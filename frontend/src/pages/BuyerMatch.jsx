import React from 'react';
import AiToolPage from '../AiToolPage.jsx';

export default function BuyerMatch() {
  return (
    <AiToolPage
      title="Buyer-Seller Matching"
      intro="Match a buyer's needs to your upcycle inventory."
      endpoint="buyer-match"
      fields={[
        { name: 'buyerNeed', label: 'Buyer need', type: 'textarea' },
        { name: 'budget', label: 'Budget', type: 'text' },
        { name: 'location', label: 'Location', type: 'text' },
        { name: 'sustainabilityGoals', label: 'Sustainability goals', type: 'text' },
      ]}
    />
  );
}
