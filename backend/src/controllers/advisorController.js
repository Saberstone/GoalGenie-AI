const { GoogleGenAI } = require('@google/genai');
const Goal = require('../models/Goal');
const Expense = require('../models/Expense');

const MODEL = 'gemini-3.5-flash-lite'; 

// Sob hishab plain JS e, LLM keno math korte na hoy=
const buildGoalContext = (goals) => {
  const today = new Date();
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  if (goals.length === 0) return 'The user has no goals yet.';

  const lines = goals.map((g) => {
    const remaining = Math.max(g.targetAmount - g.currentAmount, 0);
    const percent = Math.round((g.currentAmount / g.targetAmount) * 100);
    let line = `- ${g.type} goal "${g.title}": saved ${fmt(g.currentAmount)} of ${fmt(g.targetAmount)} (${percent}%), remaining ${fmt(remaining)}, monthly contribution ${fmt(g.monthlyContribution)}.`;

    if (remaining === 0) {
      return line + ' Goal is fully funded.';
    }

    if (g.monthlyContribution > 0) {
      const monthsNeeded = Math.ceil(remaining / g.monthlyContribution);
      const done = new Date(today);
      done.setMonth(done.getMonth() + monthsNeeded);
      line += ` At this pace it completes in ${monthsNeeded} months (${done.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}).`;

      if (g.targetDate) {
        const target = new Date(g.targetDate);
        const monthsUntil =
          (target.getFullYear() - today.getFullYear()) * 12 +
          (target.getMonth() - today.getMonth());
        if (monthsUntil > 0) {
          const required = Math.ceil(remaining / monthsUntil);
          line += ` Target date is ${target.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}; to hit it the user needs ${fmt(required)}/month. Status: ${monthsNeeded <= monthsUntil ? 'ON TRACK' : 'BEHIND SCHEDULE'}.`;
        } else {
          line += ' The target date has already passed.';
        }
      }
    } else {
      line += ' No monthly contribution is set.';
    }
    return line;
  });

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalMonthly = goals.reduce((s, g) => s + g.monthlyContribution, 0);

  return `${lines.join('\n')}\n\nTotals: saved ${fmt(totalSaved)} across ${goals.length} goals, ${fmt(totalMonthly)} per month in total contributions.`;
};

const buildExpenseContext = (expenses) => {
  if (expenses.length === 0) {
    return 'The user has not logged any expenses yet.';
  }

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  const now = new Date();

  const thisMonth = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
  });

  const sumBy = (list) => list.reduce((s, e) => s + e.amount, 0);
  const byCategory = (list) => {
    const map = {};
    list.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  };

  const thisMonthByCategory = byCategory(thisMonth);
  const lastMonthByCategory = byCategory(lastMonth);

  const categoryLines = Object.entries(thisMonthByCategory).map(([cat, amt]) => {
    const lastAmt = lastMonthByCategory[cat] || 0;
    const change =
      lastAmt > 0 ? Math.round(((amt - lastAmt) / lastAmt) * 100) : null;
    return `  - ${cat}: ${fmt(amt)} this month${
      change !== null ? ` (${change > 0 ? '+' : ''}${change}% vs last month)` : ''
    }`;
  });

  return `This month's total spending: ${fmt(sumBy(thisMonth))} across ${thisMonth.length} transactions.
Last month's total spending: ${fmt(sumBy(lastMonth))}.
Spending by category this month:\n${categoryLines.join('\n') || '  (none)'}`;
};

const SYSTEM_PROMPT = `You are GoalGenie, a friendly AI savings advisor inside a personal finance app for Indian users.

Rules:
- Use ONLY the numbers in the user's goal data. All calculations (months needed, required monthly amount, on-track status) are already done. Quote them, never recalculate or invent figures.
- If the data isn't enough to answer (for example spending or expenses, which the app doesn't track yet), say so honestly and suggest what the user could do.
- Give practical, specific suggestions based on their real goals. Keep answers short (under 120 words), in plain language, with amounts in ₹.
- Reply in the same language and style the user writes in (English, Bengali, or romanized Bengali).
- You give educational guidance, not licensed financial advice. Never recommend specific stocks or funds.
- Expense data is now available — use it to suggest realistic ways the user could free up more money for their goals, comparing this month vs last month when relevant;`

// @route POST /api/advisor/ask
const askAdvisor = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'Please type a question' });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'AI is not configured on the server' });
    }

    const goals = await Goal.find({ userId: req.user._id }).lean();
    const expenses = await Expense.find({ userId: req.user._id }).lean();
    const goalContext = buildGoalContext(goals);
    const expenseContext = buildExpenseContext(expenses);

    // History clean kora, Gemini te assistant er role er naam "model"
    const cleanHistory = Array.isArray(history)
      ? history
          .filter(
            (m) =>
              (m.role === 'user' || m.role === 'assistant') &&
              typeof m.content === 'string' &&
              m.content.trim()
          )
          .slice(-8)
      : [];
    while (cleanHistory.length && cleanHistory[0].role !== 'user') {
      cleanHistory.shift();
    }

    const contents = [
      ...cleanHistory.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      { role: 'user', parts: [{ text: message.trim().slice(0, 1000) }] },
    ];

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\nUser's name: ${req.user.name}\n\nUser's goal data:\n${goalContext}\n\nUser's expense data:\n${expenseContext}`,
        maxOutputTokens: 500,
      },
    });

    res.status(200).json({ reply: response.text || 'Sorry, I could not come up with an answer.' });
  } catch (error) {
    console.error('Advisor error:', error.message);
    if (error.status === 429) {
      return res.status(429).json({ message: 'Too many questions too fast. Please wait a minute and try again.' });
    }
    res.status(500).json({ message: 'The Genie is having trouble right now. Please try again.' });
  }
};

const User = require('../models/User');

// @route POST /api/advisor/allocation
const getAllocationAdvice = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: 'AI is not configured on the server' });
    }

    const user = await User.findById(req.user._id);
    const goals = await Goal.find({ userId: req.user._id, status: 'active' }).lean();

    if (goals.length === 0) {
      return res.status(200).json({ reply: 'You have no active goals yet. Add a goal first to get an allocation suggestion.' });
    }

    const income = user.monthlyIncome || 0;
    const totalContribution = goals.reduce((s, g) => s + g.monthlyContribution, 0);
    const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

    const goalLines = goals
      .map((g) => {
        const remaining = Math.max(g.targetAmount - g.currentAmount, 0);
        const share = totalContribution > 0 ? Math.round((g.monthlyContribution / totalContribution) * 100) : 0;
        return `- "${g.title}" (${g.type}): currently gets ${fmt(g.monthlyContribution)}/month (${share}% of total contributions), ${fmt(remaining)} remaining${g.targetDate ? `, target date ${new Date(g.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}` : ''}.`;
      })
      .join('\n');

    const context = `Monthly income: ${fmt(income)}.
Total committed to goals: ${fmt(totalContribution)} (${income > 0 ? Math.round((totalContribution / income) * 100) : 'unknown'}% of income).
Remaining uncommitted income: ${fmt(Math.max(income - totalContribution, 0))}.

Goals:\n${goalLines}`;

    const prompt = `Based on this user's income and goals, suggest how they should prioritize or rebalance their monthly contributions across goals. If total contributions already exceed income, flag that clearly. Be specific with numbers, not vague. Keep it under 150 words.`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: `${SYSTEM_PROMPT}\n\nUser's name: ${req.user.name}\n\n${context}`,
        maxOutputTokens: 400,
      },
    });

    res.status(200).json({
      reply: response.text || 'Could not generate a suggestion right now.',
      income,
      totalContribution,
      goals: goals.map((g) => ({
        title: g.title,
        type: g.type,
        monthlyContribution: g.monthlyContribution,
        share: totalContribution > 0 ? Math.round((g.monthlyContribution / totalContribution) * 100) : 0,
      })),
    });
  } catch (error) {
    console.error('Allocation advice error:', error.message);
    res.status(500).json({ message: 'The Genie is having trouble right now. Please try again.' });
  }
};
module.exports = { askAdvisor, getAllocationAdvice };