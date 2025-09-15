const { Router } = require("express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { version } = require("../package.json");

const router = Router();

/**
 * @type {swaggerJsDoc.Options}
 */
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.4",
    info: {
      title: "Documentación de inventario API",
      version,
      description: "Documentación de API utilizado para manejo de inventario",
    },
    basePath: "/",
    host: `localhost:${process.env.SERVER_PORT}`,
  },
  apis: ["./src/routes/*.js", "./src/models/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = router;
