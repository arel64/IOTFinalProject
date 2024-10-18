from dataclasses import dataclass, asdict
import os
from typing import Any, Dict
import uuid
from azure.data.tables import TableClient, TableServiceClient
from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from azure.ai.textanalytics import TextAnalyticsClient




@dataclass
class BaseEntity:
    def __post_init__(self):
        items = asdict(self).items()
        values = [(value is not None) for _, value in items]
        if not all(values):
            raise ValueError(f"Missing one or more parameters {items}")

    def asdict(self) -> Dict[str, Any]:
        return {key: str(value) if isinstance(value, (float, int)) else value for key, value in asdict(self).items()}


def createTableIfNotExists(table_name: str) -> tuple[TableServiceClient, TableClient]:
    service_client = TableServiceClient.from_connection_string(
        conn_str=getStorageConnectionString())
    table_client = service_client.create_table_if_not_exists(
        table_name)  # type: ignore
    return service_client, table_client


def isEntryExists(table: TableClient, cond: str) -> bool:
    entities = table.query_entities(cond)  # type: ignore
    entity_list = list(entities)
    return bool(entity_list)


def getStorageConnectionString() -> str:
    connectionString = os.getenv('TableStorageAccountConnectionString')
    if connectionString is None:
        raise ValueError("No connection string for table storage account")
    return connectionString


def getTextAnalyticsEndpoint() -> str:
    endpoint = os.getenv('TextAnalyticsEndpoint')
    if endpoint is None:
        raise ValueError("No endpoint for text analytics")
    return endpoint


def getTextAnalyticsKey() -> str:
    key = os.getenv('TextAnalyticsKey')
    if key is None:
        raise ValueError("No key for text analytics")
    return key


def getStoresTableName() -> str:
    tableName = os.getenv('StoresTableName')
    if tableName is None:
        raise ValueError("No table name for medicine")
    return tableName

def getTokensTableName()-> str:
    tableName = os.getenv('TokensTableName')
    if tableName is None:
        raise ValueError("No table name for tokens")
    return tableName


def writeEntityToTable(entity: BaseEntity, table: TableClient, partition_key: str) -> None:
    entity_dict = entity.asdict()
    entity_dict['PartitionKey'] = partition_key
    entity_dict['RowKey'] = str(uuid.uuid4())
    table.create_entity(entity=entity_dict)  # type: ignore


def getMedicineTableName() -> str:
    tableName = os.getenv('MedicineTableName')
    if tableName is None:
        raise ValueError("No table name for medicine")
    return tableName


def getDocumentAnalysisClient() -> DocumentAnalysisClient:
    endpoint = os.getenv('FormRecogniserEndpoint')
    key = os.getenv('FormRecogniserKey')
    if endpoint is None or key is None:
        raise ValueError("No endpoint or key for form recognizer")
    document_analysis_client = DocumentAnalysisClient(
        endpoint=endpoint, credential=AzureKeyCredential(key)
    )
    return document_analysis_client


def getBlobClient(connection_string: str, container_name: str, blob_name: str) -> BlobClient:
    try:
        blob_service_client = BlobServiceClient.from_connection_string(
            connection_string)
        blob_client = blob_service_client.get_blob_client(
            container=container_name, blob=blob_name)
    except Exception as e:
        raise ValueError(f"Could not get blob client {e}")
    return blob_client


def getContainerClient(connection_string: str, container_name: str) -> ContainerClient:
    blob_service_client = BlobServiceClient.from_connection_string(
        connection_string)
    container_client = blob_service_client.get_container_client(container_name)
    if not container_client.exists():
        container_client.create_container()
    return container_client


def getTextAnalyticsClient() -> TextAnalyticsClient:
    text_analytics_client = TextAnalyticsClient(
        endpoint=getTextAnalyticsEndpoint(),
        credential=AzureKeyCredential(getTextAnalyticsKey()),
    )
    return text_analytics_client

