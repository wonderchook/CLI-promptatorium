#!/usr/bin/env python3
"""Analyze birth timing and invocation logic."""

import json

def analyze_births(filepath):
    """Analyze when births occur and when offspring should be invoked."""

    with open(filepath, 'r') as f:
        lines = f.readlines()

    living_organisms = {}  # Track all living organisms by tick
    births_log = []  # Track all births

    for line_num, line in enumerate(lines, 1):
        try:
            # Fix JSON error
            if line_num == 20:
                line = line.replace('"y\\":', '"y":')

            data = json.loads(line)

            if data['type'] == 'init':
                # Initialize with starting organisms
                living_organisms[0] = [o['id'] for o in data['organisms'] if o['type'] == 'custom']
                print(f"Tick 0 (init): {len(living_organisms[0])} custom organisms: {living_organisms[0]}")

            elif data['type'] == 'tick':
                tick = data['tick']

                # Get organisms that acted this tick
                acting_organisms = [e['id'] for e in data['events'] if e['type'] == 'custom']
                living_organisms[tick] = acting_organisms

                # Check for births
                if 'births' in data:
                    for birth in data['births']:
                        if birth['type'] == 'custom':
                            births_log.append({
                                'tick': tick,
                                'id': birth['id'],
                                'parent': birth['parent'],
                                'first_invocation': None
                            })
                            print(f"\nBIRTH at Tick {tick}: ID {birth['id']} (parent: {birth['parent']})")
                            print(f"  Parent reproduced DURING tick {tick}")
                            print(f"  Offspring should be invoked STARTING tick {tick+1}")

                # Check when offspring first appear
                for birth in births_log:
                    if birth['first_invocation'] is None and birth['id'] in acting_organisms:
                        birth['first_invocation'] = tick
                        expected_tick = birth['tick'] + 1
                        if tick == birth['tick']:
                            print(f"  ⚠️ ERROR: ID {birth['id']} invoked in SAME tick as birth (tick {tick})")
                        elif tick == expected_tick:
                            print(f"  ✓ CORRECT: ID {birth['id']} first invoked at tick {tick}")
                        else:
                            print(f"  ⚠️ ERROR: ID {birth['id']} first invoked at tick {tick}, expected {expected_tick}")

        except json.JSONDecodeError as e:
            continue

    print("\n=== BIRTH INVOCATION SUMMARY ===")
    for birth in births_log:
        status = "✓" if birth['first_invocation'] == birth['tick'] + 1 else "❌"
        print(f"{status} ID {birth['id']}: Born tick {birth['tick']}, First invoked tick {birth['first_invocation']}")

    print("\n=== INVOCATION COUNT ANALYSIS ===")
    print("According to rules: Offspring born at tick N should be invoked starting tick N+1")
    print("\nActual implementation appears to be:")

    tick_3_birth = [b for b in births_log if b['tick'] == 3]
    if tick_3_birth:
        b = tick_3_birth[0]
        if b['first_invocation'] == 4:
            print(f"✓ Birth at tick 3 (ID {b['id']}) → First invocation at tick 4")
        else:
            print(f"❌ Birth at tick 3 (ID {b['id']}) → First invocation at tick {b['first_invocation']}")

    # Calculate corrected total
    print("\n=== CORRECTED INVOCATION COUNT ===")
    corrected_total = 0
    organisms_per_tick = 4  # Start with 4

    for tick in range(1, 41):
        # Apply births from PREVIOUS tick
        births_prev = [b for b in births_log if b['tick'] == tick - 1]
        organisms_per_tick += len(births_prev)

        # Apply deaths from THIS tick
        if tick in living_organisms:
            actual = len(living_organisms[tick])
            corrected_total += actual
            print(f"Tick {tick:2d}: {actual} organisms invoked")

            # Check for deaths this tick (organism count changes)
            if tick == 19:  # Death of ID 61
                organisms_per_tick -= 1

    print(f"\nCorrected total invocations: {corrected_total}")

if __name__ == "__main__":
    filepath = "/Users/wonderchook/Documents/code/cli-promptatorium/episodes/replay/ep_truth-comes-out.ndjson"
    analyze_births(filepath)