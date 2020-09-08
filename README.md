# marketplace-firestore-modifier



## instructions -
 - use any working service account as env variable of GOOGLE_APPLICATION_CREDENTIALS in .env file
 - npm i
 - npm start
 
 
### update products

patch: localhost:5000/products/update?tenant=FACL

```json
{
    "productIds": ["101", "102", "103"],
    "updatedValues": {
        "bu_status": 0
    }
}
```


### get all products

get: localhost:5000/products/all?tenant=FACL


### get product

get: localhost:5000/products/<productId>?tenant=FACL


### create variant

post: localhost:5000/variant/create

```json
{
    "tenant": "FACL",
    "name": "Vestido",
    "productId": "7943149",
    "variantId": "7943151",
    "categoryId": "J05050101"
}
```

### delete product

delete: localhost:5000/product/<producdtId>?tenant=FACL


### delete variant

delete: localhost:5000/variant/<varinantId>?tenant=FACL

