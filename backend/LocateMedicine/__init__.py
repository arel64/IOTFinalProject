import json
import logging
import azure.functions as func
from azure.core.exceptions import HttpResponseError

from Algortihms import getStoresWithMedicationGreedy
from Store import getStore
from Image import ImageParser
from DocumentReader import DocumentReader
from DocumentAnalyzer import DocumentAnalyzer


def main(
        req: func.HttpRequest
    ) -> func.HttpResponse:
    try:
        image = ImageParser.parse(req)
        readDocument = DocumentReader.getDocumentText(image) # Includes caching by file name as sent by api
        medicationsNames = DocumentAnalyzer().getMedicationsNames(image.name,readDocument) # Includes caching by file name as sent by api
        storesNames,notFoundMedications = getStoresWithMedicationGreedy(medicationsNames)
        stores = [getStore(storeName) for storeName in storesNames] # 
        if None in stores:
            response_data = {
                "stores": [store.asdict() for store in stores if store is not None],
                "notFoundMedications": list(notFoundMedications),
                "message": "There were medications with stores that don't exist, results may be incomplete"
            }
            return func.HttpResponse(body=json.dumps(response_data), status_code=206, mimetype="application/json")   
        response_data = {
            "stores": [store.asdict() for store in stores if store is not None],
            "notFoundMedications": list(notFoundMedications)
        }
        jsondata = json.dumps(response_data)
        return func.HttpResponse(body=jsondata, status_code=200, mimetype="application/json")
    except ValueError as e:
        logging.error(f"ValueError: {e}")
        return func.HttpResponse(str(e), status_code=400)
    except HttpResponseError as e:
        logging.error(f"Could not create table {e}")
        return func.HttpResponse(f"Server communication went wrong", status_code=500)
    except Exception as e:
        logging.error(f"Exception: {e}")
        return func.HttpResponse(f"Something went wrong", status_code=500)

