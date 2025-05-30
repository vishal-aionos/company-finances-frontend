import React, { useState } from 'react';
import Header from '../components/Header';
import SearchInterface from '../components/SearchInterface';
import ReportsDisplay from '../components/ReportsDisplay';
import FloatingChatbot from '../components/FloatingChatbot';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  reports?: ReportData;
}

interface ReportSection {
  company_name: string;
  report_type: string;
  summary: string;
  url?: string;
}

interface LLMInsights {
  strategic_shifts?: string[];
  risk_flags?: string[];
  sentiment_analysis?: string[];
  key_phrases?: string[];
  ai_recommendation?: string;
}

interface ReportData {
  annual: ReportSection;
  earnings: ReportSection;
  analyst: ReportSection;
  credit: ReportSection;
  insights?: LLMInsights;
}

// Simple Markdown to docx converter for headings, bold, italics, and lists
function markdownToDocxParagraphs(markdown: string): Paragraph[] {
  const lines = markdown.split(/\r?\n/);
  const paragraphs: Paragraph[] = [];
  let inList = false;
  for (let line of lines) {
    line = line.trim();
    if (!line) {
      paragraphs.push(new Paragraph({ text: '' }));
      inList = false;
      continue;
    }
    // Headings
    if (/^# /.test(line)) {
      paragraphs.push(new Paragraph({ text: line.replace(/^# /, ''), heading: HeadingLevel.HEADING_1 }));
      inList = false;
      continue;
    }
    if (/^## /.test(line)) {
      paragraphs.push(new Paragraph({ text: line.replace(/^## /, ''), heading: HeadingLevel.HEADING_2 }));
      inList = false;
      continue;
    }
    if (/^### /.test(line)) {
      paragraphs.push(new Paragraph({ text: line.replace(/^### /, ''), heading: HeadingLevel.HEADING_3 }));
      inList = false;
      continue;
    }
    // Lists
    if (/^[-*] /.test(line)) {
      paragraphs.push(new Paragraph({ text: line.replace(/^[-*] /, ''), bullet: { level: 0 } }));
      inList = true;
      continue;
    }
    // Bold/Italic (simple)
    let runs: TextRun[] = [];
    let match;
    let lastIndex = 0;
    const boldItalicRegex = /\*\*([^*]+)\*\*|\*([^*]+)\*|__([^_]+)__|_([^_]+)_/g;
    while ((match = boldItalicRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        runs.push(new TextRun(line.substring(lastIndex, match.index)));
      }
      if (match[1]) {
        runs.push(new TextRun({ text: match[1], bold: true }));
      } else if (match[2]) {
        runs.push(new TextRun({ text: match[2], italics: true }));
      } else if (match[3]) {
        runs.push(new TextRun({ text: match[3], bold: true }));
      } else if (match[4]) {
        runs.push(new TextRun({ text: match[4], italics: true }));
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < line.length) {
      runs.push(new TextRun(line.substring(lastIndex)));
    }
    if (runs.length > 0) {
      paragraphs.push(new Paragraph({ children: runs }));
    } else {
      paragraphs.push(new Paragraph({ text: line }));
    }
    inList = false;
  }
  return paragraphs;
}

const Index = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [currentReports, setCurrentReports] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [hasPromptedSave, setHasPromptedSave] = useState(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setHasPromptedSave(false);
    // Clear chatbot history on new search
    sessionStorage.removeItem('chatbot_history');
    sessionStorage.removeItem('chatbot_last_company');
    try {
      const response = await fetch(`https://llm-fin-analyser.onrender.com/get-report?company=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to fetch report');
      const data = await response.json();

      const reports: ReportData = {
        annual: data.annual,
        earnings: data.earnings,
        analyst: data.analyst,
        credit: data.credit,
        insights: data.insights,
      };
      const newHistoryItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query: query.toUpperCase(),
        timestamp: new Date().toLocaleString(),
        reports: reports
      };
      setSearchHistory(prev => [newHistoryItem, ...prev]);
      setCurrentReports(reports);
      setSelectedHistoryId(newHistoryItem.id);
      setTimeout(() => {
        setToast({ message: `Save the Financial reports of ${reports.annual.company_name} to the database`, type: 'success' });
        setHasPromptedSave(true);
        setTimeout(() => setToast(null), 2500);
      }, 500);
    } catch (err) {
      alert('Failed to fetch report. Please try again.');
    }
    setIsLoading(false);
  };

  const handleHistorySelect = (item: SearchHistoryItem) => {
    setCurrentReports(item.reports || null);
    setSelectedHistoryId(item.id);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    setCurrentReports(null);
    setSelectedHistoryId('');
  };

  // Add save report handler
  const handleSaveReport = async () => {
    if (!currentReports) return;
    const companyName = currentReports.annual?.company_name || 'Unknown';
    try {
      const response = await fetch('https://llm-fin-analyser.onrender.com/save-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: companyName,
          reports: currentReports
        })
      });
      if (response.ok) {
        setToast({ message: 'Reports saved successfully!', type: 'success' });
      } else {
        setToast({ message: 'Failed to save reports.', type: 'error' });
      }
    } catch (err) {
      setToast({ message: 'Failed to save reports.', type: 'error' });
    }
    setTimeout(() => setToast(null), 2000);
  };

  const handleDownloadReport = async () => {
    if (!currentReports) return;
    const { annual, earnings, analyst, credit } = currentReports;
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: `Financial Report Summaries for ${annual.company_name}`,
              heading: HeadingLevel.TITLE,
              spacing: { after: 400 },
            }),
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'Annual Report', heading: HeadingLevel.HEADING_1 }),
            ...markdownToDocxParagraphs(annual.summary || 'No summary available.'),
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'Earnings Call', heading: HeadingLevel.HEADING_1 }),
            ...markdownToDocxParagraphs(earnings.summary || 'No summary available.'),
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'Analyst Report', heading: HeadingLevel.HEADING_1 }),
            ...markdownToDocxParagraphs(analyst.summary || 'No summary available.'),
            new Paragraph({ text: '' }),
            new Paragraph({ text: 'Credit Rating', heading: HeadingLevel.HEADING_1 }),
            ...markdownToDocxParagraphs(credit.summary || 'No summary available.'),
          ],
        },
      ],
    });
    const blob = await Packer.toBlob(doc);
    const fileName = `${annual.company_name.replace(/\s+/g, '_')}_Financial_Reports.docx`;
    // Download logic
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onDownloadReport={currentReports && !isLoading ? handleDownloadReport : undefined} />
      
      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-8 right-20 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}
      
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Financial Document Analysis
            </h1>
            <p className="text-xl text-slate-600">
              Enter a company name to analyze financial reports using AI.
            </p>
          </div>

          <SearchInterface 
            onSearch={handleSearch} 
            isLoading={isLoading} 
            showSaveButton={!!currentReports && !isLoading}
            onSaveReport={handleSaveReport}
          />
          
          {(currentReports || isLoading) && (
            <ReportsDisplay reports={currentReports} isLoading={isLoading} />
          )}
        </div>
      </main>
      
      {/* Only show chatbot after a report is available and not loading */}
      {currentReports && !isLoading && <FloatingChatbot reports={currentReports} />}
    </div>
  );
};

export default Index;
