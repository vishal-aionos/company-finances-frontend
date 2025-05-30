import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Loader2, FileText, BarChart2, MessageSquare, Sparkles } from 'lucide-react';

const processSteps = [
  { icon: <FileText className="h-6 w-6 text-blue-500 animate-bounce" />, label: 'Fetching Annual Report...' },
  { icon: <BarChart2 className="h-6 w-6 text-green-500 animate-bounce" />, label: 'Analyzing Financials...' },
  { icon: <MessageSquare className="h-6 w-6 text-yellow-500 animate-bounce" />, label: 'Generating Insights...' },
  { icon: <Sparkles className="h-6 w-6 text-purple-500 animate-bounce" />, label: 'Finalizing Report...' },
];

const LoadingState = () => {
  return (
    <div className="mt-12 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center mb-8">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Processing your request...</h2>
        <p className="text-lg text-slate-600 mb-4">We are analyzing the company data and generating your report. This may take a few moments.</p>
      </div>
      <div className="w-full max-w-xl space-y-4 mb-8">
        {processSteps.map((step, idx) => (
          <div key={idx} className="flex items-center space-x-4 bg-white border border-slate-200 rounded-lg p-4 shadow animate-pulse">
            {step.icon}
            <span className="text-slate-700 text-lg font-medium">{step.label}</span>
          </div>
        ))}
      </div>
      <div className="w-full max-w-xl">
        <Progress value={70} className="h-4 bg-slate-200" />
      </div>
      <div className="mt-6 text-slate-500 text-sm">This usually takes less than a minute. Thank you for your patience!</div>
    </div>
  );
};

export default LoadingState;
