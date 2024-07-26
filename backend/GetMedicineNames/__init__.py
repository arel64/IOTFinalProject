import base64
from dataclasses import dataclass
import io
import logging
import pickle
import re
import azure.functions as func
from azure.core.exceptions import HttpResponseError
from azure.ai.formrecognizer import AnalyzeResult
from azure.storage.blob import ContainerClient,FilteredBlob,StorageStreamDownloader
from Medicine import MedicineRequestParser, insertMedicineToInventory
from schemaUtils import BaseEntity, createTableIfNotExists, getContainerClient, getMedicineTableName, getStorageConnectionString,getDocumentAnalysisClient
@dataclass
class CachedImage(BaseEntity):
   base64Data: str
   name: str
   
class CachedImageParser:
    @staticmethod
    def parse(req: func.HttpRequest) -> CachedImage:
        req_body = req.get_json()
        return CachedImage(
            base64Data=req_body.get("imageData"),
            name=req_body.get("imageName")
        )
        
def main(
        req: func.HttpRequest
    ) -> func.HttpResponse:
    try:
        image = CachedImageParser.parse(req)
        readDocument = getDocumentText(image) # Includes caching by file name as sent by api
        wordsSentence = getPossibleMedicineNamesString(readDocument)

        return func.HttpResponse(f"Get Medicine Name entry processed successfully", status_code=200)
    except ValueError as e:
        logging.error(f"ValueError: {e}")
        return func.HttpResponse(str(e), status_code=400)
    except HttpResponseError as e:
        logging.error(f"Could not create table {e}")
        return func.HttpResponse(f"Server communication went wrong", status_code=500)
    except Exception as e:
        logging.error(f"Exception: {e}")
        return func.HttpResponse(f"Something went wrong", status_code=500)

def getPossibleMedicineNames(readDocument: AnalyzeResult)-> set[str]: 
    words : set[str] = set()
    for page in readDocument.pages:
        for _, line in enumerate(page.lines):
            line_words = line.get_words()
            for word in line_words:
                if word.confidence > 0.85 and bool(re.match('^[a-zA-Z]+$', word.content)):
                    words.add(word.content.lower())
    return words
def getPossibleMedicineNamesString(readDocument: AnalyzeResult)-> str:
    words = getPossibleMedicineNames(readDocument)
    words_list = " ".join(words)
    return words_list

def getDocumentText(image : CachedImage) -> AnalyzeResult:
    container_client = getContainerClient(getStorageConnectionString() ,getDocumentReadContainerName())
    blob = getCachedDocumentText(image.name, container_client)
    if blob: 
        readDocument = readDocumentText(container_client, blob.name)# type: ignore
    else:
        readDocument = analyzeDocumentBase64(image.base64Data)
        saveDoumentText(image.name, container_client, readDocument)
    return readDocument

def readDocumentText(container_client : ContainerClient, blob_name : str) -> AnalyzeResult:
    blob_client = container_client.get_blob_client(blob_name) # type: ignore
    blob_stream: StorageStreamDownloader[bytes] = blob_client.download_blob() # type: ignore
    blob_data: bytes = blob_stream.readall()
    readDocument: AnalyzeResult = pickle.loads(blob_data)
    return readDocument

def saveDoumentText(imageName:str, container_client: ContainerClient, readDocument : AnalyzeResult) -> None:
    blob_client = container_client.get_blob_client(imageName)
    stream = io.BytesIO()
    pickle.dump(readDocument,stream) # type: ignore
    tagName = getBlobTagName()
    nameTags = {tagName: imageName}
    stream.seek(0)
    blob_client.upload_blob(stream.read(),tags=nameTags,overwrite=True) # type: ignore

def analyzeDocument(binaryData: io.BytesIO) -> AnalyzeResult:
    client = getDocumentAnalysisClient()
    poller = client.begin_analyze_document(
                "prebuilt-document", document=binaryData
            )
    readDocument = poller.result()
    return readDocument
def analyzeDocumentBase64(base64Data :str) -> AnalyzeResult:
    binaryData = io.BytesIO(base64.b64decode(base64Data))
    return analyzeDocument(binaryData)


def getCachedDocumentText(imageName : str, containerClient : ContainerClient) -> FilteredBlob | None:
    tagName = getBlobTagName()
    filter_expressions = f"\"{tagName}\"='{imageName}'"
    blobs_iter = containerClient.find_blobs_by_tags(filter_expression=filter_expressions)
    blobs = list(blobs_iter)
    if not blobs:
        return None
    if len(blobs) > 1:
        raise ValueError("More than one entry found")
    return blobs[0]
def getBlobTagName() -> str:
    return "BlobName"
def getDocumentReadContainerName() -> str:
    return "image-text"