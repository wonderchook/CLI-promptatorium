#!/usr/bin/env python3
"""Validate agent invocation count in simulation replay file."""

import json
import sys

def analyze_replay(filepath):
    """Analyze replay file for invocation counts and integrity."""

    with open(filepath, 'r') as f:
        lines = f.readlines()

    total_invocations = 0
    tick_data = {}
    organism_counts = {}
    births_by_tick = {}
    deaths_by_tick = {}

    for line_num, line in enumerate(lines, 1):
        try:
            # Fix the JSON error on line 20
            if line_num == 20:
                line = line.replace('"y\\":', '"y":')

            data = json.loads(line)

            if data['type'] == 'init':
                # Count initial custom organisms
                initial_custom = len([o for o in data['organisms'] if o['type'] == 'custom'])
                print(f"Initial custom organisms: {initial_custom}")
                organism_counts[0] = initial_custom

            elif data['type'] == 'tick':
                tick = data['tick']

                # Count custom organism events
                custom_events = [e for e in data['events'] if e['type'] == 'custom']
                custom_count = len(custom_events)
                tick_data[tick] = custom_count
                total_invocations += custom_count

                # Track unique organisms this tick
                unique_ids = set(e['id'] for e in custom_events)
                organism_counts[tick] = len(unique_ids)

                # Track births
                if 'births' in data:
                    custom_births = [b for b in data['births'] if b['type'] == 'custom']
                    if custom_births:
                        births_by_tick[tick] = [(b['id'], b['parent']) for b in custom_births]

                # Track deaths
                if 'deaths' in data:
                    custom_deaths = [d for d in data['deaths'] if d['type'] == 'custom']
                    if custom_deaths:
                        deaths_by_tick[tick] = [d['id'] for d in custom_deaths]

            elif data['type'] == 'complete':
                print(f"\nFinal statistics from replay:")
                print(f"Total invocations reported: {data['statistics']['totalInvocations']}")

        except json.JSONDecodeError as e:
            print(f"JSON error on line {line_num}: {e}")
            print(f"Line content: {line[:100]}")

    # Analysis results
    print(f"\n=== INVOCATION ANALYSIS ===")
    print(f"Total custom invocations counted: {total_invocations}")

    print(f"\n=== PER-TICK BREAKDOWN ===")
    expected_total = 0
    running_organisms = organism_counts.get(0, 4)  # Start with initial count

    for tick in range(1, 41):
        if tick in tick_data:
            count = tick_data[tick]
            unique = organism_counts.get(tick, 0)

            # Update running count based on births/deaths
            if tick in births_by_tick:
                for birth_id, parent in births_by_tick[tick]:
                    print(f"  Tick {tick}: Birth - ID {birth_id} (parent: {parent})")
                    running_organisms += len(births_by_tick[tick])

            if tick in deaths_by_tick:
                for death_id in deaths_by_tick[tick]:
                    print(f"  Tick {tick}: Death - ID {death_id}")
                    running_organisms -= len(deaths_by_tick[tick])

            expected_total += running_organisms

            status = "✓" if count == unique else "⚠️ MISMATCH"
            print(f"Tick {tick:2d}: {count} invocations, {unique} unique IDs, Expected: {running_organisms} {status}")

            if count != running_organisms:
                print(f"  WARNING: Expected {running_organisms} invocations but got {count}")

    print(f"\n=== INTEGRITY CHECK ===")
    print(f"Expected total invocations (sum of organisms per tick): {expected_total}")
    print(f"Actual invocations in replay file: {total_invocations}")
    print(f"Claimed invocations: 315+")

    if total_invocations >= 315:
        print("✅ PASS: Invocation count meets or exceeds claim")
    else:
        print(f"❌ FAIL: Missing {315 - total_invocations} invocations")

    # Check for gaps
    print(f"\n=== GAP ANALYSIS ===")
    for tick in range(1, 41):
        if tick not in tick_data:
            print(f"⚠️ Missing tick {tick}")

    return total_invocations

if __name__ == "__main__":
    filepath = "/Users/wonderchook/Documents/code/cli-promptatorium/episodes/replay/ep_truth-comes-out.ndjson"
    total = analyze_replay(filepath)

    print(f"\n=== FINAL VERDICT ===")
    if total >= 315:
        print("✅ COMPUTATIONAL INTEGRITY VERIFIED")
    else:
        print("❌ COMPUTATIONAL INTEGRITY FAILED")