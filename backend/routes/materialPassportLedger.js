const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    summary: { passports: 49, verified_sources: 31, co2e_saved_kg: 1840, resale_ready: 18 },
    passports: [
      { material: 'reclaimed oak beams', origin: 'warehouse demo', grade: 'A', chain: 'verified', co2e_saved_kg: 420 },
      { material: 'denim offcuts', origin: 'apparel factory', grade: 'B', chain: 'pending lab note', co2e_saved_kg: 95 },
      { material: 'tempered glass panels', origin: 'retail remodel', grade: 'A', chain: 'verified', co2e_saved_kg: 310 },
    ],
  });
});

router.post('/issue', (req, res) => {
  const { material = 'material', origin = 'unknown' } = req.body || {};
  res.json({ material, origin, passport_id: `mat-${Date.now()}`, status: 'issued', required_proofs: ['source photo', 'weight ticket', 'condition grade'] });
});

module.exports = router;
