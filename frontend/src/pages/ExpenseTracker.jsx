import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const categories = [
  { value: "food", icon: "🍔", label: "Food" },
  { value: "travel", icon: "🚕", label: "Travel" },
  { value: "shopping", icon: "🛍️", label: "Shopping" },
  { value: "bills", icon: "🧾", label: "Bills" },
  { value: "entertainment", icon: "🎬", label: "Entertainment" },
  { value: "rent", icon: "🏠", label: "Rent" },
  { value: "health", icon: "💊", label: "Health" },
  { value: "other", icon: "📦", label: "Other" },
];

const categoryIcon = Object.fromEntries(categories.map((c) => [c.value, c.icon]));

function ExpenseTracker() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setSubmitting(true);
    setError("");
    try {
      await api.post("/expenses", {
        amount: Number(amount),
        category,
        description,
      });
      setAmount("");
      setDescription("");
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((exp) => exp._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const totalThisMonth = expenses
    .filter((exp) => {
      const d = new Date(exp.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, exp) => sum + exp.amount, 0);

  const byCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen bg-slate-200/60 p-6 sm:p-10">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm font-medium text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          ← Back to Dashboard
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-xl">
            💰
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md p-5">
            <p className="text-sm text-gray-500 mb-1">This month</p>
            <p className="text-2xl font-semibold text-gray-900">
              ₹{totalThisMonth.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md p-5">
            <p className="text-sm text-gray-500 mb-1">Top category</p>
            <p className="text-2xl font-semibold text-gray-900">
              {topCategory ? `${categoryIcon[topCategory[0]]} ${topCategory[0]}` : "—"}
            </p>
          </div>
        </div>

        {/* Add Expense Form */}
        <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Add an expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount (₹)"
                required
                className="px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Note (optional) — e.g. Swiggy order"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-base transition-colors"
            >
              {submitting ? "Adding..." : "+ Add Expense"}
            </button>
          </form>
        </div>

        {/* Expense List */}
        <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md overflow-hidden">
          <h2 className="text-sm font-semibold text-gray-900 p-6 pb-0 mb-2">
            Recent expenses
          </h2>
          {loading ? (
            <p className="text-sm text-gray-500 p-6">Loading...</p>
          ) : expenses.length === 0 ? (
            <p className="text-sm text-gray-500 p-6">No expenses logged yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {expenses.map((exp) => (
                <div key={exp._id} className="flex items-center gap-4 p-4">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-base shrink-0">
                    {categoryIcon[exp.category] || "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">
                      {exp.description || exp.category}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(exp.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      · <span className="capitalize">{exp.category}</span>
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{exp.amount.toLocaleString("en-IN")}
                  </span>
                  <button
                    onClick={() => handleDelete(exp._id)}
                    className="text-gray-300 hover:text-red-500 text-sm transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpenseTracker;