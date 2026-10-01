import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const hexColorMap = {
  house: "#4F46E5",
  car: "#F59E0B",
  investment: "#059669",
  emergency: "#F59E0B",
  education: "#4F46E5",
  wedding: "#059669",
};

function AllocationPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllocation = async () => {
      try {
        const res = await api.post("/advisor/allocation");
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchAllocation();
  }, []);

  const income = data?.income || 0;
  const totalContribution = data?.totalContribution || 0;
  const remaining = income - totalContribution;
  const overCommitted = income > 0 && totalContribution > income;

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
            ⚖️
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Allocation</h1>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Analyzing your goals...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : !data?.goals?.length ? (
          <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md p-10 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No active goals yet
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Add a goal first to see how your income is being allocated
            </p>
            <button
              onClick={() => navigate("/add-goal")}
              className="bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              + Create Goal
            </button>
          </div>
        ) : (
          <>
            {income === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
                You haven't set a monthly income yet.{" "}
                <button
                  onClick={() => navigate("/settings")}
                  className="font-semibold underline"
                >
                  Add it in Settings
                </button>{" "}
                for a more accurate picture.
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md p-5">
                <p className="text-sm text-gray-500 mb-1">Monthly income</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{income.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md p-5">
                <p className="text-sm text-gray-500 mb-1">Committed to goals</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ₹{totalContribution.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md p-5">
                <p className="text-sm text-gray-500 mb-1">
                  {overCommitted ? "Over budget by" : "Remaining"}
                </p>
                <p
                  className={`text-2xl font-semibold ${
                    overCommitted ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  ₹{Math.abs(remaining).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {overCommitted && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-sm text-red-800">
                ⚠️ Your goal contributions add up to more than your income. Consider
                adjusting some goals or increasing your income.
              </div>
            )}

            {/* Allocation Bars */}
            <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md p-6 mb-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                How your contributions are split
              </h2>
              <div className="space-y-4">
                {data.goals.map((g, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-gray-700 font-medium">{g.title}</span>
                      <span className="text-gray-500">
                        ₹{g.monthlyContribution.toLocaleString("en-IN")} ({g.share}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${g.share}%`,
                          backgroundColor: hexColorMap[g.type] || "#4F46E5",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Suggestion */}
            <div className="bg-primary-light border border-indigo-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🧞</span>
                <h2 className="text-sm font-semibold text-gray-900">
                  Genie's suggestion
                </h2>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {data.reply}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AllocationPage;