# Taste

- Prefers narrow, direct answers to the exact question asked: when the user poses a specific yes/no or feasibility question, answer that question first rather than expanding into broader recommendations or adjacent refactors. Will explicitly re-narrow the scope when the agent over-expands (e.g. "I'm just asking if the compiler can emit imports like this: `import {v4} from 'uuid';`"). Confidence: 0.7

- After stating a position or plan, asks "what am I missing?" / "what do you think?" — wants the agent to genuinely challenge the reasoning and surface blind spots, rather than validate or simply agree. Confidence: 0.5

- Gives very terse, imperative task directives (e.g. "fix macro shadow", "support sourcemaps"), assuming shared context from the ongoing session — expects the agent to infer the scope and pick the approach itself rather than being told what to change or how. Confidence: 0.6

- Explicitly delegates design/implementation judgement ("otherwise implement what you see adequate") — sets the goal and lets the agent choose the adequate approach, rather than specifying the design. Confidence: 0.5

- After making edits himself, hands back with a bare "review now" and expects a review-only pass over the current working tree: read the actual state, run the checks and report output verbatim, and end with a clear ready-to-commit verdict that separates real blockers from non-blocking notes — without modifying source or re-doing the work. Confidence: 0.55
