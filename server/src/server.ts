import express, { Express } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import router from './routes/apiRoutes';

const app: Express = express();

/************************************************************************************
 *                              Basic Express Middlewares
 ***********************************************************************************/

app.set('json spaces', 4);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse comma-separated origins from .env
const allowedOrigins: string[] = (process.env.UI_URL || "http://localhost:5173").split(",");

// Common CORS config
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, Postman, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Handle logs in console during development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  app.use(cors(corsOptions));
}

// Handle security and origin in production
if (process.env.NODE_ENV === 'production') {
  // app.use(helmet());
  console.log("production ==");
  app.use(cors());
}

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