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
from azure.ai.textanalytics import AnalyzeHealthcareEntitiesResult
from schemaUtils import BaseEntity, getContainerClient, getStorageConnectionString,getDocumentAnalysisClient, getTextAnalyticsClient
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
        medicationsNames = getMedicationsNames(image.name,readDocument)
        return func.HttpResponse(f"Medications perscribed in picture {medicationsNames}", status_code=200)
    except ValueError as e:
        logging.error(f"ValueError: {e}")
        return func.HttpResponse(str(e), status_code=400)
    except HttpResponseError as e:
        logging.error(f"Could not create table {e}")
        return func.HttpResponse(f"Server communication went wrong", status_code=500)
    except Exception as e:
        logging.error(f"Exception: {e}")
        return func.HttpResponse(f"Something went wrong", status_code=500)

def getMedicationsNames(tag_name:str,readDocument:AnalyzeResult) -> set[str]:
    wordsSentence = getPossibleMedicineNamesString(readDocument)

    container_client = getContainerClient(getStorageConnectionString() ,getDocumentProccesedContainerName())
    blob = getCachedMedicationsName(container_client,tag_name)
    if blob: 
        analysisResult = readMedicineNames(container_client,blob.name) # type: ignore
    else:
        analysisResult = analyzeHealthcareEntities(wordsSentence)
        saveAnalysisResult(tag_name, container_client, analysisResult)
    medicationNames = analyzeMedicationsNames(analysisResult)  # type: ignore
    return medicationNames
def getDocumentText(image : CachedImage) -> AnalyzeResult:
    container_client = getContainerClient(getStorageConnectionString() ,getDocumentReadContainerName())
    blob = getCachedDocumentText(container_client,image.name)
    if blob: 
        readDocument = readDocumentText(container_client, blob.name)# type: ignore
    else:
        readDocument = analyzeDocumentBase64(image.base64Data)
        saveDoumentText(image.name, container_client, readDocument)
    return readDocument

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
    words_list = "\n".join(words)
    return words_list



def readBlob(container_client : ContainerClient, blob_name : str):
    blob_client = container_client.get_blob_client(blob_name) # type: ignore
    blob_stream: StorageStreamDownloader[bytes] = blob_client.download_blob() # type: ignore
    blob_data: bytes = blob_stream.readall()
    readObject = pickle.loads(blob_data)
    return readObject
def readDocumentText(container_client : ContainerClient, blob_name : str) -> AnalyzeResult:
    return readBlob(container_client, blob_name)
def readMedicineNames(container_client : ContainerClient, blob_name : str) -> AnalyzeResult:
    return readBlob(container_client, blob_name)

def saveBlobWithTags(blobName:str, container_client: ContainerClient, data, tags: dict[str, str]) -> None: # type: ignore
    blob_client = container_client.get_blob_client(blobName)
    stream = io.BytesIO()
    pickle.dump(data,stream) # type: ignore
    stream.seek(0)
    blob_client.upload_blob(stream.read(),tags=tags,overwrite=True) # type: ignore
    
def saveAnalysisResult(imageName:str, container_client: ContainerClient, medicationsNames : AnalyzeHealthcareEntitiesResult) -> None:
    tags = {getBlobTagName():imageName}
    return saveBlobWithTags(imageName, container_client, medicationsNames, tags)
def saveDoumentText(imageName:str, container_client: ContainerClient, readDocument : AnalyzeResult) -> None:
    tags = {getBlobTagName():imageName}
    return saveBlobWithTags(imageName, container_client, readDocument, tags)

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

def analyzeMedicationsNames(doc: AnalyzeHealthcareEntitiesResult) -> set[str] :
    medications : set[str] = set()
    for entity in doc.entities:
        if not entity.category == "MedicationName":
            continue
        medications.add(entity.text.lower().split(" ")[0])

    return medications 

def analyzeHealthcareEntities(wordsSentence : str) -> AnalyzeHealthcareEntitiesResult:
    client = getTextAnalyticsClient()
    documents = [
        wordsSentence
    ]

    poller = client.begin_analyze_healthcare_entities(documents)
    result = poller.result()
    docs = [doc for doc in result if not doc.is_error]
    if not docs:
        raise ValueError("No documents found")
    if len(docs) > 1:
        raise ValueError("More than one document")
    if docs[0].is_error:
        raise ValueError("Error anylizing document")
    return docs[0] # type: ignore
from typing import Optional

def getCachedTaggedValue(containerClient : ContainerClient,tagName :str,tagValue : str) -> Optional[FilteredBlob]:
    filter_expressions = f"\"{tagName}\"='{tagValue}'"
    blobs_iter = containerClient.find_blobs_by_tags(filter_expression=filter_expressions)
    blobs = list(blobs_iter)
    if not blobs:
        return None
    if len(blobs) > 1:
        raise ValueError("More than one entry found")
    return blobs[0]
def getCachedDocumentText(containerClient: ContainerClient,imageName : str) -> Optional[FilteredBlob]:
    tagName = getBlobTagName()
    return getCachedTaggedValue(containerClient,tagName ,imageName)

def getCachedMedicationsName(containerClient: ContainerClient,imageName : str) -> Optional[FilteredBlob]:
    tagName = getBlobTagName()
    return getCachedTaggedValue(containerClient,tagName ,imageName)

def getBlobTagName() -> str:
    return "BlobName"
def getDocumentReadContainerName() -> str:
    return "image-text"
def getDocumentProccesedContainerName()-> str:
    return "processed-text"