'use strict';

const STATES = Object.freeze({ draft: ['moderation'], moderation: ['listed', 'rejected'], listed: ['offer_accepted', 'withdrawn'], offer_accepted: ['escrow_pending'], escrow_pending: ['funded', 'cancelled'], funded: ['in_transit'], in_transit: ['delivered', 'disputed'], delivered: ['settled', 'disputed'], disputed: ['refunded', 'settled'], rejected: [], withdrawn: [], cancelled: [], refunded: [], settled: [] });
const MODERATORS = new Set(['moderator', 'safety_officer', 'tenant_admin']);
function text(v, f, max = 500) { if (typeof v !== 'string' || !v.trim() || v.trim().length > max) throw new Error(`${f} is required`); return v.trim(); }
function validateListing(input) {
  if (!input || typeof input !== 'object') throw new Error('listing must be an object');
  if (!Array.isArray(input.materials) || !input.materials.length || input.materials.some(m => !m.catalogCode || !Number.isFinite(m.weightKg) || m.weightKg <= 0)) throw new Error('materials require catalogCode and positive weightKg');
  if (!Number.isInteger(input.priceCents) || input.priceCents < 0) throw new Error('priceCents must be a non-negative integer');
  return { title: text(input.title, 'title', 200), sellerId: text(input.sellerId, 'sellerId', 100), materials: input.materials, condition: text(input.condition, 'condition', 80), safetyAttestations: Array.isArray(input.safetyAttestations) ? input.safetyAttestations : [], priceCents: input.priceCents, currency: text(input.currency, 'currency', 3).toUpperCase(), location: input.location || null, chainOfCustody: Array.isArray(input.chainOfCustody) ? input.chainOfCustody : [] };
}
function transition(current, next, role, record, note) {
  if (!STATES[current]?.includes(next)) throw new Error(`transition ${current} -> ${next} is not allowed`);
  if (next === 'listed' && (!MODERATORS.has(role) || !note || note.trim().length < 10 || !record.safetyAttestations.length)) throw new Error('documented safety moderation and attestations are required');
  if (next === 'funded' && !record.paymentReference) throw new Error('verified escrow payment reference is required');
  if (next === 'in_transit' && !record.shipmentReference) throw new Error('verified shipment reference is required');
  return next;
}
function calculateImpact(materials, factors) { return materials.reduce((sum, m) => { const factor = factors[m.catalogCode]; if (!Number.isFinite(factor)) throw new Error(`missing versioned impact factor for ${m.catalogCode}`); return sum + m.weightKg * factor; }, 0); }
module.exports = { STATES, validateListing, transition, calculateImpact };
