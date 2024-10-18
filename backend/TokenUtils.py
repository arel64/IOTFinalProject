import logging
import jwt
from dataclasses import dataclass
import secrets
from datetime import datetime, timedelta, timezone
from schemaUtils import BaseEntity, createTableIfNotExists, writeEntityToTable, getTokensTableName
from Store import getStoreUid
import azure.functions as func


SECRET_KEY = secrets.token_hex(32)
ALGORITHM = 'HS256'
class TokenExpiredError(Exception):
    def __init__(self, message="Token has expired"):
        self.message = message
        super().__init__(self.message)

@dataclass
class TokenEntity(BaseEntity):
    PartitionKey: str
    Token: str

class TokenCredentials():
    @staticmethod
    def create(storeName : str) -> str:
        expiration = datetime.now(timezone.utc) + timedelta(days=1)
        payload = {
            'store_name': storeName,
            'exp': expiration.timestamp()
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        TokenCredentials._storeToken(token,storeName)
        return token
    @staticmethod
    def _decode(token: str) -> dict:
        try:
            decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return decoded
        except jwt.ExpiredSignatureError:
            logging.info("Token has expired")
            raise jwt.ExpiredSignatureError("Token has expired")
        except jwt.InvalidTokenError:
            raise ValueError("Invalid token")
    @staticmethod
    def _storeToken(store_name: str, token: str):
        partition_key = getStoreUid(store_name)
        _, table_client = createTableIfNotExists(getTokensTableName())

        existing_entities = table_client.query_entities(f"PartitionKey eq '{partition_key}'")
        entity_list = list(existing_entities)

        if entity_list:
            logging.info(f"Updating the token for store {store_name}.")
            token_entity = entity_list[0]
            token_entity['Token'] = token
            table_client.update_entity(entity=token_entity, mode="replace")  
            return

        logging.info(f"Creating a new token for store {store_name}.")
        token_entity = TokenEntity(
            PartitionKey=partition_key,
            Token=token
        )
        writeEntityToTable(token_entity, table_client, partition_key)

    @staticmethod
    def decodeRequestToken(req: func.HttpRequest) -> dict:
        auth_header = req.headers.get('Authorization')
        if not auth_header:
            raise ValueError("Authorization header missing")
        
        token = auth_header.split(" ")[1]
        token = TokenCredentials._decode(token)
        return token
    

                 



