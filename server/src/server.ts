import express, { Express } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import router from './routes/apiRoutes';

const app: Express = express();

/************************************************************************************
 *                              CORS Config (must be first)
 ***********************************************************************************/
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (
      !origin || 
      origin === process.env.UI_URL || 
      origin === "http://localhost:5173"
    ) {
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

// Use CORS **before any other middleware**
app.use(cors(corsOptions));

/************************************************************************************
 *                              Basic Express Middlewares
 ***********************************************************************************/
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

if (process.env.NODE_ENV === 'production') {
  // app.use(helmet());
  console.log("✅ Production mode");
}

app.set('json spaces', 4);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/************************************************************************************
 *                               Routes
 ***********************************************************************************/
app.use('/api', router);

/************************************************************************************
 *                               Error Handling
 ***********************************************************************************/
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  return res.status(500).json({
    errorName: err.name,
    message: err.message,
    stack: err.stack || 'no stack defined'
  });
});

export default app;