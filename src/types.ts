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

export interface WorldContext {
  self: {
    id: number | string;
    energy: number;
    health: number;
    position: { x: number; y: number };
    age: number;
  };
  nearby: {
    plants: Array<{
      id: number | string;
      distance: number;
      direction: string;
      energy: number;
    }>;
    herbivores: Array<{
      id: number | string;
      distance: number;
      direction: string;
      health: number;
      behavior: string;
    }>;
    customAgents: Array<{
      id: number | string;
      distance: number;
      direction: string;
      energy: number;
      health: number;
      recentAction: string;
    }>;
  };
  environment: {
    light: number;
    biome: string;
    crowding: number;
  };
}

export interface AgentDecision {
  action: 'move' | 'eat' | 'reproduce' | 'signal' | 'rest';
  target?: string | number;
  direction?: { x: number; y: number };
  message?: string;
  reasoning: string;
}

export interface CritterInstance {
  instanceId: string;
  agentFile: string;
  organismId?: number | string;
}
