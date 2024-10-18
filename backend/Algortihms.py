
from Medicine import findMedicineEntitiesByName
from schemaUtils import createTableIfNotExists, getMedicineTableName

def getStoresWithMedicationGreedy(medicationNames: set[str]) -> tuple[set[str], set[str]]:
    _, medicationsTable = createTableIfNotExists(getMedicineTableName())
    medication_to_stores = {med: set[str]() for med in medicationNames}
    
    for medicationName in medicationNames:
        entities = findMedicineEntitiesByName(medicationsTable, medicationName)
        for entity in entities:
            medication_to_stores[medicationName].add(entity['StoreName'])  # type: ignore

    noStoreMedications = {med for med, stores in medication_to_stores.items() if not stores}
    medicationNames -= noStoreMedications  
    
    notFoundMedications = set(medicationNames)
    selectedStores = set[str]()
    
    while notFoundMedications:
        bestStore = None
        medicationsCoveredByBest = set[str]()
        
        for store in {store for stores in medication_to_stores.values() for store in stores}:
            medications_covered = {med for med in notFoundMedications if store in medication_to_stores[med]}
            if len(medications_covered) > len(medicationsCoveredByBest): # type: ignore
                bestStore = store
                medicationsCoveredByBest = medications_covered
        
        if not bestStore:
            break  # If no best store found, break out of the loop
        
        selectedStores.add(bestStore)
        notFoundMedications -= medicationsCoveredByBest
    
    # The remaining uncoveredMedications are those for which no stores were found within the algorithm
    notFoundMedications.update(noStoreMedications)
    
    return selectedStores, notFoundMedications