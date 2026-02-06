import { Schema, model } from 'mongoose';

const reportSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  data: Schema.Types.Mixed,
  type: {
    type: String,
    enum: ['monthly', 'yearly', 'custom'],
    default: 'monthly',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default model('Report', reportSchema);
