import logging
import azure.functions as func
from azure.data.tables import TableClient
from azure.core.exceptions import HttpResponseError
from dataclasses import dataclass
from schemaUtils import BaseEntity,createTableIfNotExists, getStoresTableName,writeEntityToTable


@dataclass
class Store(BaseEntity):
    StoreName: str | None
    Email: str | None
    ContactNumber: str | None

class StoreRequestParser:
    @staticmethod
    def parse(req: func.HttpRequest) -> Store:
        json = req.get_json()
        storeName = json.get('storeName')
        email = json.get('email')
        contactNumber = json.get('contactNumber')
        return Store(
            StoreName=storeName,
            Email=email,
            ContactNumber=contactNumber
        )

def main(
        req: func.HttpRequest
    ) -> func.HttpResponse:
    try:
        store = StoreRequestParser.parse(req)
        _,table_client = createTableIfNotExists(getStoresTableName())
        with table_client as table:
            registerStore(store, table)
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

def registerStore(store : Store, table : TableClient) -> None:
    partition_key = store.StoreName.replace(" ","").lower() # type: ignore
    entities = table.query_entities(f"PartitionKey eq '{partition_key}'") # type: ignore
    entity_list = list(entities)
    if entity_list:
        raise ValueError("Store already exists")
    writeEntityToTable(store, table, partition_key)
    

