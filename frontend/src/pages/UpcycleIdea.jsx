import React from 'react';
import AiToolPage from '../AiToolPage.jsx';

export default function UpcycleIdea() {
  return (
    <AiToolPage
      title="Upcycle Idea Generator"
      intro="Turn raw or reclaimed materials into 5 distinct upcycle product ideas."
      endpoint="upcycle-idea"
      fields={[
        { name: 'materials', label: 'Materials available', type: 'textarea', placeholder: 'e.g. pallet wood, denim scraps, glass jars' },
        { name: 'sellerSkills', label: 'Seller skills', type: 'text', placeholder: 'e.g. woodworking, sewing' },
        { name: 'toolsAvailable', label: 'Tools available', type: 'text', placeholder: 'e.g. table saw, sewing machine, hand tools' },
        { name: 'targetMarket', label: 'Target market', type: 'text', placeholder: 'e.g. eco-conscious millennials' },
      ]}
    />
  );
}
