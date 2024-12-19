import { corsOptions } from '@/configs/cors.config';
import { checkDatabaseConnection } from '@/configs/database.config';
import { env } from '@/configs/env.config';
import { app, server } from '@/configs/socket.config';
import { startCronJobs } from '@/crons/jobs';
import { errorHandler } from '@/middlewares/errorHandler.middleware';
import { useRoutes } from '@/routes/index.route';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import morgan from 'morgan';

// Middlewares
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Router
useRoutes(app);

// Error Middleware
app.use(errorHandler);

const port = env.PORT;

async function start() {
  try {
    await checkDatabaseConnection();
    startCronJobs();
    server.listen(port, () => {
      console.log(`[INFO] Server is running at port ${port}`);
    });
  } catch (error) {
    console.log('[ERROR ❌] Failed to run server', error);
    process.exit(1);
  }
}

start();
