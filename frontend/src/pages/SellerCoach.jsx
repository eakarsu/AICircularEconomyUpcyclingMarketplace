import React from 'react';
import AiToolPage from '../AiToolPage.jsx';

export default function SellerCoach() {
  return (
    <AiToolPage
      title="Seller Growth Coach"
      intro="Get a 30/60/90-day plan to grow your circular-economy business."
      endpoint="seller-coach"
      fields={[
        { name: 'sellerStage', label: 'Seller stage', type: 'text', placeholder: 'hobbyist / side-hustle / full-time' },
        { name: 'monthlyRevenue', label: 'Monthly revenue ($)', type: 'number' },
        { name: 'topProducts', label: 'Top products', type: 'textarea' },
        { name: 'growthGoal', label: 'Growth goal', type: 'text' },
      ]}
    />
  );
}
