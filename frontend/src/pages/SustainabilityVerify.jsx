import React from 'react';
import AiToolPage from '../AiToolPage.jsx';

export default function SustainabilityVerify() {
  return (
    <AiToolPage
      title="Sustainability Claim Verifier"
      intro="Audit a marketplace listing's sustainability claim for greenwashing risk."
      endpoint="sustainability-verify"
      fields={[
        { name: 'claim', label: 'Sustainability claim', type: 'textarea' },
        { name: 'supportingEvidence', label: 'Supporting evidence', type: 'textarea' },
        { name: 'materialChain', label: 'Material chain', type: 'text' },
      ]}
    />
  );
}
