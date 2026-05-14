import React from 'react';
import AiToolPage from '../AiToolPage.jsx';

export default function TrendForecast() {
  return (
    <AiToolPage
      title="Trend Forecast"
      intro="Forecast trending circular-economy material categories and product types."
      endpoint="trend-forecast"
      fields={[
        { name: 'region', label: 'Region', type: 'text' },
        { name: 'timeframe', label: 'Timeframe', type: 'text', placeholder: 'e.g. next 12 months' },
        { name: 'category', label: 'Category focus', type: 'text', placeholder: 'e.g. home goods, fashion, all' },
      ]}
    />
  );
}
