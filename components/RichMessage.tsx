
import React from 'react';
import clsx from 'clsx';

interface Props {
  text: string;
  isMe: boolean;
}

export const RichMessage: React.FC<Props> = ({ text, isMe }) => {
  const renderContent = () => {
    // Basic Markdown Parsing
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeContent = '';
    let inTable = false;
    let tableRows: string[][] = [];

    const processInline = (str: string) => {
        // Split by bold (**), italic (*), and code (`)
        const parts = str.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
            if (part.startsWith('*') && part.endsWith('*')) return <em key={i} className="italic opacity-90">{part.slice(1, -1)}</em>;
            if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className={clsx("px-1.5 py-0.5 rounded font-mono text-xs border", isMe ? "bg-white/20 border-white/20" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700")}>{part.slice(1, -1)}</code>;
            return part;
        });
    };

    const flushTable = () => {
        if (tableRows.length > 0) {
            elements.push(
                <div key={`table-${elements.length}`} className="my-3 overflow-hidden rounded-xl border border-white/20 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className={isMe ? "bg-black/10" : "bg-slate-100 dark:bg-slate-800"}>
                                    {tableRows[0].map((cell, idx) => (
                                        <th key={idx} className="p-3 border-b border-white/10 whitespace-nowrap font-bold">
                                            {processInline(cell.trim())}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableRows.slice(1).map((row, rIdx) => (
                                    <tr key={rIdx} className="border-b border-white/5 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                        {row.map((cell, cIdx) => (
                                            <td key={cIdx} className="p-3 whitespace-nowrap">
                                                {processInline(cell.trim())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
            tableRows = [];
            inTable = false;
        }
    };

    lines.forEach((line, index) => {
        // Handle Code Blocks
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                elements.push(
                    <div key={`code-${index}`} className="my-3 rounded-xl overflow-hidden shadow-md border border-slate-800 relative group text-left">
                        <div className="bg-slate-950 px-4 py-2 flex items-center justify-between border-b border-slate-800">
                             <div className="flex gap-1.5">
                                 <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                 <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                             </div>
                             <span className="text-[10px] text-slate-500 font-mono uppercase">Code</span>
                        </div>
                        <div className="bg-slate-900 p-4 overflow-x-auto">
                            <pre className="text-xs font-mono text-emerald-300 leading-relaxed">{codeContent}</pre>
                        </div>
                    </div>
                );
                codeContent = '';
                inCodeBlock = false;
            } else {
                flushTable();
                inCodeBlock = true;
            }
            return;
        }

        if (inCodeBlock) {
            codeContent += line + '\n';
            return;
        }

        // Handle Tables
        if (line.trim().startsWith('|')) {
            // Check if it's a separator line (e.g., |---|---|)
            if (line.trim().match(/^\|[\s-]+\|/)) {
                return; // Skip separator line
            }
            const cells = line.split('|').filter(cell => cell.trim() !== '');
            if (cells.length > 0) {
                if (!inTable) {
                    inTable = true;
                }
                tableRows.push(cells);
                return;
            }
        }
        
        if (inTable) {
             flushTable();
        }

        // Handle Headers
        if (line.startsWith('# ')) {
             elements.push(<h1 key={index} className="text-xl font-bold my-2 border-b border-white/20 pb-1">{processInline(line.slice(2))}</h1>);
             return;
        }
        if (line.startsWith('## ')) {
             elements.push(<h2 key={index} className="text-lg font-bold my-2">{processInline(line.slice(3))}</h2>);
             return;
        }

        // Handle Lists
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            elements.push(
                <div key={index} className="flex gap-2 ml-1 my-1">
                    <span className="text-emerald-400">•</span>
                    <span>{processInline(line.trim().slice(2))}</span>
                </div>
            );
            return;
        }

        // Standard Paragraph
        if (line.trim() !== '') {
            elements.push(<p key={index} className="min-h-[1.2em]">{processInline(line)}</p>);
        } else {
             // Preserve empty lines as spacing
             elements.push(<div key={index} className="h-2"></div>);
        }
    });
    
    // Flush any remaining table
    flushTable();

    return elements;
  };

  return <div className="space-y-0.5 break-words">{renderContent()}</div>;
};
