import React from 'react';
import AiToolPage from '../AiToolPage.jsx';

export default function PricingStrategy() {
  return (
    <AiToolPage
      title="Pricing Strategy"
      intro="Recommend floor / target / premium pricing for an upcycled item."
      endpoint="pricing-strategy"
      fields={[
        { name: 'item', label: 'Item', type: 'text' },
        { name: 'materialCost', label: 'Material cost ($)', type: 'number' },
        { name: 'laborHours', label: 'Labor hours', type: 'number' },
        { name: 'hourlyRate', label: 'Hourly rate ($)', type: 'number', default: '25' },
        { name: 'marketTier', label: 'Target market tier', type: 'text', placeholder: 'budget / mid / premium' },
      ]}
    />
  );
}
