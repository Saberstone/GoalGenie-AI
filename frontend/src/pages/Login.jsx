import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-100 via-slate-100 to-emerald-50 flex items-center justify-center p-6">
      {/* Soft background blobs */}
      <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-primary rounded-full blur-3xl opacity-30" />
      <div className="absolute -bottom-48 -right-32 w-[34rem] h-[34rem] bg-success rounded-full blur-3xl opacity-25" />
      <div className="absolute top-10 right-1/4 w-72 h-72 bg-amber-300 rounded-full blur-3xl opacity-25" />

      {/* Card */}
      <div className="animated-border relative w-full max-w-md lg:max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex transition-all duration-300">
        {/* Left - Form */}
        <div className="w-full lg:w-1/2 p-10 sm:p-12 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-2xl">
              🧞
            </div>
            <span className="text-3xl font-bold text-gray-900 tracking-tight">
              GoalGenie <span className="text-primary">AI</span>
            </span>
          </div>

          <h2 className="text-3xl font-semibold text-gray-900 mb-2">
            Welcome back
          </h2>
          <p className="text-gray-500 text-base mb-8">
            Sign in to continue tracking your goals
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-12 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* এখানে নতুন যোগ করো */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-primary/40"
            >
              Sign in
            </button>
          </form>

          <p className="text-center text-base text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-primary font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Right - Illustration + Tagline */}
        <div className="hidden lg:flex lg:w-1/2 bg-primary-light items-center justify-center p-10 relative">
          <div className="flex flex-col items-center text-center">
            <svg
              viewBox="0 0 300 300"
              className="w-full max-w-xs mb-6"
              role="img"
              aria-label="A genie lamp releasing a growth path toward a goal"
            >
              <circle cx="60" cy="70" r="10" fill="#F59E0B" opacity="0.7" />
              <circle cx="230" cy="60" r="7" fill="#F59E0B" opacity="0.5" />
              <circle cx="245" cy="130" r="5" fill="#059669" opacity="0.6" />

              <path
                d="M110 190 C 130 140, 160 120, 190 90 S 220 60, 230 45"
                stroke="#059669"
                strokeWidth="3"
                strokeDasharray="6 6"
                fill="none"
                strokeLinecap="round"
              />

              <circle
                cx="232"
                cy="42"
                r="16"
                fill="#ECFDF5"
                stroke="#059669"
                strokeWidth="2.5"
              />
              <circle cx="232" cy="42" r="6" fill="#059669" />

              <ellipse
                cx="110"
                cy="215"
                rx="46"
                ry="9"
                fill="#4F46E5"
                opacity="0.15"
              />
              <path
                d="M70 200 Q70 165 110 165 Q150 165 150 200 Q150 212 110 212 Q70 212 70 200 Z"
                fill="#4F46E5"
              />
              <path
                d="M148 195 Q175 190 190 195 Q178 200 150 202 Z"
                fill="#4338CA"
              />
              <rect
                x="95"
                y="210"
                width="30"
                height="8"
                rx="3"
                fill="#4338CA"
              />
              <rect
                x="85"
                y="216"
                width="50"
                height="7"
                rx="3"
                fill="#3730A3"
              />
              <circle cx="110" cy="163" r="6" fill="#F59E0B" />
            </svg>

            <h3 className="text-xl font-semibold text-gray-900 mb-2 max-w-xs">
              Your wishes, mapped into savings.
            </h3>
            <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
              Set a goal — a house, a car, an investment — and let AI plan the
              fastest way to get there.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
