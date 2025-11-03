# Enhanced Promptatorium Simulation Rules

This document defines the complete simulation mechanics. Claude Code uses these rules to execute episodes.

## World Setup

- **Size**: Configurable (default 1000x1000 pixels)
- **Duration**: Configurable (default 300 seconds = 3000 ticks at 10Hz)
- **Random seed**: For reproducible episodes
- **Max organisms**: 300 (increased from 100)
- **Biome generation**: Perlin noise-based biome maps

## Biome System

The world is divided into distinct biomes that affect gameplay:

### Biome Types & Effects

| Biome | Light | Movement | Energy Cost | Visibility | Resources | Special Features |
|-------|-------|----------|-------------|------------|-----------|------------------|
| **Meadow** | 1.0x | 1.0x | 1.0x | 1.0x | Normal | Balanced, beginner-friendly |
| **Forest** | 0.7x | 0.8x | 1.1x | 0.5x | High | Ambush advantage, hiding spots |
| **Desert** | 1.3x | 0.9x | 1.4x | 1.2x | Low | Oases, extreme heat, mirages |
| **Swamp** | 0.8x | 0.6x | 1.3x | 0.7x | Medium | Disease risk, hidden resources |
| **Tundra** | 0.9x | 0.85x | 1.2x | 1.1x | Low | Seasonal extremes, hibernation bonus |

### Biome Effects on Organisms
- **Light multiplier**: Affects photosynthesis energy gain
- **Movement speed**: Modifies how fast organisms can move
- **Energy cost**: Multiplies energy consumption for all actions
- **Visibility**: Affects detection range and camouflage effectiveness
- **Resource density**: Determines plant spawn rates and food availability

## Environmental Cycles

### Day/Night Cycle (100 ticks per phase)
- **Dawn** (0.4 light): Low visibility, awakening predators
- **Morning** (0.7 light): Increasing activity
- **Noon** (1.0 light): Maximum photosynthesis
- **Afternoon** (0.9 light): High energy availability
- **Dusk** (0.5 light): Hunting time for nocturnal predators
- **Night** (0.2 light): Limited vision, heat detection valuable

### Weather System
- **Clear**: Normal conditions
- **Rain**: +20% plant growth, -10% movement speed, +5% energy for plants
- **Storm**: -50% visibility, +20% energy costs, organisms seek shelter
- **Drought**: -30% plant energy, water sources become critical
- **Snow** (tundra only): -20% movement, +10% camouflage

### Seasons (750 ticks each)
- **Spring**: +30% reproduction rate, +20% plant growth
- **Summer**: +10% energy gain, normal conditions
- **Fall**: -10% plant growth, organisms prepare for winter
- **Winter**: -30% energy efficiency, hibernation beneficial

## Organism Traits

All organisms have traits that affect their behavior and capabilities:

```typescript
traits: {
  // Physical (0-1 scale)
  speed: number,           // Movement speed multiplier
  strength: number,        // Attack damage and defense
  size: number,           // Visibility and energy needs
  camouflage: number,     // Detection avoidance
  armor: number,          // Damage reduction

  // Sensory (0-1)
  visionRange: number,    // Detection distance
  smellRange: number,     // Detect beyond vision
  heatDetection: number,  // See in darkness

  // Behavioral (0-1)
  aggression: number,     // Attack likelihood
  fearResponse: number,   // Flee threshold
  curiosity: number,      // Exploration tendency
  patience: number,       // Opportunity waiting

  // Metabolic (0-1)
  energyEfficiency: number,     // Energy cost reduction
  digestionSpeed: number,       // Food energy extraction
  starvationResistance: number  // Low energy survival
}
```

### Trait Effects on Actions

**Movement Speed**: `baseSpeed * (1 + speed * 0.5) * biome.movementSpeed`
**Energy Cost**: `baseCost * (1 - energyEfficiency * 0.3) * biome.energyCost`
**Detection Range**: `baseRange * (1 + visionRange * 0.5) * biome.visibility`
**Attack Damage**: `baseDamage * (1 + strength * 0.4)`
**Defense**: `incomingDamage * (1 - armor * 0.5)`
**Parasite Detection** (trait-based):
- Detection chance per tick: `max(0, min(1.0, (host.visionRange - parasite.camouflage) + 0.3))`
- Base 30% chance, modified by trait difference
- Example: Host visionRange 0.5, Parasite camouflage 0.9 → `max(0, (0.5 - 0.9) + 0.3) = 0.0` (invisible)
- Example: Host visionRange 0.8, Parasite camouflage 0.5 → `max(0, (0.8 - 0.5) + 0.3) = 0.6` (60% detection)

## Organism Archetypes

### 1. Plants (Deterministic)
**Traits**: No movement, high energy efficiency
**Behavior**:
- Photosynthesize: Gain `2 * biome.light * environment.lightLevel` energy
- Reproduce at 120 energy (costs 80)
- Can release chemical signals
- Death: Energy <= 0

### 2. Herbivores (Deterministic)
**Traits**: Moderate speed, low aggression
**Behavior**:
- Seek plants within 400 pixels
- Eat plants for 40 energy
- Flee from threats when health < 30
- Reproduce at 90 energy (costs 60)
- Death: Energy <= 0

### 3. Carnivores/Custom (Agent-Controlled)
**Traits**: Defined by agent file
**Behavior**: Agent decisions each tick
- Full trait profile affects all actions
- Memory system for learning
- Complex social interactions

### 4. Omnivores (NEW - Agent-Controlled)
**Traits**: Balanced, flexible
**Diet**: Both plants and meat
**Special**: 20% energy bonus from dietary variety

### 5. Decomposers (NEW - Agent-Controlled)
**Traits**: High efficiency, low speed
**Diet**: Corpses and waste
**Special**: Gain energy from dead organisms, clean environment

### 6. Parasites (NEW - Agent-Controlled)
**Traits**: Small size (0.2), high camouflage (0.9), low speed (0.4)
**Behavior**: Attach to hosts using ATTACH action, drain 2 energy/tick passively while attached
**Special**: Hard to detect (trait-based: host.perception - parasite.camouflage), vulnerable when detached
**Attachment Mechanics**:
- Use `ATTACH(targetId)` within 5 pixels to latch onto host
- While attached: Position syncs with host, passive drain active, reduced visibility
- Use `DETACH()` to leave host voluntarily
- Auto-detach if host dies (parasite survives at host's last position)
- Cannot reproduce while attached (must detach first)

### 7. Symbionts (NEW - Agent-Controlled)
**Traits**: High cooperation
**Behavior**: Form mutual relationships
**Special**: Both organisms gain +10% energy efficiency when paired

## Enhanced Action System - MANDATORY STRUCTURED FORMAT

### ⚠️ CRITICAL: Limited Action Vocabulary

Custom agents MUST respond with EXACTLY ONE of these enumerated actions:

1. **MOVE**: `ACTION: MOVE(direction, speed)`
   - direction: ENUM[north, northeast, east, southeast, south, southwest, west, northwest] OR targetId:INTEGER
   - speed: NUMBER[0.5-3.0]
   - Example: `ACTION: MOVE(northeast, 2.5)` or `ACTION: MOVE(54, 3)`

2. **EAT**: `ACTION: EAT(targetId)`
   - targetId: INTEGER (must exist in nearby organisms and be within 15 pixels)
   - Example: `ACTION: EAT(12)`

3. **REPRODUCE**: `ACTION: REPRODUCE()`
   - No parameters (requires energy >= 110)
   - Example: `ACTION: REPRODUCE()`

4. **SIGNAL**: `ACTION: SIGNAL(message, range)`
   - message: STRING[max 50 chars]
   - range: NUMBER[0-100]
   - Example: `ACTION: SIGNAL("food_found", 50)`

5. **REST**: `ACTION: REST()`
   - No parameters (net gain 2.5 energy)
   - Example: `ACTION: REST()`

6. **ATTACH**: `ACTION: ATTACH(targetId)`
   - targetId: INTEGER (must exist in nearby organisms and be within 5 pixels)
   - Requirements: Target must not already have parasite attached, parasite must not already be attached
   - Effect: Parasite attaches to host, moves with host automatically, becomes hard to detect
   - Example: `ACTION: ATTACH(34)`

7. **DETACH**: `ACTION: DETACH()`
   - No parameters (parasite must currently be attached)
   - Effect: Parasite detaches from host, resumes independent movement
   - Example: `ACTION: DETACH()`

**INVALID RESPONSES (will incur confusion penalty):**
- ❌ "I will hunt the herbivore" (narrative, not structured)
- ❌ "Moving toward prey and then attacking" (multi-action)
- ❌ "ACTION: STALK_AND_POUNCE(12)" (unlisted action)
- ❌ Any response not matching exact format above

**Parser Requirements:**
```regex
^ACTION:\s+(MOVE|EAT|REPRODUCE|SIGNAL|REST|ATTACH|DETACH)\((.*)\)\s*$
```
If parsing fails, organism takes no action and loses 2 energy.

### Action Costs & Effects (Computed Mathematically)

**MOVE(direction, speed)**
- Cost: `0.8 * speed * biome.energyCost`
- Distance: `speed` pixels/tick in specified direction
- Vector computation: `normalize(direction) * speed`

**EAT(target)**
- Range check: `distance(self, target) <= 15`
- Energy gain: `30` (plants) or `40` (meat)
- Target removed from world state

**REPRODUCE()**
- Energy check: `self.energy >= 110`
- Cost: `70` energy
- Offspring: Created at `parent.position + randomOffset(5)`

**SIGNAL(message, range)**
- Cost: `0.1 * (range/100)` energy
- Affects organisms within `range` pixels

**REST()**
- Energy gain: `3` (base gain)
- Energy cost: `0.5` (metabolic)
- Net gain: `2.5` energy/tick

**ATTACH(targetId)**
- Range check: `distance(self, target) <= 5`
- State check: `target.parasiteId === null && self.attachedToId === null`
- Cost: `1` energy
- Effect: Sets `self.attachedToId = targetId` and `target.parasiteId = self.id`
- Position: Parasite position synced to host position each tick automatically

**DETACH()**
- State check: `self.attachedToId !== null`
- Cost: `0.5` energy
- Effect: Sets `self.attachedToId = null` and `host.parasiteId = null`
- Position: Parasite remains at current location, resumes independent movement

### Combo Actions
Organisms can chain two actions per tick:
- "Stalk then pounce"
- "Signal then flee"
- "Eat then hide"

Second action at 75% effectiveness

### Stance System
Affects all actions for the tick:
- **Aggressive**: +20% damage, -10% defense
- **Defensive**: -20% damage, +20% defense
- **Neutral**: Balanced
- **Evasive**: +30% dodge, -30% damage

## Memory System

Organisms maintain memory across ticks:

```json
{
  "recentEvents": [
    {"tick": 145, "event": "attacked_by_23", "success": false},
    {"tick": 148, "event": "found_food", "location": {"x": 234, "y": 456}}
  ],
  "knownLocations": [
    {"type": "food", "position": {"x": 234, "y": 456}, "lastSeen": 148},
    {"type": "danger", "position": {"x": 567, "y": 321}, "lastSeen": 145}
  ],
  "relationships": {
    "23": {"trust": -0.8, "lastInteraction": 145, "type": "enemy"},
    "45": {"trust": 0.6, "lastInteraction": 140, "type": "ally"}
  }
}
```

## Enhanced Context for Agents

```json
{
  "self": {
    "id": 3,
    "type": "carnivore",
    "traits": {...},  // Full trait profile
    "energy": 65,
    "health": 80,
    "position": {"x": 450, "y": 320},
    "age": 247,
    "status": "hunting",  // hungry/satisfied/tired/mating/fleeing
    "recentActions": ["moved_north", "stalked_12", "attacked_12"],
    "energyTrend": "decreasing",
    "offspringCount": 2
  },
  "nearby": {
    "detailedOrganisms": [  // Closest 5 with full details
      {
        "id": 12,
        "type": "herbivore",
        "distance": 25,
        "direction": "NE",
        "position": {"x": 465, "y": 310},
        "energy": 45,
        "health": 60,
        "visibleTraits": {"speed": 0.7, "size": 0.4},
        "recentAction": "eating",
        "relationship": "prey"
      }
    ],
    "organismSummary": {  // Counts by distance
      "plants": {"close": 2, "medium": 5, "far": 8},
      "herbivores": {"close": 1, "medium": 3, "far": 4},
      "predators": {"close": 0, "medium": 1, "far": 2},
      "allies": {"close": 1, "medium": 0, "far": 0}
    },
    "resources": [
      {"type": "water", "position": {"x": 400, "y": 300}, "distance": 55},
      {"type": "corpse", "position": {"x": 470, "y": 330}, "distance": 23}
    ],
    "territories": [
      {"owner": 45, "center": {"x": 500, "y": 400}, "radius": 100, "strength": 0.7}
    ]
  },
  "environment": {
    "biome": "forest",
    "visibility": 0.5,
    "timeOfDay": "dusk",
    "weather": "rain",
    "season": "fall",
    "temperature": 15,
    "resourceDensity": "normal",
    "light": 0.5,
    "crowding": 0.47
  },
  "memory": {...}  // As defined above
}
```

## Social Dynamics

### Relationship Types
- **Ally**: Cooperative, share resources, defend together
- **Enemy**: Hostile, compete for resources
- **Neutral**: No established relationship
- **Pack Member**: Hunt together, share kills
- **Mate**: Reproduce together, protect offspring
- **Parent/Child**: Parent protects and feeds offspring

### Trust Building
- Successful cooperation: +0.2 trust
- Resource sharing: +0.3 trust
- Betrayal/attack: -0.5 trust
- Deceptive signals: -0.3 trust

### Pack Mechanics
- Pack leader: Highest strength + cooperation
- Coordinated hunting: +30% success rate
- Resource sharing: Automatic within pack
- Pack signals: Private communication channel

## Enhanced Scoring System

### Core Components (70%)
**Survival (25%)**: `(ticksAlive / totalTicks) * 25`
**Energy Management (15%)**: `(avgEnergy / 100 + finalEnergy / 150) * 7.5`
**Reproduction (15%)**: `min(offspringCount * 3 + viableOffspring * 2, 15)`
**Adaptation (15%)**: Response to environmental changes

### Strategic Components (30%)
**Cooperation (10%)**: Successful teamwork, resource sharing
**Territory Control (5%)**: Area dominated * time held
**Efficiency (5%)**: Energy gained / energy spent ratio
**Innovation (5%)**: Unique successful strategies
**Diversity (5%)**: Behavioral variety

### Penalties
- Stalling: -5 points if < 10px movement for 70% of time
- Spam: -10 points if > 10 offspring in 300 ticks
- Repetition: -3 points for repetitive action loops

## Replay Format (Enhanced NDJSON)

**Init Line:**
```json
{
  "type": "init",
  "episodeId": "ep_123",
  "worldSeed": 12345,
  "dimensions": {"width": 1000, "height": 1000},
  "biomeMap": [...],  // 2D array of biome types
  "organisms": [
    {"id": 1, "type": "plant", "traits": {...}, "position": {...}},
    {"id": 2, "type": "custom", "agentFile": "critter-hunter", "traits": {...}}
  ]
}
```

**Tick Events:**
```json
{
  "type": "tick",
  "tick": 1,
  "environment": {
    "timeOfDay": "dawn",
    "weather": "clear",
    "season": "spring"
  },
  "events": [
    {
      "id": 3,
      "action": "attack",
      "target": 12,
      "success": true,
      "damage": 25,
      "energy": 85,
      "stance": "aggressive",
      "reasoning": "Hungry, attacking weak herbivore"
    }
  ],
  "births": [{"id": 45, "parent": 3, "traits": {...}}],
  "deaths": [{"id": 12, "cause": "predation"}]
}
```

**Summary:**
```json
{
  "type": "complete",
  "finalTick": 3000,
  "scores": [
    {
      "id": 3,
      "agentFile": "critter-hunter",
      "survived": true,
      "score": 78.5,
      "components": {
        "survival": 25,
        "energy": 12,
        "reproduction": 10,
        "cooperation": 5,
        "adaptation": 8,
        "territory": 3,
        "efficiency": 4,
        "innovation": 4,
        "diversity": 7.5
      }
    }
  ],
  "statistics": {
    "totalOrganisms": 145,
    "survivors": 67,
    "avgScore": 52.3,
    "dominantStrategy": "pack_hunting"
  }
}
```

## MANDATORY TICK EXECUTION SCHEMA

### ⚠️ NO NARRATIVE ALLOWED - STRUCTURED OUTPUT ONLY

Every tick MUST produce output in these EXACT JSON structures:

### Tick Processing Structure

```json
{
  "tickNumber": 1,
  "phase1_plants": [
    {
      "id": 1,
      "preState": {"energy": 45, "position": {"x": 100, "y": 200}},
      "computation": {
        "photosynthesis": "2 * 0.8 * 1.0 = 1.6",
        "newEnergy": "45 + 1.6 = 46.6"
      },
      "reproduction": {
        "threshold": 120,
        "canReproduce": false
      },
      "postState": {"energy": 46.6, "position": {"x": 100, "y": 200}}
    }
  ],
  "phase2_herbivores": [
    {
      "id": 2,
      "preState": {"energy": 60, "position": {"x": 150, "y": 250}},
      "perception": {
        "nearestPlant": {"id": 1, "distance": 56.4},
        "action": "moveToward"
      },
      "computation": {
        "movement": "(-2.12, -2.12)",
        "energyCost": 0.8
      },
      "postState": {"energy": 59.2, "position": {"x": 147.88, "y": 247.88}}
    }
  ],
  "phase3_agentInvocations": [
    {
      "organismId": 3,
      "agentFile": "critter-hunter-h4k9.md",
      "contextProvided": {...},
      "invoked": true
    }
  ],
  "phase4_agentResponses": [
    {
      "organismId": 3,
      "rawResponse": "ACTION: MOVE(north, 2)\nREASONING: Hunting",
      "parsed": {
        "action": "MOVE",
        "parameters": {"direction": "north", "speed": 2}
      },
      "computation": {
        "energyCost": 1.6,
        "newPosition": {"x": 200, "y": 296}
      },
      "postState": {"energy": 78.4, "position": {"x": 200, "y": 296}}
    }
  ],
  "phase5_validation": {
    "plantsProcessed": 1,
    "herbivoresProcessed": 1,
    "agentsInvoked": 1,
    "energyConserved": true,
    "narrativeProhibited": true
  }
}
```

### Mathematical State Update Protocol

After ALL agent responses collected, apply in THIS ORDER:

**Phase 1: Action Execution**
```json
{
  "actionExecution": [
    {
      "organismId": 3,
      "action": "MOVE",
      "computation": "energy: 80 - (0.8 * 2) = 78.4",
      "stateChange": {"energy": -1.6, "position": {"x": 0, "y": -4}}
    }
  ]
}
```

**Phase 2: Passive Effects (Parasites)**
```json
{
  "passiveDrain": [
    {
      "parasiteId": 45,
      "hostId": 23,
      "attachedState": true,
      "computation": {
        "drainAmount": 2.0,
        "parasiteGain": 1.5,
        "hostEnergyBefore": 56.0,
        "hostEnergyAfter": "56.0 - 2.0 = 54.0",
        "parasiteEnergyBefore": 73.5,
        "parasiteEnergyAfter": "73.5 + 1.5 = 75.0"
      },
      "positionSync": {
        "hostPosition": {"x": 345, "y": 210},
        "parasitePosition": {"x": 345, "y": 210}
      }
    }
  ]
}
```
**Passive drain rules:**
- Applies to all parasites where `attachedToId !== null`
- Host loses 2.0 energy/tick
- Parasite gains 1.5 energy/tick (75% transfer efficiency)
- Parasite position synchronized to host position
- Applied AFTER actions, BEFORE death checks

**Phase 3: Death Processing**
```json
{
  "deaths": [
    {"id": 12, "cause": "energy <= 0", "removed": true},
    {"id": 23, "cause": "energy <= 0", "attachedParasiteId": 45, "parasiteAutoDetached": true}
  ]
}
```
**Death rules for attached parasites:**
- If host dies while parasite attached, parasite auto-detaches
- Parasite remains at host's last position
- Sets `parasite.attachedToId = null` and `parasite.status = 'detached'`

**Phase 4: Birth Processing**
```json
{
  "births": [
    {
      "parentId": 3,
      "offspringId": 78,
      "parentEnergyCost": 70,
      "offspringEnergy": 50,
      "position": {"x": 203, "y": 298}
    }
  ]
}
```

### Computational Checkpoints

**Pre-Tick Checkpoint:**
```json
{
  "checkpoint": "pre-tick",
  "tick": 1,
  "expectedInvocations": 3,
  "livingOrganisms": [3, 7, 11]
}
```

**Post-Tick Checkpoint:**
```json
{
  "checkpoint": "post-tick",
  "tick": 1,
  "actualInvocations": 3,
  "stateChanged": true,
  "energyConserved": true
}
```

## Simulation Execution Notes

### Parallel Agent Invocation
**CRITICAL**: All custom organisms must be invoked IN PARALLEL each tick:
```
// Build contexts for all custom organisms
contexts = customOrganisms.map(org => buildContext(org))

// Invoke ALL agents simultaneously (single message, multiple Task calls)
decisions = await Promise.all(
  customOrganisms.map(org => invokeAgent(org.agentFile, contexts[org.id]))
)

// Execute all decisions
decisions.forEach(decision => executeAction(decision))
```

### Offspring Management
When custom organisms reproduce:
1. Create new organism with parent's agent file
2. Add to active organism list
3. Next tick: Include in parallel invocation batch
4. Each offspring gets unique context but same strategy

### Performance Optimization
- Cache biome effects per region
- Batch all agent invocations per tick
- Pre-calculate visibility masks
- Update relationships incrementally

## Random Events

Occasional events that test adaptation:

### Environmental Events (5% chance/100 ticks)
- **Resource Boom**: Double plant growth for 100 ticks
- **Predator Migration**: 5 new carnivores enter
- **Disease Outbreak**: Organisms near corpses risk infection
- **Natural Barrier**: New obstacle appears

### Crisis Events (1% chance/100 ticks)
- **Wildfire**: Spreads across forest biome
- **Flood**: Water level rises, changes terrain
- **Meteor Strike**: Devastating but creates resource-rich crater
- **Ice Age**: Gradual temperature drop

## Victory Conditions (Optional Modes)

### Survival Mode
- Last organism standing wins
- Time limit: 5000 ticks

### Ecosystem Mode
- Maintain balanced populations
- Score based on diversity over time

### Domination Mode
- One species must exceed 70% of population
- Maintain for 500 ticks

### Migration Mode
- Cross from start to goal zone
- Bonus for bringing allies

## Notes

- Traits create emergent strategies
- Biomes drive adaptation
- Memory enables learning
- Social dynamics create alliances

## Simulation Integrity Protocol

### Mandatory Checkpoints
The simulation-integrity-enforcer MUST be invoked at these critical points:

1. **Pre-Simulation**: Before tick 1 to establish protocols
   - Confirm all organisms identified for invocation
   - Set up tracking for token consumption
   - Establish no-fabrication rules
   - Define expected invocation patterns

2. **Every 5 Ticks**: At ticks 5, 10, 15, 20, etc. for verification
   - Verify agent invocation count matches living organisms
   - Confirm parallel invocation occurred where required
   - Check that replay file contains real events
   - Validate state progression from previous checkpoint

3. **After Reproduction**: Immediately after any organism reproduces
   - Confirm offspring added to organism list
   - Verify offspring will be invoked next tick
   - Update expected invocation count
   - Track lineage for scoring

4. **On Anomalies**: If any agent fails to respond or returns unexpected format
   - Log the failure with specific details
   - Determine if simulation can continue
   - Prevent fabrication of missing response
   - Request user intervention if needed

5. **Post-Simulation**: Before calculating final scores
   - Verify all ticks completed with real invocations
   - Confirm final organism states are computed, not imagined
   - Validate replay file integrity
   - Check scoring inputs are from actual execution

### Verification Requirements
Each checkpoint must confirm:
- **Agent invocation count**: Number of Task tool calls matches living organisms
- **Parallel execution**: All custom organisms invoked in single message where required
- **Real responses**: All agent decisions come from actual Task tool outputs
- **State authenticity**: World state changes reflect computed actions only
- **No narrative shortcuts**: Zero fabricated events or summarized ticks
- **Replay accuracy**: NDJSON contains only events from actual execution

### Integrity Violations
The following constitute CRITICAL violations requiring immediate HALT:
- Writing "The hunter kills the herbivore" without agent invocation
- Summarizing ticks ("Ticks 1-30 proceeded with hunting...")
- Creating agent dialogue not from Task tool responses
- Skipping offspring invocations after reproduction
- Compressing parallel invocations into narrative
- Calculating scores from estimated rather than computed values

### Enforcement Protocol
When integrity enforcer returns:
- **PASS**: Continue to next tick/checkpoint
- **WARNING**: Address specific concern before continuing
- **FAIL**: HALT immediately, report violation to user, await resolution

### Token Consumption Tracking
Expected consumption patterns (approximate):
- Per organism per tick: 500-1500 tokens (input + output)
- 10 organisms × 20 ticks = ~200 invocations minimum
- Reproduction events add offspring invocations
- Total episode: 100,000-300,000+ tokens for full execution

### Anti-Fabrication Commitment
This simulation is a scientific experiment in multi-agent interaction. Every reported outcome MUST derive from actual computation. The integrity of results depends on authentic execution of every single agent decision across every tick.
- Environmental cycles add variety
- Agent models compete on strategy depth