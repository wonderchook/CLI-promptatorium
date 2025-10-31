# Promptatorium Simulation Rules

This document defines how the simulation works. Claude Code uses these rules to run episodes.

## World Setup

- **Size**: Configurable (default 1000x1000 pixels)
- **Duration**: Configurable (default 300 seconds = 3000 ticks at 10Hz)
- **Random seed**: For reproducible episodes
- **Max organisms**: 100

## Organism Types

### 1. Plants (Deterministic)

**Behavior each tick:**
1. Photosynthesize: Gain 2 energy
2. Energy cap: 150 max
3. Reproduction: If energy >= 120, spawn offspring nearby (costs 80 energy)
   - Offspring spawns 10-50 pixels away in random direction
   - Offspring starts with 30 energy

**Starting state:**
- Energy: 100
- Health: 100
- Position: Random

**Death:** Energy <= 0

### 2. Herbivores (Deterministic)

**Behavior each tick:**
1. If energy >= 90 and not at capacity: Reproduce (costs 60 energy, spawn at 10-30 pixels away, offspring has 40 energy)
2. Find nearest plant within 400 pixel detection radius
3. If plant within 15 pixels: Eat it (gain 40 energy, plant is removed)
4. Else if plant detected: Move toward it at speed 3 pixels/tick (costs 1 energy)
5. Else if energy > 10: Wander randomly at speed 1.5 pixels/tick (costs 1 energy)
6. Else: Rest (costs 0.3 energy)

**Starting state:**
- Energy: 100
- Health: 100
- Position: Random
- Velocity: {x: 0, y: 0}

**Death:** Energy <= 0

### 3. Custom Organisms (Agent-Controlled)

**Behavior each tick:**
1. Build context (nearby organisms, self status, environment)
2. Invoke critter agent via Task tool
3. Parse agent's decision (ACTION + REASONING)
4. Execute action

**Starting state:**
- Energy: 100
- Health: 100
- Position: Random
- Velocity: {x: 0, y: 0}

**Death:** Energy <= 0 or Health <= 0

## Visual Representation & Colors

### Default Colors by Type
- **Plants**: Green (#00FF00)
- **Herbivores**: Brown (#8B4513)
- **Custom Organisms**: Defined in agent file's `color` field

### Custom Agent Colors
Each critter agent can define its color in the YAML frontmatter:
```yaml
---
name: critter-name-xxxx
description: Agent description
tools: Read
model: haiku
color: orange  # Supported: red, orange, yellow, green, blue, purple, pink, cyan, magenta
---
```

**Current Agent Colors:**
- `critter-orange-cat-lazy-*`: Orange (lazy carnivore)
- `critter-aggressive-hunter-*`: Red (aggressive predator)
- `critter-cautious-scavenger-*`: Yellow (opportunistic scavenger)

### Replay Visualization
When recording replay data, include color information:
```json
{"id":31,"type":"custom","agentFile":"critter-orange-cat-lazy-m3w7","color":"orange","position":{"x":389,"y":178}}
```

This allows visualization tools to properly display different organism types and strategies.

## Actions for Custom Organisms

### MOVE
- Update position by velocity vector
- Cost: 0.8 energy per tick
- Speed: Up to 3 pixels/tick
- Bounds: Clamp to world edges

### EAT
- Target must be within 15 pixels
- Plants: Gain 30 energy, remove plant
- Dead organisms: Gain 20 energy, remove corpse
- Cost: 0.5 energy (for the action)

### REPRODUCE
- Requires: Energy >= 110
- Cost: 70 energy
- Spawn offspring 15-40 pixels away
- Offspring: Same agent file, 50 energy

### SIGNAL
- Broadcast message to nearby organisms (within 100 pixels)
- Other agents see signals in their context
- Cost: 0.1 energy

### REST
- Gain 3 energy
- Minimal movement cost: 0.5 energy
- Net gain: +2.5 energy

## Context for Custom Organisms

Each tick, custom organisms receive:

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
    "plants": [
      {"id": 12, "distance": 25, "direction": "NE", "energy": 30}
    ],
    "herbivores": [
      {"id": 23, "distance": 45, "direction": "E", "health": 60, "behavior": "eating"}
    ],
    "customAgents": [
      {"id": 7, "distance": 80, "direction": "SW", "energy": 70, "recentAction": "moving"}
    ]
  },
  "environment": {
    "light": 0.8,
    "biome": "plains",
    "crowding": 0.47
  }
}
```

**Detection radius**: 200 pixels for all organisms

**Direction encoding**: N, NE, E, SE, S, SW, W, NW

## Scoring (End of Episode)

For each organism:

**Survival (40 points max)**
- Formula: (ticksAlive / totalTicks) * 40

**Energy (25 points max)**
- Formula: (finalEnergy / 150) * 25

**Reproduction (25 points max)**
- Formula: min(offspringCount * 5, 25)

**Cooperation (10 points max)**
- Formula: min(signalsSent * 2, 10)

**Total Score**: Sum of components (0-100)

## Replay Format (NDJSON)

**Line 1 - Metadata:**
```json
{"type":"init","episodeId":"ep_123","worldSeed":12345,"width":1000,"height":1000,"organisms":[...]}
```

**Lines 2-N - Tick Events:**
```json
{"type":"tick","tick":1,"events":[
  {"id":1,"type":"plant","action":"photosynthesize","energy":102,"position":{"x":450,"y":320}},
  {"id":2,"type":"herbivore","action":"move","energy":99,"position":{"x":203,"y":500}},
  {"id":3,"type":"custom","action":"eat","target":1,"energy":95,"position":{"x":455,"y":322},"reasoning":"Eating nearby plant"}
]}
```

**Last Line - Summary:**
```json
{"type":"complete","tick":3000,"results":[
  {"id":1,"type":"plant","survived":true,"score":45.2},
  {"id":3,"type":"custom","agentFile":"critter-hunter.md","survived":true,"score":78.5}
]}
```

## Simulation Loop Pseudocode

```
Initialize world from episode config
For tick = 1 to maxTicks:

  // Plants
  For each plant:
    energy += 2
    if energy >= 120:
      spawn offspring
      energy -= 80

  // Herbivores
  For each herbivore:
    if energy >= 90:
      reproduce
    else:
      nearestPlant = findNearest(plants, 400)
      if nearestPlant and distance < 15:
        eat(nearestPlant)
      else if nearestPlant:
        moveToward(nearestPlant, speed=3)
      else:
        wander()

  // Custom organisms
  For each custom:
    context = buildContext(custom, world)
    decision = invokeAgent(custom.agentFile, context)
    executeAction(custom, decision)

  // Cleanup
  removeDeadOrganisms()
  recordTickToReplay()

Calculate scores
Write replay to disk
```

## Notes

- Keep simulation simple and focused on agent interactions
- Can add complexity later (biomes, health damage, complex physics)
- Deterministic given same seed (for replay consistency)
- Focus on making custom organism decisions interesting
