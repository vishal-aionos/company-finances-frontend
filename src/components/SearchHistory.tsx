import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  reports?: any;
}

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelectHistory: (item: SearchHistoryItem) => void;
  onClearHistory: () => void;
  selectedId: string;
}

const SearchHistory = ({ history, onSelectHistory, onClearHistory, selectedId }: SearchHistoryProps) => {
  const [open, setOpen] = useState(true);
  return (
    <aside
      className={`bg-white border-r border-slate-200 shadow-sm h-screen transition-all duration-300 ${open ? 'w-80 overflow-y-auto' : 'w-14 overflow-hidden cursor-pointer flex flex-col items-center justify-center'}`}
      style={{ minWidth: open ? 320 : 56, maxWidth: open ? 320 : 56 }}
      onClick={() => {
        if (!open) setOpen(true);
      }}
    >
      {open ? (
        <>
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center text-lg font-semibold text-slate-800">
            <span className="mr-2">🕒</span>
            Search History
            </div>
            <Button
              onClick={e => { e.stopPropagation(); setOpen(false); }}
              size="icon"
              variant="ghost"
              className="ml-2 text-slate-500 hover:text-slate-800"
              aria-label="Collapse history"
            >
              <span>⬅️</span>
            </Button>
        </div>
        {history.length > 0 && (
            <div className="px-6 pt-2">
          <Button
            onClick={onClearHistory}
            variant="outline"
            size="sm"
            className="w-full text-slate-600 hover:text-slate-800"
          >
            Clear History
          </Button>
            </div>
        )}
      <div className="p-4 space-y-3">
        {history.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No search history yet</p>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectHistory(item)}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedId === item.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-medium text-slate-800 mb-2">{item.query}</div>
              <div className="text-sm text-slate-500">{item.timestamp}</div>
            </div>
          ))
        )}
      </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full w-full" style={{ minHeight: 80 }}>
          <span className="text-2xl text-slate-500">🕒</span>
        </div>
      )}
    </aside>
  );
};

export default SearchHistory;
