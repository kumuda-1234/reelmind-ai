# ReelMind AI

> An AI-style semantic recommendation dashboard that turns short-form viewing behavior into meaningful technology discovery.

## Problem Statement

Short-form feeds are easy to consume but often optimize for passive, entertainment-heavy scrolling. A single meme, a career clip, or a developer-tool video can be treated as an isolated keyword signal instead of evidence of a deeper interest.

ReelMind AI looks beyond exact topic repetition. It uses interaction behavior and semantic concept relationships to infer what a user is genuinely interested in, then surfaces useful, adjacent technology content.

## Solution

ReelMind AI is a TypeScript implementation of an AI-style semantic recommendation pipeline. It analyzes seeded reel content and viewer interactions, rolls specific concepts up into broader interests, ranks educational candidates, filters hype-heavy content, and explains why a recommendation was selected.

The dashboard makes that reasoning visible through recommendations, confidence signals, an interest graph, interest evolution, and an interactive live-demo mode.

## Key Features

- Interaction and behavior analysis for skips, watches, replays, likes, and saves
- Semantic content understanding from reel concepts and a concept taxonomy
- Interest inference with broader semantic roll-up
- Hidden-interest discovery
- Visual interest map and cross-domain connections
- Interest evolution across interaction history
- Recommendation ranking that retains semantic similarity and educational value
- Broader-interest prioritization, adjacent-topic diversity, and narrow-topic repetition suppression
- Hype Shield for filtering hype/clickbait candidates
- Confidence scores and evidence-based recommendation explanations
- Explore Beyond Your Feed for adjacent technology topics
- Live Demo / Interaction Mode for in-memory, no-reload recommendation updates

## How the Intelligence Works

```text
User interactions
        ↓
Behavior analysis
        ↓
Content / semantic analysis
        ↓
Interest inference
        ↓
Interest graph / broader concepts
        ↓
Candidate generation
        ↓
Hype filtering
        ↓
Recommendation ranking
        ↓
Explanation
```

The engine uses a semantic taxonomy rather than keyword matching alone. Specific concepts can propagate to parent interests—for example, Java, coding interviews, developer lifestyle, and developer hardware can connect to broader Software Engineering and Technology interests. Candidate ranking combines interest match, semantic similarity, educational value, exploration, and the existing hype penalty.

## Live Demo

The Overview page includes **Live Demo / Interaction Mode** with fictional, anonymized seeded reels. Judges can use **Skip**, **Watch**, **Replay**, **Like**, and **Save** actions on four representative reels. Watch simulates a brief five-second viewing progression.

Each completed action is added only to the current in-memory demo session. The dashboard then runs the existing behavior analysis, interest inference, candidate generation, hype filtering, recommendation ranking, and explanation pipeline again—without reloading the page. The Live AI Signal area shows the latest interaction, inferred interest, confidence, recommended next topic, and match score. **Reset Demo** restores the original seeded interaction state.

## Example Intelligence

Repeated positive interactions with programming- and technology-related reels can converge on the broader **Software Engineering** interest instead of repeatedly serving a narrow Java topic. The recommendation engine can then prioritize connected, useful directions such as:

- System Design / HLD
- Backend Engineering
- DSA
- Cloud and DevOps

The Hype Shield continues to filter the seeded clickbait examples, including job-guarantee, seven-day-engineer, and developer-replacement claims.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React icons

## Project Structure

```text
src/
├── pages/        Dashboard views: overview, recommendations, intelligence,
│                 interest map, evolution, and explore
├── components/   Reusable glass UI, score bars, graph/pipeline visuals,
│                 navigation, and the live demo panel
├── engine/       Semantic recommendation pipeline, taxonomy, behavior analysis,
│                 interest inference, ranking, Hype Shield, explanations, and seed data
└── lib/          Shared labels and UI utilities
```

Important engine modules include:

- `orchestrator.ts` — runs the end-to-end analysis pipeline
- `behaviorAnalyzer.ts` — converts interaction behavior into weighted signals
- `contentAnalyzer.ts` and `taxonomy.ts` — provide semantic concepts and relationships
- `interestInference.ts` and `interestGraph.ts` — infer and visualize broader interests
- `candidateGenerator.ts` and `recommendationEngine.ts` — generate and rank content
- `hypeDetector.ts`, `confidenceService.ts`, and `explanationService.ts` — keep recommendations trustworthy and interpretable
- `seedData.ts` — fictional/anonymized demo reels and interactions

## Getting Started

```bash
npm install
npm run dev
```

## Verification

```bash
npm run typecheck
npm run build
```

The production build is generated into `dist/`.

## Demo / Competition Notes

The current implementation uses fictional, anonymized seeded data. It does not connect to real social-media accounts, real user data, authentication systems, or external AI APIs.

This is an AI-style semantic recommendation engine implemented in TypeScript, not a production-trained machine-learning system.

## Future Improvements

- Real-time user-data integration with appropriate consent and privacy controls
- Learned embeddings or model-based semantic similarity
- Persistent user profiles and feedback history
- Richer feedback loops and recommendation evaluation

## License

No license has been specified yet.
