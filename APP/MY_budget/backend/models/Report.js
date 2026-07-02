const { Schema, model } = require('mongoose');

const monthlyReportSchema = new Schema({
  userId: {
    type: Number,
    required: true,
    index: true,
  },
  period: {
    month: { type: Number, required: true, min: 1, max: 12 },
    year:  { type: Number, required: true },
  },
  metrics: {
    totalExpenses:     { type: Number, default: 0 },
    totalIncome:       { type: Number, default: 0 },
    savingsRate:       { type: Number, default: 0 },
    categoryBreakdown: [
      {
        categoryName: String,
        amount:       Number,
        percentage:   Number,
      },
    ],
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model('MonthlyReport', monthlyReportSchema);
