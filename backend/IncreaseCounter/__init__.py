import logging
import azure.functions as func
import os
from azure.data.tables import TableClient
import json

def main(req: func.HttpRequest,
         signalrHub: func.Out[str]) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    try:
        connection_string = os.getenv('AzureWebJobsStorage')
        with TableClient.from_connection_string(connection_string, table_name='myTable') as table:
            entity = table.get_entity("counter", "counter1")
            count = entity['value'] = entity['value'] + 1
            table.update_entity(entity=entity)
        
        signalrHub.set(json.dumps({
            'target': 'newCountUpdate',
            'arguments': [f'{count}']
        }))
        return func.HttpResponse(f"{count}", status_code=200)
    except Exception as e:
        logging.error(e)
        return func.HttpResponse(f"Something went wrong {e}", status_code=500)
    
