# CLI Promptatorium

An AI-driven biological ecosystem simulator that runs entirely in Claude Code, where custom AI agents control organisms competing for survival in a dynamic environment.

⚠️ **TOKEN WARNING**: Running simulations can consume significant tokens (15,000-100,000+ tokens depending on duration and population size). A 30-tick simulation with 7 custom organisms typically uses 60,000-80,000 tokens.

## Overview

CLI Promptatorium is a unique simulation framework where:
- **Claude IS the simulation engine** - no external runtime needed
- **AI agents control organisms** with distinct strategies and personalities
- **Episodes run as conversations** with Claude Code executing the simulation
- **Real agent invocations** - each organism makes authentic decisions every tick
- **Organisms compete** for food, energy, and reproductive success
- **Strategies emerge** from multi-agent interactions in procedurally-generated ecosystems

## Key Features

- 🧠 **AI-Controlled Organisms**: Each custom organism is controlled by a Claude model making intelligent decisions every tick
- 🎯 **Soul-Based Behavior**: Agents demonstrate emergent behaviors like parental defense, tactical adaptation, and resource competition
- 📊 **Scoring System**: 4-component scoring (survival, energy, reproduction, cooperation)
- 🌱 **Dynamic Ecosystem**: Plants photosynthesize, herbivores graze, omnivores adapt, carnivores hunt
- 🎮 **Strategy Creation**: Design your own organism strategies using natural language prompts
- 📼 **Replay System**: Full simulation history saved in NDJSON format
- ⚡ **Parallel Execution**: Multiple agents invoked simultaneously for performance

## Available Organism Types

**Included Strategies:**
- **Omnivore** (`omnivore-soul-balanced-om01`) - Flexible diet, +20% energy variety bonus, tactical switching
- **Aggressive Hunter** (`critter-aggressive-hunter-h4k9`) - High-risk predator, territorial, frequent reproduction
- **Cautious Scavenger** (`critter-cautious-scavenger-s7x2`) - Follows predators, steals leftovers, avoids conflict
- **Orange Cat** (`critter-orange-cat-lazy-m3w7`) - Lazy carnivore, sunbathes, hunts only when hungry
- **Forest Phantom** (`critter-forest-phantom-k9m2`) - Stealthy ambush predator using camouflage

## Quick Start

### Method 1: Using the `/episode` Slash Command (Recommended)

The `/episode` command creates and runs a simulation in one step:

```bash
/episode my-test-battle 30
```

**What this does:**
1. Prompts you to configure the episode (organisms, world size, etc.)
2. Creates episode config file: `episodes/config/ep_my-test-battle.json`
3. Runs the simulation for 30 ticks
4. Generates replay file: `episodes/replay/ep_my-test-battle.ndjson` (gitignored)
5. Calculates final scores and validates objectives

**Command format:**
```
/episode [episode-name] [tick-count]
```

**Examples:**
```bash
/episode hunter-vs-scavenger 60    # 60-tick battle
/episode omnivore-stress 100       # 100-tick endurance test
/episode quick-test 15             # Quick 15-tick test
```

### Method 2: Manual Episode Creation

You can also create and run episodes manually:

**Step 1: Ask Claude to create an episode config**
```
"Create an episode with 4 omnivores, 2 hunters, 1 scavenger, 8 herbivores, and 20 plants. Call it ep_test_001. Duration 30 ticks."
```

**Step 2: Run the simulation**
```
"Run the simulation for episode ep_test_001"
```

Claude Code will:
- Initialize the world with organisms at random positions
- Execute each tick sequentially (1-30)
- Invoke ALL custom agents in parallel each tick via the Task tool
- Track all events (movements, eating, reproduction, deaths)
- Calculate final scores
- Generate replay file in `episodes/replay/`

### Creating Custom Organisms

You can create custom critter strategies:

```
"Help me create a new omnivore critter that prefers hunting but falls back to plants when threatened"
```

Claude will guide you through the personality quiz and generate a new agent file in `.claude/agents/`.

## Project Structure

```
cli-promptatorium/
├── README.md                      # This file
├── LICENSE                        # MIT License
├── SIMULATION_RULES.md            # Complete game mechanics
├── CLAUDE.md                      # Architecture & developer guide
├── .claude/
│   ├── commands/
│   │   └── episode.md             # /episode slash command definition
│   └── agents/                    # Critter agent definitions
│       ├── critter-creator.md     # Interactive critter creation wizard
│       ├── episode-creator.md     # Episode configuration helper
│       ├── omnivore-soul-balanced-om01.md
│       ├── critter-aggressive-hunter-h4k9.md
│       ├── critter-cautious-scavenger-s7x2.md
│       └── [user-created critters...]
├── episodes/
│   ├── config/                    # Episode configuration files (JSON)
│   │   └── ep_*.json
│   └── replay/                    # Simulation replay data (NDJSON, gitignored)
│       └── ep_*.ndjson
└── src/
    └── types.ts                   # TypeScript type definitions
```

## How It Works

### The Simulation Loop

For each tick (1 to duration):

1. **Process Plants** - Deterministic photosynthesis (+2 energy), reproduce if energy >= 120
2. **Process Herbivores** - Deterministic AI movement and eating
3. **Process Custom Organisms** (THE SOUL LAYER):
   - Build context for each organism (nearby food, threats, energy state)
   - **Invoke ALL custom agents in parallel** via Task tool (haiku model)
   - Parse responses: `ACTION: [move|eat|reproduce|signal|rest]` + `REASONING: [explanation]`
   - Execute actions in world state
4. **Handle Reproduction** - Offspring inherit parent's agent file, get new ID
5. **Remove Dead** - Organisms with energy <= 0 die
6. **Record Events** - Write tick data to replay NDJSON
7. **Update Display** - Show narrative + data summary

**Key Insight**: Claude Code maintains ALL world state in memory during the conversation. No database needed!

### Agent Invocation Example

When Omnivore 30 (at tick 23) receives context:
```json
{
  "self": {"id": 30, "energy": 103.46, "position": {"x": 643, "y": 264}},
  "nearby": {
    "plants": [{"id": 12, "distance": 30, "direction": "SW"}],
    "herbivores": [],
    "customAgents": [{"id": 34, "distance": 3, "direction": "SE", "energy": 53.4}]
  },
  "environment": {"light": 0.8, "biome": "plains"}
}
```

The agent responds:
```
ACTION: MOVE(NW, 3.0)
REASONING: Hunters at critical 3px distance - maximum threat. Fleeing NW at top
speed creates distance while moving toward my offspring (46 energy), who faces
the same danger. Survival first, then assess reproduction once we reach safety.
```

This is **real agency** - the agent reasoned about kinship, threat assessment, and made a protective choice!

## Token Consumption

**Typical Usage:**

| Scenario | Organisms | Ticks | Estimated Tokens |
|----------|-----------|-------|------------------|
| Quick test | 3-5 | 15 | 15,000-25,000 |
| Standard episode | 7-10 | 30 | 60,000-80,000 |
| Stress test | 10-15 | 60 | 120,000-180,000 |
| Endurance run | 15+ | 100+ | 200,000+ |

**Token Budget Tips:**
- Use `/compact` command at planned intervals (every 25 ticks) to compress conversation history
- Run shorter episodes (15-30 ticks) for testing
- Limit custom organism count (5-8 is a sweet spot)
- Use `haiku` model for agents (already default in all included critters)

## Scoring Components

Organisms are scored on a 0-100 scale:

- **Survival (40%)**: `(ticksAlive / totalTicks) × 40`
- **Energy (25%)**: `(finalEnergy / 150) × 25`
- **Reproduction (25%)**: `min(offspringCount × 5, 25)`
- **Cooperation (10%)**: `min(signalsSent × 2, 10)`

**Example:** Omnivore 30 from ep_omnivore_test_30
- Survival: 40.0 (lived all 30 ticks)
- Energy: 18.83 (113.0 final energy)
- Reproduction: 10 (2 offspring)
- Cooperation: 0 (no signals)
- **Total: 68.83** ⭐

## Example: Running a Simulation

```bash
# Using the slash command (easiest)
/episode battle-royale 30

# Claude will prompt you to configure:
# - How many omnivores? (e.g., 4)
# - How many hunters? (e.g., 2)
# - How many scavengers? (e.g., 1)
# - How many herbivores? (e.g., 8)
# - How many plants? (e.g., 20)
# - World size? (default: 1000x1000)

# Then it runs automatically!
# Output includes:
# - Tick-by-tick narrative
# - Agent decisions with reasoning
# - Deaths, births, eating events
# - Final scores and rankings
# - Test objective validation (if configured)
```

**Manual approach:**
```bash
# 1. Create the episode
"Create an episode called ep_my_test with 4 omnivores, 2 hunters, 8 herbivores,
20 plants. Duration 30 ticks."

# 2. Run it
"Run the simulation for episode ep_my_test"

# 3. Analyze results
"Show me the final scores and who won"
```

## Advanced Features

### Dietary Variety Bonus (Omnivores)

Omnivores gain +20% energy when eating both plants AND meat within 10 ticks:
- Plant: 30 → 36 energy (with bonus)
- Meat: 50 → 60 energy (with bonus)

This incentivizes tactical diet switching!

### Emergent Behaviors

Organisms have demonstrated:
- **Parental defense** (charging at predators to protect offspring)
- **Resource competition** (multiple organisms racing to same food)
- **Tactical retreats** (fleeing when energy is too low to fight)
- **Opportunistic hunting** (targeting weak prey)
- **Pack dynamics** (offspring clustering near parents)

### Test Objectives

Episode configs can include test objectives:
```json
{
  "testObjectives": {
    "primary": [
      "Omnivores demonstrate BOTH hunting and grazing behaviors",
      "Dietary variety bonus triggers at least once per omnivore"
    ]
  },
  "successCriteria": {
    "minOmnivoresEatPlants": 3,
    "minOmnivoresHuntPrey": 2
  }
}
```

Claude validates these automatically at the end!

## Development

This project is designed to run entirely within Claude Code. The simulation logic is interpreted from SIMULATION_RULES.md rather than implemented in traditional code.

**Key Files:**
- `SIMULATION_RULES.md` - Complete mechanics specification (energy costs, action ranges, etc.)
- `CLAUDE.md` - Architecture documentation and integrity rules
- `.claude/commands/episode.md` - Slash command definition for /episode

**Creating New Agent Types:**

1. Copy an existing agent file (e.g., `omnivore-soul-balanced-om01.md`)
2. Modify the strategy prompt to define new behavior
3. Update the frontmatter (name, description)
4. Test with a small episode (15 ticks, 2-3 organisms)

## License

MIT License - See [LICENSE](./LICENSE) for details.

## Credits

Created with Claude Code - Anthropic's official CLI for Claude

## Contributing

This is an open-source project! Contributions welcome:
- New organism strategies
- Episode scenarios
- Documentation improvements
- Replay visualization tools
- Bug fixes and enhancements

See [CLAUDE.md](./CLAUDE.md) for architecture details.
