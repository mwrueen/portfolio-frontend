'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minHeight?: string;
}

// Dynamically import ReactQuill with SSR disabled to prevent window/document undefined issues
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill-new');
    return RQ;
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs gap-2">
        <div className="w-5 h-5 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        <span className="font-medium text-slate-500">Loading Quill Rich Text Editor...</span>
      </div>
    ),
  }
);

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your custom page content here...',
  minHeight = '240px',
}: RichTextEditorProps) {
  
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'clean'],
      ],
    }),
    []
  );

  const formats = useMemo(
    () => [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'color',
      'background',
      'list',
      'blockquote',
      'code-block',
      'link',
    ],
    []
  );

  return (
    <div className="rich-text-editor-wrapper bg-white rounded-xl shadow-xs overflow-hidden">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />
      <style jsx global>{`
        .rich-text-editor-wrapper .ql-toolbar.ql-snow {
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          border-color: #e2e8f0;
          background-color: #f8fafc;
          padding: 0.625rem 0.75rem;
        }
        .rich-text-editor-wrapper .ql-container.ql-snow {
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          border-color: #e2e8f0;
          background-color: #ffffff;
          font-family: inherit;
          font-size: 0.875rem;
        }
        .rich-text-editor-wrapper .ql-editor {
          min-height: ${minHeight};
          font-family: inherit;
          color: #0f172a;
          line-height: 1.65;
        }
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          color: #94a3b8;
          font-style: normal;
        }
      `}</style>
    </div>
  );
}
