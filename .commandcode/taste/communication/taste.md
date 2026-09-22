# Taste

- Prefers narrow, direct answers to the exact question asked: when the user poses a specific yes/no or feasibility question, answer that question first rather than expanding into broader recommendations or adjacent refactors. Will explicitly re-narrow the scope when the agent over-expands (e.g. "I'm just asking if the compiler can emit imports like this: `import {v4} from 'uuid';`"). Confidence: 0.7

- After stating a position or plan, asks "what am I missing?" / "what do you think?" — wants the agent to genuinely challenge the reasoning and surface blind spots, rather than validate or simply agree. Confidence: 0.5

- Gives very terse, imperative task directives (e.g. "fix macro shadow", "support sourcemaps"), assuming shared context from the ongoing session — expects the agent to infer the scope and pick the approach itself rather than being told what to change or how. Confidence: 0.6
