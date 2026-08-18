// Semantic concept taxonomy — defines how specific topics map to broader interests.
// This is the backbone of ReelMind's semantic inference (NOT keyword matching).

export interface TaxonomyEntry {
  concept: string;
  label: string;
  level: number; // 0 = specific, 1 = mid, 2 = broad
  parents: string[]; // broader concepts this rolls up into
  related: string[]; // adjacent concepts (cross-domain links)
}

// Level 0: specific reel topics
// Level 1: mid-level domains
// Level 2: broad interests

export const TAXONOMY: TaxonomyEntry[] = [
  // Specific (level 0)
  { concept: 'java', label: 'Java', level: 0, parents: ['programming'], related: ['dsa', 'backend'] },
  { concept: 'dsa', label: 'DSA', level: 0, parents: ['programming'], related: ['system_design', 'interview'] },
  { concept: 'interview', label: 'Coding Interviews', level: 0, parents: ['career'], related: ['dsa', 'programming'] },
  { concept: 'developer_lifestyle', label: 'Developer Lifestyle', level: 0, parents: ['career'], related: ['programming', 'technology'] },
  { concept: 'hardware', label: 'Hardware', level: 0, parents: ['technology'], related: ['developer_tools'] },
  { concept: 'gaming', label: 'Gaming', level: 0, parents: ['entertainment'], related: ['technology'] },
  { concept: 'ai_tech', label: 'AI Technology', level: 0, parents: ['ai_ml'], related: ['technology', 'programming'] },
  { concept: 'cyber_news', label: 'Cybersecurity News', level: 0, parents: ['cybersecurity'], related: ['technology', 'news'] },
  { concept: 'system_design', label: 'System Design', level: 0, parents: ['software_engineering'], related: ['backend', 'cloud'] },
  { concept: 'cloud', label: 'Cloud', level: 0, parents: ['technology'], related: ['devops', 'backend'] },
  { concept: 'devops', label: 'DevOps', level: 0, parents: ['software_engineering'], related: ['cloud', 'backend'] },
  { concept: 'backend', label: 'Backend', level: 0, parents: ['software_engineering'], related: ['database', 'api'] },
  { concept: 'database', label: 'Databases', level: 0, parents: ['software_engineering'], related: ['backend', 'data'] },
  { concept: 'api', label: 'APIs', level: 0, parents: ['software_engineering'], related: ['backend'] },
  { concept: 'data', label: 'Data Science', level: 0, parents: ['ai_ml'], related: ['database'] },
  { concept: 'developer_tools', label: 'Developer Tools', level: 0, parents: ['technology'], related: ['hardware'] },
  { concept: 'news', label: 'Tech News', level: 0, parents: ['technology'], related: ['cybersecurity'] },
  { concept: 'entertainment', label: 'Entertainment', level: 0, parents: [], related: [] },

  // Mid-level (level 1)
  { concept: 'programming', label: 'Programming', level: 1, parents: ['software_engineering'], related: ['dsa', 'backend'] },
  { concept: 'career', label: 'Career', level: 1, parents: ['software_engineering'], related: ['developer_lifestyle'] },
  { concept: 'ai_ml', label: 'AI / ML', level: 1, parents: ['software_engineering'], related: ['data', 'programming'] },
  { concept: 'cybersecurity', label: 'Cybersecurity', level: 1, parents: ['technology'], related: ['news'] },

  // Broad (level 2)
  { concept: 'software_engineering', label: 'Software Engineering', level: 2, parents: [], related: ['technology'] },
  { concept: 'technology', label: 'Technology', level: 2, parents: [], related: ['software_engineering'] },
];

export const CONCEPT_MAP: Record<string, TaxonomyEntry> = TAXONOMY.reduce(
  (acc, entry) => {
    acc[entry.concept] = entry;
    return acc;
  },
  {} as Record<string, TaxonomyEntry>
);

// Get all ancestors (transitive parents) of a concept
export function getAncestors(concept: string): string[] {
  const entry = CONCEPT_MAP[concept];
  if (!entry) return [];
  const ancestors = new Set<string>();
  const queue = [...entry.parents];
  while (queue.length) {
    const c = queue.shift()!;
    if (ancestors.has(c)) continue;
    ancestors.add(c);
    const e = CONCEPT_MAP[c];
    if (e) queue.push(...e.parents);
  }
  return Array.from(ancestors);
}

// Get all descendants (concepts that roll up into this one)
export function getDescendants(concept: string): string[] {
  const descendants: string[] = [];
  for (const entry of TAXONOMY) {
    if (getAncestors(entry.concept).includes(concept)) {
      descendants.push(entry.concept);
    }
  }
  return descendants;
}

// Compute semantic similarity between two concept sets (Jaccard over ancestor union)
export function semanticSimilarity(conceptsA: string[], conceptsB: string[]): number {
  const expand = (cs: string[]) => {
    const set = new Set<string>();
    for (const c of cs) {
      set.add(c);
      for (const a of getAncestors(c)) set.add(a);
    }
    return set;
  };
  const setA = expand(conceptsA);
  const setB = expand(conceptsB);
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const c of setA) if (setB.has(c)) intersection++;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
