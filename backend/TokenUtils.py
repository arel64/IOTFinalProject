import logging
import jwt
import os
from typing import Dict,Any
from dataclasses import dataclass, asdict
import secrets
from datetime import datetime, timedelta, timezone
from schemaUtils import createTableIfNotExists, writeEntityToTable, getTokensTableName
import azure.functions as func


# Use a consistent secret key for token encoding and decoding
SECRET_KEY = secrets.token_hex(32)

class TokenExpiredError(Exception):
    """Custom exception to indicate that the JWT token has expired."""
    def __init__(self, message="Token has expired"):
        self.message = message
        super().__init__(self.message)

@dataclass
class TokenEntity:
    PartitionKey: str
    Token: str

    def asdict(self) -> Dict[str, Any]:
        return asdict(self)

def createJwt(store_name: str) -> str:
    """
    Create a JWT token for a store.

    Args:
    - store_name: Name of the store.

    Returns:
    - A JWT token as a string.
    """
    expiration = datetime.now(timezone.utc) + timedelta(seconds=60)

    payload = {
        'store_name': store_name,
        'exp': expiration.timestamp()  # Token expiry time is 1 day
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    return token

def validateJwt(token: str) -> dict:
    """
    Validate a JWT token.

    Args:
    - token: The JWT token to validate.

    Returns:
    - The decoded token payload if valid.

    Raises:
    - ValueError if the token is expired or invalid.
    """
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return decoded
    except jwt.ExpiredSignatureError:
        logging.info("Token has expired")
        raise jwt.ExpiredSignatureError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")

def storeToken(store_name: str, token: str):
    """
    Store a new token in Azure Table Storage.

    Args:
    - store_name: Name of the store.
    - token: The token to store.
    """
    from Store import getStoreUid
    partition_key = getStoreUid(store_name)
    _, table_client = createTableIfNotExists(getTokensTableName())

    # Check if the token already exists for this store
    existing_entities = table_client.query_entities(f"PartitionKey eq '{partition_key}'")
    entity_list = list(existing_entities)

    if entity_list:
        # Update the existing entity
        logging.info(f"Updating the token for store {store_name}.")
        token_entity = entity_list[0]  # Assuming there's only one entity per PartitionKey
        token_entity['Token'] = token
        table_client.update_entity(entity=token_entity, mode="replace")  # 'replace' mode to update
    else:
        # Create a new entity
        logging.info(f"Creating a new token for store {store_name}.")
        token_entity = TokenEntity(
            PartitionKey=partition_key,
            Token=token
        )
        writeEntityToTable(token_entity, table_client, partition_key)

def validateToken(req: func.HttpRequest) -> str:
    """
    Validate the token from the request header.

    Args:
    - req: The HTTP request object.

    Returns:
    - The store name if the token is valid.

    Raises:
    - ValueError if the token is missing, expired, or invalid.
    """
    auth_header = req.headers.get('Authorization')
    if not auth_header:
        raise ValueError("Authorization header missing")
    
    token = auth_header.split(" ")[1]  # Expecting format: Bearer <token>
    decoded = validateJwt(token)
    return decoded['store_name']
