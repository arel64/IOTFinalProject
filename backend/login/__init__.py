import json
import logging
import hashlib
import azure.functions as func
from schemaUtils import createTableIfNotExists, getStoresTableName
from TokenUtils import TokenCredentials

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return func.HttpResponse(
                json.dumps({'error': 'Email and password are required. Please try again.'}),
                status_code=400,
                mimetype='application/json'
            )
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        _, table_client = createTableIfNotExists(getStoresTableName())
        stores = table_client.query_entities(f"Email eq '{email}'")
        store_list = list(stores)

        if not store_list:
            return func.HttpResponse(json.dumps({'error': 'Invalid email. Please try again.'}), status_code=401, mimetype='application/json')

        store_entity = store_list[0]
        if store_entity['Password'] != password_hash:
           return func.HttpResponse('{"error": "Incorrect Password. Please try again."}',
                                     status_code=401,
                                     mimetype='application/json')

        token = TokenCredentials.create(store_entity['StoreName'])
        
        return func.HttpResponse(
            json.dumps({'token': token}),
            status_code=200,
            mimetype='application/json'
        )

    except Exception as e:
        logging.error(f"Exception: {e}")
        return func.HttpResponse(json.dumps({'error': 'Something went wrong. Please try again.'}), status_code=500, mimetype='application/json')
