import React from 'react';
import AiToolPage from '../AiToolPage.jsx';

export default function MaterialValuation() {
  return (
    <AiToolPage
      title="Material Valuation"
      intro="Estimate marketplace value for reclaimed or waste materials."
      endpoint="material-valuation"
      fields={[
        { name: 'materialDescription', label: 'Material description', type: 'textarea', placeholder: 'Describe the materials' },
        { name: 'quantity', label: 'Quantity', type: 'text' },
        { name: 'condition', label: 'Condition', type: 'text', placeholder: 'e.g. like-new, usable, project-grade' },
        { name: 'region', label: 'Region', type: 'text', placeholder: 'e.g. US Northeast' },
      ]}
    />
  );
}
