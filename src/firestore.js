const {firestore} = require("./firebaseInit")
const {chunk} = require("lodash")
const {
    MARKETPLACE_COLLECTION,
    PRODUCT_COLLECTION,
    STOCK_COLLECTION,
    ORDER_BY_FIELD,
    PRODUCT_ID_FIELD,
  BU_STATUS_FIELD
} = require("./constants")

const getProductCollection = (tenant, limit, offset) => {
    return firestore
        .collection(MARKETPLACE_COLLECTION)
        .doc(tenant)
        .collection(PRODUCT_COLLECTION)
    // .orderBy(ORDER_BY_FIELD)
    // .limit(limit)
    // .offset(offset);
};

const getStockCollection = (tenant) => {
    return firestore
        .collection(MARKETPLACE_COLLECTION)
        .doc(tenant)
        .collection(STOCK_COLLECTION);
};

const getDataFromSnapshot = snapshot => {
    const products = [];
    snapshot.forEach(doc => products.push(doc.data()));
    return products;
};

const getProductRefs = async (productIds, tenant) => {
    const firestoreClauseLimit = 10;
    const batchedProductIds = chunk(productIds, firestoreClauseLimit);
    const sourceCollectionRef = getProductCollection(tenant);

    const productListPromises = batchedProductIds.map(batchedIds =>
        sourceCollectionRef.where(PRODUCT_ID_FIELD, 'in', batchedIds).get(),
    );
    return Promise.all(productListPromises)
        .then(productListArray => {
            const docIds = [];
            productListArray.forEach(productList => {
                productList.forEach(doc => docIds.push(doc.id));
            });
            return docIds;
        })
};


const getAllProducts = (tenant) => {
    const productCollection = getProductCollection(tenant)
    return productCollection.get()
        .then(snapshot => getDataFromSnapshot(snapshot));
}

const updateValues = (productRefs, updatedValues, tenant) => {
    const productCollection = getProductCollection(tenant)
    const batch = firestore.batch();
    productRefs.forEach(productRef => {
        const docRef = productCollection.doc(productRef);
        batch.update(docRef, updatedValues);
    });
    return batch.commit()
}

const getProducts = (tenant, productId) => {
    const productCollection = getProductCollection(tenant)
    return productCollection
        .where("bu_product_id", "==", productId)
        .get()
        .then(snapshot => getDataFromSnapshot(snapshot));
}

const addVariant = async (variant, scId, tenant) => {
    const productCollection = getProductCollection(tenant)
    return await productCollection
        .doc(scId)
        .set(variant)
};

const addStock = async (variant, id, tenant) => {
    const stockCollection = getStockCollection(tenant)
    return await stockCollection
        .doc(id)
        .set(variant)
};

const getDocRef = async (field, value, tenant) => {
    const productCollection = getProductCollection(tenant)
    const collectionRefs = await productCollection.where(field, "==", value).get();
    const result = []
    collectionRefs.forEach(collectionRef => result.push(collectionRef.id));
    return result[0];
}

const deleteRef = (ref, tenant) => {
    const productCollection = getProductCollection(tenant)
    return productCollection.doc(ref).delete()
}

const findAllDocumentsByKeyValues = async (collection, key, values) => {
  const valuesInChunks = chunk(values, 10);
  const documentIds = [];

  const documentReferencesInChunks = valuesInChunks.map(valueChunk => collection.where(key, 'in', valueChunk).get());
  await Promise.all(documentReferencesInChunks)
    .then(chunks => chunks.forEach(chunk => chunk.forEach(document => documentIds.push(document.id))))

  return documentIds;
};

const isNewVariant = async (tenant, values) => {
  const productCollection = getProductCollection(tenant)
  const valuesInChunks = chunk(values, 10);
  const docData = [];

  const refs = valuesInChunks.map(valueChunk =>
    productCollection
      .where(PRODUCT_ID_FIELD, 'in', valueChunk)
      .where(BU_STATUS_FIELD, "==", 1)
      .get()
  )

  await Promise.all(refs)
    .then(chunks => chunks.forEach(chunk => chunk.forEach(document => docData.push(document.data()))))
  return values.map(value => {
    const result = docData.find(data => data[PRODUCT_ID_FIELD] === value)
    return {[value]: !!result}
  })
}

module.exports = {getAllProducts, getProductRefs, updateValues, getProducts, addVariant, addStock, getDocRef,
  deleteRef,
  isNewVariant
}

