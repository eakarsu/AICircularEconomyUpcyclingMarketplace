const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });
require('./config/runtime').validateRuntime();

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

const allowedOrigins=(process.env.CORS_ORIGINS||'http://localhost:4051').split(',').map(v=>v.trim()).filter(Boolean);
app.use((req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Frame-Options','DENY');res.setHeader('Referrer-Policy','no-referrer');next();});
app.use(cors({origin:(origin,cb)=>!origin||allowedOrigins.includes(origin)?cb(null,true):cb(new Error('origin not allowed')),credentials:true}));
app.use(express.json({limit:'1mb'}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/custom-views', require('./routes/customViews'));
app.use('/api/material-passport-ledger', require('./routes/materialPassportLedger'));
app.use('/api/marketplace', require('./routes/governedMarketplace'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'AICircularEconomyUpcyclingMarketplace', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(err.statusCode || 500).json({ error: err.message || 'Something went wrong' });
});


app.use('/api/upcycler-agent', require('./routes/upcyclerAgent')); // apply pass 6 — audit custom suggestion

app.use('/api/circular-rag', require('./routes/circularGuideRag')); // apply pass 6 — audit custom suggestion

app.use('/api/impact-stream', require('./routes/impactStream')); // apply pass 6 — audit custom suggestion

app.use('/api/municipality-white-label', require('./routes/municipalityWhiteLabel')); // apply pass 6 — audit custom suggestion
app.listen(PORT, () => {
  console.log(`AICircularEconomyUpcyclingMarketplace backend running on port ${PORT}`);
});
