const ExcelJS = require('exceljs');
const { PassThrough } = require('stream');
const StockMovement = require('../models/StockMovement');
const { stockMovementEnum } = require('../enums/stockMovementEnum');
const { formatDateToCaracas } = require('../utils/date');

const MOVEMENT_TYPE_TRANSLATION = {
  [stockMovementEnum.initial]: 'Inicial',
  [stockMovementEnum.in]: 'Entrada',
  [stockMovementEnum.out]: 'Salida',
  [stockMovementEnum.adjust]: 'Ajuste',
  [stockMovementEnum.transfer]: 'Transferencia',
};

const SPANISH_COLUMNS_MOVEMENTS = [
  'Fecha',
  'Tipo',
  'Producto',
  'Almacén',
  'Cantidad',
  'Anterior',
  'Nuevo',
  'Razón',
  'Creado Por',
];

const SPANISH_COLUMNS_SUMMARY = [
  'Producto',
  'Almacén',
  'Total Entradas',
  'Total Salidas',
  'Cambio Neto',
];

const SPANISH_COLUMNS_TRANSFERS = [
  'Fecha',
  'Producto',
  'Almacén Origen',
  'Almacén Destino',
  'Cantidad',
];

class ReportService {
  static instance;

  /**
   * Get an instance
   *
   * @returns {ReportService}
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new ReportService();
    }
    return this.instance;
  }

  static destroyInstance() {
    delete this.instance;
  }

  buildMatchStage(filters = {}) {
    const matchStage = {};

    if (filters.productId) {
      matchStage.productId = filters.productId;
    }
    if (filters.warehouseId) {
      matchStage.warehouseId = filters.warehouseId;
    }
    if (filters.type) {
      matchStage.type = filters.type;
    }
    if (filters.startDate || filters.endDate) {
      matchStage.createdAt = {};
      if (filters.startDate) {
        matchStage.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        matchStage.createdAt.$lte = new Date(filters.endDate);
      }
    }

    return matchStage;
  }

  getMovementsAggregation(filters = {}) {
    const matchStage = this.buildMatchStage(filters);

    return [
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'warehouses',
          localField: 'warehouseId',
          foreignField: '_id',
          as: 'warehouse',
        },
      },
      { $unwind: { path: '$warehouse', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'warehouses',
          localField: 'transferToWarehouseId',
          foreignField: '_id',
          as: 'transferToWarehouse',
        },
      },
      {
        $lookup: {
          from: 'warehouses',
          localField: 'transferFromWarehouseId',
          foreignField: '_id',
          as: 'transferFromWarehouse',
        },
      },
      {
        $project: {
          _id: 1,
          type: 1,
          quantity: 1,
          previousQuantity: 1,
          newQuantity: 1,
          reason: 1,
          createdAt: 1,
          productName: { $ifNull: ['$product.name', 'Producto no encontrado'] },
          warehouseName: { $ifNull: ['$warehouse.name', 'Almacén no encontrado'] },
          userName: {
            $ifNull: ['$user.username', 'Usuario no encontrado'],
          },
          transferToWarehouseName: {
            $ifNull: [{ $arrayElemAt: ['$transferToWarehouse.name', 0] }, null],
          },
          transferFromWarehouseName: {
            $ifNull: [{ $arrayElemAt: ['$transferFromWarehouse.name', 0] }, null],
          },
        },
      },
    ];
  }

  createWorkbook(sheetName, columns) {
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.addRow(columns);

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    return { workbook, worksheet };
  }

  async *getMovementsGenerator(filters = {}) {
    const pipeline = this.getMovementsAggregation(filters);
    const cursor = StockMovement.aggregate(pipeline).cursor();

    for await (const doc of cursor) {
      yield doc;
    }
  }

  async generateMovementsReport(filters = {}) {
    const passThrough = new PassThrough();

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
      stream: passThrough,
      useStyles: true,
      useSharedStrings: true,
    });

    const worksheet = workbook.addWorksheet('Movimientos');
    worksheet.addRow(SPANISH_COLUMNS_MOVEMENTS);

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };
    headerRow.commit();

    // Procesamiento en background
    (async () => {
      try {
        const generator = this.getMovementsGenerator(filters);

        for await (const movement of generator) {
          const row = [
            formatDateToCaracas(movement.createdAt),
            MOVEMENT_TYPE_TRANSLATION[movement.type] || movement.type,
            movement.productName,
            movement.warehouseName,
            movement.quantity,
            movement.previousQuantity,
            movement.newQuantity,
            movement.reason || '',
            movement.userName,
          ];
          worksheet.addRow(row).commit(); // Importante: .commit() libera la memoria de la fila
        }

        worksheet.commit();
        await workbook.commit();
      } catch (error) {
        passThrough.destroy(error);
      }
    })();

    return passThrough;
  }

  async generateSummaryReport(filters = {}) {
    const matchStage = this.buildMatchStage(filters);

    const summaryData = await StockMovement.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'warehouses',
          localField: 'warehouseId',
          foreignField: '_id',
          as: 'warehouse',
        },
      },
      { $unwind: { path: '$warehouse', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            productId: '$productId',
            warehouseId: '$warehouseId',
          },
          productName: { $first: '$product.name' },
          warehouseName: { $first: '$warehouse.name' },
          totalIn: {
            $sum: {
              $cond: [
                { $in: ['$type', [stockMovementEnum.initial, stockMovementEnum.in]] },
                '$quantity',
                0,
              ],
            },
          },
          totalOut: {
            $sum: {
              $cond: [{ $eq: ['$type', stockMovementEnum.out] }, '$quantity', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          productName: 1,
          warehouseName: 1,
          totalIn: 1,
          totalOut: 1,
          netChange: { $subtract: ['$totalIn', '$totalOut'] },
        },
      },
      { $sort: { productName: 1, warehouseName: 1 } },
    ]);

    const { workbook, worksheet } = this.createWorkbook('Resumen', SPANISH_COLUMNS_SUMMARY);

    for (const row of summaryData) {
      worksheet.addRow([
        row.productName,
        row.warehouseName,
        row.totalIn,
        row.totalOut,
        row.netChange,
      ]);
    }

    return workbook.xlsx.writeBuffer();
  }

  async generateTransfersReport(filters = {}) {
    const matchStage = this.buildMatchStage({
      ...filters,
      type: stockMovementEnum.transfer,
    });

    const transfersData = await StockMovement.aggregate([
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'warehouses',
          localField: 'warehouseId',
          foreignField: '_id',
          as: 'warehouse',
        },
      },
      { $unwind: { path: '$warehouse', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'warehouses',
          localField: 'transferToWarehouseId',
          foreignField: '_id',
          as: 'transferToWarehouse',
        },
      },
      {
        $lookup: {
          from: 'warehouses',
          localField: 'transferFromWarehouseId',
          foreignField: '_id',
          as: 'transferFromWarehouse',
        },
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          quantity: 1,
          productName: { $ifNull: ['$product.name', 'Producto no encontrado'] },
          warehouseName: {
            $ifNull: ['$warehouse.name', 'Almacén no encontrado'],
          },
          transferToWarehouseName: {
            $ifNull: [{ $arrayElemAt: ['$transferToWarehouse.name', 0] }, null],
          },
          transferFromWarehouseName: {
            $ifNull: [{ $arrayElemAt: ['$transferFromWarehouse.name', 0] }, null],
          },
        },
      },
    ]);

    const { workbook, worksheet } = this.createWorkbook(
      'Transferencias',
      SPANISH_COLUMNS_TRANSFERS
    );

    for (const row of transfersData) {
      worksheet.addRow([
        formatDateToCaracas(row.createdAt),
        row.productName,
        row.transferFromWarehouseName || row.warehouseName,
        row.transferToWarehouseName || '',
        row.quantity,
      ]);
    }

    return workbook.xlsx.writeBuffer();
  }
}

module.exports = ReportService;
