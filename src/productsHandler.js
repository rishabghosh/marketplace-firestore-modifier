const {
  getAllProducts,
  getProductRefs,
  updateValues,
  getProducts,
  addVariant,
  deleteRef,
  getDocRef
} = require("./firestore")
const {getUTCTimeStamp} = require("./dateUtils")
const {SKU_ID_FIELD, PRODUCT_ID_FIELD} = require("./constants")

const sendResponse = (res, code, body) => {
  res.status(code);
  body ? res.send(body) : res.send()
};


const handleAllProducts = async (req, res) => {
  const {tenant} = req.query;
  try {
    const allProducts = await getAllProducts(tenant)
    sendResponse(res, 200, allProducts)
  } catch (e) {
    sendResponse(res, 500, e)
  }
}

const updateProductDetails = async (req, res) => {
  const {tenant} = req.query;
  const {productIds, updatedValues} = req.body
  try {
    const productRefs = await getProductRefs(productIds, tenant)
    await updateValues(productRefs, updatedValues, tenant)
    sendResponse(res, 204)
  } catch (e) {
    sendResponse(res, 500, e)
  }
}

const handleProduct = async (req, res) => {
  const {tenant} = req.query;
  const {productId} = req.params;
  try {
    const products = await getProducts(tenant, productId)
    sendResponse(res, 200, products)
  } catch (e) {
    console.error(e)
    sendResponse(res, 500, e)
  }
}

const createVariantData = (name, variantId, tenant, categoryId, productId, scId) => {
  return {
    "sc_product_title": name,
    "sc_sku_id": variantId,
    "sc_operator_code": tenant,
    "sc_category_id": categoryId,
    "sc_status": 0,
    "bu_status": 0,
    "sc_config_id": productId,
    "bu_sku_id": variantId,
    "sc_product_identifier": "product",
    "sc_id": scId,
    "last_modified_date": getUTCTimeStamp(),
    "bu_product_id": productId
  }
}

const addVariantHandler = async (req, res) => {
  const {name, productId, variantId, categoryId, tenant} = req.body;
  const scId = `${productId}-${variantId}`;
  const newVariant = createVariantData(name, variantId, tenant, categoryId, productId, scId)

  try {
    await addVariant(newVariant, scId, tenant)
    sendResponse(res, 201)
  } catch (e) {
    console.error(e)
    sendResponse(res, 500, e)
  }
}

const deleteHandler = async (req, res, field) => {
  const {id} = req.params
  const {tenant} = req.query
  try {
    const docRef = await getDocRef(field, id, tenant)
    await deleteRef(docRef, tenant)
    sendResponse(res, 204)
  } catch (e) {
    console.error(e)
    sendResponse(res, 500, e)
  }
};

const deleteVariantHandler = (req, res) => deleteHandler(req, res, SKU_ID_FIELD)

const deleteProductHandler = (req, res) => deleteHandler(req, res, PRODUCT_ID_FIELD)

const importCoreCatelogHandler = async (req, res) => {
  const {id: productId, defaultParentCategoryId: categoryId, variants} = req.body;
  const {tenant} = req.query

  const allVariants = variants.map(variant => {
    const {id: variantId, name} = variant;
    const scId = `${productId}-${variantId}`;
    const newVariant = createVariantData(name, variantId, tenant, categoryId, productId, scId)
    return addVariant(newVariant, scId, tenant)
  })

  try {
    await Promise.all(allVariants)
    sendResponse(res, 201)
  } catch (e) {
    console.error(e)
    sendResponse(res, 500)
  }
}

const deleteByRefHandler = async (req, res) => {
  const {tenant} = req.query;
  const {id} = req.params
  try {
    await deleteRef(id, tenant)
    sendResponse(res, 204)
  } catch (e) {
    console.error(e)
    sendResponse(res, 500)
  }
}

module.exports = {
  handleAllProducts,
  updateProductDetails,
  handleProduct,
  addVariantHandler,
  deleteVariantHandler,
  deleteProductHandler,
  importCoreCatelogHandler,
  deleteByRefHandler
}