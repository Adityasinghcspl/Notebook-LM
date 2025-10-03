import express, { Express } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import router from './routes/apiRoutes';

const app: Express = express();

/************************************************************************************
 *                              Basic Express Middlewares
 ***********************************************************************************/

if (process.env.NODE_ENV === 'production') {
  console.log("production ==");
  app.use(cors());
}

app.set('json spaces', 4);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Handle logs in console during development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Handle security and origin in production
// if (process.env.NODE_ENV === 'production') {
//   // app.use(helmet());
//   console.log("production ==");
//   app.use(cors());
// }

/************************************************************************************
 *                               Register all routes
 ***********************************************************************************/

app.use('/api', router);

/************************************************************************************
 *                               Express Error Handling
 ***********************************************************************************/

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  return res.status(500).json({
    errorName: err.name,
    message: err.message,
    stack: err.stack || 'no stack defined'
  });
});

export default app;