import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const iconMap = {
  house: "🏠",
  car: "🚗",
  investment: "📈",
  emergency: "🚨",
  education: "🎓",
  wedding: "💍",
};

const detailLabels = {
  downPaymentPercent: "Down payment (%)",
  propertyLocation: "Location",
  condition: "Condition",
  loanTenureYears: "Loan tenure (years)",
  instrumentType: "Instrument",
  expectedReturnRate: "Expected return (%)",
};

function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [simulatedContribution, setSimulatedContribution] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const res = await api.get(`/goals/${id}`);
        setGoal(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load goal");
      } finally {
        setLoading(false);
      }
    };
    fetchGoal();
  }, [id]);

  const handleAddSavings = async (e) => {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return;

    setSaving(true);
    setError("");
    try {
      const newAmount = goal.currentAmount + value;
      const res = await api.put(`/goals/${id}`, {
        currentAmount: newAmount,
        status: newAmount >= goal.targetAmount ? "completed" : goal.status,
      });
      setGoal(res.data);
      setAmount("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update goal");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;
    try {
      await api.delete(`/goals/${id}`);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete goal");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-200/60 flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-slate-200/60 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">{error || "Goal not found"}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-primary font-medium hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const percent = Math.min(
    Math.round((goal.currentAmount / goal.targetAmount) * 100),
    100,
  );
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  const monthsLeft =
    remaining > 0 && goal.monthlyContribution > 0
      ? Math.ceil(remaining / goal.monthlyContribution)
      : null;
  const details = Object.entries(goal.specificDetails || {}).filter(
    ([, v]) => v !== "" && v !== null && v !== undefined,
  );

  return (
    <div className="min-h-screen bg-slate-200/60 p-6 sm:p-10">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm font-medium text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          ← Back to Dashboard
        </button>

        {/* Header card */}
        <div className="bg-white rounded-3xl border border-gray-300/60 shadow-md p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-3xl">
              {iconMap[goal.type] || "🎯"}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{goal.title}</h1>
              <p className="text-sm text-gray-500 capitalize">
                {goal.type} goal
                {goal.targetDate &&
                  ` · Target ${new Date(goal.targetDate).toLocaleDateString(
                    "en-IN",
                    { month: "short", year: "numeric" },
                  )}`}
              </p>
            </div>
            {goal.status === "completed" && (
              <span className="text-xs font-semibold text-success bg-success-light px-3 py-1.5 rounded-full">
                🎉 Completed
              </span>
            )}
          </div>

          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              ₹{goal.currentAmount.toLocaleString("en-IN")} of ₹
              {goal.targetAmount.toLocaleString("en-IN")}
            </span>
            <span className="font-semibold text-primary">{percent}%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Stat
            label="Still to save"
            value={`₹${remaining.toLocaleString("en-IN")}`}
          />
          <Stat
            label="Monthly contribution"
            value={`₹${goal.monthlyContribution.toLocaleString("en-IN")}`}
          />
          <Stat
            label="Estimated time left"
            value={
              goal.status === "completed"
                ? "Done!"
                : monthsLeft
                  ? monthsLeft >= 12
                    ? `${Math.floor(monthsLeft / 12)} yr ${monthsLeft % 12} mo`
                    : `${monthsLeft} months`
                  : "—"
            }
          />
        </div>

        {/* Add savings */}
        {goal.status !== "completed" && (
          <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              💰 Add savings to this goal
            </h2>
            <form onSubmit={handleAddSavings} className="flex gap-3">
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount in ₹"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-semibold px-6 rounded-xl transition-colors"
              >
                {saving ? "Adding..." : "Add"}
              </button>
            </form>
          </div>
        )}

        {/* What-If Simulator */}
        {goal.status !== "completed" && (
          <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">
              🔮 What if I save differently?
            </h2>
            <p className="text-xs text-gray-400 mb-5">
              Drag the slider to see how your timeline changes
            </p>

            <WhatIfSimulator goal={goal} />
          </div>
        )}

        {/* Specific details */}
        {details.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Goal details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {details.map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs text-gray-400 mb-0.5">
                    {detailLabels[key] || key}
                  </p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {String(value)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          onClick={handleDelete}
          className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
        >
          🗑 Delete this goal
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function WhatIfSimulator({ goal }) {
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
  const currentContribution = goal.monthlyContribution || 0;

  // Slider range: current theke 3x porjonto, ba minimum ₹1000
  const maxSlider = Math.max(currentContribution * 3, 5000);
  const [value, setValue] = useState(currentContribution);

  const months = value > 0 ? Math.ceil(remaining / value) : null;
  const currentMonths =
    currentContribution > 0 ? Math.ceil(remaining / currentContribution) : null;

  const monthsDiff = months && currentMonths ? currentMonths - months : 0;

  const formatMonths = (m) => {
    if (!m) return "—";
    if (m >= 12) return `${Math.floor(m / 12)} yr ${m % 12} mo`;
    return `${m} months`;
  };

  const getDate = (m) => {
    if (!m) return "—";
    const d = new Date();
    d.setMonth(d.getMonth() + m);
    return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">Monthly contribution</span>
        <span className="text-lg font-bold text-primary">
          ₹{value.toLocaleString("en-IN")}
        </span>
      </div>

      <input
        type="range"
        min="0"
        max={maxSlider}
        step="500"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-primary cursor-pointer"
      />

      <div className="flex items-center justify-between text-xs text-gray-400 mt-1 mb-6">
        <span>₹0</span>
        <span>₹{maxSlider.toLocaleString("en-IN")}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Time to complete</p>
          <p className="text-xl font-semibold text-gray-900">
            {formatMonths(months)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">~{getDate(months)}</p>
        </div>

        <div
          className={`rounded-xl p-4 ${
            monthsDiff > 0
              ? "bg-success-light"
              : monthsDiff < 0
              ? "bg-red-50"
              : "bg-gray-50"
          }`}
        >
          <p className="text-xs text-gray-400 mb-1">vs current plan</p>
          <p
            className={`text-xl font-semibold ${
              monthsDiff > 0
                ? "text-success"
                : monthsDiff < 0
                ? "text-red-600"
                : "text-gray-900"
            }`}
          >
            {monthsDiff > 0
              ? `${monthsDiff} mo faster`
              : monthsDiff < 0
              ? `${Math.abs(monthsDiff)} mo slower`
              : "Same pace"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default GoalDetail;
