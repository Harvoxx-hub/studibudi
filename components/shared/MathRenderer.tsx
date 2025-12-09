"use client";

import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathRendererProps {
  content: string;
  displayMode?: boolean;
  className?: string;
}

/**
 * Renders text content with LaTeX math expressions.
 * Supports inline math with \( ... \) or $ ... $ and display math with \[ ... \] or $$ ... $$
 */
export function MathRenderer({ 
  content, 
  displayMode = false,
  className = "" 
}: MathRendererProps) {
  if (!content) return null;
  
  // Split content by math delimiters
  const parts: Array<{ type: "text" | "math"; content: string; display: boolean }> = [];
  
  // Find all math expressions - prioritize display math ($$ ... $$ or \[ ... \])
  const mathMatches: Array<{ start: number; end: number; content: string; display: boolean }> = [];
  
  // First, find display math: $$ ... $$ or \[ ... \]
  const displayRegex = /\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/g;
  let match: RegExpExecArray | null;
  while ((match = displayRegex.exec(content)) !== null) {
    mathMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      content: (match[1] || match[2] || "").trim(),
      display: true,
    });
  }
  
  // Then find inline math: \( ... \) or $ ... $ (but not $$)
  const inlineRegex = /\\\(([^)]+)\\\)|(?<!\$)\$([^$\n]+?)\$(?!\$)/g;
  while ((match = inlineRegex.exec(content)) !== null) {
    // Check if this is not already captured as display math
    const isOverlapping = mathMatches.some(
      (m) => match!.index >= m.start && match!.index < m.end
    );
    if (!isOverlapping) {
      mathMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        content: (match[1] || match[2] || "").trim(),
        display: false,
      });
    }
  }
  
  // Sort matches by start position
  mathMatches.sort((a, b) => a.start - b.start);
  
  // Build parts array
  let lastIndex = 0;
  for (const mathMatch of mathMatches) {
    // Add text before math
    if (mathMatch.start > lastIndex) {
      const textContent = content.substring(lastIndex, mathMatch.start);
      if (textContent) {
        parts.push({
          type: "text",
          content: textContent,
          display: false,
        });
      }
    }
    
    // Add math
    parts.push({
      type: "math",
      content: mathMatch.content.trim(),
      display: mathMatch.display,
    });
    
    lastIndex = mathMatch.end;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    const textContent = content.substring(lastIndex);
    if (textContent) {
      parts.push({
        type: "text",
        content: textContent,
        display: false,
      });
    }
  }
  
  // If no math found, return plain text
  if (parts.length === 0) {
    return <span className={className}>{content}</span>;
  }
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return <span key={index}>{part.content}</span>;
        } else {
          try {
            const html = katex.renderToString(part.content, {
              throwOnError: false,
              displayMode: part.display || displayMode,
              strict: false,
            });
            return (
              <span
                key={index}
                dangerouslySetInnerHTML={{ __html: html }}
                className={part.display ? "block my-2" : "inline"}
              />
            );
          } catch (error) {
            // If KaTeX fails to render, show the original math expression
            return (
              <span key={index} className="text-red-500">
                {part.display ? `$$${part.content}$$` : `$${part.content}$`}
              </span>
            );
          }
        }
      })}
    </span>
  );
}

/**
 * Simple inline math renderer for single math expressions
 */
export function InlineMath({ content, className = "" }: { content: string; className?: string }) {
  try {
    const html = katex.renderToString(content, {
      throwOnError: false,
      displayMode: false,
    });
    return (
      <span
        className={`inline ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch (error) {
    return <span className={`text-red-500 ${className}`}>{content}</span>;
  }
}

/**
 * Display math renderer for block-level math expressions
 */
export function DisplayMath({ content, className = "" }: { content: string; className?: string }) {
  try {
    const html = katex.renderToString(content, {
      throwOnError: false,
      displayMode: true,
    });
    return (
      <div
        className={`my-4 ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch (error) {
    return <div className={`text-red-500 ${className}`}>\[{content}\]</div>;
  }
}

