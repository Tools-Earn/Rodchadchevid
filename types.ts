import React from 'react';

export enum AspectRatio {
  PORTRAIT = 'Portrait (9:16)',
  LANDSCAPE = 'Landscape (16:9)',
  SQUARE = 'Square (1:1)',
}

export enum Verbosity {
  CONCISE = 'Concise',
  STANDARD = 'Standard',
  DETAILED = 'Detailed',
}

export interface PromptOptions {
  topic: string;
  style: string;
  ratio: AspectRatio;
  layoutPreference: string;
  verbosity: Verbosity;
  tone: string;
  specificContent?: string;
}

export interface GeneratedResult {
  prompt: string;
  explanation?: string;
}

export interface StyleOption {
  id: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
}

export interface ToneOption {
  id: string;
  label: string;
  emoji: string;
}