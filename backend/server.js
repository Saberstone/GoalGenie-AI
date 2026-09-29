const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const goalRoutes = require('./src/routes/goalRoutes');
const advisorRoutes = require('./src/routes/advisorRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/advisor', advisorRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/', (req, res) => {
  res.send('GoalGenie AI backend is running 🧞');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});