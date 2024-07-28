from typing import Optional
import azure.functions as func
from dataclasses import dataclass
from schemaUtils import BaseEntity, createTableIfNotExists, getStoresTableName, writeEntityToTable
from azure.data.tables import TableEntity
@dataclass
class Store(BaseEntity):
    StoreName: str
    Email: str
    ContactNumber: str
    Latitude :str
    Longitude: str

class StoreRequestParser:
    @staticmethod
    def parse(req: func.HttpRequest) -> Store:
        json = req.get_json()
        storeName = json.get('storeName')
        email = json.get('email')
        contactNumber = json.get('contactNumber')
        latitude = json.get('latitude')
        longitude = json.get('longitude')
        return Store(
            StoreName=storeName,
            Email=email,
            ContactNumber=contactNumber,
            Latitude=latitude,
            Longitude=longitude
        
        )
class StoreEntityParser:
    @staticmethod
    def parse(entity: TableEntity) -> Store:
        return Store(
            StoreName=entity.get('StoreName'),
            Email=entity.get('Email'),
            ContactNumber=entity.get('ContactNumber'),
            Latitude=entity.get('Latitude'),
            Longitude=entity.get('Longitude')
        )
def getStoreUid(storeName: str) -> str:
    return storeName.replace(" ","").lower()


def registerStore(store : Store) -> None:
    _,table_client = createTableIfNotExists(getStoresTableName())
    with table_client as table:
        entity = getStoreEntity(store.StoreName)
        if entity:
            raise ValueError("Store already exists")
        partition_key = getStoreUid(store.StoreName)
        writeEntityToTable(store, table, partition_key)
        
def getStoreEntity(storeName: str) -> Optional[TableEntity]:
    _,table_client = createTableIfNotExists(getStoresTableName())
    with table_client as table:
        storeUid = getStoreUid(storeName)
        entities = table.query_entities(f"PartitionKey eq '{storeUid}'") # type: ignore
        entity_list = list(entities)
        if not entity_list:
            return None
    if len(entity_list) > 1:
        raise ValueError("Multiple stores found")
    
    return entity_list[0]
def getStore(storeName: str) -> Optional[Store]:
    entity = getStoreEntity(storeName)
    if not entity:
        return None
    return StoreEntityParser.parse(entity)