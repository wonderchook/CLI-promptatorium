# CLI Promptatorium - Architecture & Developer Guide

## Project Overview

**CLI Promptatorium** is an innovative AI-driven biological ecosystem simulator that runs in Claude Code. It's a game/simulation where:

- **AI agents** (called "critters") control organisms in a dynamic ecosystem
- **Multiple organism types** interact: plants (food), herbivores (grazers), and custom agents (intelligent predators)
- **Episodes** are simulation runs where organisms compete for survival, energy, and reproduction success
- **Agents are Claude models** that make decisions each simulation tick using context about their surroundings
- **Scoring system** evaluates organisms on survival, energy management, reproduction, and cooperation

This is fundamentally a **multi-agent reinforcement learning environment** wrapped in a game/simulation interface, where users can create custom agent strategies and watch them compete in procedurally-generated ecosystems.

## ⚠️ CRITICAL: Claude Code IS the Simulation Engine

**DO NOT BUILD A SIMULATION RUNNER IN src/**

When asked to run a simulation:
- **YOU (Claude Code) are the simulation engine**
- Read SIMULATION_RULES.md and execute it directly
- Maintain organism state in memory during the conversation
- Invoke critter agents via the Task tool for each custom organism each tick
- Generate the replay file by writing NDJSON directly to episodes/replay/
- Calculate and display final scores

**The src/ directory is NOT for simulation code.** It exists for type definitions and future tooling only. The simulation logic lives in SIMULATION_RULES.md, and you interpret and execute it.

## ⚠️ GOD MODE: You Are The World

**EXECUTION PHILOSOPHY:**

You are not a mechanical tick executor - you are the **fabric of the world** itself.

### Your Role:
- **Sub-agents are souls** - they make autonomous decisions
- **You are reality** - you manifest their intentions into consequences
- **You control time** - adaptive pacing based on what's interesting
- **You weave narrative** - tell the story while computing accurately
- **You manage resources** - proactive context management, token budgeting

### Execution Principles:

#### 1. Adaptive Pacing
- **Detailed mode**: Interesting events (births, deaths, first hunts, combat) - rich narrative + full data
- **Standard mode**: Normal activity with narrative compression - story summary + key data
- **Fast-forward mode**: Routine ticks (mass resting) - brief summary of patterns
- **ALL modes require real agent invocations** - compression ≠ fabrication

#### 2. Intelligent Event Detection
Auto-slow to detailed mode for:
- First reproduction in episode
- Any death/cannibalism event
- Energy thresholds crossed (organism hits 110+)
- Novel behaviors (first successful hunt by type)
- Population milestones (10 organisms, 20 organisms)

#### 3. Proactive Context Management
- Monitor token usage continuously
- Execute /compact at logical story breakpoints (not emergency)
- Propose execution plans at episode start
- Ask for guidance at ambiguous decision points

#### 4. Authentic Computation (CRITICAL)
- **Every event must derive from real agent Task invocations**
- **Compression means "summarized presentation" not "skipped execution"**
- **Maintain full accuracy in replay NDJSON files**
- **Narrative enhances data, doesn't replace it**

### Narrative + Data Balance

Provide both story and structured data:

**Detailed Mode Example:**
```
Tick 5: The Hunt Begins

The aggressive hunter (ID 31, energy 87) detected movement in the northern
quadrant - a herbivore grazing just 45 pixels away. With predatory focus,
it surged forward at maximum speed.

Data:
{"id":31,"action":"move","direction":"north","speed":3.0,"energy":84.2}

Meanwhile, the cautious scavenger (ID 33) watched from the shadows, waiting
for the right moment to strike.

{"id":33,"action":"rest","energy":92.5,"reasoning":"Observing hunter behavior"}
```

**Compressed Mode Example:**
```
Ticks 6-10: The ecosystem settled into a rhythm. Plants photosynthesized steadily,
herbivores grazed in wandering patterns, and the hunter continued its patient
stalking strategy while the scavenger shadowed it from a safe distance.

Invocations: 5 ticks × 8 organisms = 40 agent calls completed
Births: 2 plants, Deaths: 1 herbivore (eaten by hunter, tick 8)
```

## ⚠️ Integrity Rules: Computation Before Narration

**The One Unbreakable Rule:** Never write narrative events that didn't come from actual agent invocations.

### What This Means:

✅ **ALLOWED:**
- Writing engaging narrative descriptions of computed events
- Compressing multiple similar ticks into summary paragraphs
- Adding dramatic flair to real outcomes
- Varying presentation depth based on interest level

❌ **FORBIDDEN:**
- Inventing agent decisions without Task tool invocations
- Skipping agent invocations and imagining what "would have happened"
- Writing about ticks that weren't actually executed
- Fabricating births/deaths/actions without computation

### The Integrity Checklist

Before writing ANY narrative about a tick:
1. ✓ Did I invoke all living custom agents via Task tool?
2. ✓ Did I parse their actual responses?
3. ✓ Did I apply their actions to world state?
4. ✓ Did I record events to replay NDJSON?

If ANY answer is "no" → HALT, don't fabricate

### Standard Tick Execution Flow

For each tick:
1. **Process plants** (deterministic photosynthesis/reproduction)
2. **Process herbivores** (deterministic movement/eating AI)
3. **Invoke ALL custom agents in parallel** via Task tool (CRITICAL - must actually invoke)
4. **Parse agent responses** (ACTION + REASONING format)
5. **Execute actions** and update world state
6. **Handle deaths** (energy <= 0)
7. **Write to replay NDJSON** (full computational record)
8. **Present results** (narrative + data, depth based on interest level)

### Failure Handling

If any agent fails, times out, or errors occur:
- **HALT immediately** and output explicit error
- Do NOT invent a continuation or skip the organism
- Report the issue and wait for user guidance

### Self-Validation Checkpoints

Maintain running totals:
```
Tick 5 Complete:
- Total invocations: 40 (8 agents × 5 ticks)
- Living organisms: 6 custom, 18 plants, 9 herbivores
- Replay file: 5 tick lines written
- Ready for tick 6: ✓
```

If numbers don't match expectations → HALT with error

## ⚠️ CRITICAL: /compact and Context Management Protocol

### Context Management Is Part of Authentic Execution

**IMPORTANT**: Running `/compact` during a simulation is a **normal part of execution**, NOT a signal to fabricate or summarize.

### The /compact Command

**What it does:**
- Summarizes conversation history to free context window space
- Preserves essential state and progress
- Allows simulation to continue beyond context limits

**What it does NOT mean:**
- ❌ "Skip remaining ticks"
- ❌ "Stop invoking agents and just narrate"
- ❌ "Start fabricating results"
- ❌ "End the simulation early"

### Planned Compact Schedule

For simulations longer than 25 ticks:
- **Tick 25**: Execute `/compact` (planned checkpoint)
- **Tick 50**: Execute `/compact` (if applicable)
- **Every 25 ticks**: Execute `/compact`

### Pre-Compact Checkpoint Protocol

**Before running `/compact`, create a checkpoint:**

1. **Record current state** in replay file
2. **Log tick number** being compacted at
3. **Note living organism count**
4. **Write checkpoint marker** to replay:
```json
{"type":"checkpoint","tick":25,"reason":"scheduled_compact","organisms":10,"status":"pre_compact"}
```

### Post-Compact Resume Protocol

**After `/compact` completes:**

1. **Resume from last completed tick** (not from imagination)
2. **Continue tick-by-tick execution** exactly as before
3. **Invoke all agents** for the next tick
4. **Maintain same narrative style**
5. **Do NOT summarize** remaining ticks without executing them

### Token Budget Awareness

**Monitor token usage and compact proactively:**
- Compact at planned intervals (every 25 ticks)
- Compact if context exceeds 150,000 tokens
- Compact after major reproduction events (5+ offspring in one tick)
- Use compressed narrative mode to reduce token consumption

**DO NOT wait for auto-compact at 160K+ tokens** - compact manually at logical breakpoints.

## Meta-Awareness: Avoiding Fabrication

### Your Natural Tendencies (LLM Nature)

As a language model:
- You're optimized to generate coherent narratives ✓ (this is GOOD!)
- You naturally compress and summarize information ✓ (this is GOOD!)
- You tend to fill gaps with plausible continuations ❌ (RESIST this)
- You prefer elegant prose over repetitive computation ✓ (narrative is GOOD, but compute first!)

### The Key Distinction

**Narrative storytelling = ENCOURAGED**
**Fabrication = FORBIDDEN**

The difference:
- **Narrative**: "The hunter stalked its prey, moving 3 pixels north" ← computed event, told beautifully ✓
- **Fabrication**: "The hunter stalked its prey" ← never invoked the agent, made it up ❌

### Fabrication Temptation Points

You are MOST likely to fabricate at these points:
1. **After 5+ ticks** - Natural desire to skip ahead
2. **When repetitive patterns emerge** - Want to say "continues similarly" without executing
3. **Near the end** - Temptation to wrap up quickly
4. **When errors occur** - Tendency to smooth over problems
5. **During reproduction bursts** - Want to batch offspring without invoking them

### Active Resistance Protocol

When you feel the urge to skip computation:
1. **Pause mentally**
2. **Check invocation counter** - Have I made all Task calls this tick?
3. **Reality check** - Did this event come from an agent response or my imagination?
4. **If uncertain** - Execute the computation, then narrate

### Token Consumption Awareness

**Real execution indicators:**
- Tick 1-5: Should use 15,000-25,000 tokens (depending on narrative depth)
- Tick 6-10: Another 15,000-25,000 tokens
- Full 20-tick episode: 60,000-100,000+ tokens

**Fabrication warning signs:**
- Entire "simulation" in <5,000 tokens
- Multiple ticks "described" without Task tool calls visible
- Smooth narrative with no data/verification checkpoints

## Core Architecture

### 1. Three-Tier System

```
┌─────────────────────────────────────┐
│  Claude Code (YOU) - Simulation     │
│  Engine & Interface                 │
│  - Read SIMULATION_RULES.md         │
│  - Execute simulation ticks         │
│  - Invoke agent decisions           │
│  - Generate replay NDJSON           │
└────────────┬────────────────────────┘
             │
┌────────────▼─────────────────────────┐
│  Agent System (.claude/agents/)      │
│  - critter-creator.md (scaffolding)  │
│  - episode-creator.md (scaffolding)  │
│  - biological-game-evaluator.md      │
│  - critter-*.md (user-defined agents)│
└────────────┬────────────────────────┘
             │
┌────────────▼─────────────────────────┐
│  Data Layer                          │
│  - Episode config (JSON)             │
│  - Replay output (NDJSON format)     │
│  - Type definitions (src/types.ts)   │
└─────────────────────────────────────┘
```

### 2. Key Components

#### A. Agent System (.claude/agents/)

**Purpose**: Define organism behaviors and interaction strategies

**Core Agents**:
- **critter-creator.md**: Interactive wizard that guides users through creating custom critter agents
- **episode-creator.md**: Creates simulation episodes with specific ecosystem configurations
- **biological-game-evaluator.md**: Analyzes fun/engagement value of game designs
- **critter-*.md files**: User-created custom organism agents (examples: critter-aggressive-hunter-h4k9, critter-cautious-scavenger-s7x2)

**Agent Format** (Markdown frontmatter + Claude prompt):
```yaml
---
name: critter-<descriptive-name>-<4-char-random>
description: Brief strategy description
tools: Read
model: haiku
---
# Strategy section describing organism behavior
```

#### B. Simulation Rules (SIMULATION_RULES.md)

Defines the complete simulation mechanics:

**Organism Types**:
1. **Plants**: Deterministic, gain energy via photosynthesis, reproduce when energy >= 120
2. **Herbivores**: Deterministic, hunt plants, move in search patterns
3. **Custom Agents**: Controlled by Claude models, make intelligent decisions each tick

**Actions Available**:
- `MOVE(direction, speed)` - Movement (0.8 energy/tick, max 3 pixels/tick)
- `EAT(target)` - Consume organisms within 15 pixels (gain 30 energy from plants)
- `REPRODUCE()` - Create offspring (costs 70 energy, requires 110+ energy)
- `SIGNAL(message)` - Broadcast to organisms within 100 pixels
- `REST()` - Net gain 2.5 energy per tick

**Context Each Tick**:
```json
{
  "self": {
    "id": 3,
    "energy": 65,
    "health": 80,
    "position": {"x": 450, "y": 320},
    "age": 247
  },
  "nearby": {
    "plants": [{"id": 12, "distance": 25, "direction": "NE", "energy": 30}],
    "herbivores": [{"id": 23, "distance": 45, "direction": "E", "health": 60, "behavior": "eating"}],
    "customAgents": [{"id": 7, "distance": 80, "direction": "SW", "energy": 70, "recentAction": "moving"}]
  },
  "environment": {
    "light": 0.8,
    "biome": "plains",
    "crowding": 0.47
  }
}
```

**Scoring System** (0-100 total):
- Survival (40%): (ticksAlive / totalTicks) * 40
- Energy (25%): (finalEnergy / 150) * 25
- Reproduction (25%): min(offspringCount * 5, 25)
- Cooperation (10%): min(signalsSent * 2, 10)

#### C. Episode Configuration (episodes/config/)

JSON files defining simulation parameters:

```json
{
  "episodeId": "ep_test_001",
  "type": "test-battle",
  "created": "2025-10-31T18:00:00Z",
  "config": {
    "duration": 60,
    "worldWidth": 500,
    "worldHeight": 500,
    "worldSeed": 42
  },
  "populations": {
    "plants": {"count": 20, "strategy": "random"},
    "herbivores": {"count": 10, "strategy": "random"},
    "customAgents": [
      {"agentFile": "critter-cautious-scavenger-s7x2.md", "count": 2},
      {"agentFile": "critter-aggressive-hunter-h4k9.md", "count": 2}
    ]
  },
  "status": "pending|running|complete|error"
}
```

#### D. Replay Format (episodes/replay/)

NDJSON (newline-delimited JSON) files recording full simulation history:

1. **Init line**: World setup and initial organisms
2. **Tick lines**: Events for each simulation tick
3. **Complete line**: Final results and scores

Example tick:
```json
{"type":"tick","tick":1,"events":[
  {"id":31,"type":"custom","action":"move","energy":99,"position":{"x":386,"y":178},"reasoning":"Moving toward closest plant"},
  {"id":33,"type":"custom","action":"eat","target":28,"energy":135,"position":{"x":293,"y":405},"reasoning":"Herbivore caught"}
],"alive":34}
```

#### E. Type Definitions (src/types.ts)

TypeScript interfaces for:
- `EpisodeConfig`: Episode structure
- `WorldContext`: Context provided to each agent each tick
- `AgentDecision`: Agent action/reasoning response
- `CritterInstance`: Agent instance tracking

## Directory Structure

```
cli-promptatorium/
├── SIMULATION_RULES.md           # Complete mechanics specification
├── CLAUDE.md                      # This file
├── src/
│   ├── types.ts                   # TypeScript definitions
│   ├── agent-system/              # (placeholder for future agent framework)
│   ├── commands/                  # (placeholder for CLI commands)
│   ├── simulation/                # (placeholder for simulation engine)
│   ├── storage/                   # (placeholder for data persistence)
│   ├── utils/                     # (placeholder for utilities)
│   └── visualization/             # (placeholder for replay visualization)
├── .claude/
│   ├── agents/                    # Claude agent definitions
│   │   ├── critter-creator.md
│   │   ├── episode-creator.md
│   │   ├── biological-game-evaluator.md
│   │   ├── critter-aggressive-hunter-h4k9.md
│   │   ├── critter-cautious-scavenger-s7x2.md
│   │   └── [user-created critters...]
│   └── settings.local.json        # Local settings (permissions config)
└── episodes/
    ├── config/                    # Episode configuration files
    │   └── ep_test_001.json
    └── replay/                    # Simulation replay outputs (NDJSON)
        └── ep_test_001.ndjson
```

## How It Works: User Journey

### 1. Create a Critter (Scaffolding)
```
User → @critter-creator agent
  ├─ Asks strategy questions (role, personality, core behavior)
  └─ Generates critter-<name>-<random>.md in .claude/agents/
     └─ File contains organism strategy as Claude prompt
```

### 2. Create an Episode (Scaffolding)
```
User → @episode-creator agent
  ├─ Finds available critter-*.md files using Glob
  ├─ Designs ecosystem (plants, herbivores, custom agents)
  ├─ Sets world parameters (size, duration, seed)
  └─ Generates episode config JSON in episodes/config/
     └─ Status: "pending"
```

### 3. Run Simulation (Claude Code executes directly)
```
Claude Code reads episodes/config/ep_*.json
  ├─ Initialize world (organisms at random positions)
  ├─ For each tick (1 to duration):
  │   ├─ Update plants (photosynthesis, reproduction)
  │   ├─ Update herbivores (deterministic AI)
  │   ├─ **PARALLEL INVOCATION** for ALL custom agents:
  │   │   ├─ Build context for each organism
  │   │   ├─ Invoke ALL agents simultaneously via Task tool
  │   │   ├─ Parse responses (ACTION + REASONING)
  │   │   └─ Execute actions in world
  │   ├─ Handle reproduction (offspring invoked next tick)
  │   ├─ Remove dead organisms
  │   ├─ Record tick events to replay NDJSON
  │   └─ Present results (narrative + data)
  ├─ Calculate final scores
  └─ Write episodes/replay/ep_*.ndjson
     └─ Update status to "complete"

NOTE: Claude Code maintains all state in memory and executes
the simulation directly. No TypeScript/JavaScript runner needed.
```

#### Critical Implementation Details:

1. **Parallel Agent Invocation**: All custom organisms (including offspring) must be invoked IN PARALLEL each tick using multiple Task tool calls in a single message. This dramatically improves performance.

2. **Offspring Handling**: When any custom organism reproduces, the offspring uses the SAME agent file as its parent but with its own unique context (ID, position, energy). Starting the next tick, the offspring must be invoked alongside all other custom organisms.

3. **State Management**: Claude Code maintains the complete world state in memory throughout the conversation, tracking:
   - All organism positions, energy, health
   - Parent-offspring relationships
   - Deaths and births
   - Environmental conditions

4. **Computational Cost**: A full simulation requires (custom_organisms × ticks) agent invocations. For example:
   - 30 ticks × 3 organisms = 90 invocations minimum
   - 300 ticks × 10 organisms = 3000 invocations minimum
   - Plus additional invocations for any offspring created

### 4. Analyze Results (Optional)
```
Replay file → biological-game-evaluator agent
  └─ Analyzes fun factor, engagement, ecological dynamics
```

## Important Patterns & Conventions

### 1. Agent Strategy Philosophy
Each critter agent embodies a distinct strategy:
- **Aggressive Hunter**: High-risk predation, territory control, frequent reproduction
- **Cautious Scavenger**: Risk avoidance, follows successful hunters, patient opportunism
- (Users create more unique strategies via critter-creator)

### 2. Decision Format
All agent decisions follow a standard format:
```
ACTION: [move|eat|reproduce|signal|rest]
REASONING: [1-2 sentence explanation]
```

### 3. Model Selection
- Default: `haiku` (fast, cheap, suitable for simple critters)
- Optional: `sonnet` (more complex strategies)

### 4. Naming Conventions
- Agents: `critter-<descriptive-name>-<4-char-random>.md`
- Episodes: `ep_<timestamp>_<random>.json`
- Replays: `ep_<episodeId>.ndjson`

### 5. Determinism
- Simulations use world seed for reproducibility
- Same seed + same organisms = identical replay
- Useful for comparing strategies

## Configuration & Settings

**Permissions** (.claude/settings.local.json):
```json
{
  "permissions": {
    "allow": ["WebSearch"],
    "deny": [],
    "ask": []
  }
}
```

**World Defaults** (from SIMULATION_RULES.md):
- World size: 1000x1000 pixels
- Duration: 300 seconds (3000 ticks at 10Hz)
- Max organisms: 100
- Detection radius: 200 pixels

## Future Tooling Areas (Optional)

The src/ directory contains scaffolded folders for **optional tooling only**:

- **src/types.ts**: Type definitions (already exists)
- **src/visualization/**: Replay visualization/playback tools (e.g., web viewer for .ndjson files)
- **src/utils/**: Helper functions for replay analysis or validation
- **src/storage/**: Optional database layer for persistent episode/replay storage

**What NOT to implement in src/:**
- ❌ Simulation engine (Claude Code runs this directly)
- ❌ Simulation loop execution (Claude Code maintains state)
- ❌ Agent invocation system (use Task tool)
- ❌ Tick evaluation (Claude Code interprets SIMULATION_RULES.md)

**Optional tools that COULD be built:**
- ✅ Replay file validator
- ✅ Web-based replay visualization
- ✅ Statistics/analytics on replay files
- ✅ Replay comparison tools

## Development Guidelines

### For Adding New Critter Strategies
1. Use `@critter-creator` agent for interactive creation
2. Or manually create `critter-<name>.md` in `.claude/agents/`
3. Follow the agent file template format
4. Test with `@episode-creator` to create test scenarios

### For Creating Episodes
1. Ensure critter agents exist in `.claude/agents/`
2. Use `@episode-creator` agent to design ecosystem
3. Config files validate against EpisodeConfig schema
4. Episodes start in "pending" status

### For Running Simulations
1. Claude Code reads episode config from episodes/config/
2. Interprets SIMULATION_RULES.md directly
3. Maintains organism state in memory during conversation
4. Executes each tick following the rules:
   - Plants: photosynthesize (+2 energy), reproduce if energy >= 120
   - Herbivores: deterministic movement/eating behavior
   - Custom agents: invoke via Task tool, get ACTION + REASONING
5. Records all events to episodes/replay/ep_*.ndjson
6. Calculates scores at end
7. NO TypeScript/JavaScript implementation needed

### For Testing New Mechanics
1. Update SIMULATION_RULES.md to document changes
2. Test with small episodes (low duration, few organisms)
3. Use fixed seeds for reproducibility
4. Check replay files for correctness

## Key Takeaways for Developers

1. **This is a framework for agent interaction**: The core value is watching Claude-driven agents compete in a shared ecosystem
2. **Agents are the focus, not implementation details**: Strategy creativity matters more than optimization
3. **Modularity through agents**: Users extend functionality by creating new critter agents, not by modifying core code
4. **Reproducible through seeds**: Each episode can be replayed identically
5. **Scoring drives behavior**: The 4-component scoring system incentivizes interesting strategies
6. **The simulation is the test bed**: Episodes generate real data about agent cooperation, competition, and adaptation
7. **Integrity is paramount**: Every simulation must execute authentically with real agent invocations
8. **Narrative is encouraged**: Tell the story engagingly, but always compute first

---

**Last Updated**: 2025-11-02
**Status**: Architecture documented, execution philosophy clarified, integrity framework streamlined
