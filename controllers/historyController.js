// Packages
import expressAsyncHandler from 'express-async-handler';
// Models
import historyModel from '../models/historyModel.js';

// --------------------------------------------------------------------------

// GET
// Get History
export const getHistory = expressAsyncHandler(async (req, res) => {
  const history = await historyModel.find({ user: req.user.id });

  res.status(200).json({ data: history });
});
