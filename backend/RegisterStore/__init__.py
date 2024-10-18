import json
import logging
import azure.functions as func
from azure.core.exceptions import HttpResponseError

from Store import StoreRequestParser
from TokenUtils import registerStore


def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        store = StoreRequestParser.parse(req)
        result = registerStore(store)
        logging.info(f"Token issued successfully for : {store.StoreName}")
        return func.HttpResponse(json.dumps(result), status_code=201, mimetype='application/json')
    except ValueError as e:
        logging.error(f"ValueError: {e}")
        return func.HttpResponse(str(e), status_code=400)
    except HttpResponseError as e:
        logging.error(f"Could not create table: {e}")
        return func.HttpResponse("Server communication went wrong", status_code=500)
    except Exception as e:
        logging.error(f"Exception: {e}")
        return func.HttpResponse("Something went wrong", status_code=500)
