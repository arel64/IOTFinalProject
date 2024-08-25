import hashlib
import re
from typing import Optional
import azure.functions as func
from dataclasses import dataclass
from schemaUtils import BaseEntity, createTableIfNotExists, getStoresTableName, writeEntityToTable
from azure.data.tables import TableEntity
from TokenUtils import createJwt, storeToken

@dataclass
class Store(BaseEntity):
    StoreName: str
    Email: str
    ContactNumber: str
    Latitude :str
    Longitude: str
    Password :str

class StoreRequestParser:
    @staticmethod
    def parse(req: func.HttpRequest) -> Store:
        json = req.get_json()
        storeName = json.get('storeName')
        email = json.get('email')
        contactNumber = json.get('contactNumber')
        latitude = json.get('latitude')
        longitude = json.get('longitude')
        password = json.get('password')
        
        #Validate Email format
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            raise ValueError("Invalid email format")
        
        return Store(
            StoreName=storeName,
            Email=email,
            ContactNumber=contactNumber,
            Latitude=latitude,
            Longitude=longitude,
            Password=hashlib.sha256(password.encode()).hexdigest()  # Hash the password
        
        )
class StoreEntityParser:
    @staticmethod
    def parse(entity: TableEntity) -> Store:
        return Store(
            StoreName=entity.get('StoreName'), # type: ignore
            Email=entity.get('Email'), # type: ignore
            ContactNumber=entity.get('ContactNumber'), # type: ignore
            Latitude=entity.get('Latitude'), # type: ignore
            Longitude=entity.get('Longitude') # type: ignore
        )
def getStoreUid(storeName: str) -> str:
    return storeName.replace(" ","").lower()


def registerStore(store : Store) -> dict:
    _,table_client = createTableIfNotExists(getStoresTableName())
    partition_key = getStoreUid(store.StoreName)

    with table_client as table:
        # Check if the store or email already exists
        existing_stores_by_name = table.query_entities(f"PartitionKey eq '{partition_key}'")
        existing_stores_by_email = table.query_entities(f"Email eq '{store.Email}'")

        if list(existing_stores_by_name):
            raise ValueError("A store with this name already exists")

        if list(existing_stores_by_email):
            raise ValueError("A store with this email already exists")
        
        writeEntityToTable(store, table, partition_key)
        
        # Generate tokens upon successful registration
        token = createJwt(store.StoreName)
        # refresh_token = createRefreshToken()
        storeToken(store.StoreName, token)

        return {
            'message': f"Store {store.StoreName} registered successfully",
            'token': token
            }
        
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
