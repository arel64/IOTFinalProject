from dataclasses import dataclass, asdict
import os
from typing import Any,Dict
import uuid
from azure.data.tables import TableClient,TableServiceClient

@dataclass
class BaseEntity:
    def __post_init__(self):
        items = asdict(self).items()
        values = [(value is not None) for _, value in items]
        if not all(values):
            raise ValueError(f"Missing one or more parameters {items}")

    def asdict(self) -> Dict[str, Any]:
        return {key: str(value) if isinstance(value, (float, int)) else value for key, value in asdict(self).items()}

def createTableIfNotExists(table_name:str)-> tuple[TableServiceClient,TableClient]:
    service_client = TableServiceClient.from_connection_string(conn_str=getStorageConnectionString())
    table_client = service_client.create_table_if_not_exists(table_name) # type: ignore
    return service_client,table_client

def getStorageConnectionString() -> str:
    connectionString = os.getenv('TableStorageAccountConnectionString') 
    if connectionString is None:
        raise ValueError("No connection string for table storage account")
    return connectionString

def getStoresTableName()-> str:
    tableName = os.getenv('StoresTableName')
    if tableName is None:
        raise ValueError("No table name for medicine")
    return tableName

def writeEntityToTable(entity : BaseEntity, table : TableClient, partition_key : str) -> None:
    entity_dict = entity.asdict()
    entity_dict['PartitionKey'] = partition_key
    entity_dict['RowKey'] = str(uuid.uuid4())
    table.create_entity(entity=entity_dict) # type: ignore
    
def getMedicineTableName()-> str:
    tableName = os.getenv('MedicineTableName')
    if tableName is None:
        raise ValueError("No table name for medicine")
    return tableName
def getMyStoreName()-> str:
    return "MyTestStore" #TOOD:: Get from auth