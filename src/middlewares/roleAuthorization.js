const LoggerService = require("../services/LoggerService");
const { userRoleEnum } = require("../enums/userRoleEnum");

/**
 * Check if user has required role(s)
 * 
 * @param {string[]} allowedRoles - roles that are allowed to access
 * @returns {import('express').RequestHandler}
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    const loggerService = LoggerService.getInstance();
    const session = req.body.session;

    if (!session) {
      loggerService.warn("middleware@requireRole", {
        requestId: req.requestId,
        userIp: req.userIp,
        reason: "No session found",
        type: "security"
      });
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const userRole = session.role;

    if (!allowedRoles.includes(userRole)) {
      loggerService.warn("middleware@requireRole", {
        requestId: req.requestId,
        userIp: req.userIp,
        userRole,
        allowedRoles,
        reason: "Insufficient permissions",
        type: "security"
      });
      return res.status(403).json({
        message: "Forbidden - insufficient permissions",
      });
    }

    next();
  };
};

/**
 * Check if user is admin
 */
const isAdmin = requireRole(userRoleEnum.admin);

/**
 * Check if user is admin or manager
 */
const isAdminOrManager = requireRole(userRoleEnum.admin, userRoleEnum.manager);

/**
 * Check if user is admin, manager or cashier (read operations)
 */
const isCashierOrHigher = requireRole(userRoleEnum.admin, userRoleEnum.manager, userRoleEnum.cashier);

/**
 * Check if user is admin, manager or cashier (write operations like bill create)
 */
const isAdminOrManagerOrCashier = requireRole(userRoleEnum.admin, userRoleEnum.manager, userRoleEnum.cashier);

module.exports = {
  requireRole,
  isAdmin,
  isAdminOrManager,
  isCashierOrHigher,
  isAdminOrManagerOrCashier,
};