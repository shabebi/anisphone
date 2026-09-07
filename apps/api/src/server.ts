import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const port = Number(process.env.PORT ?? 5000);

app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL ?? 'http://localhost:5173',
    process.env.ADMIN_URL ?? 'http://localhost:5174',
  ],
}));
app.use(express.json());

app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, message: 'Anis Phone API is running' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`API running on http://localhost:${port}`);
});
