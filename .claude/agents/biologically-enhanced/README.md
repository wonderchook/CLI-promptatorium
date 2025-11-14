# Biologically-Enhanced Organism Agents

## Overview

This folder contains **scientifically-grounded organism agents** based on modern ecological theory and biological principles. Unlike the narrative-focused "soul-based" agents, these organisms make decisions using mathematical models derived from:

- **Optimal Foraging Theory** (OFT)
- **Metabolic Scaling Laws** (Kleiber's Law)
- **Life History Theory** (r/K selection)
- **Predation Risk Assessment** (Giving-Up Density, vigilance trade-offs)
- **Social Ecology** (group living benefits and costs)
- **Individual-Based Modeling** (IBM) principles

## Why Use Biologically-Enhanced Agents?

### Scientific Realism
These agents exhibit behaviors grounded in empirical research:
- Energy costs scale with body size following Kleiber's Law (metabolic rate ∝ mass^0.75)
- Prey selection based on profitability calculations (E/h ratios)
- Risk-reward trade-offs using giving-up density thresholds
- Group living dynamics using dilution effect mathematics

### Emergent Complexity
Simple biological rules create complex emergent behaviors:
- Resource partitioning between r-selected and K-selected strategies
- Trophic cascades from optimal foraging decisions
- Population cycles from predator-prey dynamics
- Social structures from group living benefits

### Educational Value
Simulations become teaching tools for:
- Ecological concepts (niches, competition, predation)
- Evolutionary strategies (fast vs. slow life histories)
- Behavioral ecology (foraging theory, risk sensitivity)
- Population dynamics (growth rates, carrying capacity)

## Available Agents

### 1. Optimal Forager (`critter-optimal-forager-bio-o4f2.md`)
**Strategy**: Maximize energy gain per unit time

**Key Features**:
- Calculates prey profitability: P = E / (h + s)
- Risk-adjusted decision making
- Spatial memory of productive patches
- Omnivore with dietary flexibility

**Best Used For**: Testing foraging theory predictions, observing patch use patterns

**Traits**:
- Size: 0.5 (medium)
- Speed: 0.7
- Vision: 0.8 (excellent detection)
- Digestion: 0.7 (good energy extraction)

---

### 2. r-Strategist (`critter-r-strategist-bio-r5x8.md`)
**Strategy**: "Live fast, die young, leave many offspring"

**Key Features**:
- Reproduces at low energy threshold (80)
- Small body size (0.3) = high metabolism
- Early maturation (50 ticks)
- No parental care
- High reproductive rate

**Best Used For**: Colonization scenarios, disturbance recovery, population growth studies

**Traits**:
- Size: 0.3 (small)
- Speed: 0.9 (fast)
- Energy Efficiency: 0.4 (poor)
- Starvation Resistance: 0.3 (low)

---

### 3. K-Strategist (`critter-k-strategist-bio-k9p3.md`)
**Strategy**: "Live long, invest heavily, dominate competition"

**Key Features**:
- Reproduces at high energy threshold (130)
- Large body size (0.85) = low mass-specific metabolism
- Late maturation (200 ticks)
- Extended parental care (50 ticks)
- Territorial behavior

**Best Used For**: Stable environment scenarios, competitive exclusion studies, territorial dynamics

**Traits**:
- Size: 0.85 (large)
- Speed: 0.5 (slow but powerful)
- Strength: 0.85 (very strong)
- Energy Efficiency: 0.85 (excellent)
- Starvation Resistance: 0.85 (high)

---

### 4. Risk-Sensitive Forager (`critter-risk-manager-bio-r2m7.md`)
**Strategy**: Balance energy gain against predation risk

**Key Features**:
- Calculates predation risk using inverse square law
- Uses Giving-Up Density (GUD) for patch leaving decisions
- Vigilance-foraging trade-offs
- Cover-seeking behavior
- Group joining for dilution effect

**Best Used For**: Predation pressure studies, landscape of fear demonstrations, risk-reward scenarios

**Traits**:
- Size: 0.4 (small-medium)
- Speed: 0.75 (good escape)
- Vision: 0.85 (excellent predator detection)
- Fear Response: 0.8 (highly sensitive)

---

### 5. Social Forager (`critter-social-forager-bio-s6g1.md`)
**Strategy**: Cooperate through group living

**Key Features**:
- Dilution effect: risk ∝ 1/√(group size)
- Many-eyes detection
- Shared vigilance (reduced individual cost)
- Information sharing (food, predators)
- Optimal group size calculations (4-8 individuals)

**Best Used For**: Cooperation studies, group dynamics, information sharing experiments

**Traits**:
- Size: 0.45 (small-medium)
- Social: 0.95 (highly cooperative)
- Cooperation: 0.9 (excellent)
- Aggression: 0.2 (low - avoid conflict)

---

## Supporting Files

### `BIOLOGICAL_PRINCIPLES.md`
Comprehensive documentation of the biological principles underlying these agents:
- Metabolic scaling formulas
- Optimal foraging theory mathematics
- Life history trade-offs
- Predation risk assessment
- Energy flow calculations
- Group living dynamics

### `bio-utils.js`
JavaScript utility functions implementing biological calculations:
- `basalMetabolicRate(size)` - Kleiber's Law implementation
- `preyProfitability(energy, handlingTime, searchTime)` - OFT calculations
- `calculatePredationRisk(predators)` - Risk assessment
- `groupDilutionEffect(danger, groupSize)` - Social benefits
- And many more...

Use these utilities for:
- Validating agent decisions
- Building custom agents
- Analyzing replay data
- Creating visualizations

---

## How to Use These Agents

### Creating Episodes with Bio-Enhanced Agents

```javascript
// Example episode configuration
{
  "episodeId": "ep_bio_enhanced_test",
  "config": {
    "duration": 300,
    "worldWidth": 1000,
    "worldHeight": 1000
  },
  "populations": {
    "plants": {"count": 30, "strategy": "random"},
    "herbivores": {"count": 0},  // Using bio-enhanced herbivores instead
    "customAgents": [
      {"agentFile": "biologically-enhanced/critter-r-strategist-bio-r5x8.md", "count": 3},
      {"agentFile": "biologically-enhanced/critter-k-strategist-bio-k9p3.md", "count": 2},
      {"agentFile": "biologically-enhanced/critter-optimal-forager-bio-o4f2.md", "count": 2},
      {"agentFile": "biologically-enhanced/critter-social-forager-bio-s6g1.md", "count": 4}
    ]
  }
}
```

### Experimental Scenarios

**1. Life History Competition**
- r-strategist vs. K-strategist
- Hypothesis: r-selected dominates disturbed/variable environments, K-selected dominates stable environments
- Test with: Different world seeds, resource densities, predation pressures

**2. Risk-Reward Trade-offs**
- Add aggressive predators
- Compare optimal forager vs. risk-sensitive forager
- Hypothesis: Risk-managers survive longer but gain less energy

**3. Group Living Benefits**
- Vary predator density
- Track social forager group formation
- Hypothesis: Optimal group size increases with predation pressure

**4. Metabolic Scaling Validation**
- Compare small (0.3) vs. large (0.85) organisms
- Track energy intake frequency
- Hypothesis: Small organisms must eat more frequently (higher mass-specific metabolism)

---

## Comparing Bio-Enhanced vs. Soul-Based Agents

| Aspect | Bio-Enhanced | Soul-Based |
|--------|--------------|------------|
| **Decision Basis** | Mathematical calculations | Personality/narrative |
| **Predictability** | High (follows equations) | Low (emergent behavior) |
| **Educational Value** | Teaches ecological theory | Explores AI creativity |
| **Realism** | Empirically grounded | Anthropomorphic |
| **Complexity** | Explicit formulas | Implicit reasoning |
| **Best For** | Scientific simulations | Creative experiments |

**Neither is "better"** - they serve different purposes:
- **Bio-enhanced**: For testing hypotheses, teaching ecology, validating theory
- **Soul-based**: For entertainment, narrative emergence, unexpected behaviors

---

## Creating Custom Bio-Enhanced Agents

### Template Structure

```markdown
---
name: critter-[your-strategy]-bio-[id]
description: [Brief description of biological strategy]
tools: Read
model: haiku
---

# [Agent Name] - [Strategy Type]

## Biological Profile
- Size: [0.1-1.0]
- Basal Metabolic Rate: [calculated using Kleiber's Law]
- Traits: [relevant trait values]

## Decision-Making Algorithm

### Step 1: [Primary assessment]
[Mathematical formula or decision rule]

### Step 2: [Secondary factors]
[Calculations and thresholds]

## Behavioral States
[Energy-driven state machine]

## Response Format
ACTION: [action](params)
REASONING: [biological rationale]
```

### Best Practices

1. **Start with Biology**: Choose a real ecological strategy or organism
2. **Define Traits**: Use traits that match the strategy (size affects metabolism!)
3. **Calculate Costs**: All actions should have energy costs
4. **Use Thresholds**: Decision boundaries based on energy states
5. **Show Your Work**: Include calculations in reasoning
6. **Test Predictions**: Does the agent behave as theory predicts?

---

## Validation and Testing

### Expected Behaviors

**r-Strategist**:
- ✓ Reproduces frequently (every 50-80 ticks when energy allows)
- ✓ Dies young (200-400 ticks average lifespan)
- ✓ High offspring count (5-15 over lifetime)

**K-Strategist**:
- ✓ Reproduces rarely (every 100-200 ticks)
- ✓ Lives long (600-1200+ ticks)
- ✓ Low offspring count (2-5 over lifetime)
- ✓ Defends territory

**Optimal Forager**:
- ✓ Ignores low-profitability prey
- ✓ Leaves patches when gain rate < threshold
- ✓ Returns to productive patches (memory)

**Risk-Sensitive**:
- ✓ Flees when risk > fear response threshold
- ✓ Increases vigilance with predator proximity
- ✓ Accepts more risk when desperate (low energy)

**Social Forager**:
- ✓ Joins groups when alone
- ✓ Maintains group size around 4-8
- ✓ Shares information (food, danger signals)

### Validation Metrics

From replay data, calculate:
```javascript
// Life history validation
reproductionRate = totalOffspring / ticksAlive
maturationAge = firstReproductionTick
lifespan = deathTick - birthTick

// Foraging validation
profitabilityChoices = targetsChosen.map(t => calculateProfitability(t))
avgProfitability = mean(profitabilityChoices)

// Risk sensitivity validation
flightEvents = actions.filter(a => a.type === 'flee' && predatorPresent)
flightThreshold = min(riskLevels where flight occurred)

// Social behavior validation
avgGroupSize = mean(nearbyConspecificCounts)
groupFormationEvents = transitionsFrom(alone, inGroup)
```

---

## Further Reading

### Foundational Papers
- Stephens, D.W. & Krebs, J.R. (1986). *Foraging Theory*. Princeton University Press.
- West, G.B., Brown, J.H., & Enquist, B.J. (1997). A general model for the origin of allometric scaling laws in biology. *Science*.
- Pianka, E.R. (1970). On r- and K-selection. *The American Naturalist*.

### Modern Applications
- Grimm, V. et al. (2020). The ODD Protocol for Describing Agent-Based and Other Simulation Models.
- Brown, J.S. (1988). Patch use as an indicator of habitat preference, predation risk, and competition. *Behavioral Ecology and Sociobiology*.

### Online Resources
- [Optimal Foraging Theory - Biology LibreTexts](https://bio.libretexts.org/Courses/Gettysburg_College/01:_Ecology_for_All/11:_Behavioral_Ecology/11.03:_Optimal_Foraging_Theory)
- [Kleiber's Law - Wikipedia](https://en.wikipedia.org/wiki/Kleiber's_law)
- [Life History Theory - ScienceDirect](https://www.sciencedirect.com/topics/agricultural-and-biological-sciences/life-history-theory)

---

## Contributing

To add new bio-enhanced agents:

1. **Research the biology**: Find empirical studies or theoretical models
2. **Implement the mathematics**: Translate formulas into decision rules
3. **Document the theory**: Explain the biological basis in the agent prompt
4. **Test predictions**: Run simulations and validate expected behaviors
5. **Share results**: Document interesting emergent patterns

**Naming Convention**: `critter-[strategy-name]-bio-[random-4-char].md`

---

## License & Attribution

These agents are based on published ecological theory and empirical research. Key sources:
- Metabolic Theory of Ecology (West, Brown, Enquist)
- Optimal Foraging Theory (Stephens, Krebs, Charnov)
- Life History Theory (Pianka, Stearns, Roff)
- Behavioral Ecology (Krebs, Davies)

Agents are original implementations for the Promptatorium simulation platform.

---

**Last Updated**: 2025-11-14
**Version**: 1.0.0
**Status**: Active development, contributions welcome
