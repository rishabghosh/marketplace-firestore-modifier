const {addStock,} = require("./firestore")

const sendResponse = (res, code, body) => {
    res.status(code);
    body ? res.send(body) : res.send()
};

function createStockData(scSkuId, buVariantId, quantity, lastModifiedDate, sellerId) {
    return {
        "sc_sku_id": scSkuId,
        "bu_variant_id": buVariantId,
        "quantity": quantity,
        "last_modified_date": lastModifiedDate,
        "seller_id": sellerId
    };
}

const addStockHandler = async (req, res) => {
    const {scSkuId, buVariantId, quantity, lastModifiedDate, sellerId, tenant} = req.body;
    const newStock = createStockData(scSkuId, buVariantId, quantity, lastModifiedDate, sellerId);

    try {
        await addStock(newStock, buVariantId, tenant);
        sendResponse(res, 201)
    } catch (e) {
        console.error(e)
        sendResponse(res, 500, e)
    }
}

module.exports = {
    addStockHandler
}