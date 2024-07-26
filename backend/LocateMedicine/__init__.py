import logging
import azure.functions as func
from azure.core.exceptions import HttpResponseError
from azure.data.tables import TableClient,TableEntity,UpdateMode
import os
from schemaUtils import createTableIfNotExists, getMedicineTableName, getMyStoreName,writeEntityToTable
from Medicine import Medicine,MedicineRequestParser
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

def insertMedicineToInventory(medicine : Medicine, table : TableClient) -> None:
    myStoreName = getMyStoreName()
    partition_key = f"{myStoreName}_{medicine.MedicineName}_{medicine.BatchNumber}".lower()
    entities = table.query_entities(f"PartitionKey eq '{partition_key}'") # type: ignore
    entity_list = list(entities)
    if entity_list:
        updateMedicineQuantity(table, entity_list)
    else:
        writeEntityToTable(medicine, table, partition_key)

def updateMedicineQuantity(table : TableClient, sameMedicine : list[TableEntity]) -> None:
    if len(sameMedicine) > 1:
        raise ValueError("Duplicate entry for unique key found")
    entity = sameMedicine[0]
    quantity = entity.get('Quantity') # type: ignore
    if quantity is None:
        raise ValueError("Quantity not found in matching entity")
    entity['Quantity'] = int(quantity) + 1 # type: ignore
    table.update_entity(entity=entity, mode=UpdateMode.MERGE) # type: ignore

def getStorageConnectionString() -> str:
    connectionString = os.getenv('TableStorageAccountConnectionString') 
    if connectionString is None:
        raise ValueError("No connection string for table storage account")
    return connectionString
