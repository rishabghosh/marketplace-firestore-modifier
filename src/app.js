const express = require("express");
const {
  handleAllProducts,
  updateProductDetails,
  handleProduct,
  addVariantHandler,
  deleteVariantHandler,
  deleteProductHandler,
  importCoreCatelogHandler,
  deleteByRefHandler
} = require("./productsHandler")
const bodyParser = require("body-parser");

const app = express();
const port = 5000

app.use(bodyParser.json());
app.get("/products/all", handleAllProducts);
app.patch("/products/update", updateProductDetails)
app.get("/products/:productId", handleProduct)
app.post("/variant/create", addVariantHandler)
app.delete("/variant/:id", deleteVariantHandler)
app.delete("/product/:id", deleteProductHandler)
app.post("/import/core-catelog", importCoreCatelogHandler)
app.delete("/ref/:id", deleteByRefHandler)

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});