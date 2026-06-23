const { Schema, model } = require('mongoose');

const reportSchema = new Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['monthly','yearly','custom'], default: 'monthly' },
  data: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = model('Report', reportSchema);
