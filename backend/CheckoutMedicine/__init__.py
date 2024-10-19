import logging
import azure.functions as func
from azure.core.exceptions import HttpResponseError
import jwt
from schemaUtils import createTableIfNotExists, getMedicineTableName
from Medicine import MedicineRequestParser,removeMedicineFromInventory
from TokenUtils import TokenCredentials
def main(
        req: func.HttpRequest
    ) -> func.HttpResponse:
    try:
        token = TokenCredentials.decodeRequestToken(req)
        storeName = token['store_name']
        medicine = MedicineRequestParser.parse(req,storeName)
        _,table_client = createTableIfNotExists(getMedicineTableName())
        with table_client as table:
            removeMedicineFromInventory(medicine, table,storeName)
        return func.HttpResponse(f"Medicine checkout processed successfully", status_code=200)
    except ValueError as e:
        logging.error(f"ValueError: {e}")
        return func.HttpResponse(str(e), status_code=400)
    except HttpResponseError as e:
        logging.error(f"Could not create table {e}")
        return func.HttpResponse(f"Server communication went wrong", status_code=500)
    except jwt.ExpiredSignatureError as e:
        return func.HttpResponse(f"Expired Token", status_code=401)
    except jwt.InvalidTokenError as e:
        logging.error(f"Bad Token {e}")
        return func.HttpResponse(f"Invalid Token", status_code=401)
    except Exception as e:
        logging.error(f"Exception: {e}")
        return func.HttpResponse(f"Something went wrong", status_code=500)

