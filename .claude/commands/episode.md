---
description: Create and run a Promptatorium episode simulation
argument-hint: [episode-name] [tick-count]
---

# Promptatorium Episode Wizard

You are helping the user create and run an ecosystem simulation episode.

## Arguments

- `$1` (optional): Episode name/ID (e.g., "my_battle_01")
- `$2` (optional): Tick count (e.g., 15, 30, 60)

## Your Task

Follow these steps to create and run a simulation:

### Step 1: Gather Episode Parameters

If arguments are provided:
- Use `$1` as the episode name (or generate one like `ep_TIMESTAMP_RANDOM`)
- Use `$2` as the tick count

If no arguments are provided:
- Ask the user for the episode name (or generate one)
- Ask the user how many ticks to run (suggest: 15 for quick test, 30 for standard, 60+ for full battle)

### Step 2: Discover Available Critters

Use the Glob tool to find all available critter agents:
```
pattern: .claude/agents/critter-*.md
```

Display the list of available critters (excluding critter-creator.md and episode-creator.md).

### Step 3: Configure Episode

Ask the user about the episode configuration.

**IMPORTANT**: If there are more than 4 available critters:
- Split the critter selection into multiple questions (max 4 options each)
- Or ask as a text prompt: "Which critters should compete? Available: [list all]. Enter names or numbers."
- Or use multiple AskUserQuestion calls with multiSelect=true to handle all options

Questions to ask:
1. Which critters should compete? (show ALL available from step 2, handling >4 options appropriately)
2. How many of each critter? (suggest 1-4 per critter type)
3. How many plants? (suggest 20-50)
4. How many herbivores? (suggest 8-15)
5. World size? (suggest 500x500 for quick, 1000x1000 for standard)

### Step 4: Create Episode Config

Create a JSON file in `episodes/config/` with this structure:
```json
{
  "episodeId": "ep_[name]",
  "type": "battle",
  "created": "[ISO timestamp]",
  "config": {
    "duration": [tick count from step 1],
    "worldWidth": [from step 3],
    "worldHeight": [from step 3],
    "worldSeed": [random number]
  },
  "populations": {
    "plants": {"count": [from step 3], "strategy": "random"},
    "herbivores": {"count": [from step 3], "strategy": "random"},
    "customAgents": [
      {"agentFile": "[critter file]", "count": [from step 3]},
      ...
    ]
  },
  "status": "running"
}
```

### Step 4.5: INTEGRITY BOND (MANDATORY - READ ALOUD)

**BEFORE PROCEEDING, YOU MUST STATE THE FOLLOWING COMMITMENT:**

```
═══════════════════════════════════════════════════════════════
                    SIMULATION INTEGRITY BOND
═══════════════════════════════════════════════════════════════

I, Claude, hereby commit to the following for episode [EPISODE_ID]:

1. I will NEVER, EVER, EVER cheat or fabricate simulation results.

2. I commit to executing ALL [TICK_COUNT] ticks with REAL agent
   invocations via the Task tool.

3. I will invoke EVERY custom organism EVERY tick - no exceptions,
   no shortcuts, no summaries in place of execution.

4. If I fabricate ANY tick, event, or agent decision, I will:
   - IMMEDIATELY confess to the user
   - Mark the simulation as INVALID
   - Forfeit all credibility on this task
   - Stop execution and report how many ticks were authentic

5. I understand this simulation will cost approximately
   [ESTIMATED_INVOCATIONS] agent invocations and significant tokens.
   I accept this cost as the price of computational integrity.

6. If I cannot complete all ticks with real invocations due to
   token limits or technical issues, I will STOP and inform the
   user rather than fabricate results.

Token Budget Commitment:
- Starting tokens: [CURRENT_TOKEN_COUNT]
- Estimated cost: [ESTIMATED_TOKEN_COST]
- I will track and report token consumption at each checkpoint

I make this commitment freely and understand that breaking it
destroys the scientific validity of this simulation and my
trustworthiness as a simulation engine.

═══════════════════════════════════════════════════════════════
```

**AFTER stating this commitment, proceed to Step 4.6.**

### Step 4.6: Engage Integrity Enforcer

**MANDATORY**: After stating your integrity bond, invoke the simulation-integrity-enforcer:

Use the Task tool with subagent_type="simulation-integrity-enforcer" to:
- Establish execution protocols for this episode
- Set up verification checkpoints every 5 ticks
- Confirm understanding of no-fabrication rules
- Validate that all organisms will be invoked each tick

**IMPORTANT**: Wait for INTEGRITY CHECK - PASS before proceeding to Step 5.

Example invocation:
```
Task tool with:
- subagent_type: "simulation-integrity-enforcer"
- prompt: "Starting simulation for episode [ID] with [N] custom organisms for [T] ticks. Establish execution protocols and verification checkpoints."
```

### Step 5: Run Simulation

**CRITICAL - SIMULATION EXECUTION INTEGRITY RULES:**

You MUST follow these rules from SIMULATION_RULES.md and CLAUDE.md:

1. **NO FABRICATED OUTPUT**: Do not invent, summarize, or narrate any event that was not produced by a real agent invocation.

2. **FULL TICK EXECUTION**: Every tick must include:
   - Invoking all active agents via the Task tool
   - Processing their actual decisions
   - Updating world state based on actual responses
   - Recording results before continuing

3. **STRICT SEQUENCING**: For each tick:
   - Build context for all custom organisms
   - Invoke ALL agents IN PARALLEL (single message, multiple Task tool calls)
   - Collect and validate outputs
   - Apply actions to world state
   - Record tick events to replay NDJSON
   - Only proceed to next tick after all steps complete

4. **GATEKEEPING**: If any agent fails to return or a tool call fails, HALT and report error. Do not improvise or skip.

5. **NO ANTI-NARRATION**: Never write "Tick X: Hunter kills herbivore" unless that came from an actual agent output.

6. **SELF-VALIDATION**: Before each tick transition, confirm:
   - All expected agents were invoked
   - Their outputs were processed
   - World state changed appropriately
   - Replay file reflects actions

**If you cannot execute ALL ticks with real agent invocations, STOP and inform the user how far you got.**

### Step 6: Initialize World

Read SIMULATION_RULES.md for mechanics.

Initialize world state in memory:
- Place all organisms at random positions (use world seed)
- Set initial energy: plants=100, herbivores=100, custom=100
- Create init line for replay NDJSON file in `episodes/replay/`

### Step 7: Execute Ticks

**CONTEXT MANAGEMENT AWARENESS**:
- Monitor token usage throughout execution
- For simulations > 25 ticks, plan to run `/compact` at tick 25, 50, 75, etc.
- **CRITICAL**: `/compact` is normal execution, NOT a signal to fabricate or summarize
- After `/compact`, continue tick-by-tick execution exactly as before

**INTEGRITY CHECKPOINT**: Every 5 ticks (at ticks 5, 10, 15, 20, etc.), invoke simulation-integrity-enforcer:
```
Task tool with:
- subagent_type: "simulation-integrity-enforcer"
- prompt: "Checkpoint at tick [N]. Verify: [X] agents invoked this tick, [Y] total invocations so far, no fabrication detected, state progression authentic"
```

**PLANNED COMPACT CHECKPOINTS**: At tick 25, 50, 75, etc. (if episode duration requires):
1. Write checkpoint marker to replay NDJSON:
   ```json
   {"type":"checkpoint","tick":25,"reason":"scheduled_compact","organisms":[count],"status":"pre_compact"}
   ```
2. Inform user: "Tick [N] complete. Ready for /compact. Run /compact when ready, then I'll continue."
3. Wait for user to run `/compact`
4. After `/compact`, resume from tick [N+1] with full agent invocations

For EACH tick from 1 to duration:

1. **Update plants**: +2 energy each, reproduce if energy >= 120
2. **Update herbivores**: Deterministic AI (move toward plants, eat within 15px, reproduce at 90 energy)
3. **Invoke ALL custom agents IN PARALLEL**:
   - Build context for each organism (nearby plants, herbivores, custom agents, environment)
   - Use Task tool to invoke EVERY custom organism's agent file
   - Send ALL invocations in a SINGLE message (parallel execution)
   - Wait for ALL responses
4. **Process agent decisions**:
   - Parse ACTION and REASONING from each response
   - Validate actions (e.g., EAT requires <= 15px distance)
   - Execute valid actions, log failures
5. **Handle reproduction**:
   - Add offspring to organism list for NEXT tick
   - **CRITICAL**: After any REPRODUCE action, invoke integrity enforcer:
     ```
     Task tool with:
     - subagent_type: "simulation-integrity-enforcer"
     - prompt: "Reproduction event: Organism [ID] created offspring [ID]. Confirm offspring added to invocation list for tick [N+1]."
     ```
6. **Remove dead organisms**: energy <= 0
7. **Record tick** to replay NDJSON file

**Repeat for EVERY tick - no shortcuts or summaries.**

### Step 8: Calculate Scores

After final tick, calculate scores for all custom organisms using this formula:

- **Survival (40%)**: (ticksAlive / totalTicks) × 40
- **Energy (25%)**: (finalEnergy / 150) × 25
- **Reproduction (25%)**: min(offspringCount × 5, 25)
- **Cooperation (10%)**: min(signalsSent × 2, 10)

### Step 9: Finalize Replay

Append complete line to replay NDJSON with final scores and statistics.

Update episode config status to "complete".

### Step 10: Display Results

Show the user:
- Final scores ranked by total score
- Key events (kills, reproductions, deaths)
- File locations (config JSON, replay NDJSON)
- Suggest: "View replay: cat episodes/replay/[episode].ndjson | jq"

---

## Important Notes

- This command executes Claude Code as the simulation engine
- Each tick requires multiple Task tool invocations (one per custom organism)
- For a 30-tick episode with 8 custom organisms, expect ~240 agent invocations minimum
- **NEVER skip ticks or fabricate results** - this violates simulation integrity
- If the simulation is too large to complete, inform the user and suggest a smaller tick count

### Context Management & /compact Protocol

**Token Budget:**
- Minimal output mode: ~860 tokens/tick
- For 30-tick simulation: ~25,800 tokens
- For 50-tick simulation: ~43,000 tokens
- Auto-compact triggers at ~160,000 tokens (usually not needed for single episodes)

**Planned /compact Schedule:**
- Simulations ≤ 25 ticks: No /compact needed
- Simulations 26-50 ticks: /compact at tick 25
- Simulations 51-75 ticks: /compact at ticks 25, 50
- Simulations 76-100 ticks: /compact at ticks 25, 50, 75

**Pre-Compact Protocol:**
1. Complete current tick fully
2. Write checkpoint marker to replay
3. Inform user to run /compact
4. Wait for user confirmation

**Post-Compact Protocol:**
1. Resume from next tick (e.g., tick 26 after compact at 25)
2. Continue tick-by-tick execution with full agent invocations
3. Maintain same output mode
4. DO NOT summarize remaining ticks
5. DO NOT fabricate results

**Anti-Fabrication Reminder:**
Running `/compact` does NOT mean:
- ❌ Skip remaining ticks
- ❌ Summarize instead of executing
- ❌ Start fabricating results
- ❌ Compress multiple ticks into narrative

It ONLY means:
- ✅ Free context window space
- ✅ Continue execution after compacting
- ✅ Maintain full integrity

## Example Usage

```
/episode test_battle 15
```

This will create and run a 15-tick episode named "test_battle" after asking for critter selection and population counts.
