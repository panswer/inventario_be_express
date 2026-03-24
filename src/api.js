const { Router } = require("express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerDefinition = require("./swaggerDef");

const router = Router();

/**
 * @type {swaggerJsDoc.Options}
 */
const swaggerOptions = {
  swaggerDefinition,
  apis: ["./src/routes/*.js", "./src/models/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = router;
