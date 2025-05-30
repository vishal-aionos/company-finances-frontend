import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface DocumentViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  document: string;
  viewType: 'dialog' | 'sheet';
}

const DocumentViewer = ({ isOpen, onOpenChange, document, viewType }: DocumentViewerProps) => {
  if (viewType === 'dialog') {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Source Document</DialogTitle>
          </DialogHeader>
          <div className="mt-4 p-4 bg-slate-50 rounded-md border border-slate-200">
            {document.startsWith('http') ? (
              <a
                href={document}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 transition-colors text-base font-medium"
              >
                {document}
              </a>
            ) : (
              <pre className="whitespace-pre-wrap text-sm">{document}</pre>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Source Document</SheetTitle>
        </SheetHeader>
        <div className="mt-4 p-4 bg-slate-50 rounded-md border border-slate-200 h-full overflow-y-auto">
          {document.startsWith('http') ? (
            <a
              href={document}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 transition-colors text-base font-medium"
            >
              {document}
            </a>
          ) : (
            <pre className="whitespace-pre-wrap text-sm">{document}</pre>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DocumentViewer;
