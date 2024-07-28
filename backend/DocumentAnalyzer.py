from azure.ai.formrecognizer import AnalyzeResult
from azure.ai.textanalytics import AnalyzeHealthcareEntitiesResult
from schemaUtils import getStorageConnectionString, getTextAnalyticsClient
from BlobOperations import BlobOperaions
import re

class DocumentAnalyzer:
    def getMedicationsNames(self,documentName :str,readDocument:AnalyzeResult) -> set[str]:
        wordsSentence = self._getPossibleMedicineNamesString(readDocument)
        blobOperations = BlobOperaions(getStorageConnectionString(),self._getDocumentProccesedContainerName())
        blob = blobOperations.getBlob(documentName)
        if blob: 
            analysisResult = blobOperations.readBlobData(blob.name) # type: ignore
        else:
            analysisResult = self._analyzeHealthcareEntities(wordsSentence)
            blobOperations.saveBlob(documentName, analysisResult) # type: ignore
        medicationNames = self._analyzeMedicationsNames(analysisResult)  # type: ignore
        return medicationNames


    def _getPossibleMedicineNames(self,readDocument: AnalyzeResult)-> set[str]: 
        words : set[str] = set()
        for page in readDocument.pages:
            for _, line in enumerate(page.lines):
                line_words = line.get_words()
                for word in line_words:
                    if word.confidence > 0.85 and bool(re.match('^[a-zA-Z]+$', word.content)):
                        words.add(word.content.lower())
        return words
    def _getPossibleMedicineNamesString(self,readDocument: AnalyzeResult)-> str:
        words = self._getPossibleMedicineNames(readDocument)
        words_list = "\n".join(words)
        return words_list



    def _analyzeMedicationsNames(self,doc: AnalyzeHealthcareEntitiesResult) -> set[str] :
        medications : set[str] = set()
        for entity in doc.entities:
            if not entity.category == "MedicationName":
                continue
            medications.add(entity.text.lower().split(" ")[0])

        return medications 

    def _analyzeHealthcareEntities(self,wordsSentence : str) -> AnalyzeHealthcareEntitiesResult:
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
    def _getDocumentProccesedContainerName(self)-> str:
        return "processed-text"

        