import React from 'react';
import AiToolPage from '../AiToolPage.jsx';

export default function RepairOrResell() {
  return (
    <AiToolPage
      title="Repair vs Resell Decision"
      intro="Should this item be repaired before sale, sold as-is, or upcycled?"
      endpoint="repair-or-resell"
      fields={[
        { name: 'itemDescription', label: 'Item description', type: 'textarea' },
        { name: 'currentCondition', label: 'Current condition', type: 'text' },
        { name: 'repairCost', label: 'Estimated repair cost', type: 'text' },
        { name: 'asIsValue', label: 'As-is resale value', type: 'text' },
        { name: 'repairedValue', label: 'Repaired resale value', type: 'text' },
      ]}
    />
  );
}
