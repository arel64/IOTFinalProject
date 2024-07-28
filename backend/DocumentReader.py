
import base64
from Image import Image
from schemaUtils import getDocumentAnalysisClient, getStorageConnectionString
from BlobOperations import BlobOperaions
from azure.ai.formrecognizer import AnalyzeResult
from io import BytesIO
class DocumentReader:
    @staticmethod
    def getDocumentText(image : Image) -> AnalyzeResult:
        blobOperations = BlobOperaions(getStorageConnectionString(),DocumentReader._getDocumentReadContainerName())
        blob = blobOperations.getBlob(image.name)
        if blob: 
            readDocument = blobOperations.readBlobData(blob.name) # type: ignore
        else:
            readDocument = DocumentReader._analyzeDocumentBase64(image.base64Data)
            blobOperations.saveBlob(image.name,readDocument) # type: ignore
        return readDocument
    @staticmethod
    def _analyzeDocument(binaryData: BytesIO) -> AnalyzeResult:
        client = getDocumentAnalysisClient()
        poller = client.begin_analyze_document(
            "prebuilt-document", document=binaryData
        )
        readDocument = poller.result()
        return readDocument
    @staticmethod
    def _analyzeDocumentBase64(base64Data :str) -> AnalyzeResult:
        binaryData = BytesIO(base64.b64decode(base64Data))
        return DocumentReader._analyzeDocument(binaryData)
    @staticmethod
    def _getDocumentReadContainerName() -> str:
        return "image-text"