import React from 'react';
import { FileText, MessageSquare, BarChart, Building } from 'lucide-react';

export interface ReportType {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: string;
  title: string;
}

export interface ReportSection {
  company_name: string;
  report_type: string;
  summary: string;
  url?: string;
}

export interface LLMInsights {
  strategic_shifts?: string[];
  risk_flags?: string[];
  sentiment_analysis?: string[];
  key_phrases?: string[];
  ai_recommendation?: string;
}

export interface ReportData {
  annual: ReportSection;
  earnings: ReportSection;
  analyst: ReportSection;
  credit: ReportSection;
  insights?: LLMInsights;
}

export const getReportTypes = (reports: ReportData): ReportType[] => {
  return [
    {
      id: 'annual',
      label: 'Annual Report',
      icon: <FileText className="h-5 w-5" />,
      content: reports.annual.summary,
      title: 'Annual Report'
    },
    {
      id: 'earnings',
      label: 'Earnings Call',
      icon: <MessageSquare className="h-5 w-5" />,
      content: reports.earnings.summary,
      title: 'Earnings Call Transcript'
    },
    {
      id: 'analyst',
      label: 'Analyst Report',
      icon: <BarChart className="h-5 w-5" />,
      content: reports.analyst.summary,
      title: 'Analyst Report'
    },
    {
      id: 'credit',
      label: 'Credit Rating',
      icon: <Building className="h-5 w-5" />,
      content: reports.credit.summary,
      title: 'Credit Rating Report'
    },
    {
      id: 'insights',
      label: 'AI Insights',
      icon: '✨',
      content: '',
      title: 'AI-Generated Insights'
    }
  ];
};
