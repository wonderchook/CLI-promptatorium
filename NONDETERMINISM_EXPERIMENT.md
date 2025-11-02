# Nondeterminism Experiment - Session Progress

**Date**: 2025-11-02
**Status**: Ready to test
**Next Step**: Run experiment after session restart

---

## Key Insight

**The soul IS the LLM invocation.**

We don't need complex probability distributions or sampling systems. The organism's "mind" is simply the LLM thinking when we invoke the agent. Natural LLM temperature variation should provide nondeterministic behavior.

### The Elegant Architecture:
```
Organism = Body (state/position/energy) + Soul (LLM invocation)

Same context + Same soul → Different thoughts → Different actions
```

This is how real minds work - you can face the same situation twice and choose differently.

---

## What We Created

### 1. Test Agent: `critter-free-soul-test-f5t1.md`

**Location**: `.claude/agents/critter-free-soul-test-f5t1.md`

**Philosophy**:
- Minimal constraints on decision-making
- Encourages natural expression and uncertainty
- Trusts the soul to "think" rather than forcing rigid patterns
- Prompt says "Trust your instincts", "Express uncertainty", "Be spontaneous"

**Response Format**:
```
[Natural thoughts/feelings about situation]

ACTION: [choice]
```

### 2. Test Episode: `ep_soul_variation_test.json`

**Location**: `episodes/config/ep_soul_variation_test.json`

**Setup**:
- 5 tick duration (short test)
- 1 free-soul predator
- 5 plants, 3 herbivores
- **World seed: 42** (fixed for reproducibility)
- Small world: 500x500

**Purpose**: Run multiple times with same seed to see if soul makes different choices.

---

## The Experiment Plan

### Hypothesis:
If we run the same episode multiple times (same seed = identical starting conditions), the free-soul agent will make different decisions because the LLM invocation is naturally nondeterministic.

### Test Protocol:

**Run 1**: Baseline
```bash
# Run ep_soul_variation_test with seed=42
# Record: tick-by-tick decisions made by organism
# Note: position after each tick, action chosen
```

**Run 2**: Same seed, observe variation
```bash
# Run ep_soul_variation_test with seed=42 again
# Compare: Did the soul make different choices?
# Look for: Different actions in same situations
```

**Run 3**: Confirm pattern
```bash
# Run ep_soul_variation_test with seed=42 third time
# Validate: Continued variation across runs
```

### What We're Looking For:

**Success Indicators**:
- ✅ Tick 1: Organism faces same nearby organisms but chooses different target/direction
- ✅ Tick 2+: Decision paths diverge (position changes lead to new contexts)
- ✅ Overall: Three runs produce three different trajectories

**If variation is insufficient**:
- Investigate explicit temperature setting in Task invocations
- Try `temperature: 1.0` or `temperature: 1.5`
- Consider if Haiku model needs higher temp than default

---

## Commands to Run

### Start Experiment:
```bash
# Option A: Use slash command (if it exists)
/episode soul_variation_test 5

# Option B: Request manually
"Run the episode ep_soul_variation_test"
```

### Track Results:
Create a comparison file after each run:
```
episodes/analysis/soul_variation_results.md
- Run 1: [decisions]
- Run 2: [decisions]
- Run 3: [decisions]
- Analysis: [variation observed?]
```

---

## Open Questions

### 1. Temperature Setting
- **Current**: Unknown what default temperature is for Task tool agent invocations
- **Need to verify**: Can we explicitly set temperature in Task calls?
- **Syntax**: Might be `model: haiku, temperature: 1.0` in agent frontmatter or Task parameters

### 2. Model Selection
- **Haiku**: Fast, cheap, but possibly more deterministic?
- **Sonnet**: Slower, more expensive, potentially more creative/varied?
- **Consider**: Testing same agent with both models

### 3. Context Sensitivity
- **Question**: How much context variation is needed for LLM to choose differently?
- **Hypothesis**: Even identical context might produce varied responses at high temperature
- **Test**: Run tick 1 multiple times with exact same context

---

## Implementation Notes

### What We DON'T Need (Simpler Than Expected):
- ❌ Probability distribution parsing
- ❌ Weighted sampling systems
- ❌ Complex decision trees
- ❌ Episode config changes for "nondeterminism mode"

### What We MIGHT Need (If Natural Variation Insufficient):
- ✅ Explicit temperature parameter in Task invocations
- ✅ Agent prompt adjustments to encourage more varied thinking
- ✅ Model selection (Sonnet vs Haiku for creativity)

---

## Next Steps After Restart

1. **Verify agent is visible**: Check that `critter-free-soul-test-f5t1.md` appears in agent list
2. **Run first test**: Execute `ep_soul_variation_test` episode
3. **Record results**: Document tick-by-tick decisions
4. **Repeat 2 more times**: Same seed, observe variation
5. **Analyze**: Did we get natural nondeterminism?
6. **Adjust if needed**: Temperature tuning or prompt refinement

---

## Files Created This Session

```
.claude/agents/critter-free-soul-test-f5t1.md
episodes/config/ep_soul_variation_test.json
NONDETERMINISM_EXPERIMENT.md (this file)
```

---

## Todo List Status

- ✅ Design nondeterministic soul architecture (completed)
- ✅ Create test agent for free soul expression (completed)
- ✅ Create test episode with fixed seed (completed)
- 🔄 Run same scenario 3 times to test variation (NEXT STEP)
- ⏳ Analyze if natural LLM variation is sufficient (pending)

---

## Success Criteria

**Experiment succeeds if:**
- Same initial world state produces different organism behaviors across runs
- Soul feels "alive" - making contextual but varied decisions
- No complex machinery needed - just pure LLM thinking

**Then we know:**
- Organisms already are nondeterministic souls
- Architecture is sound
- Can extend to all agents with prompt philosophy changes

---

**Ready to run the test!** 🧪

Just say: "Run episode ep_soul_variation_test three times and compare results"
