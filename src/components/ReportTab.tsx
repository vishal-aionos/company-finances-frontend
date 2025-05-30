import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

interface ReportTabProps {
  icon: React.ReactNode;
  title: string;
  content: string;
  url?: string;
  onViewSource: (content: string, type: 'dialog' | 'sheet') => void;
  companyName?: string;
  reportType?: string;
}

const preprocessMarkdown = (content: string) => {
  const lines = content.split(/\r?\n/);
  const processed: string[] = [];
  let inSection = false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // If the line is a heading (starts and ends with **, ignoring whitespace)
    if (/^\s*\*\*.*\*\*\s*$/.test(line)) {
      processed.push(line);
      inSection = true;
    } else if (inSection && line.trim() !== '') {
      // If inside a section and the line is not empty or a heading, add bullet
      processed.push(`- ${line.trim()}`);
    } else {
      // If not in a section (before first heading), or empty line, leave as is
      processed.push(line);
    }
  }
  return processed.join('\n');
};

const extractYearRange = (summary: string) => {
  // Try to match patterns like 2022-23, 2021-2022, FY23, FY2023, etc.
  const match = summary.match(/(\d{4}[\-/]\d{2,4}|FY\s?\d{2,4})/i);
  return match ? match[0].replace(/\s+/g, '') : '';
};

const ReportTab = ({ icon, title, content, url, onViewSource, companyName, reportType }: ReportTabProps) => {
  // Dynamic description
  let description = '';
  const yearRange = content ? extractYearRange(content) : '';
  if (reportType && companyName) {
    if (reportType === 'annual') description = `Annual Report Summary of ${companyName}${yearRange ? ` for the Financial Year ${yearRange}` : ''}`;
    else if (reportType === 'earnings') description = `Earnings Report Summary of ${companyName}${yearRange ? ` for the Financial Year ${yearRange}` : ''}`;
    else if (reportType === 'analyst') description = `Analyst report summary of ${companyName}`;
    else if (reportType === 'credit') description = `Credit rating report summary of ${companyName}`;
  }
  return (
    <Card className="border-2 border-slate-200 shadow-lg w-full">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-3 text-slate-800">
            <span className="text-2xl">{icon}</span>
            <span>{title}</span>
          </CardTitle>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex items-center space-x-1"
              onClick={() => onViewSource(url || '', 'dialog')}
            >
              <span>🔍</span>
              <span>View Source</span>
            </Button>
          </div>
        </div>
        <p className="text-slate-600">{description || 'Financial summary for the selected company'}</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="prose max-w-none text-slate-700 leading-relaxed text-lg">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-2" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-2 mb-1" {...props} />,
              strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
              // You can add more custom renderers as needed
            }}
          >
            {preprocessMarkdown(content)}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportTab;
