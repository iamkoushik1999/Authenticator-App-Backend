import mongoose from 'mongoose';

const historySchema = mongoose.Schema(
  {
    user: {
      type: String,
      ref: 'User',
    },
    mode: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const historyModel = mongoose.model('History', historySchema);
export default historyModel;
