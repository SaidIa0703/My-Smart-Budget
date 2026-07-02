// tests/unit/services/budget-calculator.test.js

const filterRelevantTransactions = (transactions, budget) =>
  transactions.filter(t =>
    t.category_id === budget.category_id &&
    t.type === 'expense' &&
    new Date(t.date) >= new Date(budget.start_date) &&
    (!budget.end_date || new Date(t.date) <= new Date(budget.end_date))
  );

const calculateTotalSpent = (transactions) =>
  transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

const determineBudgetStatus = (spent, limit) => {
  const pct = (spent / limit) * 100;
  if (pct > 100) return 'critical';
  if (pct > 80)  return 'warning';
  if (pct > 50)  return 'normal';
  return 'healthy';
};

const calculateBudgetStatus = (budget, transactions) => {
  const relevant = filterRelevantTransactions(transactions, budget);
  const totalSpent = calculateTotalSpent(relevant);
  return {
    total: totalSpent,
    status: determineBudgetStatus(totalSpent, budget.amount),
    remaining: budget.amount - totalSpent,
    percentage: (totalSpent / budget.amount) * 100,
  };
};

// ── Tests ─────────────────────────────────────────────────────────────────

describe('calculateBudgetStatus', () => {
  const budget = {
    id: 1,
    category_id: 5,
    amount: 500,
    start_date: '2025-01-01',
    end_date: null,
  };

  const transactions = [
    { category_id: 5, type: 'expense', amount: '50',  date: '2025-01-05' },
    { category_id: 5, type: 'expense', amount: '75',  date: '2025-01-10' },
    { category_id: 5, type: 'expense', amount: '25',  date: '2025-01-15' },
    { category_id: 2, type: 'expense', amount: '200', date: '2025-01-08' }, // autre catégorie
    { category_id: 5, type: 'income',  amount: '100', date: '2025-01-20' }, // revenu exclu
  ];

  test('calcule correctement le total dépensé', () => {
    const result = calculateBudgetStatus(budget, transactions);
    expect(result.total).toBe(150); // 50 + 75 + 25
  });

  test('calcule le restant disponible', () => {
    const result = calculateBudgetStatus(budget, transactions);
    expect(result.remaining).toBe(350); // 500 - 150
  });

  test('calcule le pourcentage utilisé', () => {
    const result = calculateBudgetStatus(budget, transactions);
    expect(result.percentage).toBe(30); // 150/500 * 100
  });

  test('retourne le statut "healthy" quand < 50%', () => {
    const result = calculateBudgetStatus(budget, transactions);
    expect(result.status).toBe('healthy');
  });

  test('retourne le statut "warning" quand > 80%', () => {
    const heavyTransactions = [
      { category_id: 5, type: 'expense', amount: '450', date: '2025-01-05' },
    ];
    const result = calculateBudgetStatus(budget, heavyTransactions);
    expect(result.status).toBe('warning');
  });

  test('retourne le statut "critical" en cas de dépassement', () => {
    const overBudget = [
      { category_id: 5, type: 'expense', amount: '600', date: '2025-01-05' },
    ];
    const result = calculateBudgetStatus(budget, overBudget);
    expect(result.status).toBe('critical');
    expect(result.remaining).toBe(-100);
  });

  test('ignore les transactions hors période', () => {
    const budgetWithDates = { ...budget, start_date: '2025-02-01', end_date: '2025-02-28' };
    const result = calculateBudgetStatus(budgetWithDates, transactions);
    expect(result.total).toBe(0); // toutes les transactions sont en janvier
  });

  test('ignore les transactions d\'autres catégories', () => {
    const otherCatTransactions = [
      { category_id: 2, type: 'expense', amount: '999', date: '2025-01-05' },
    ];
    const result = calculateBudgetStatus(budget, otherCatTransactions);
    expect(result.total).toBe(0);
  });
});

describe('determineBudgetStatus', () => {
  test('retourne "healthy" pour 0%', () => {
    expect(determineBudgetStatus(0, 500)).toBe('healthy');
  });
  test('retourne "normal" pour 60%', () => {
    expect(determineBudgetStatus(300, 500)).toBe('normal');
  });
  test('retourne "warning" pour 85%', () => {
    expect(determineBudgetStatus(425, 500)).toBe('warning');
  });
  test('retourne "critical" pour 110%', () => {
    expect(determineBudgetStatus(550, 500)).toBe('critical');
  });
});
