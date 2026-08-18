// Shared concept label mapping — single source of truth for concept -> display label.

import { CONCEPT_MAP } from '@/engine/taxonomy';

export function labelOf(concept: string): string {
  return CONCEPT_MAP[concept]?.label ?? concept;
}

export function labelsOf(concepts: string[]): string[] {
  return concepts.map((c) => labelOf(c));
}

export function joinLabels(concepts: string[], max = 3): string {
  return concepts.slice(0, max).map((c) => labelOf(c)).join(', ');
}
