import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json());

// API Health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Church Management System CMS PWA' });
});

// Serve static build from dist
const distPath = path.join(process.cwd(), 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
