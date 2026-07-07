const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const leadRoutes = require('./routes/leadRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Mount lead routes under /api prefix
app.use('/api', leadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
