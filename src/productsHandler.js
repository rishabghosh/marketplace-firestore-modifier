const {getAllProducts, getProductRefs, updateValues} = require("./firestore")

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


module.exports = {handleAllProducts, updateProductDetails}