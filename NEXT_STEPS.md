# Next Steps - CLI Promptatorium

**Date**: 2025-11-02
**Status**: Post-Experiment Analysis Complete

---

## Current State

### Experiments Completed

1. ✅ **ep_soul_variation_test** (Runs 1-3)
   - **Status**: VALID - Proper controlled experiment
   - **Result**: Confirmed LLM nondeterminism (same context → different speeds: 3.0, 2.0, 2.5)
   - **Duration**: 5 ticks per run
   - **Files**: `episodes/replay/ep_soul_variation_test_run1-3.ndjson`

2. ✅ **ep_free_soul_world**
   - **Status**: FLAWED - Different starting positions invalidate claims
   - **Result**: Showed behavioral variation but NOT proof of nondeterminism
   - **Duration**: 10 ticks (stopped early)
   - **Files**: `episodes/replay/ep_free_soul_world.ndjson`

### Critical Findings from Analysis

**ep_free_soul_world FLAWS**:
- ❌ Three free-souls started at different positions (250,350), (550,200), (400,600)
- ❌ Different contexts from tick 1 → can't attribute variation to nondeterminism
- ❌ Could be rational responses to different situations, not soul variation
- ❌ No replication (only 1 run)
- ❌ Too short (10 ticks, no kills/reproductions)

**What Remains Valid**:
- ✅ Original ep_soul_variation_test proves nondeterminism conclusively
- ✅ Agents CAN make varied strategic choices (REST vs MOVE)
- ✅ Meta-reasoning observed (Free-Soul 2 questioned strategy)
- ✅ Computational integrity maintained (60 real invocations)

---

## Recommended Path Forward

### PHASE 1: Run a Real Full Episode (30 mins) ⭐ START HERE

**Goal**: See what actually happens in a complete ecosystem

**Command**:
```bash
/episode epic_battle 30
```

**Configuration**:
- Duration: 30 ticks (long enough to see hunts, kills, reproductions)
- Agents: 3 free-souls, 2 aggressive hunters, 1 cautious scavenger
- World: 1000x1000
- Populations: 30 plants, 12 herbivores

**Why This First**:
- We've been doing experiments but never seen the "game" play out
- Will reveal if hunts succeed, if organisms reproduce, if strategies diverge
- Shows what's interesting vs boring
- Surfaces new questions organically

**Expected Outcomes**:
- First kills/deaths
- Possible reproduction events
- Strategy differentiation (which critters thrive?)
- Emergent dynamics

---

### PHASE 2: Fix the Science - Controlled Multi-Agent Experiment (1 hour)

**Goal**: Prove nondeterminism in multi-agent setting properly

**Design**:
```json
{
  "episodeId": "ep_nondeterminism_controlled",
  "type": "controlled-experiment",
  "description": "3 free-souls at SAME starting position, run 3 times",
  "config": {
    "duration": 15,
    "worldWidth": 600,
    "worldHeight": 600,
    "worldSeed": 42
  },
  "populations": {
    "plants": {"count": 20, "strategy": "random"},
    "herbivores": {"count": 8, "strategy": "random"},
    "customAgents": [
      {
        "agentFile": "critter-free-soul-test-f5t1.md",
        "count": 3,
        "startPositions": "same"  // All start at (300, 300)
      }
    ]
  }
}
```

**Procedure**:
1. Run episode with seed 42
2. Run SAME episode config again (seed 42)
3. Run SAME episode config third time (seed 42)
4. Compare: Did the three free-souls at (300,300) make different choices across runs?

**What This Proves**:
- If free-soul behaviors differ across runs despite identical starting state → NONDETERMINISM
- If they're identical → Temperature too low or agents too deterministic

**Note**: May need to add position specification to episode creator

---

### PHASE 3: Evaluate Fun Factor (15 mins)

**Goal**: Is this engaging as a game/simulation?

**Command**:
```bash
@biological-game-evaluator analyze episodes/replay/ep_epic_battle.ndjson
```

**Questions for Evaluator**:
- Is it engaging to watch organisms compete?
- Are the stakes clear?
- Do outcomes feel earned or random?
- What would make it more fun?
- Is there narrative tension?

**Why This Matters**:
This is fundamentally a GAME project. Science experiments are cool, but the real question: is it fun?

---

## Additional Options (Lower Priority)

### Option A: Create New Critter Strategies

Use `@critter-creator` to design:
- **Pack Hunter** - Coordinates with same species via SIGNAL
- **Territorial Defender** - Guards area, signals warnings to intruders
- **Energy Hoarder** - Rests frequently, only hunts when desperate
- **Opportunistic Omnivore** - Eats anything nearby, no specialization
- **Stealth Ambusher** - Uses HIDE, waits for prey to come close

Run them in competition to see which strategy wins.

### Option B: Build Replay Visualization

**Options**:
1. CLI viewer - ASCII art tick-by-tick playback
2. Web viewer - HTML canvas with organism positions, energy bars, trails
3. Analytics dashboard - Charts of energy over time, decision trees

**Why**: NDJSON is hard to parse visually. Visualization reveals patterns.

### Option C: Strategy Analysis Tools

Build analysis scripts:
```bash
node src/analysis/compare-strategies.js ep_epic_battle.ndjson
# Outputs:
# - Which strategies gained most energy?
# - Which reproduced most?
# - Which survived longest?
# - Decision pattern analysis
```

### Option D: Publish Findings

Write documentation:
- `FINDINGS.md` - Nondeterminism discovery summary
- `METHODOLOGY.md` - How to run valid experiments
- `FUTURE_WORK.md` - Open questions

Share on GitHub, blog, or relevant communities.

---

## Critical Open Questions

### Scientific Questions:
1. **How much nondeterminism is needed?**
   - Current default temperature seems sufficient
   - Should we test explicit temperature settings?

2. **Does strategy design matter?**
   - Do different prompts produce measurably different outcomes?
   - Or does LLM nondeterminism dominate strategy?

3. **What's the right episode length?**
   - 5 ticks: Too short, no ecological events
   - 10 ticks: Still too short
   - 30 ticks: Probably minimum for meaningful dynamics
   - 50-100 ticks: Ideal for seeing strategies play out?

4. **Reproduction mechanics**:
   - No reproductions observed yet (organisms need 110+ energy, cost 70)
   - Are reproduction thresholds too high?
   - Should offspring be pre-scripted or emerge naturally?

### Game Design Questions:
1. **Is it fun to watch?** (Unknown - need full episode)
2. **Are there meaningful choices?** (Seems like yes based on varied strategies)
3. **Is there emergent narrative?** (Unknown - need longer episodes)
4. **What makes a "good" organism?** (Energy management? Aggression? Caution?)

### Technical Questions:
1. **Performance**: Can we handle 100+ tick episodes? 500+ ticks?
2. **Visualization**: What's the best way to show what's happening?
3. **Replay analysis**: How do we extract insights from NDJSON?

---

## Immediate Action Items

**Before next session:**

1. ✅ Critical analysis complete (this document)
2. ✅ Experiment flaws documented
3. ✅ Path forward defined

**For next session:**

1. **RUN**: `/episode epic_battle 30`
   - Let it play out completely
   - Watch for first kill, first reproduction, final rankings
   - Note what's exciting vs boring

2. **ANALYZE**: Review the replay
   - Which strategies worked?
   - Were there surprises?
   - What would make it better?

3. **DECIDE**: Based on epic_battle results:
   - If it's exciting → design more episodes, create new critters
   - If it's boring → identify why, iterate on mechanics
   - If it's broken → fix simulation rules

---

## Success Criteria

### Phase 1 Success:
- ✅ Episode runs to completion (30 ticks)
- ✅ At least 1 kill occurs
- ✅ At least 1 organism dies
- ✅ Strategies produce different outcomes (some thrive, some struggle)
- ✅ It's interesting to watch/analyze

### Phase 2 Success:
- ✅ Three runs with same seed complete
- ✅ Free-souls in same positions show behavioral variation
- ✅ Variation is documented and reproducible
- ✅ Scientific claim of nondeterminism is defensible

### Phase 3 Success:
- ✅ Fun factor evaluation completed
- ✅ Concrete improvements identified
- ✅ Clear sense of whether this is worth developing further

---

## Key Files Reference

**Experiments**:
- `episodes/config/ep_soul_variation_test.json` - Original valid experiment
- `episodes/config/ep_free_soul_world.json` - Flawed multi-agent test
- `episodes/replay/ep_soul_variation_test_run1-3.ndjson` - Proof of nondeterminism
- `episodes/analysis/soul_variation_results.md` - Detailed analysis of original experiment

**Documentation**:
- `NONDETERMINISM_EXPERIMENT.md` - Original experiment plan + results
- `SIMULATION_RULES.md` - Complete mechanics specification
- `CLAUDE.md` - Architecture and developer guide

**Agents**:
- `.claude/agents/critter-free-soul-test-f5t1.md` - Nondeterministic test agent
- `.claude/agents/critter-aggressive-hunter-h4k9.md` - Aggressive strategy
- `.claude/agents/critter-cautious-scavenger-s7x2.md` - Cautious strategy

**Commands**:
- `.claude/commands/episode.md` - Episode runner with integrity protocols

---

## Final Recommendation

**START WITH**: `/episode epic_battle 30`

Let's see what this system can actually do when it runs for a meaningful duration. All the science experiments are interesting, but we need to know if this is **compelling** before optimizing it.

After that epic battle, we'll have much better intuition about:
- What needs improvement
- What's already working well
- Whether the nondeterminism actually matters for gameplay
- What experiments would be most valuable next

**The science can wait. Let's see the souls fight.** ⚔️🧠✨

---

**Status**: Ready for next session
**Next Command**: `/episode epic_battle 30`
