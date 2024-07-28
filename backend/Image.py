from schemaUtils import BaseEntity
from dataclasses import dataclass
import azure.functions as func
@dataclass
class Image(BaseEntity):
   base64Data: str
   name: str
   
class ImageParser:
    @staticmethod
    def parse(req: func.HttpRequest) -> Image:
        req_body = req.get_json()
        return Image(
            base64Data=req_body.get("imageData"),
            name=req_body.get("imageName")
        )
        