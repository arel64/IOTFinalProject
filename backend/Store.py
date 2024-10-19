import hashlib
import re
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
    Password :str
    def uid(self):
        return self.uidFromName(self.StoreName)
    @staticmethod
    def uidFromName(name : str):
        return name.replace(" ","").lower()
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
            Longitude=entity.get('Longitude'), # type: ignore
            Password=entity.get('Password') # type: ignore
        )    


def getStoreEntity(storeName: str) -> Optional[TableEntity]:
    _,table_client = createTableIfNotExists(getStoresTableName())
    with table_client as table:
        storeUid = Store.uidFromName(storeName)
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
