import { healthCheck } from '../../packages/core/health.js';
import { registerRoutes } from './routes.js';

export function createServer() {
  const app = {
    routes: [],
    get(path, handler) {
      this.routes.push({ method: 'GET', path, handler });
    }
  };

  registerRoutes(app);
  app.get('/health', healthCheck);

  const port = process.env.PORT || '3000';
  const mode = process.env.APP_MODE || 'development';

  return { app, port, mode };
}
