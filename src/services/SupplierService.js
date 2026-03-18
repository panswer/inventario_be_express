const Supplier = require('../models/Supplier');

class SupplierService {
    static instance;

    static getInstance() {
        if (!this.instance) {
            this.instance = new SupplierService();
        }

        return this.instance;
    }

    static destroyInstance() {
        delete this.instance;
    }

    getSuppliers(onlyEnabled = false) {
        const filter = onlyEnabled ? { isEnabled: true } : {};
        return Supplier.find(filter);
    }

    getSupplierById(supplierId) {
        return Supplier.findById(supplierId);
    }

    createSupplier(supplierData) {
        return new Supplier(supplierData).save();
    }

    updateSupplierById(supplierId, updateData) {
        return Supplier.findByIdAndUpdate(supplierId, updateData, { new: true });
    }

    async toggleSupplier(supplierId) {
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            return null;
        }
        
        supplier.isEnabled = !supplier.isEnabled;
        return supplier.save();
    }

    getSuppliersByIds(supplierIds) {
        return Supplier.find({ _id: { $in: supplierIds } });
    }

    getSupplierByRif(rif) {
        return Supplier.findOne({ rif: { $regex: new RegExp(`^${rif}$`, 'i') } });
    }
}

module.exports = SupplierService;
