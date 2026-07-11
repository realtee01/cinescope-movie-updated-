import express from 'express';
import apiRouter from '../src/apiRouter';

const app = express();
app.use('/api', apiRouter);

export default app;
