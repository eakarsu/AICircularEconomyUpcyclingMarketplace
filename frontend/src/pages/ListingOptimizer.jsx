import React from 'react';
import AiToolPage from '../AiToolPage.jsx';

export default function ListingOptimizer() {
  return (
    <AiToolPage
      title="Listing Optimizer"
      intro="Improve marketplace listing copy with sustainability-forward messaging."
      endpoint="listing-optimizer"
      fields={[
        { name: 'currentTitle', label: 'Current title', type: 'text' },
        { name: 'currentDescription', label: 'Current description', type: 'textarea' },
        { name: 'materials', label: 'Materials used', type: 'text' },
        { name: 'photos', label: 'Photos provided', type: 'text', placeholder: 'e.g. 4 photos including detail shots' },
      ]}
    />
  );
}
