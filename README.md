# CLI Promptatorium

An AI-driven biological ecosystem simulator that runs entirely in Claude Code, where custom AI agents control organisms competing for survival in a dynamic environment.

## Overview

CLI Promptatorium is a unique simulation framework where:
- **Claude IS the simulation engine** - no external runtime needed
- **AI agents control organisms** with distinct strategies and personalities
- **Episodes run as conversations** with Claude Code executing the simulation
- **Organisms compete** for food, energy, and reproductive success
- **Strategies emerge** from multi-agent interactions in procedurally-generated ecosystems

## Key Features

- 🧠 **AI-Controlled Critters**: Each custom organism is controlled by a Claude model making intelligent decisions
- 🎨 **Color-Coded Visualization**: Organisms display in unique colors (orange cats, red hunters, yellow scavengers)
- 📊 **Scoring System**: 4-component scoring (survival, energy, reproduction, cooperation)
- 🌱 **Dynamic Ecosystem**: Plants photosynthesize, herbivores graze, carnivores hunt
- 🎮 **Strategy Creation**: Design your own critter personalities using natural language prompts
- 📼 **Replay System**: Full simulation history saved in NDJSON format

## Quick Start

### 1. Create a Custom Critter

Ask Claude Code to help you create a critter:
```
"Let's create a new critter with [describe strategy]"
```

Example strategies included:
- **Orange Cat** (lazy carnivore, sunbathes, hunts only when hungry)
- **Aggressive Hunter** (high-risk predator, territorial, frequent reproduction)
- **Cautious Scavenger** (follows predators, steals leftovers, avoids conflict)

### 2. Create an Episode

Configure a simulation scenario:
```
"Create an episode with 2 orange cats, 1 hunter, 1 scavenger, 15 plants, and 8 herbivores"
```

### 3. Run the Simulation

Execute the episode:
```
"Run the simulation for episode ep_orange_cat_test"
```

Claude Code will:
- Initialize the world with organisms
- Execute each tick (10 per second)
- Invoke critter agents for decisions
- Track all events and scoring
- Generate a replay file

## Project Structure

```
cli-promptatorium/
├── README.md                      # This file
├── SIMULATION_RULES.md            # Complete game mechanics
├── CLAUDE.md                      # Architecture documentation
├── .claude/
│   └── agents/                    # Critter agent definitions
│       ├── critter-creator.md    # Interactive critter creation wizard
│       ├── episode-creator.md    # Episode configuration helper
│       └── critter-*.md          # Custom organism strategies
├── episodes/
│   ├── config/                   # Episode configuration files
│   │   └── ep_*.json
│   └── replay/                   # Simulation replay data
│       └── ep_*.ndjson
└── src/
    └── types.ts                  # TypeScript type definitions
```

## How It Works

1. **Agent System**: Critters are defined as markdown files with YAML frontmatter specifying their strategy
2. **Simulation Engine**: Claude Code reads SIMULATION_RULES.md and executes the mechanics directly
3. **Decision Making**: Each tick, Claude invokes critter agents via the Task tool to get their actions
4. **State Management**: World state is maintained in Claude's memory during the conversation
5. **Replay Output**: Complete history saved as NDJSON for analysis or visualization

## Example Critter Strategy

```yaml
---
name: critter-orange-cat-lazy-m3w7
description: Lazy carnivore that sunbathes and hunts only when hungry
tools: Read
model: haiku
color: orange
---

# Your strategy prompt defines the critter's behavior...
```

## Scoring Components

Organisms are scored on:
- **Survival (40%)**: How long they stay alive
- **Energy (25%)**: Final energy level
- **Reproduction (25%)**: Number of offspring created
- **Cooperation (10%)**: Signals sent to other organisms

## Development

This project is designed to run entirely within Claude Code. The simulation logic is interpreted from SIMULATION_RULES.md rather than implemented in traditional code.

For detailed architecture information, see [CLAUDE.md](./CLAUDE.md).

For complete game mechanics, see [SIMULATION_RULES.md](./SIMULATION_RULES.md).

## License

Private repository - All rights reserved

## Credits

Created with Claude Code - Anthropic's official CLI for Claude