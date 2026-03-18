const express = require("express");
const swaggerRoutes = require("../api");
const { authorizationFn } = require("../middlewares/authorization");

const router = express.Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Enter your bearer token in the format **Bearer &lt;token&gt;**
 */

router.use("/auth", require("./authentication"));
router.use("/product", require("./product"));
router.use("/category", require("./category"));
router.use("/supplier", require("./supplier"));
router.use("/price", [authorizationFn], require("./price"));
router.use("/bill", [authorizationFn], require("./bill"));
router.use("/doc", swaggerRoutes);

module.exports = router;
