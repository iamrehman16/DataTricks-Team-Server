import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';  // import cookie-parser
import connectDB from './config/db.js';
import userRoutes from './routes/user.routes.js';

const app = express();

// --- CORS Config ---
app.use(cors({
  origin: 'http://localhost:5173',  // your React frontend URL
  credentials: true,                // allow cookies & Authorization headers
}));

app.use(express.json());
app.use(cookieParser());  // use cookie-parser middleware

// connect DB
connectDB();

// routes
app.use('/api/user', userRoutes);

// default route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// listen on port
app.listen(process.env.PORT, () => {
  console.log('Server is running on port 5000');
});
