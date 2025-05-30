import React from 'react';
import { Search } from 'lucide-react';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";

const Header = ({ onDownloadReport }: { onDownloadReport?: () => void }) => {
  return (
    <header className="bg-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-500 p-2 rounded-lg">
              <Search className="h-6 w-6 text-slate-800" />
            </div>
            <h1 className="text-2xl font-bold">LLM Financial Analyser</h1>
          </div>
          <div className="flex items-center space-x-8">
            {/* NavigationMenu removed as per request */}
            {onDownloadReport && (
              <button
                onClick={onDownloadReport}
                className="bg-slate-800 hover:bg-gray-500 text-white font-semibold px-6 py-2 rounded-lg shadow transition-all duration-200"
              >
                Download Report
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
