import React from 'react';

interface LLMInsights {
  strategic_shifts?: string[];
  risk_flags?: string[];
  sentiment_analysis?: string[];
  ai_recommendation?: string;
}

interface InsightsListProps {
  llmInsights?: LLMInsights;
}

const renderInsightItem = (item: any) => {
  if (typeof item === 'string') return <span className="text-slate-700">{item}</span>;
  if (typeof item === 'object' && item !== null) {
    return (
      <span className="text-slate-700">
        {item.point && <span>{item.point} </span>}
        {item.evidence && <span className="block text-xs text-slate-500"><strong>Evidence:</strong> {item.evidence}</span>}
      </span>
    );
  }
  return null;
};

const InsightsList: React.FC<InsightsListProps> = ({ llmInsights }) => {
  if (!llmInsights) return <div className="text-slate-500">No insights available.</div>;
  return (
    <div className="space-y-6">
      {llmInsights.strategic_shifts && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <span className="mr-2">🧠</span>
            Strategic Shifts
          </h3>
          <ul className="space-y-2">
            {llmInsights.strategic_shifts.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {renderInsightItem(item)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {llmInsights.risk_flags && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <span className="mr-2">⚠️</span>
            Risk Flags
          </h3>
          <ul className="space-y-2">
            {llmInsights.risk_flags.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {renderInsightItem(item)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {llmInsights.sentiment_analysis && (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
            <span className="mr-2">📊</span>
            Sentiment Analysis
          </h3>
          <ul className="space-y-2">
            {llmInsights.sentiment_analysis.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {renderInsightItem(item)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {llmInsights.ai_recommendation && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            AI Recommendation
          </h3>
          <p className="text-blue-700">{llmInsights.ai_recommendation}</p>
        </div>
      )}
    </div>
  );
};

export default InsightsList;
