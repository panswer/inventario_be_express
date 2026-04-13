const ReportService = require('../services/ReportService');
const LoggerService = require('../services/LoggerService');

const buildFiltersFromQuery = query => {
  const filters = {};
  const { productId, warehouseId, type, startDate, endDate, houre } = query;

  if (productId) filters.productId = productId;
  if (warehouseId) filters.warehouseId = warehouseId;
  if (type) filters.type = type;

  if (houre === 'false' || houre === false) {
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
  } else {
    if (startDate) {
      filters.startDate = startDate.includes('T') ? startDate : `${startDate}T00:00:00`;
    } else {
      const today = new Date().toISOString().split('T')[0];
      filters.startDate = `${today}T00:00:00`;
    }
    if (endDate) {
      filters.endDate = endDate.includes('T') ? endDate : `${endDate}T23:59:59`;
    } else {
      const today = new Date().toISOString().split('T')[0];
      filters.endDate = `${today}T23:59:59`;
    }
  }

  return filters;
};

const getMovementsReport = async (req, res) => {
  const filters = buildFiltersFromQuery(req.query);
  const reportService = ReportService.getInstance();
  const loggerService = LoggerService.getInstance();

  try {
    const reportStream = await reportService.generateMovementsReport(filters);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_movimientos.xlsx');

    reportStream.on('error', err => {
      loggerService.error('reportService@generateMovementsReportStream', {
        requestId: req.requestId,
        userIp: req.userIp,
        reason: err?.message ?? 'Unknown stream error',
        type: 'logic',
      });
      if (!res.headersSent) {
        res.status(500).json({ message: 'Internal error' });
      } else {
        res.end();
      }
    });

    reportStream.pipe(res);
  } catch (error) {
    loggerService.error('reportService@generateMovementsReport', {
      requestId: req.requestId,
      userIp: req.userIp,
      reason: error?.message ?? 'Unknown error',
      type: 'logic',
    });
    return res.status(500).json({ message: 'Internal error' });
  }
};

const getSummaryReport = async (req, res) => {
  const filters = buildFiltersFromQuery(req.query);
  const reportService = ReportService.getInstance();
  const loggerService = LoggerService.getInstance();

  try {
    const buffer = await reportService.generateSummaryReport(filters);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_resumen.xlsx');

    return res.status(200).send(buffer);
  } catch (error) {
    loggerService.error('reportService@generateSummaryReport', {
      requestId: req.requestId,
      userIp: req.userIp,
      reason: error?.message ?? 'Unknown error',
      type: 'logic',
    });
    return res.status(500).json({ message: 'Internal error' });
  }
};

const getTransfersReport = async (req, res) => {
  const filters = buildFiltersFromQuery(req.query);
  const reportService = ReportService.getInstance();
  const loggerService = LoggerService.getInstance();

  try {
    const buffer = await reportService.generateTransfersReport(filters);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_transferencias.xlsx');

    return res.status(200).send(buffer);
  } catch (error) {
    loggerService.error('reportService@generateTransfersReport', {
      requestId: req.requestId,
      userIp: req.userIp,
      reason: error?.message ?? 'Unknown error',
      type: 'logic',
    });
    return res.status(500).json({ message: 'Internal error' });
  }
};

module.exports = {
  getMovementsReport,
  getSummaryReport,
  getTransfersReport,
};
