// Search utilities for fuzzy matching and relevance scoring
import React from 'react';

export interface SearchResult {
  item: any;
  score: number;
  matches: {
    field: string;
    indices: Array<[number, number]>;
  }[];
}

// Simple fuzzy matching algorithm
export function fuzzyMatch(pattern: string, text: string): { match: boolean; score: number; indices: Array<[number, number]> } {
  pattern = pattern.toLowerCase();
  text = text.toLowerCase();
  
  let patternIdx = 0;
  let textIdx = 0;
  let score = 0;
  const indices: Array<[number, number]> = [];
  let inMatch = false;
  let matchStart = -1;
  
  while (patternIdx < pattern.length && textIdx < text.length) {
    if (pattern[patternIdx] === text[textIdx]) {
      if (!inMatch) {
        matchStart = textIdx;
        inMatch = true;
      }
      score += 1;
      patternIdx++;
    } else if (inMatch) {
      indices.push([matchStart, textIdx - 1]);
      inMatch = false;
    }
    textIdx++;
  }
  
  if (inMatch) {
    indices.push([matchStart, textIdx - 1]);
  }
  
  const match = patternIdx === pattern.length;
  
  // Bonus for consecutive matches
  if (match) {
    let consecutiveBonus = 0;
    for (const [start, end] of indices) {
      consecutiveBonus += (end - start + 1) * 2;
    }
    score += consecutiveBonus;
    
    // Bonus for matching at word boundaries
    if (indices.length > 0 && indices[0][0] === 0) {
      score += 10;
    }
    
    // Bonus for shorter text (more relevant)
    score += Math.max(0, 20 - text.length);
  }
  
  return { match, score, indices };
}

// Search with relevance scoring
export function searchItems(query: string, items: any[], fields: string[]): SearchResult[] {
  if (!query.trim()) return [];
  
  const results: SearchResult[] = [];
  
  for (const item of items) {
    let totalScore = 0;
    const matches: SearchResult['matches'] = [];
    
    for (const field of fields) {
      const value = item[field];
      if (typeof value === 'string') {
        const result = fuzzyMatch(query, value);
        if (result.match) {
          totalScore += result.score * (field === 'title' ? 2 : 1); // Title matches are worth more
          matches.push({
            field,
            indices: result.indices
          });
        }
      } else if (Array.isArray(value)) {
        // Handle keyword arrays
        for (const keyword of value) {
          const result = fuzzyMatch(query, keyword);
          if (result.match) {
            totalScore += result.score * 0.5; // Keyword matches are worth less
            matches.push({
              field,
              indices: result.indices
            });
            break; // Only count one keyword match
          }
        }
      }
    }
    
    if (totalScore > 0) {
      results.push({ item, score: totalScore, matches });
    }
  }
  
  // Sort by relevance score
  return results.sort((a, b) => b.score - a.score);
}

// Highlight matched text
export function highlightText(text: string, indices: Array<[number, number]>): React.ReactNode[] {
  if (indices.length === 0) return [text];
  
  const result: React.ReactNode[] = [];
  let lastEnd = 0;
  
  for (const [start, end] of indices) {
    if (start > lastEnd) {
      result.push(text.substring(lastEnd, start));
    }
    result.push(
      React.createElement(
        'mark',
        {
          key: `${start}-${end}`,
          className: 'bg-yellow-200 text-gray-900 font-medium rounded px-0.5'
        },
        text.substring(start, end + 1)
      )
    );
    lastEnd = end + 1;
  }
  
  if (lastEnd < text.length) {
    result.push(text.substring(lastEnd));
  }
  
  return result;
}

// Search history management
export class SearchHistory {
  private static KEY = 'myeca_search_history';
  private static MAX_ITEMS = 10;
  
  static getHistory(): string[] {
    try {
      const stored = localStorage.getItem(this.KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
  
  static addToHistory(query: string): void {
    if (!query.trim()) return;
    
    const history = this.getHistory();
    const filtered = history.filter(item => item.toLowerCase() !== query.toLowerCase());
    const updated = [query, ...filtered].slice(0, this.MAX_ITEMS);
    
    try {
      localStorage.setItem(this.KEY, JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  }
  
  static clearHistory(): void {
    try {
      localStorage.removeItem(this.KEY);
    } catch {
      // Ignore localStorage errors
    }
  }
}

// Popular searches
export const popularSearches = [
  'Income tax calculator',
  'ITR filing',
  'GST registration',
  'HRA exemption',
  'Tax saving tips',
  '80C deductions',
  'New tax regime',
  'TDS calculator',
];