const SupplierService = require("../services/SupplierService");
const LoggerService = require("../services/LoggerService");

const getSuppliers = async (req, res) => {
    const { onlyEnabled } = req.query;
    const supplierService = SupplierService.getInstance();

    const suppliers = await supplierService.getSuppliers(onlyEnabled === "true");

    return res.status(200).json({
        suppliers,
    });
};

const getSupplierById = async (req, res) => {
    const supplierId = req.params.supplierId;
    const supplierService = SupplierService.getInstance();
    const loggerService = LoggerService.getInstance();

    let supplier;
    try {
        supplier = await supplierService.getSupplierById(supplierId);
    } catch (error) {
        loggerService.error(
            "supplierService@getSupplierById",
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: error?.message ?? "Unknown error",
                type: "logic",
            }
        );
        return res.status(500).json({
            message: "Internal error",
        });
    }

    if (!supplier) {
        return res.status(404).json({
            message: "Supplier not found",
        });
    }

    res.status(200).json({
        supplier,
    });
};

const createSupplier = async (req, res) => {
    const body = req.body;
    const supplierService = SupplierService.getInstance();
    const loggerService = LoggerService.getInstance();

    const existingSupplier = await supplierService.getSupplierByRif(body.rif);
    if (existingSupplier) {
        loggerService.warn(
            "supplierService@getSupplierByRif",
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: "Duplicated supplier rif",
                type: "logic",
            }
        );
        return res.status(400).json({
            code: 4004,
        });
    }

    let supplier;
    try {
        supplier = await supplierService.createSupplier({
            name: body.name,
            rif: body.rif,
            phone: body.phone,
            address: body.address,
            contactPerson: body.contactPerson,
            createdBy: body.session._id,
        });
    } catch (error) {
        loggerService.error(
            "supplierService@createSupplier",
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: error?.message ?? "Unknown error",
                type: "logic",
            }
        );
        return res.status(400).json({
            code: 4001,
        });
    }

    res.status(201).json({
        supplier,
    });
};

const updateSupplierById = async (req, res) => {
    const supplierId = req.params.supplierId;
    const { name, rif, phone, address, contactPerson } = req.body;
    const supplierService = SupplierService.getInstance();
    const loggerService = LoggerService.getInstance();

    let supplier;
    try {
        supplier = await supplierService.getSupplierById(supplierId);
    } catch (error) {
        loggerService.error(
            "supplierService@getSupplierById",
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: error?.message ?? "Unknown error",
                type: "logic",
            }
        );
        return res.status(500).json({
            message: "Internal error",
        });
    }

    if (!supplier) {
        loggerService.error(
            "supplierService@getSupplierById",
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: "Supplier not found",
                type: "logic",
            }
        );
        return res.status(404).json({
            message: "Supplier not found",
        });
    }

    if (rif) {
        const existingSupplier = await supplierService.getSupplierByRif(rif);
        if (existingSupplier && existingSupplier._id.toString() !== supplierId) {
            loggerService.warn(
                "supplierService@getSupplierByRif",
                {
                    requestId: req.requestId,
                    userIp: req.userIp,
                    body: req.body,
                    reason: "Duplicated supplier rif",
                    type: "logic",
                }
            );
            return res.status(400).json({
                code: 4004,
            });
        }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (rif) updateData.rif = rif;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (contactPerson !== undefined) updateData.contactPerson = contactPerson;

    try {
        supplier = await supplierService.updateSupplierById(supplierId, updateData);
    } catch (error) {
        loggerService.error(
            "supplierService@updateSupplierById",
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: error?.message ?? "Unknown error",
                type: "logic",
            }
        );
        return res.status(500).json({
            message: "Internal error",
        });
    }

    res.status(200).json({
        supplier,
    });
};

const toggleSupplier = async (req, res) => {
    const supplierId = req.params.supplierId;
    const supplierService = SupplierService.getInstance();
    const loggerService = LoggerService.getInstance();

    let supplier;
    try {
        supplier = await supplierService.getSupplierById(supplierId);
    } catch (error) {
        loggerService.error(
            "supplierService@getSupplierById",
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: error?.message ?? "Unknown error",
                type: "logic",
            }
        );
        return res.status(500).json({
            message: "Internal error",
        });
    }

    if (!supplier) {
        loggerService.error(
            "supplierService@getSupplierById",
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: "Supplier not found",
                type: "logic",
            }
        );
        return res.status(404).json({
            message: "Supplier not found",
        });
    }

    try {
        supplier = await supplierService.toggleSupplier(supplierId);
    } catch (error) {
        loggerService.error(
            "supplierService@toggleSupplier",
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: error?.message ?? "Unknown error",
                type: "logic",
            }
        );
        return res.status(500).json({
            message: "Internal error",
        });
    }

    res.status(200).json({
        supplier,
    });
};

module.exports = {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplierById,
    toggleSupplier,
};
