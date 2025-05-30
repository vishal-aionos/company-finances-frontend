import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatsPanel from './StatsPanel';
import InsightsList from './InsightsList';
import DocumentViewer from './DocumentViewer';
import ReportTab from './ReportTab';
import LoadingState from './LoadingState';
import { getReportTypes, type ReportData } from './ReportTabsConfig';

interface ReportsDisplayProps {
  reports: ReportData | null;
  isLoading: boolean;
}

const ReportsDisplay = ({ reports, isLoading }: ReportsDisplayProps) => {
  const [activeTab, setActiveTab] = useState('annual');
  const [showSourceDocument, setShowSourceDocument] = useState(false);
  const [sourceViewType, setSourceViewType] = useState<'dialog' | 'sheet'>('dialog');
  const [currentDocument, setCurrentDocument] = useState('');

  // Extract stats from the annual report summary if available
  let stats = undefined;
  if (reports && reports.annual && reports.annual.summary) {
    const summary = reports.annual.summary;
    // Improved regex to match lines like 'Revenue: ...', 'Net Margin: ...', 'Free Cash Flows: ...', 'Growth', 'EBITDADADA'
    const revenueMatch = summary.match(/Revenue:\s*([^\n]*)/i)|| summary.match(/Revenue from operations:\s*([^\n]*)/i);;
    const marginMatch = summary.match(/Profit:\s*([^\n]*)/i)|| summary.match(/Profit After Tax:\s*([^\n]*)/i);
    const growthMatch = summary.match(/EBITDA:\s*([^\n]*)/i) ||summary.match(/EBIT:\s*([^\n]*)/i);
    const cashFlowMatch = summary.match(/Cash Flows?:\s*([^\n]*)/i) || summary.match(/Cash Flow:\s*([^\n]*)/i);
    stats = {
      revenue: revenueMatch ? revenueMatch[1].trim() : 'Not available',
      margin: marginMatch ? marginMatch[1].trim() : 'Not available',
      growth: growthMatch ? growthMatch[1].trim() : 'Not available',
      cashFlow: cashFlowMatch ? cashFlowMatch[1].trim() : 'Not available',
    };
  }

  // Reset to 'annual' tab when new reports are loaded
  useEffect(() => {
    if (reports) setActiveTab('annual');
  }, [reports]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!reports) return null;

  const viewSourceDocument = (url: string | undefined, type: 'dialog' | 'sheet' = 'dialog') => {
    setCurrentDocument(url || 'No source URL available');
    setSourceViewType(type);
    setShowSourceDocument(true);
  };

  const reportTypes = getReportTypes(reports);

  return (
    <div className="mt-8">
      {/* Quick Stats Panel */}
      <StatsPanel stats={stats} />
      
      <Tabs 
        defaultValue="annual" 
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-5 mb-6 bg-white border border-slate-200 rounded-xl p-1 h-14 items-center">
          {reportTypes.map((report) => (
            <TabsTrigger
              key={report.id}
              value={report.id}
              className="flex items-center space-x-2 text-[hsl(215.4,91.06%,44.73%)] data-[state=active]:bg-slate-800 data-[state=active]:text-white rounded-lg py-3"
            >
              <span className="text-lg">{typeof report.icon === 'string' ? report.icon : report.icon}</span>
              <span className="font-medium">{report.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {reportTypes.map((report, idx) => (
          <TabsContent key={report.id} value={report.id} className="w-full">
            {report.id === 'insights' ? (
              <Card className="border-2 border-slate-200 shadow-lg w-full">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
                  <CardTitle className="flex items-center space-x-3 text-slate-800">
                    <span className="text-2xl">{report.icon}</span>
                    <span>{report.title}</span>
                  </CardTitle>
                  <p className="text-slate-600">AI-generated insights for the selected company</p>
                </CardHeader>
                <CardContent className="p-6">
                  <InsightsList llmInsights={reports.insights || {}} />
                </CardContent>
              </Card>
            ) : (
              <ReportTab 
                icon={report.icon} 
                title={report.title} 
                content={report.content} 
                url={
                  report.id === 'annual' ? reports.annual.url :
                  report.id === 'earnings' ? reports.earnings.url :
                  report.id === 'analyst' ? reports.analyst.url :
                  report.id === 'credit' ? reports.credit.url : undefined
                }
                companyName={
                  report.id === 'annual' ? reports.annual.company_name :
                  report.id === 'earnings' ? reports.earnings.company_name :
                  report.id === 'analyst' ? reports.analyst.company_name :
                  report.id === 'credit' ? reports.credit.company_name : ''
                }
                reportType={report.id}
                onViewSource={(url) => viewSourceDocument(url)}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      {/* Document Viewer */}
      <DocumentViewer
        isOpen={showSourceDocument}
        onOpenChange={setShowSourceDocument}
        document={currentDocument}
        viewType={sourceViewType}
      />
    </div>
  );
};

export default ReportsDisplay;
