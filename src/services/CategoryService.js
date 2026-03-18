const Category = require('../models/Category');

class CategoryService {
    /**
     * @type {CategoryService}
     */
    static instance;

    static getInstance() {
        if (!this.instance) {
            this.instance = new CategoryService();
        }

        return this.instance;
    }

    static destroyInstance() {
        delete this.instance;
    }

    /**
     * Get all categories
     * 
     * @param {boolean} [onlyEnabled] - Filter only enabled categories
     * @returns {Promise<Array<import('../models/Category')>>}
     */
    getCategories(onlyEnabled = false) {
        const filter = onlyEnabled ? { isEnabled: true } : {};
        return Category.find(filter);
    }

    /**
     * Get category by ID
     * 
     * @param {string} categoryId 
     * @returns {Promise<import('../models/Category')>}
     */
    getCategoryById(categoryId) {
        return Category.findById(categoryId);
    }

    /**
     * Create a new category
     * 
     * @param {Object} categoryData 
     * @returns {Promise<import('../models/Category')>}
     */
    createCategory(categoryData) {
        return new Category(categoryData).save();
    }

    /**
     * Update a category by ID
     * 
     * @param {string} categoryId 
     * @param {Object} updateData 
     * @returns {Promise<import('../models/Category')>}
     */
    updateCategoryById(categoryId, updateData) {
        return Category.findByIdAndUpdate(categoryId, updateData, { new: true });
    }

    /**
     * Toggle category enabled/disabled status
     * 
     * @param {string} categoryId 
     * @returns {Promise<import('../models/Category')>}
     */
    async toggleCategory(categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
            return null;
        }
        
        category.isEnabled = !category.isEnabled;
        return category.save();
    }

    /**
     * Get categories by IDs
     * 
     * @param {Array<string>} categoryIds 
     * @returns {Promise<Array<import('../models/Category')>>}
     */
    getCategoriesByIds(categoryIds) {
        return Category.find({ _id: { $in: categoryIds } });
    }

    /**
     * Get category by name
     * 
     * @param {string} name 
     * @returns {Promise<import('../models/Category')>}
     */
    getCategoryByName(name) {
        return Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    }
}

module.exports = CategoryService;
