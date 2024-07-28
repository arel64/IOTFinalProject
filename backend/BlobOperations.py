from io import BytesIO
import pickle
from typing import Optional
from azure.storage.blob import ContainerClient,FilteredBlob,StorageStreamDownloader

from schemaUtils import getContainerClient

class BlobOperaions:
    def __init__(self,connection : str, container_name: str) -> None:
        self.container_client : ContainerClient = getContainerClient(connection ,container_name)

        
    def readBlobData(self, blob_name : str):
        blob_client = self.container_client.get_blob_client(blob_name) # type: ignore
        blob_stream: StorageStreamDownloader[bytes] = blob_client.download_blob() # type: ignore
        blob_data: bytes = blob_stream.readall()
        readObject = pickle.loads(blob_data)
        return readObject
    
    def saveBlob(self,blobName:str, data) -> None: # type: ignore
        tags = {self._getBlobTagName():blobName}
        blob_client = self.container_client.get_blob_client(blobName)
        stream = BytesIO()
        pickle.dump(data,stream) # type: ignore
        stream.seek(0)
        blob_client.upload_blob(stream.read(),tags=tags,overwrite=True) # type: ignore
        
    def getBlob(self,blobName : str) -> Optional[FilteredBlob]:
        filter_expressions = f"\"{self._getBlobTagName()}\"='{blobName}'"
        blobs_iter = self.container_client.find_blobs_by_tags(filter_expression=filter_expressions)
        blobs = list(blobs_iter)
        if not blobs:
            return None
        if len(blobs) > 1:
            raise ValueError("More than one entry found")
        return blobs[0]
    
    def _getBlobTagName(self) -> str:
        return "BlobName"