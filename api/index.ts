import express from 'express';
import apiRouter from '../src/apiRouter.js';

const app = express();
app.use('/api', apiRouter);

export default app;
