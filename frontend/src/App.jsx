import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import GoalDetail from './pages/GoalDetail'
import AddGoal from './pages/AddGoal'
import ExpenseTracker from './pages/ExpenseTracker'
import AdvisorChat from './pages/AdvisorChat'
import AllocationPage from './pages/AllocationPage'
import Signup from './pages/SignUp'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/goal/:id" element={<GoalDetail />} />
        <Route path="/add-goal" element={<AddGoal />} />
        <Route path="/expenses" element={<ExpenseTracker />} />
        <Route path="/advisor" element={<AdvisorChat />} />
        <Route path="/allocation" element={<AllocationPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App