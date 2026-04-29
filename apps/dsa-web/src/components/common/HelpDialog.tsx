import type React from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from './Button';
import { ScrollArea } from './ScrollArea';

interface HelpDialogProps {
  isOpen: boolean;
  title: string;
  content: string;
  onClose: () => void;
}

/**
 * 用於顯示詳細說明的對話框元件，支援 Markdown 渲染。
 */
export const HelpDialog: React.FC<HelpDialogProps> = ({
  isOpen,
  title,
  content,
  onClose,
}) => {
  if (!isOpen) return null;

  const dialog = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="mx-4 flex w-full max-w-2xl max-h-[85vh] flex-col rounded-2xl border border-[var(--settings-border-strong)] bg-[var(--settings-surface)] p-0 shadow-2xl animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--settings-border)] px-6 py-4">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
          <button
            type="button"
            className="rounded-full p-2 text-muted-text hover:bg-[var(--settings-surface-hover)] hover:text-foreground transition-colors"
            onClick={onClose}
            aria-label="關閉"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <ScrollArea className="flex-1 px-6 py-5">
          <div className="prose prose-sm dark:prose-invert max-w-none text-secondary-text prose-headings:text-foreground prose-headings:font-medium prose-a:text-cyan hover:prose-a:text-cyan/80 prose-strong:text-foreground">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </ScrollArea>

        <div className="flex justify-end border-t border-[var(--settings-border)] px-6 py-4">
          <Button
            type="button"
            variant="settings-primary"
            onClick={onClose}
          >
            了解
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
};
