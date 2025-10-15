import { useState, useRef, useEffect } from 'react';

import { Navbar } from './Navbar';
import { ProblemDescription } from '../problem/ProblemDescription';
import { CodeEditor } from '../editor/CodeEditor';
import { EditorToolbar } from '../editor/EditorToolbar';
import { ConsolePanel } from '../editor/ConsolePanel';
import { Button } from '../ui/button';
import type { Problem, ExecutionResult } from '../../types';

interface ProblemLayoutProps {
  problem: Problem;
  onRun: () => void;
  onSubmit: () => void;
  results: ExecutionResult[];
  isRunning: boolean;
  isSubmitting: boolean;
  submissionError: string | null;
}

export function ProblemLayout({ problem, onRun, onSubmit, results, isRunning, isSubmitting, submissionError }: ProblemLayoutProps) {
  const [leftWidth, setLeftWidth] = useState(40); // percentage
  const [bottomHeight, setBottomHeight] = useState(40); // percentage
  const [isResizing, setIsResizing] = useState<'horizontal' | 'vertical' | null>(null);
  const [mobileTab, setMobileTab] = useState('editor'); // 'problem' or 'editor'
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();

      if (isResizing === 'horizontal') {
        const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        setLeftWidth(Math.min(Math.max(newWidth, 30), 70));
      } else if (isResizing === 'vertical') {
        const rightPanel = containerRef.current.querySelector('.right-panel');
        if (!rightPanel) return;
        const rightRect = rightPanel.getBoundingClientRect();
        const newHeight = ((rightRect.bottom - e.clientY) / rightRect.height) * 100;
        setBottomHeight(Math.min(Math.max(newHeight, 20), 70));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(null);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  return (
    <div className="flex h-screen flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Mobile Navigation Tabs */}
      <div className="md:hidden flex gap-2 border-b border-border px-4 py-2 bg-card">
        <Button
          variant={mobileTab === 'problem' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMobileTab('problem')}
        >
          Problem
        </Button>
        <Button
          variant={mobileTab === 'editor' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMobileTab('editor')}
        >
          Editor
        </Button>
      </div>

      {/* Desktop Layout */}
      <div ref={containerRef} className="hidden md:flex flex-1 overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div
          className="hidden md:flex flex-col border-r border-border overflow-hidden"
          style={{ width: `${leftWidth}%` }}
        >
          <ProblemDescription problem={problem} />
        </div>

        {/* Horizontal Resizer */}
        <div
          className="hidden md:block w-1 cursor-col-resize bg-border hover:bg-primary transition-colors"
          onMouseDown={() => setIsResizing('horizontal')}
        />

        {/* Right Panel - Editor and Console */}
        <div
          className="right-panel flex flex-1 flex-col overflow-hidden"
          style={{ width: `${100 - leftWidth}%` }}
        >
          {/* Editor Toolbar */}
          <EditorToolbar onRun={onRun} onSubmit={onSubmit} isRunning={isRunning} isSubmitting={isSubmitting} />

          {/* Editor */}
          <div
            className="flex-1 overflow-hidden"
            style={{ height: `${100 - bottomHeight}%` }}
          >
            <CodeEditor />
          </div>

          {/* Vertical Resizer */}
          <div
            className="h-1 cursor-row-resize bg-border hover:bg-primary transition-colors"
            onMouseDown={() => setIsResizing('vertical')}
          />

          {/* Console Panel */}
          <div
            className="overflow-hidden"
            style={{ height: `${bottomHeight}%` }}
          >
            <ConsolePanel sampleTestCases={problem.sample_test_cases} results={results} error={submissionError} />
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden">
        {mobileTab === 'problem' ? (
          <ProblemDescription problem={problem} />
        ) : (
          <div className="flex flex-col h-full">
            {/* Editor Toolbar */}
            <EditorToolbar onRun={onRun} onSubmit={onSubmit} isRunning={isRunning} isSubmitting={isSubmitting} />

            {/* Editor - 60% height */}
            <div className="h-[60%] overflow-hidden">
              <CodeEditor />
            </div>

            {/* Console - 40% height */}
            <div className="h-[40%] overflow-hidden">
              <ConsolePanel sampleTestCases={problem.sample_test_cases} results={results} error={submissionError} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
