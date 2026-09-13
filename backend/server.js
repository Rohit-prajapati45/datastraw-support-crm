import './config/env.js';
import cors from 'cors';
import express from 'express';
import ticketsRouter from './routes/tickets.js';
import './database/db.js';

const app = express();
const localOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(Boolean)
  : localOrigins;

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    const error = new Error('CORS origin is not allowed.');
    error.statusCode = 403;
    return callback(error);
  }
}));
app.use(express.json({ limit: '1mb' }));
app.use('/api/tickets', ticketsRouter);
app.use((req, res) => res.status(404).json({ error: 'API route not found.' }));
app.use((error, req, res, next) => {
  console.error(error);
  const status = error.statusCode || 500;
  res.status(status).json({ error: status === 500 ? 'An unexpected server error occurred.' : error.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Support CRM API listening on http://localhost:${port}`));
