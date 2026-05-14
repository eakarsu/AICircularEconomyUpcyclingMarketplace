const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/ai', require('./routes/ai'));

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


// === Batch 01 Gaps & Frontend Mounts ===
app.use('/api/gap-frontend-has-13-themed-pages-buyermatch-materialva', require('./routes/gap_frontend_has_13_themed_pages_buyermatch_materialva'));
app.use('/api/gap-no-backend-persistence-for-any-feature-page-beyond', require('./routes/gap_no_backend_persistence_for_any_feature_page_beyond'));
app.use('/api/gap-no-ai-model-wiring-confirmed-beyond-the-single-ai-', require('./routes/gap_no_ai_model_wiring_confirmed_beyond_the_single_ai_'));
app.use('/api/gap-no-marketplace-listings-or-seller-buyer-crud-backe', require('./routes/gap_no_marketplace_listings_or_seller_buyer_crud_backe'));
app.use('/api/gap-no-payment-processing-and-escrow', require('./routes/gap_no_payment_processing_and_escrow'));
app.use('/api/gap-no-shipping-logistics-integration', require('./routes/gap_no_shipping_logistics_integration'));
app.use('/api/gap-no-review-and-trust-score-system', require('./routes/gap_no_review_and_trust_score_system'));
app.use('/api/gap-no-environmental-impact-reporting-persistence', require('./routes/gap_no_environmental_impact_reporting_persistence'));
app.use('/api/gap-no-notification-system-or-webhooks', require('./routes/gap_no_notification_system_or_webhooks'));
