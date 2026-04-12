const UserService = require('../services/UserService');
const LoggerService = require('../services/LoggerService');

/**
 * Get all users
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 *
 * @returns {Promise<void>}
 */
const getUsers = async (req, res) => {
  const userService = UserService.getInstance();
  const loggerService = LoggerService.getInstance();

  try {
    const users = await userService.getAllUsers();
    return res.status(200).json({ users });
  } catch (error) {
    loggerService.error('userService@getUsers', {
      requestId: req.requestId,
      userIp: req.userIp,
      reason: error?.message ?? 'Unknown error',
      type: 'logic',
    });
    return res.status(500).json({ message: 'Internal error' });
  }
};

/**
 * Update user role
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 *
 * @returns {Promise<void>}
 */
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const userService = UserService.getInstance();
  const loggerService = LoggerService.getInstance();

  try {
    const user = await userService.updateUserRole(id, role);
    return res.status(200).json({ user });
  } catch (error) {
    loggerService.error('userService@updateUserRole', {
      requestId: req.requestId,
      userIp: req.userIp,
      reason: error?.message ?? 'Unknown error',
      type: 'logic',
    });

    if (error.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }
    if (error.message === 'Invalid role') {
      return res.status(400).json({ message: 'Invalid role' });
    }

    return res.status(500).json({ message: 'Internal error' });
  }
};

/**
 * Assign warehouse to user
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 *
 * @returns {Promise<void>}
 */
const assignWarehouse = async (req, res) => {
  const { id } = req.params;
  const { warehouseId } = req.body;
  const userService = UserService.getInstance();
  const loggerService = LoggerService.getInstance();

  try {
    const user = await userService.assignWarehouse(id, warehouseId);
    return res.status(200).json({ user });
  } catch (error) {
    loggerService.error('userService@assignWarehouse', {
      requestId: req.requestId,
      userIp: req.userIp,
      reason: error?.message ?? 'Unknown error',
      type: 'logic',
    });

    if (error.message === 'User not found') {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(500).json({ message: 'Internal error' });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
  assignWarehouse,
};
