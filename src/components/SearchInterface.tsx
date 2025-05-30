import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  showSaveButton?: boolean;
  onSaveReport?: () => Promise<void>;
}

const SearchInterface = ({ onSearch, isLoading, showSaveButton, onSaveReport }: SearchInterfaceProps) => {
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleSave = async () => {
    if (!onSaveReport) return;
    setSaving(true);
    await onSaveReport();
    setSaving(false);
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="flex gap-4 max-w-3xl mx-auto">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Enter company name (e.g., APPLE, MICROSOFT)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-14 text-lg border-2 border-slate-200 focus:border-blue-500 rounded-xl"
            disabled={isLoading}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
        </div>
        
        <Button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="h-14 px-8 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Running...</span>
            </div>
          ) : (
            'Run Analysis'
          )}
        </Button>
        {showSaveButton && (
          <Button
            type="button"
            className="h-14 px-8 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all duration-200"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </div>
            ) : (
              'Save Report'
            )}
          </Button>
        )}
      </form>
    </div>
  );
};

export default SearchInterface;
