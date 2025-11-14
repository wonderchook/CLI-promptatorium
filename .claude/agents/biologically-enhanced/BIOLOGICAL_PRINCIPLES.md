# Biologically-Enhanced Simulation Framework

## Overview

This framework integrates modern ecological theory and biological principles into the Promptatorium simulation, creating more realistic and scientifically-grounded organism behaviors.

## Core Biological Principles

### 1. Metabolic Scaling (Kleiber's Law)

**Principle**: Metabolic rate scales with body mass to the 3/4 power.

**Formula**: `MetabolicRate = a × Mass^0.75`

**Implications**:
- Larger organisms have lower mass-specific metabolic rates
- Small organisms need to eat more frequently relative to body size
- Energy budgets scale predictably with size

**Implementation**:
```javascript
// Base metabolic cost per tick
basalMetabolicRate = 0.5 × (size^0.75)

// Total energy cost
totalEnergyCost = basalMetabolicRate + activityCost
```

**Size Categories**:
- **Micro** (size: 0.1-0.3): High metabolism, frequent feeding, short lifespan
- **Small** (size: 0.4-0.6): Moderate metabolism, balanced strategies
- **Medium** (size: 0.7-0.8): Lower mass-specific needs, longer fasting
- **Large** (size: 0.9-1.0): Lowest mass-specific metabolism, infrequent feeding

---

### 2. Optimal Foraging Theory (OFT)

**Principle**: Organisms maximize net energy gain per unit time.

**Key Metric - Profitability**: `P = E / (h + s)`
- E = Energy gained from prey
- h = Handling time (pursuit + consumption)
- s = Search time to find prey

**Decision Rules**:
1. **Prey Selection**: Attack if `P_prey > P_threshold`
2. **Patch Leaving**: Leave area when `E_gained / time < average_rate`
3. **Risk-Reward Trade-off**: `NetValue = E × (1 - PredationRisk)`

**Implementation**:
```javascript
// Calculate profitability for each potential prey
profitability = (preyEnergy) / (estimatedHandlingTime + distanceToTarget/speed)

// Choose highest profitability prey above threshold
optimalPrey = preys.filter(p => profitability(p) > threshold)
                   .sort((a,b) => profitability(b) - profitability(a))[0]

// Risk-adjusted decision
if (predatorsNearby) {
  adjustedValue = profitability × (1 - predationRisk)
  if (adjustedValue < safePatchValue) {
    flee()
  }
}
```

---

### 3. Life History Strategies

**r-selected** (fast life history):
- High reproductive rate
- Small body size
- Short lifespan
- Early maturation
- Low parental investment
- Example: Mice, insects

**K-selected** (slow life history):
- Low reproductive rate
- Large body size
- Long lifespan
- Late maturation
- High parental investment
- Example: Elephants, whales

**Trait Profiles**:

| Trait | r-selected | K-selected |
|-------|-----------|-----------|
| Size | 0.2-0.4 | 0.7-1.0 |
| Reproduction threshold | 80 energy | 130 energy |
| Offspring energy | 40 | 60 |
| Speed | 0.8-1.0 | 0.4-0.6 |
| Energy efficiency | 0.3-0.5 | 0.7-0.9 |
| Starvation resistance | 0.2-0.4 | 0.7-0.9 |

---

### 4. Energy Flow and Trophic Efficiency

**10% Rule**: Only ~10% of energy transfers between trophic levels.

**Energy Budget Equation**:
```
Energy_In = Consumption
Energy_Out = Metabolism + Activity + Growth + Reproduction + Waste

Net_Energy = Energy_In - Energy_Out
```

**Digestive Efficiency by Trophic Level**:
- **Primary Producers** (plants): 100% photosynthesis conversion (of available light)
- **Herbivores**: 30-40% digestive efficiency (plant matter is hard to digest)
- **Carnivores**: 70-80% digestive efficiency (meat is easier to digest)
- **Omnivores**: 50-60% average efficiency (depends on diet composition)

**Implementation**:
```javascript
// Eating mechanics
if (target.type === 'plant') {
  energyGained = target.energy × 0.35 × self.digestionSpeed
} else if (target.type === 'meat') {
  energyGained = target.energy × 0.75 × self.digestionSpeed
}

// With omnivore diversity bonus
if (omnivore && ateMultipleFoodTypes) {
  energyGained *= 1.2  // 20% bonus for dietary variety
}
```

---

### 5. Predation Risk Assessment

**Principle**: Organisms balance foraging gains against predation risk.

**Risk Factors**:
- Distance to cover (vegetation, terrain)
- Number of nearby predators
- Predator type and hunting success rate
- Time of day (visibility)
- Group size (dilution effect)

**Giving-Up Density (GUD)**:
```
GUD = ResourceDensity at which organism leaves patch

GUD = MetabolicCost + PredationCost + MissedOpportunityCost
```

**Implementation**:
```javascript
// Calculate perceived danger
dangerLevel = 0
for (predator of nearbyPredators) {
  distance = distanceTo(predator)
  threat = predator.strength / distance
  dangerLevel += threat
}

// Modify behavior based on danger
if (dangerLevel > self.fearResponse) {
  // Flee to nearest cover
  action = MOVE(towardCover, maxSpeed)
} else if (dangerLevel > self.fearResponse × 0.5) {
  // Vigilant foraging (slower, more cautious)
  action = MOVE(towardFood, reducedSpeed)
  energyGained *= 0.7  // Less efficient due to vigilance
}
```

---

### 6. Behavioral Time Budgets

**Principle**: Organisms allocate time between competing activities.

**Activity Categories**:
1. **Foraging**: Finding and consuming food
2. **Vigilance**: Scanning for predators
3. **Resting**: Energy recovery and digestion
4. **Social**: Grooming, communication, mating
5. **Movement**: Traveling between patches

**Time Allocation by State**:
```javascript
// Energy-driven state machine
if (energy < 40) {
  // Desperate: 90% foraging, 10% vigilance
  state = "desperateForaging"
} else if (energy < 70) {
  // Hungry: 70% foraging, 20% vigilance, 10% movement
  state = "activeForaging"
} else if (energy < 110) {
  // Satisfied: 40% foraging, 30% resting, 20% social, 10% vigilance
  state = "maintenance"
} else {
  // Surplus: 20% foraging, 40% social, 30% resting, 10% reproduction prep
  state = "reproductive"
}
```

---

### 7. Thermal Regulation and Climate Adaptation

**Principle**: Organisms must maintain energy balance across temperature gradients.

**Temperature Effects**:
- **Ectotherms** (cold-blooded): Activity and metabolism vary with temperature
- **Endotherms** (warm-blooded): Constant high metabolism, thermal regulation costs

**Thermoregulation Costs**:
```javascript
// Temperature deviation from optimum
tempDeviation = Math.abs(environment.temperature - optimalTemp)

// Additional metabolic cost
thermalCost = tempDeviation × 0.02 × (1 - thermalAdaptation)

// Activity modification
if (tempDeviation > 15) {
  // Too cold/hot - seek shelter
  action = MOVE(towardOptimalMicroclimate, normalSpeed)
  activityMultiplier = 0.5
}
```

---

### 8. Group Living and Social Foraging

**Benefits of Grouping**:
- **Many eyes effect**: Better predator detection
- **Dilution effect**: Lower individual predation risk
- **Information sharing**: Faster food discovery
- **Cooperative hunting**: Larger prey accessible

**Costs of Grouping**:
- **Resource competition**: Shared food sources
- **Aggression**: Energy spent on conflicts
- **Disease transmission**: Higher infection risk

**Group Size Dynamics**:
```javascript
// Optimal group size calculation
predationBenefit = 1 - (1 / Math.sqrt(groupSize))  // Dilution
foragingCost = groupSize × 0.1  // Competition

netBenefit = predationBenefit - foragingCost

// Join/leave decisions
if (alone && netBenefit > 0) {
  action = MOVE(towardGroup, normalSpeed)
} else if (inGroup && netBenefit < -0.2) {
  action = MOVE(awayFromGroup, normalSpeed)
}
```

---

### 9. Learning and Memory

**Principle**: Organisms improve foraging efficiency through experience.

**Learning Mechanisms**:
1. **Spatial Memory**: Remember food patch locations
2. **Temporal Memory**: Return to patches at optimal times
3. **Social Learning**: Observe successful conspecifics
4. **Predator Recognition**: Learn which organisms are dangerous

**Implementation**:
```javascript
memory = {
  foodPatches: [
    {location: {x, y}, quality: 0.8, lastVisit: tick-50, replenishRate: 0.05},
    {location: {x, y}, quality: 0.3, lastVisit: tick-10, replenishRate: 0.02}
  ],
  predatorEncounters: [
    {predatorId: 23, dangerLevel: 0.9, lastSeen: tick-20, aggressive: true}
  ]
}

// Update patch quality estimate
estimatedQuality = patch.quality + (tick - patch.lastVisit) × patch.replenishRate

// Choose patch with highest expected return
bestPatch = foodPatches.max(p => estimatedQuality(p) / distanceTo(p))
```

---

### 10. Reproductive Strategies

**Timing of Reproduction**:
- **Fixed threshold**: Reproduce when energy > threshold
- **Conditional**: Reproduce when energy high AND conditions favorable
- **Seasonal**: Reproduce during optimal seasons
- **Opportunistic**: Reproduce when resources abundant

**Offspring Investment**:
```javascript
// Parental investment decisions
if (r_selected) {
  // Many small offspring
  offspringEnergy = 40
  offspringCount = Math.floor(self.energy / 100)
  parentalCare = 0
} else if (K_selected) {
  // Few large offspring
  offspringEnergy = 70
  offspringCount = 1
  parentalCare = 20  // Ticks spent guarding
}
```

---

## Integrating Principles into Agents

### Example: Biologically-Realistic Herbivore

```markdown
1. Calculate metabolic needs based on body size (Kleiber's law)
2. Assess food patches using optimal foraging profitability
3. Balance foraging vs. predation risk
4. Use spatial memory to revisit productive patches
5. Adjust time budget based on energy state
6. Make group size decisions based on predation pressure
7. Time reproduction for seasonal abundance
```

### Example: Biologically-Realistic Predator

```markdown
1. Calculate energy needs (higher for carnivores)
2. Evaluate prey profitability: energy gain / (chase time + handling time)
3. Decide to pursue only if profitability exceeds threshold
4. Use ambush vs. pursuit based on speed traits
5. Learn prey vulnerability patterns
6. Coordinate with pack if social
7. Guard territory during offspring rearing
```

---

## Agent Development Guidelines

### 1. Define Life History Strategy
- Choose r-selected or K-selected
- Set trait values consistent with strategy
- Define reproductive thresholds

### 2. Specify Metabolic Profile
- Body size determines base metabolic rate
- Activity costs scale with actions
- Set starvation threshold

### 3. Design Foraging Algorithm
- Calculate prey/food profitability
- Set acceptance thresholds
- Include risk assessment

### 4. Implement Memory System
- Track successful food patches
- Remember predator encounters
- Update knowledge based on experience

### 5. Create Behavioral State Machine
- Desperate → Foraging → Maintenance → Reproductive → Parental
- State transitions based on energy and conditions

### 6. Add Environmental Responsiveness
- Temperature tolerance
- Biome preferences
- Time-of-day activity patterns

---

## Validation Metrics

To ensure biological realism, agents should exhibit:

1. **Realistic energy budgets**: Energy in ≈ Energy out (for stable populations)
2. **Size-appropriate metabolism**: Small organisms eat more frequently
3. **Prey selectivity**: Ignore unprofitable prey when better options exist
4. **Risk sensitivity**: Reduce foraging when predators present
5. **Memory effects**: Return to productive patches
6. **Group size patterns**: Form groups under predation pressure
7. **Seasonal reproduction**: Offspring timed to resource availability
8. **Trophic efficiency**: ~10% energy transfer between levels

---

## Mathematical Formulas Reference

### Energy Budget
```
dE/dt = I × D - (BMR + ACT + THERM + REPRO)

Where:
E = Energy stores
I = Intake rate
D = Digestive efficiency
BMR = Basal metabolic rate (0.5 × mass^0.75)
ACT = Activity cost
THERM = Thermoregulation cost
REPRO = Reproductive investment
```

### Optimal Foraging
```
Profitability = E / (h + s)
NetRate = (E × D - Cost) / Time

Where:
E = Energy content of prey
h = Handling time
s = Search time
D = Digestive efficiency
```

### Predation Risk
```
TotalRisk = Σ(PredatorStrength / Distance^2)
Vigilance = min(TotalRisk × Sensitivity, 1.0)
ForagingEfficiency = 1 - (Vigilance × 0.5)
```

### Group Living
```
PredationRisk_Individual = BaseDanger / sqrt(GroupSize)
ResourcesPerCapita = PatchQuality / GroupSize
NetBenefit = (1 - PredationRisk_Individual) - CompetitionCost
```

---

## References

- Kleiber, M. (1932). Body size and metabolism. *Hilgardia*.
- Stephens, D.W. & Krebs, J.R. (1986). *Foraging Theory*. Princeton University Press.
- West, G.B., Brown, J.H., & Enquist, B.J. (1997). A general model for the origin of allometric scaling laws in biology. *Science*.
- Brown, J.S. (1988). Patch use as an indicator of habitat preference, predation risk, and competition. *Behavioral Ecology and Sociobiology*.
- Grimm, V. et al. (2020). The ODD Protocol for Describing Agent-Based and Other Simulation Models.

---

**Last Updated**: 2025-11-14
**Framework Version**: 1.0.0
