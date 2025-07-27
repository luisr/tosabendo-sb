// src/components/ui/markdown-renderer.tsx
'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Personaliza a renderização de elementos específicos do Markdown se necessário
          h1: ({node, ...props}) => <h1 className="text-xl font-bold" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-semibold" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-base font-semibold" {...props} />,
          p: ({node, ...props}) => <p className="text-muted-foreground" {...props} />,
          a: ({node, ...props}) => <a className="text-primary hover:underline" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc pl-5" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal pl-5" {...props} />,
          li: ({node, ...props}) => <li className="mb-1" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
