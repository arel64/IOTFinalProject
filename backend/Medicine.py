import azure.functions as func
from dataclasses import dataclass
from schemaUtils import BaseEntity, writeEntityToTable
from azure.data.tables import TableClient,TableEntity,UpdateMode

@dataclass
class Medicine(BaseEntity):
    MedicineNamePretty: str
    MedicineName: str
    Manufacturer: str
    ExpiryDate: str
    BatchNumber: str
    Price: float
    StoreName: str
    Quantity: int = 1
    
class MedicineRequestParser:
    @staticmethod
    def parse(req: func.HttpRequest,storeName: str) -> Medicine:
        json = req.get_json()
        medicine_name : str = json.get('medicineName')
        manufacturer : str= json.get('manufacturer')
        expiry_date : str= json.get('expiryDate')
        batch_number : str = json.get('batchNumber')
        price = json.get('price')
        price = float(price) if price else 0
        storeName = storeName
        return Medicine(
            MedicineNamePretty=medicine_name,
            MedicineName=medicine_name.lower(),
            Manufacturer=manufacturer,
            ExpiryDate=expiry_date,
            BatchNumber=batch_number,
            Price=price,
            StoreName=storeName
        )
class MedicineEntityParser:
    @staticmethod
    def parse(entity: TableEntity) -> Medicine:
        return Medicine(
            MedicineNamePretty=entity.get('MedicineNamePretty'), # type: ignore
            MedicineName=entity.get('MedicineName'), # type: ignore
            Manufacturer=entity.get('Manufacturer'),# type: ignore
            ExpiryDate=entity.get('ExpiryDate'),# type: ignore
            BatchNumber=entity.get('BatchNumber'),# type: ignore
            Price=float(entity.get('Price')),# type: ignore
            StoreName=entity.get('StoreName'),# type: ignore
            Quantity=entity.get('Quantity')# type: ignore
        )

def insertMedicineToInventory(medicine : Medicine, table : TableClient, storeName : str) -> None:
    partition_key = f"{storeName}_{medicine.MedicineName}_{medicine.BatchNumber}".lower()
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
def findMedicineEntities(table: TableClient, medicineName: str) -> list[TableEntity]:
    entities = table.query_entities(f"MedicineName eq '{medicineName}'") # type: ignore
    return list(entities)
def findMedicine(table: TableClient, medicineName: str) -> list[Medicine]:
    entities = findMedicineEntities(table, medicineName)
    medicine = [MedicineEntityParser.parse(entity) for entity in entities]
    return medicine