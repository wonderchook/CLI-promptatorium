# Compact Episode Runner

Run efficient simulations using compact agent versions that respond with actions only.

## Usage
```
/compact-episode [name] [ticks] [agents]
```

## How It Works

1. **Uses Compact Agents**: Automatically selects `-compact` versions of agents
2. **Terse Prompts**: Sends minimal context (E:100 H@50px)
3. **Action-Only Responses**: Agents return just "MOVE(H,3)" not explanations
4. **Batch Processing**: Can invoke multiple ticks per agent call
5. **Efficient Output**: Minimal display, full replay file

## Compact Agent Protocol

### Input Format
```
T[tick] O[id]: E:[energy] P:([x],[y]) [Nearby] → ?
```

### Expected Response
```
ACTION_ONLY
```

### Example Exchange
```
Input: "T5 O61: E:110 Light:0.8 → ?"
Output: "REST()"
```

## Implementation Strategy

1. **Detect Available Compact Agents**:
```bash
ls .claude/agents/*-compact.md
```

2. **Build Minimal Context**:
- Energy level
- Nearest threat/prey with distance
- Light level if relevant
- Position only if needed

3. **Parse Terse Responses**:
- Expect single line
- Parse action and parameters
- No reasoning to process

4. **Batch Multiple Ticks**:
```
Process ticks 1-5 for organism 61:
T1: E:100 → ?
T2: E:102.5 → ?
T3: E:105 → ?
T4: E:107.5 → ?
T5: E:110 → ?
Response: REST(),REST(),REST(),REST(),REST()
```

## Benefits

- **10x faster**: Each invocation is ~90% smaller
- **More ticks**: Can run 50-100 tick simulations
- **More agents**: Can handle 10-15 organisms
- **Same accuracy**: Decisions follow same logic
- **Full replay**: Complete NDJSON output

## When to Use

- Large simulations (30+ ticks)
- Many agents (8+ organisms)
- Performance testing
- Rapid experimentation
- Limited conversation context

## Comparison

**Normal Episode (30 ticks, 8 agents)**:
- 240 verbose invocations
- ~300,000 tokens
- Often fails to complete

**Compact Episode (30 ticks, 8 agents)**:
- 240 terse invocations
- ~30,000 tokens
- Completes reliably

## Available Compact Agents

- `critter-orange-cat-lazy-compact`
- `critter-aggressive-hunter-compact`
- `critter-forest-phantom-compact`
- `critter-squeaky-colony-burrower-compact`
- `critter-cautious-scavenger-compact`

## Example

```
/compact-episode test_compact 50 8
```

This will:
1. Create episode config
2. Select compact agents
3. Run 50 ticks with 8 organisms
4. Use action-only responses
5. Complete in single conversation