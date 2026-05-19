import React from 'react';
import MaterialFlowSankey from '../components/MaterialFlowSankey.jsx';
import ListingCategoryHeatmap from '../components/ListingCategoryHeatmap.jsx';
import EnvironmentalImpactReportPdf from '../components/EnvironmentalImpactReportPdf.jsx';
import ListingRulesEditor from '../components/ListingRulesEditor.jsx';

export default function CustomViewsPage() {
  return (
    <div>
      <h2>Impact Views</h2>
      <p className="muted">
        Four custom views for the circular-economy upcycling marketplace —
        two visualizations (material flow Sankey, category × month heatmap)
        and two structured outputs (impact report PDF, rules editor).
      </p>
      <MaterialFlowSankey />
      <ListingCategoryHeatmap />
      <EnvironmentalImpactReportPdf />
      <ListingRulesEditor />
    </div>
  );
}
