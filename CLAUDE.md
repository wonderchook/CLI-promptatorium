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

## Core Architecture

### 1. **Three-Tier System**

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

### 2. **Key Components**

#### **A. Agent System (.claude/agents/)**

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

#### **B. Simulation Rules (SIMULATION_RULES.md)**

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

#### **C. Episode Configuration (episodes/config/)**

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

#### **D. Replay Format (episodes/replay/)**

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

#### **E. Type Definitions (src/types.ts)**

TypeScript interfaces for:
- `EpisodeConfig`: Episode structure
- `WorldContext`: Context provided to each agent each tick
- `AgentDecision`: Agent action/reasoning response
- `CritterInstance`: Agent instance tracking

### 3. **Simulation Loop (Pseudocode)**

```
Initialize world from episode config
For tick = 1 to maxTicks:
  
  For each plant:
    energy += 2
    if energy >= 120:
      spawn offspring, energy -= 80
  
  For each herbivore:
    if energy >= 90: reproduce
    else:
      nearestPlant = findNearest(plants, 400)
      if nearestPlant and distance < 15: eat(nearestPlant)
      else if nearestPlant: moveToward(nearestPlant, speed=3)
      else: wander()
  
  For each custom organism:
    context = buildContext(organism, world)
    decision = invokeAgent(organism.agentFile, context)
    executeAction(organism, decision)
  
  removeDeadOrganisms()
  recordTickToReplay()

Calculate scores for all organisms
Write replay to disk
```

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

### 1. **Create a Critter** (Scaffolding)
```
User → @critter-creator agent
  ├─ Asks strategy questions (role, personality, core behavior)
  └─ Generates critter-<name>-<random>.md in .claude/agents/
     └─ File contains organism strategy as Claude prompt
```

### 2. **Create an Episode** (Scaffolding)
```
User → @episode-creator agent
  ├─ Finds available critter-*.md files using Glob
  ├─ Designs ecosystem (plants, herbivores, custom agents)
  ├─ Sets world parameters (size, duration, seed)
  └─ Generates episode config JSON in episodes/config/
     └─ Status: "pending"
```

### 3. **Run Simulation** (Claude Code executes directly)
```
Claude Code reads episodes/config/ep_*.json
  ├─ Initialize world (organisms at random positions)
  ├─ For each tick (1 to duration):
  │   ├─ Update plants (photosynthesis, reproduction)
  │   ├─ Update herbivores (deterministic AI)
  │   ├─ For each custom agent:
  │   │   ├─ Build context about surroundings
  │   │   ├─ Invoke agent via Task tool with context
  │   │   ├─ Parse response (ACTION + REASONING)
  │   │   └─ Execute action in world
  │   ├─ Remove dead organisms
  │   └─ Record tick events to replay NDJSON
  ├─ Calculate final scores
  └─ Write episodes/replay/ep_*.ndjson
     └─ Update status to "complete"

NOTE: Claude Code maintains all state in memory and executes
the simulation directly. No TypeScript/JavaScript runner needed.
```

### 4. **Analyze Results** (Optional)
```
Replay file → biological-game-evaluator agent
  └─ Analyzes fun factor, engagement, ecological dynamics
```

## Existing Example

**Test Episode: ep_test_001**
- Config: 500x500 world, 60-tick episode, seed 42
- Populations: 20 plants, 10 herbivores, 4 custom agents
- Agents: 2x cautious-scavenger-s7x2, 2x aggressive-hunter-h4k9
- Results: Hunters scored higher (89-91), scavengers (78-79), offspring varied

**Key Observation**: The replay shows agents making contextual decisions:
- Hunters pursue herbivores aggressively, claim territory
- Scavengers follow at safe distance, steal leftovers
- Both strategies produce offspring
- Environment drives diverse decision-making

## Important Patterns & Conventions

### 1. **Agent Strategy Philosophy**
Each critter agent embodies a distinct strategy:
- **Aggressive Hunter**: High-risk predation, territory control, frequent reproduction
- **Cautious Scavenger**: Risk avoidance, follows successful hunters, patient opportunism
- (Users create more unique strategies via critter-creator)

### 2. **Decision Format**
All agent decisions follow a standard format:
```
ACTION: [move|eat|reproduce|signal|rest]
REASONING: [1-2 sentence explanation]
```

### 3. **Model Selection**
- Default: `haiku` (fast, cheap, suitable for simple critters)
- Optional: `sonnet` (more complex strategies)

### 4. **Naming Conventions**
- Agents: `critter-<descriptive-name>-<4-char-random>.md`
- Episodes: `ep_<timestamp>_<random>.json`
- Replays: `ep_<episodeId>.ndjson`

### 5. **Determinism**
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

---

**Last Updated**: 2025-10-31
**Status**: Architecture documented, scaffolding complete, implementation pending
