import express from 'express'
import { config } from 'dotenv';
import morgan from 'morgan'
import cors from 'cors';
import appRouter from './routes/index.js';

config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1', appRouter);

export default app;