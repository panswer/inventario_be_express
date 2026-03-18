const CategoryService = require("../services/CategoryService");
const LoggerService = require("../services/LoggerService");

/**
 * Get all categories
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const getCategories = async (req, res) => {
    const { onlyEnabled } = req.query;
    const categoryService = CategoryService.getInstance();

    const categories = await categoryService.getCategories(onlyEnabled === "true");

    return res.status(200).json({
        categories,
    });
};

/**
 * Get a category by id
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const getCategoryById = async (req, res) => {
    const categoryId = req.params.categoryId;
    const categoryService = CategoryService.getInstance();
    const loggerService = LoggerService.getInstance();

    let category;
    try {
        category = await categoryService.getCategoryById(categoryId);
    } catch (error) {
        loggerService.error(
            "categoryService@getCategoryById",
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

    if (!category) {
        return res.status(404).json({
            message: "Category not found",
        });
    }

    res.status(200).json({
        category,
    });
};

/**
 * Create a new category
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const createCategory = async (req, res) => {
    const body = req.body;
    const categoryService = CategoryService.getInstance();
    const loggerService = LoggerService.getInstance();

    const existingCategory = await categoryService.getCategoryByName(body.name);
    if (existingCategory) {
        loggerService.warn(
            "categoryService@getCategoryByName",
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: "Duplicated category name",
                type: "logic",
            }
        );
        return res.status(400).json({
            code: 4004,
        });
    }

    let category;
    try {
        category = await categoryService.createCategory({
            name: body.name,
            createdBy: body.session._id,
        });
    } catch (error) {
        loggerService.error(
            "categoryService@createCategory",
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
        category,
    });
};

/**
 * Update a category by id
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const updateCategoryById = async (req, res) => {
    const categoryId = req.params.categoryId;
    const { name } = req.body;
    const categoryService = CategoryService.getInstance();
    const loggerService = LoggerService.getInstance();

    let category;
    try {
        category = await categoryService.getCategoryById(categoryId);
    } catch (error) {
        loggerService.error(
            "categoryService@getCategoryById",
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

    if (!category) {
        loggerService.error(
            "categoryService@getCategoryByName",
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: "Category not found",
                type: "logic",
            }
        );
        return res.status(404).json({
            message: "Category not found",
        });
    }

    const existingCategory = await categoryService.getCategoryByName(name);
    if (existingCategory && existingCategory._id.toString() !== categoryId) {
        loggerService.warn(
            "categoryService@getCategoryByName",
            {
                requestId: req.requestId,
                userIp: req.userIp,
                body: req.body,
                reason: "Duplicated category name",
                type: "logic",
            }
        );
        return res.status(400).json({
            code: 4004,
        });
    }

    try {
        category = await categoryService.updateCategoryById(categoryId, { name });
    } catch (error) {
        loggerService.error(
            "categoryService@updateCategoryById",
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
        category,
    });
};

/**
 * Toggle category enabled/disabled status
 *
 * @param {import('express').Request} req - request
 * @param {import('express').Response} res - response
 *
 * @returns {Promise<void>}
 */
const toggleCategory = async (req, res) => {
    const categoryId = req.params.categoryId;
    const categoryService = CategoryService.getInstance();
    const loggerService = LoggerService.getInstance();

    let category;
    try {
        category = await categoryService.getCategoryById(categoryId);
    } catch (error) {
        loggerService.error(
            "categoryService@getCategoryById",
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

    if (!category) {
        return res.status(404).json({
            message: "Category not found",
        });
    }

    try {
        category = await categoryService.toggleCategory(categoryId);
    } catch (error) {
        loggerService.error(
            "categoryService@toggleCategory",
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
        category,
    });
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategoryById,
    toggleCategory,
};
