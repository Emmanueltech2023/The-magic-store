const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const ImageKit = require('imagekit');
const rateLimit = require('express-rate-limit');
const client = require('prom-client');

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3000;

// ImageKit config (optional)
const publicKey = process.env.VITE_IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.VITE_IMAGEKIT_URL_ENDPOINT;

let imagekit;
if (publicKey && privateKey && urlEndpoint) {
  imagekit = new ImageKit({ publicKey, privateKey, urlEndpoint });
}

// --- Basic rate limiting ---
// Protect API endpoints from bursts (adjust windowMs & max as needed)
const apiLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// --- Prometheus metrics ---
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDuration);

// Metrics middleware
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = req.route && req.route.path ? req.route.path : req.path;
    httpRequestCounter.inc({ method: req.method, route, status_code: res.statusCode });
    end({ method: req.method, route, status_code: res.statusCode });
  });
  next();
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

app.get('/api/imagekit/auth', (req, res) => {
  try {
    if (!imagekit) return res.status(500).send('ImageKit not configured');
    const result = imagekit.getAuthenticationParameters();
    res.json(result);
  } catch (error) {
    console.error('ImageKit Auth Error:', error);
    res.status(500).send('Auth failed');
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(express.static(path.join(process.cwd(), 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✨ The Magic Store is running on http://localhost:${PORT}`);
});
