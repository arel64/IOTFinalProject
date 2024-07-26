import azure.functions as func
from dataclasses import dataclass
from schemaUtils import BaseEntity, getMyStoreName, writeEntityToTable
from azure.data.tables import TableClient,TableEntity,UpdateMode

@dataclass
class Medicine(BaseEntity):
    MedicineName: str
    Manufacturer: str
    ExpiryDate: str
    BatchNumber: str
    Price: float
    StoreName: str
    Quantity: int = 1
    
class MedicineRequestParser:
    @staticmethod
    def parse(req: func.HttpRequest) -> Medicine:
        json = req.get_json()
        medicine_name = json.get('medicineName')
        manufacturer = json.get('manufacturer')
        expiry_date = json.get('expiryDate')
        batch_number = json.get('batchNumber')
        price = json.get('price')
        price = float(price) if price else 0
        storeName = getMyStoreName()
        return Medicine(
            MedicineName=medicine_name,
            Manufacturer=manufacturer,
            ExpiryDate=expiry_date,
            BatchNumber=batch_number,
            Price=price,
            StoreName=storeName
        )


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