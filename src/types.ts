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
    status: 'hungry' | 'satisfied' | 'tired' | 'mating' | 'fleeing' | 'hunting';
    recentActions: string[];
    energyTrend: 'increasing' | 'stable' | 'decreasing';
    offspringCount: number;
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
          'share' | 'attack' | 'explore' | 'patrol' | 'forage';
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
