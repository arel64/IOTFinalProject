import logging
import azure.functions as func
from azure.core.exceptions import HttpResponseError

from Store import StoreRequestParser, registerStore



def main(
        req: func.HttpRequest
    ) -> func.HttpResponse:
    try:
        store = StoreRequestParser.parse(req)
        registerStore(store)
        return func.HttpResponse(f"Store Registered {store}", status_code=200)
    except ValueError as e:
        logging.error(f"ValueError: {e}")
        return func.HttpResponse(str(e), status_code=400)
    except HttpResponseError as e:
        logging.error(f"Could not create table {e}")
        return func.HttpResponse(f"Server communication went wrong", status_code=500)
    except Exception as e:
        logging.error(f"Exception: {e}")
        return func.HttpResponse(f"Something went wrong", status_code=500)


