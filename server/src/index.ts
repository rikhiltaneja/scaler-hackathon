import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import visitsRouter from './routes/visits.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'asha-voice-intake-server' });
});

app.use('/api/visits', visitsRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Centralized error handler
app.use((err: Error & { status?: number }, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
