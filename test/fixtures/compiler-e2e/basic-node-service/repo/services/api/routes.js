export function registerRoutes(app) {
  app.get('/ready', (_req, res) => {
    res.json({ ready: true });
  });
}
