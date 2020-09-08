const {firestore} = require("./firebaseInit")
const {chunk} = require("lodash")
const {
  MARKETPLACE_COLLECTION,
  PRODUCT_COLLECTION,
  ORDER_BY_FIELD,
  PRODUCT_ID_FIELD
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

module.exports = {getAllProducts, getProductRefs, updateValues, getProducts, addVariant, getDocRef, deleteRef}

