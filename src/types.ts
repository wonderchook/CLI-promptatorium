/**
 * Core types for CLI Promptatorium
 */

export interface EpisodeConfig {
  episodeId: string;
  type: string;
  created: string;
  config: {
    duration: number;
    worldWidth: number;
    worldHeight: number;
    worldSeed: number;
  };
  populations: {
    plants: {
      count: number;
      strategy: string;
    };
    herbivores: {
      count: number;
      strategy: string;
    };
    customAgents: Array<{
      agentFile: string;
      count: number;
    }>;
  };
  status: 'pending' | 'running' | 'complete' | 'error';
}

export interface OrganismTraits {
  // Physical traits (0-1 scale)
  speed: number;           // Movement speed multiplier
  strength: number;        // Attack damage and defense
  size: number;           // Affects visibility and energy needs
  camouflage: number;     // Harder to detect
  armor: number;          // Damage reduction

  // Sensory traits (0-1 scale)
  visionRange: number;    // Detection distance
  smellRange: number;     // Can detect beyond vision
  heatDetection: number;  // See in darkness

  // Behavioral traits (0-1 scale)
  aggression: number;     // Likelihood to attack
  fearResponse: number;   // Flee vs fight when threatened
  curiosity: number;      // Explore vs stay safe
  patience: number;       // Wait for opportunities

  // Metabolic traits (0-1 scale)
  energyEfficiency: number;    // Energy cost multiplier
  digestionSpeed: number;      // Energy extraction rate
  starvationResistance: number; // Survive on less energy
}

export interface Memory {
  recentEvents: Array<{
    tick: number;
    event: string;
    location?: { x: number; y: number };
    organismId?: number | string;
    success?: boolean;
  }>;
  knownLocations: Array<{
    type: 'food' | 'danger' | 'shelter' | 'water';
    position: { x: number; y: number };
    lastSeen: number;
    reliability: number;
  }>;
  relationships: Record<string | number, {
    lastInteraction: number;
    interactions: Array<'cooperated' | 'attacked' | 'fled' | 'ignored'>;
    trust: number;
  }>;
}

export interface WorldContext {
  self: {
    id: number | string;
    type: 'plant' | 'herbivore' | 'custom' | 'omnivore' | 'decomposer' | 'parasite' | 'symbiont';
    traits: OrganismTraits;
    energy: number;
    health: number;
    position: { x: number; y: number };
    age: number;
    status: 'hungry' | 'satisfied' | 'tired' | 'mating' | 'fleeing' | 'hunting' | 'attached_parasite' | 'attached_host';
    recentActions: string[];
    energyTrend: 'increasing' | 'stable' | 'decreasing';
    offspringCount: number;
    // Parasite attachment state
    attachedToId?: number | null;     // For parasites: ID of host they're attached to
    parasiteId?: number | null;       // For hosts: ID of parasite attached to them
    attachmentDuration?: number;      // Ticks spent attached to current host
  };
  nearby: {
    detailedOrganisms: Array<{
      id: number | string;
      type: string;
      distance: number;
      direction: string;
      position: { x: number; y: number };
      energy: number;
      health: number;
      recentAction: string;
      traits?: Partial<OrganismTraits>; // Visible traits based on perception
      relationship?: 'ally' | 'enemy' | 'neutral' | 'unknown';
    }>;
    organismSummary: {
      plants: { close: number; medium: number; far: number };
      herbivores: { close: number; medium: number; far: number };
      predators: { close: number; medium: number; far: number };
      allies: { close: number; medium: number; far: number };
    };
    resources: Array<{
      type: 'water' | 'shelter' | 'territory' | 'corpse';
      position: { x: number; y: number };
      distance: number;
      claimed: boolean;
    }>;
    territories: Array<{
      owner: number | string;
      center: { x: number; y: number };
      radius: number;
      strength: number;
    }>;
  };
  environment: {
    biome: 'meadow' | 'forest' | 'desert' | 'swamp' | 'tundra';
    visibility: number;      // 0-1, affected by biome, time, weather
    timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night';
    weather: 'clear' | 'rain' | 'storm' | 'drought' | 'snow';
    season: 'spring' | 'summer' | 'fall' | 'winter';
    temperature: number;      // Affects metabolism
    resourceDensity: 'abundant' | 'normal' | 'sparse' | 'barren';
    light: number;           // 0-1, affects plant growth
    crowding: number;        // Population density
  };
  memory: Memory;
}

export interface AgentDecision {
  action: 'move' | 'eat' | 'reproduce' | 'signal' | 'rest' |
          'defend' | 'flee' | 'stalk' | 'hide' | 'claim_territory' |
          'share' | 'attack' | 'explore' | 'patrol' | 'forage' |
          'attach' | 'detach';  // Parasite attachment actions
  target?: string | number;
  direction?: { x: number; y: number };
  message?: string;
  energyInvestment?: number;  // 0.5-1.5x energy multiplier
  stance?: 'aggressive' | 'defensive' | 'neutral' | 'evasive';
  comboAction?: {  // Optional second action
    action: string;
    target?: string | number;
    direction?: { x: number; y: number };
  };
  reasoning: string;
}

export interface CritterInstance {
  instanceId: string;
  agentFile: string;
  organismId?: number | string;
}

export interface BiomeEffects {
  lightMultiplier: number;      // Affects photosynthesis
  movementSpeed: number;         // Movement cost/speed modifier
  energyCostMultiplier: number;  // Energy drain multiplier
  visibilityModifier: number;    // Vision range modifier
  resourceSpawnRate: number;     // How often resources appear
  plantGrowthRate: number;       // Plant energy gain modifier
  specialFeatures?: string[];    // Unique biome features
}

export const BiomeConfig: Record<string, BiomeEffects> = {
  meadow: {
    lightMultiplier: 1.0,
    movementSpeed: 1.0,
    energyCostMultiplier: 1.0,
    visibilityModifier: 1.0,
    resourceSpawnRate: 1.0,
    plantGrowthRate: 1.0,
    specialFeatures: ['balanced', 'beginner_friendly']
  },
  forest: {
    lightMultiplier: 0.7,
    movementSpeed: 0.8,
    energyCostMultiplier: 1.1,
    visibilityModifier: 0.5,
    resourceSpawnRate: 1.2,
    plantGrowthRate: 1.1,
    specialFeatures: ['ambush_advantage', 'hiding_spots']
  },
  desert: {
    lightMultiplier: 1.3,
    movementSpeed: 0.9,
    energyCostMultiplier: 1.4,
    visibilityModifier: 1.2,
    resourceSpawnRate: 0.3,
    plantGrowthRate: 0.4,
    specialFeatures: ['oases', 'extreme_heat', 'mirages']
  },
  swamp: {
    lightMultiplier: 0.8,
    movementSpeed: 0.6,
    energyCostMultiplier: 1.3,
    visibilityModifier: 0.7,
    resourceSpawnRate: 0.8,
    plantGrowthRate: 0.9,
    specialFeatures: ['disease_risk', 'hidden_resources', 'slow_movement']
  },
  tundra: {
    lightMultiplier: 0.9,
    movementSpeed: 0.85,
    energyCostMultiplier: 1.2,
    visibilityModifier: 1.1,
    resourceSpawnRate: 0.5,
    plantGrowthRate: 0.6,
    specialFeatures: ['seasonal_extremes', 'hibernation_bonus', 'ice_patches']
  }
};

export interface OrganismArchetype {
  name: string;
  baseTraits: Partial<OrganismTraits>;
  dietType: 'herbivore' | 'carnivore' | 'omnivore' | 'decomposer' | 'parasite' | 'photosynthetic';
  specialAbilities: string[];
  energyRequirements: {
    baseMetabolism: number;
    reproductionCost: number;
    movementCost: number;
  };
}

// ============================================================================
// Instinct Gate System Types
// ============================================================================

/**
 * GateCondition defines when an instinct gate fires.
 * Supports simple comparisons or compound AND/OR logic.
 */
export interface GateCondition {
  type: 'simple' | 'compound';
  /** For simple conditions: the field to check (e.g., 'self.energy', 'nearestPredator.distance') */
  field?: string;
  /** Comparison or logical operator */
  operator: '<' | '<=' | '>' | '>=' | '==' | '!=' | 'AND' | 'OR';
  /** For simple conditions: the threshold value */
  value?: number | string;
  /** For compound conditions: nested conditions */
  clauses?: GateCondition[];
}

/**
 * GateAction defines what happens when a gate fires.
 * Uses special tokens like "$away_from_threat" for dynamic resolution.
 */
export interface GateAction {
  type: 'MOVE' | 'EAT' | 'REST' | 'HIDE';
  parameters?: {
    /** Direction: compass direction, organism ID, or special token like "$away_from_threat" */
    direction?: string;
    /** Speed: number or special token like "$max_speed" */
    speed?: number | string;
    /** Target: organism ID or special token like "$nearest_food" */
    target?: string;
  };
}

/**
 * TraitModulation allows gates to have dynamic thresholds based on organism traits.
 * Makes timid organisms flee earlier, bold organisms ignore threats longer.
 */
export interface TraitModulation {
  /** Which field in the condition to modulate (e.g., 'value' for threshold) */
  thresholdField: string;
  /** List of trait modifiers to apply */
  modifiers: Array<{
    /** Which trait affects this gate */
    trait: keyof OrganismTraits;
    /** Whether high trait values lower or raise the threshold */
    effect: 'lower' | 'raise';
    /** Strength of the effect (0-1 scale, applied as multiplier) */
    factor: number;
  }>;
  /** Conditions under which this gate is completely suppressed */
  suppressedBy?: Array<{
    trait: keyof OrganismTraits;
    /** Gate suppressed when trait >= this threshold */
    threshold: number;
  }>;
}

/**
 * InstinctGate represents a reflexive response that bypasses full agent reasoning.
 * Gates fire based on priority order - highest priority checked first, only one fires per tick.
 */
export interface InstinctGate {
  /** Unique identifier for the gate (e.g., 'flee_predator', 'critical_rest') */
  id: string;
  /** Human-readable name (e.g., 'Predator Flight Response') */
  name: string;
  /** Priority order - higher = checked first. Only ONE gate fires per tick. */
  priority: number;
  /** Whether this gate is active (default: true) */
  enabled?: boolean;
  /** Condition that triggers this gate */
  condition: GateCondition;
  /** Action to take when gate fires */
  action: GateAction;
  /** Optional trait-based threshold modulation */
  traitModulation?: TraitModulation;
}

/**
 * Per-organism gate configuration that can be specified in agent frontmatter.
 */
export interface InstinctGateConfig {
  /** Override settings for default gates */
  overrides?: Record<string, {
    /** Disable this gate entirely */
    enabled?: boolean;
    /** Multiply the base threshold (e.g., 0.5 = half threshold) */
    threshold_modifier?: number;
  }>;
  /** Custom gates specific to this organism */
  custom?: InstinctGate[];
}

/**
 * GateActivation records when a gate fires, for replay logging.
 */
export interface GateActivation {
  /** Which gate fired */
  gateId: string;
  /** Human-readable gate name */
  gateName: string;
  /** What triggered the gate (predator ID, distance, energy level, etc.) */
  trigger: Record<string, any>;
  /** Details of trait modulation applied, if any */
  modulation?: {
    baseThreshold: number;
    effectiveThreshold: number;
    traitFactors: Record<string, number>;
  };
  /** Confirms no agent invocation occurred */
  agentBypassed: boolean;
}

/**
 * Default instinct gates available to all organisms.
 * These can be overridden or suppressed via agent frontmatter.
 */
export const DEFAULT_INSTINCT_GATES: InstinctGate[] = [
  {
    id: 'critical_rest',
    name: 'Critical Energy Rest',
    priority: 100,
    enabled: true,
    condition: {
      type: 'simple',
      field: 'self.energy',
      operator: '<',
      value: 15
    },
    action: {
      type: 'REST'
    },
    traitModulation: {
      thresholdField: 'value',
      modifiers: [
        {
          trait: 'starvationResistance',
          effect: 'lower',
          factor: 0.5  // High starvationResistance = lower threshold (can push harder)
        }
      ]
    }
  },
  {
    id: 'flee_predator',
    name: 'Predator Flight Response',
    priority: 90,
    enabled: true,
    condition: {
      type: 'simple',
      field: 'nearestPredator.distance',
      operator: '<',
      value: 50  // Base threshold: 50 pixels
    },
    action: {
      type: 'MOVE',
      parameters: {
        direction: '$away_from_threat',
        speed: '$max_speed'
      }
    },
    traitModulation: {
      thresholdField: 'value',
      modifiers: [
        {
          trait: 'fearResponse',
          effect: 'raise',  // High fearResponse = higher threshold (flee earlier)
          factor: 0.6
        },
        {
          trait: 'aggression',
          effect: 'lower',  // High aggression = lower threshold (flee later)
          factor: 0.4
        }
      ],
      suppressedBy: [
        {
          trait: 'aggression',
          threshold: 0.95  // Extremely aggressive organisms never flee
        }
      ]
    }
  },
  {
    id: 'opportunistic_eat',
    name: 'Opportunistic Feeding',
    priority: 80,
    enabled: true,
    condition: {
      type: 'compound',
      operator: 'AND',
      clauses: [
        {
          type: 'simple',
          field: 'nearestFood.distance',
          operator: '<=',
          value: 15  // Within eating range
        },
        {
          type: 'simple',
          field: 'self.energy',
          operator: '<',
          value: 50  // Only when hungry
        }
      ]
    },
    action: {
      type: 'EAT',
      parameters: {
        target: '$nearest_food'
      }
    },
    traitModulation: {
      thresholdField: 'self.energy',
      modifiers: [
        {
          trait: 'patience',
          effect: 'lower',  // High patience = lower energy threshold (waits until hungrier)
          factor: 0.3
        }
      ]
    }
  }
];
