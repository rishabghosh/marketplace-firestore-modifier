const {getAllProducts, getProductRefs, updateValues, getProducts, addVariant} = require("./firestore")
const {getUTCTimeStamp} = require("./dateUtils")

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
  console.log(tenant, productId)
  try {
    const products = await getProducts(tenant, productId)
    sendResponse(res, 200, products)
  } catch (e) {
    console.error(e)
    sendResponse(res, 500, e)
  }
}

const addVariantHandler = async (req, res) => {
  const {name, productId, variantId, categoryId, tenant} = req.body;
  const scId = `${productId}-${variantId}`;
  const newVariant = {
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

  try {
    await addVariant(newVariant, scId, tenant)
    sendResponse(res, 200)
  } catch (e) {
    console.error(e)
    sendResponse(res, 500, e)
  }
}


module.exports = {handleAllProducts, updateProductDetails, handleProduct, addVariantHandler}