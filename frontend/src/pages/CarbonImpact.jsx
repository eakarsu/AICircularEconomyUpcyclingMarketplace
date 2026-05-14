import React from 'react';
import AiToolPage from '../AiToolPage.jsx';

export default function CarbonImpact() {
  return (
    <AiToolPage
      title="Carbon Impact Estimator"
      intro="Estimate kg CO2 avoided, landfill diverted, water and energy saved."
      endpoint="carbon-impact"
      fields={[
        { name: 'materialType', label: 'Material type', type: 'text', placeholder: 'e.g. denim, hardwood, aluminium' },
        { name: 'weightKg', label: 'Weight (kg)', type: 'number' },
        { name: 'displacedProduct', label: 'Displaced new product', type: 'text', placeholder: 'e.g. virgin steel desk' },
      ]}
    />
  );
}
