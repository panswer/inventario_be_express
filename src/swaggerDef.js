require("dotenv").config();
const { version } = require("../package.json");

module.exports = {
  openapi: "3.0.4",
  info: {
    title: "Documentación de inventario API",
    version,
    description: "Documentación de API utilizado para manejo de inventario",
  },
  basePath: "/",
  host: `localhost:${process.env.SERVER_PORT || 3000}`,
};