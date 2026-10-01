import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../services/api";
import ChatWidget from "../Components/advisor/ChatWidget";

const savingsTrend = [
  { month: "Apr", amount: 180000 },
  { month: "May", amount: 210000 },
  { month: "Jun", amount: 260000 },
  { month: "Jul", amount: 300000 },
  { month: "Aug", amount: 380000 },
  { month: "Sep", amount: 450000 },
];

const colorMap = {
  primary: { bg: "bg-primary-light", text: "text-primary", bar: "bg-primary" },
  success: { bg: "bg-success-light", text: "text-success", bar: "bg-success" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", bar: "bg-amber-500" },
};

const iconMap = {
  house: "🏠",
  car: "🚗",
  investment: "📈",
  emergency: "🚨",
  education: "🎓",
  wedding: "💍",
};

const goalColorMap = {
  house: "primary",
  car: "amber",
  investment: "success",
  emergency: "amber",
  education: "primary",
  wedding: "success",
};

const hexColorMap = {
  house: "#4F46E5",
  car: "#F59E0B",
  investment: "#059669",
  emergency: "#F59E0B",
  education: "#4F46E5",
  wedding: "#059669",
};

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await api.get("/goals");
        setGoals(res.data);
      } catch (error) {
        console.error("Failed to fetch goals", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGoals();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalMonthly = goals.reduce((sum, g) => sum + g.monthlyContribution, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallPercent =
    totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const allocationData = goals.map((goal) => ({
    name: goal.title,
    value: goal.monthlyContribution,
    color: hexColorMap[goal.type] || "#4F46E5",
  }));

  return (
    <div className="min-h-screen bg-slate-200/60 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-300/60 shadow-md flex flex-col p-6 hidden md:flex">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-xl">
            🧞
          </div>
          <span className="text-xl font-bold text-gray-900">
            GoalGenie <span className="text-primary">AI</span>
          </span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <SidebarLink
            icon="🏠"
            label="Dashboard"
            active
            onClick={() => navigate("/dashboard")}
          />
          <SidebarLink
            icon="💰"
            label="Expenses"
            onClick={() => navigate("/expenses")}
          />
          <SidebarLink
            icon="⚖️"
            label="Allocation"
            onClick={() => navigate("/allocation")}
          />
          <SidebarLink
            icon="⚙️"
            label="Settings"
            onClick={() => navigate("/settings")}
          />
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span className="text-lg">🚪</span> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-10">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-indigo-600 to-indigo-800 p-8 mb-8 text-white">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-20 -left-10 w-56 h-56 bg-emerald-400/10 rounded-full blur-2xl" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-stretch justify-between gap-6">
            <div>
              <p className="text-indigo-100 text-sm mb-1">Welcome back</p>
              <h1 className="text-3xl font-bold mb-3">
                Hi, {user?.name || "there"} 👋
              </h1>
              <p className="text-indigo-100 max-w-lg leading-relaxed">
                {goals.length > 0
                  ? `You're saving ₹${totalMonthly.toLocaleString("en-IN")}/month across ${goals.length} goal${goals.length > 1 ? "s" : ""}.`
                  : "Let's set up your first goal and start planning your financial future."}
              </p>
            </div>

            {goals.length > 0 && (
              <div className="flex flex-col items-center shrink-0">
                <ProgressRing percent={overallPercent} />
                <p className="text-xs text-indigo-100 mt-2 text-center">
                  Overall progress
                  <br />
                  across all goals
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <QuickAction
            icon="💸"
            label="Add Expense"
            onClick={() => navigate("/expenses")}
          />
          <QuickAction
            icon="🎯"
            label="New Goal"
            onClick={() => navigate("/add-goal")}
          />
          <QuickAction
            icon="📊"
            label="View Reports"
            onClick={() => navigate("/reports")}
          />
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Total Saved"
            value={`₹${totalSaved.toLocaleString("en-IN")}`}
            trend="+12% this month"
          />
          <StatCard
            label="Active Goals"
            value={goals.length}
            trend={goals.length > 0 ? "1 near completion" : "Get started"}
          />
          <StatCard
            label="Monthly Contribution"
            value={`₹${totalMonthly.toLocaleString("en-IN")}`}
            trend="On track"
          />
        </div>

        {/* AI Insight Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-lg shrink-0">
            ✨
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900 mb-1">
              AI Insight
            </p>
            <p className="text-sm text-amber-800 leading-relaxed">
              Your food delivery spending went up 18% last month. Cutting it
              back to your usual average could add ₹2,200 more to your House
              goal every month.
            </p>
          </div>
        </div>

        {/* Chart + Next Milestone */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Savings Growth Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-300/60 shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">
                Savings Growth
              </h2>
              <span className="text-xs text-success font-medium bg-success-light px-2.5 py-1 rounded-full">
                +150% in 6 months
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={savingsTrend}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                />
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString("en-IN")}`,
                    "Saved",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    fontSize: "13px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  fill="url(#colorAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Next Milestone Card */}
          <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Next Milestone
              </h2>
              <div className="text-4xl mb-3">🚗</div>
              <p className="text-sm text-gray-500 mb-1">New Car — 15% funded</p>
              <p className="text-xs text-gray-400">Estimated: Jun 2027</p>
            </div>
            <button className="mt-4 text-sm font-medium text-primary hover:underline text-left">
              View details →
            </button>
          </div>
        </div>

        {/* Allocation Donut Chart */}
        {goals.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md p-6 mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Where Your Savings Go
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full sm:w-80 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      paddingAngle={2}
                      label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        `₹${value.toLocaleString("en-IN")}/month`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 w-full space-y-3">
                {allocationData.map((entry, index) => {
                  const percent =
                    totalMonthly > 0
                      ? Math.round((entry.value / totalMonthly) * 100)
                      : 0;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-700">{entry.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">
                          ₹{entry.value.toLocaleString("en-IN")}/mo
                        </span>
                        <span className="font-semibold text-gray-900 w-10 text-right">
                          {percent}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Goals Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Goals</h2>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading your goals...</p>
        ) : goals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md p-10 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No goals yet
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Start by creating your first savings goal
            </p>
            <button
              onClick={() => navigate("/add-goal")}
              className="bg-primary hover:bg-primary-hover text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              + Create Goal
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {goals.map((goal) => (
              <GoalCard
                key={goal._id}
                onClick={() => navigate(`/goal/${goal._id}`)}
                goal={{
                  ...goal,
                  icon: iconMap[goal.type] || "🎯",
                  color: goalColorMap[goal.type] || "primary",
                  targetDate: goal.targetDate
                    ? new Date(goal.targetDate).toLocaleDateString("en-IN", {
                        month: "short",
                        year: "numeric",
                      })
                    : "No date set",
                }}
              />
            ))}

            <button
              onClick={() => navigate("/add-goal")}
              className="border-2 border-dashed border-gray-400 rounded-2xl flex flex-col items-center justify-center gap-2 p-8 text-gray-400 hover:border-primary hover:text-primary transition-colors"
            >
              <span className="text-3xl">+</span>
              <span className="text-sm font-medium">Add New Goal</span>
            </button>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md divide-y divide-gray-100">
            <ActivityRow
              icon="💰"
              title="Added ₹15,000 to Retirement SIP"
              time="2 days ago"
              color="success"
            />
            <ActivityRow
              icon="🏠"
              title="Updated House goal target date"
              time="5 days ago"
              color="primary"
            />
            <ActivityRow
              icon="✨"
              title="AI suggested cutting food delivery spend"
              time="1 week ago"
              color="amber"
            />
            <ActivityRow
              icon="🚗"
              title="Added ₹8,000 to New Car"
              time="1 week ago"
              color="success"
            />
          </div>
        </div>
      </main>

      <ChatWidget />
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors text-left ${
        active
          ? "bg-primary-light text-primary"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <span className="text-lg">{icon}</span>
      {label}
    </button>
  );
}

function StatCard({ label, value, trend }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-300/60 shadow-md p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-success font-medium">{trend}</p>
    </div>
  );
}

function GoalCard({ goal, onClick }) {
  const colors = colorMap[goal.color];
  const percent = Math.min(
    Math.round((goal.currentAmount / goal.targetAmount) * 100),
    100,
  );

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-300/60 shadow-md hover:shadow-lg transition-shadow p-5 cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center text-lg`}
        >
          {goal.icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{goal.title}</h3>
          <p className="text-xs text-gray-400">Target: {goal.targetDate}</p>
        </div>
      </div>

      <div className="mb-2">
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bar} rounded-full transition-all`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          ₹{goal.currentAmount.toLocaleString("en-IN")} / ₹
          {goal.targetAmount.toLocaleString("en-IN")}
        </span>
        <span className={`font-semibold ${colors.text}`}>{percent}%</span>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-300/60 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all p-4 flex flex-col items-center gap-2"
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );
}

function ActivityRow({ icon, title, time, color }) {
  const colors = colorMap[color];
  return (
    <div className="flex items-center gap-4 p-4 first:rounded-t-2xl last:rounded-b-2xl hover:bg-gray-50 transition-colors">
      <div
        className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center text-base shrink-0`}
      >
        {icon}
      </div>
      <p className="text-sm text-gray-700 flex-1">{title}</p>
      <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
    </div>
  );
}

function ProgressRing({ percent }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width="110" height="110" viewBox="0 0 100 100" className="-rotate-90">
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="8"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontSize="20"
        fontWeight="700"
        className="rotate-90"
        style={{ transformOrigin: "50px 50px" }}
      >
        {percent}%
      </text>
    </svg>
  );
}

export default Dashboard;
