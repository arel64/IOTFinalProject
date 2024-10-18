from typing import Optional
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
    def uid(self):
        return f"{self.StoreName}_{self.MedicineName}_{self.BatchNumber}".lower()
    
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
    medicine_entity = findMedicineEntities(medicine,table,storeName)
    if medicine_entity:
        incrementMedicineQuantity(table,medicine_entity)
    else:
        writeEntityToTable(medicine, table)
        
def removeMedicineFromInventory(medicine : Medicine, table : TableClient, storeName : str) -> None:
    medicine_entity = findMedicineEntities(medicine,table,storeName)
    if medicine_entity:
        decrementMedicineQuantity(table,medicine_entity)
    else:
        raise ValueError("Cannot checkout non existant medication")

def _offsetMedicineQuantity(table : TableClient, medicine : TableEntity,offset : int) -> None:
    quantity = medicine['Quantity']
    if quantity is None:
        raise ValueError("Quantity not found in matching entity")
    new_quantity = int(quantity) + offset
    if new_quantity < 0:
        raise ValueError("There are no more avalible medicine of this type in the system")
    medicine['Quantity'] = new_quantity
    table.update_entity(entity=medicine, mode=UpdateMode.MERGE) # type: ignore 
    
def decrementMedicineQuantity(table : TableClient, medicine : TableEntity) -> None:
    _offsetMedicineQuantity(table,medicine,-1)
    
def incrementMedicineQuantity(table : TableClient, medicine :TableEntity) -> None:
    _offsetMedicineQuantity(table,medicine,1)

def findMedicineEntities(medicine: Medicine, table : TableClient, storeName : str) -> Optional[TableEntity]:
    entities = table.query_entities(f"PartitionKey eq '{medicine.uid()}'") # type: ignore
    entity_list = list(entities)
    if not entity_list:
        return None
    if len(entity_list) > 1:
        raise ValueError("Duplicate entry for unique key found")
    return entity_list[0] # type: ignore


def findMedicineEntitiesByName(table: TableClient, medicineName: str) -> list[TableEntity]:
    entities = table.query_entities(f"MedicineName eq '{medicineName}'") # type: ignore
    return list(entities)

def findMedicine(table: TableClient, medicineName: str) -> list[Medicine]:
    entities = findMedicineEntitiesByName(table, medicineName)
    medicine = [MedicineEntityParser.parse(entity) for entity in entities]
    return medicine