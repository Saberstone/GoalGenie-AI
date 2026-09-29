import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const goalTypes = [
  { value: "house", icon: "🏠", label: "House" },
  { value: "car", icon: "🚗", label: "Car" },
  { value: "investment", icon: "📈", label: "Investment" },
];

const inputClass =
  "w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white";
const labelClass = "block text-sm font-medium text-gray-700 mb-2";

function AddGoal() {
  const navigate = useNavigate();
  const [type, setType] = useState("house");
  const [common, setCommon] = useState({
    title: "",
    targetAmount: "",
    currentAmount: "",
    monthlyContribution: "",
    targetDate: "",
  });
  const [details, setDetails] = useState({
    downPaymentPercent: 20,
    propertyLocation: "",
    condition: "new",
    loanTenureYears: 5,
    instrumentType: "SIP",
    expectedReturnRate: 12,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCommon = (e) =>
    setCommon({ ...common, [e.target.name]: e.target.value });
  const handleDetails = (e) =>
    setDetails({ ...details, [e.target.name]: e.target.value });

  // Live hint: কত মাস লাগবে
  const remaining = Number(common.targetAmount) - Number(common.currentAmount || 0);
  const monthly = Number(common.monthlyContribution);
  const monthsNeeded =
    remaining > 0 && monthly > 0 ? Math.ceil(remaining / monthly) : null;

  const buildSpecificDetails = () => {
    if (type === "house") {
      return {
        downPaymentPercent: Number(details.downPaymentPercent),
        propertyLocation: details.propertyLocation,
      };
    }
    if (type === "car") {
      return {
        condition: details.condition,
        loanTenureYears: Number(details.loanTenureYears),
      };
    }
    return {
      instrumentType: details.instrumentType,
      expectedReturnRate: Number(details.expectedReturnRate),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await api.post("/goals", {
        type,
        title: common.title,
        targetAmount: Number(common.targetAmount),
        currentAmount: Number(common.currentAmount || 0),
        monthlyContribution: Number(common.monthlyContribution || 0),
        targetDate: common.targetDate || undefined,
        specificDetails: buildSpecificDetails(),
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-200/60 p-6 sm:p-10">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm font-medium text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl border border-gray-300/60 shadow-md p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-xl">
              🧞
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create a new goal</h1>
          </div>
          <p className="text-gray-500 mb-8">
            Tell the Genie what you're saving for.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Type */}
            <div>
              <label className={labelClass}>What are you saving for?</label>
              <div className="grid grid-cols-3 gap-3">
                {goalTypes.map((t) => (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`rounded-2xl border-2 p-4 flex flex-col items-center gap-2 transition-all ${
                      type === t.value
                        ? "border-primary bg-primary-light text-primary"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-3xl">{t.icon}</span>
                    <span className="text-sm font-semibold">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className={labelClass}>Goal title</label>
              <input
                type="text"
                name="title"
                value={common.title}
                onChange={handleCommon}
                placeholder="e.g. My Dream Flat"
                required
                className={inputClass}
              />
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Target amount (₹)</label>
                <input
                  type="number"
                  name="targetAmount"
                  value={common.targetAmount}
                  onChange={handleCommon}
                  placeholder="4000000"
                  min="1"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Saved so far (₹)</label>
                <input
                  type="number"
                  name="currentAmount"
                  value={common.currentAmount}
                  onChange={handleCommon}
                  placeholder="0"
                  min="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Monthly contribution (₹)</label>
                <input
                  type="number"
                  name="monthlyContribution"
                  value={common.monthlyContribution}
                  onChange={handleCommon}
                  placeholder="15000"
                  min="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Target date</label>
                <input
                  type="date"
                  name="targetDate"
                  value={common.targetDate}
                  onChange={handleCommon}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Live hint */}
            {monthsNeeded && (
              <div className="bg-success-light border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
                ✨ At ₹{monthly.toLocaleString("en-IN")}/month, you'll reach this
                goal in about{" "}
                <span className="font-semibold">
                  {monthsNeeded >= 12
                    ? `${Math.floor(monthsNeeded / 12)} yr ${monthsNeeded % 12} mo`
                    : `${monthsNeeded} months`}
                </span>
                .
              </div>
            )}

            {/* Type-specific fields */}
            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm font-semibold text-gray-900 mb-4">
                {type === "house" && "🏠 House details"}
                {type === "car" && "🚗 Car details"}
                {type === "investment" && "📈 Investment details"}
              </p>

              {type === "house" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Down payment (%)</label>
                    <input
                      type="number"
                      name="downPaymentPercent"
                      value={details.downPaymentPercent}
                      onChange={handleDetails}
                      min="0"
                      max="100"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Property location</label>
                    <input
                      type="text"
                      name="propertyLocation"
                      value={details.propertyLocation}
                      onChange={handleDetails}
                      placeholder="e.g. Howrah"
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              {type === "car" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>New or used</label>
                    <select
                      name="condition"
                      value={details.condition}
                      onChange={handleDetails}
                      className={inputClass}
                    >
                      <option value="new">New</option>
                      <option value="used">Used</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Loan tenure (years)</label>
                    <input
                      type="number"
                      name="loanTenureYears"
                      value={details.loanTenureYears}
                      onChange={handleDetails}
                      min="0"
                      max="10"
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              {type === "investment" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Instrument</label>
                    <select
                      name="instrumentType"
                      value={details.instrumentType}
                      onChange={handleDetails}
                      className={inputClass}
                    >
                      <option value="SIP">SIP (Mutual Fund)</option>
                      <option value="FD">Fixed Deposit</option>
                      <option value="Stocks">Stocks</option>
                      <option value="Gold">Gold</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Expected annual return (%)</label>
                    <input
                      type="number"
                      name="expectedReturnRate"
                      value={details.expectedReturnRate}
                      onChange={handleDetails}
                      min="0"
                      max="50"
                      step="0.1"
                      className={inputClass}
                    />
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-primary/40"
            >
              {submitting ? "Creating..." : "Create Goal"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddGoal;