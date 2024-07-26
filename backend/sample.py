# -------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See License.txt in the project root for
# license information.
# --------------------------------------------------------------------------
import pickle
import re
def sample_analyze_healthcare_entities() -> None:

    # [START analyze_healthcare_entities]
    import os
    from azure.core.credentials import AzureKeyCredential
    from azure.ai.textanalytics import TextAnalyticsClient
    endpoint = "https://iot-text.cognitiveservices.azure.com/"
    key = 
    filename = "result_actual.pkl"
    if not os.path.isfile(filename):
        text_analytics_client = TextAnalyticsClient(
            endpoint=endpoint,
            credential=AzureKeyCredential(key),
        )

        documents = [
            words_list
        ]

        poller = text_analytics_client.begin_analyze_healthcare_entities(documents)
        result = poller.result()
        
        with open(filename, "wb") as file:
            pickle.dump(result, file) # type: ignore
    result = pickle.load(open(filename, "rb")) # type: ignore
    docs = [doc for doc in result if not doc.is_error]

    print("Let's first visualize the outputted healthcare result:")
    medications = set()
    for doc in docs:
        for entity in doc.entities:
            if not entity.category == "MedicationName":
                continue
            medications.add(entity.text.lower().split(" ")[0])

    print("Medications: ", medications)

if __name__ == "__main__":
    sample_analyze_healthcare_entities()