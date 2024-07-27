import logging
import azure.functions as func
from azure.core.exceptions import HttpResponseError
from schemaUtils import createTableIfNotExists, getMedicineTableName
from Medicine import MedicineRequestParser,insertMedicineToInventory
def main(
        req: func.HttpRequest
    ) -> func.HttpResponse:
    try:
        medicine = MedicineRequestParser.parse(req)
        _,table_client = createTableIfNotExists(getMedicineTableName())
        with table_client as table:
            insertMedicineToInventory(medicine, table)
        return func.HttpResponse(f"Medicine entry processed successfully", status_code=200)
    except ValueError as e:
        logging.error(f"ValueError: {e}")
        return func.HttpResponse(str(e), status_code=400)
    except HttpResponseError as e:
        logging.error(f"Could not create table {e}")
        return func.HttpResponse(f"Server communication went wrong", status_code=500)
    except Exception as e:
        logging.error(f"Exception: {e}")
        return func.HttpResponse(f"Something went wrong", status_code=500)