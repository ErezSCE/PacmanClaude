import { describe, it, expect, beforeEach } from 'vitest';
import { BonusFruit, FRUIT_TABLE, FRUIT_SPAWN_DOT_THRESHOLDS, FRUIT_DESPAWN_MS } from '../../src/fruit/BonusFruit';

describe('BonusFruit', () => {
  let fruit: BonusFruit;

  beforeEach(() => {
    fruit = new BonusFruit(1);
  });

  describe('fruit selection per level', () => {
    it('[US-007#1] resolves the level-1 fruit (cherry) from FRUIT_TABLE', () => {
      expect(BonusFruit.getFruitForLevel(1)).toEqual(FRUIT_TABLE[1]);
    });

    it('[US-007#1] resolves distinct fruit definitions for higher levels', () => {
      expect(BonusFruit.getFruitForLevel(2)).toEqual(FRUIT_TABLE[2]);
      expect(BonusFruit.getFruitForLevel(7)).toEqual(FRUIT_TABLE[7]);
    });

    it('[US-007#1] repeats the hardest fruit for levels beyond the table', () => {
      const highestLevel = Math.max(...Object.keys(FRUIT_TABLE).map(Number));
      expect(BonusFruit.getFruitForLevel(999)).toEqual(FRUIT_TABLE[highestLevel]);
    });
  });

  describe('spawn triggers', () => {
    it('[US-007#2] does not spawn before the first dot threshold is reached', () => {
      fruit.update(FRUIT_SPAWN_DOT_THRESHOLDS[0] - 1, 16);
      expect(fruit.isActive()).toBe(false);
    });

    it('[US-007#2] spawns after 70 dots have been eaten', () => {
      fruit.update(70, 16);
      expect(fruit.isActive()).toBe(true);
      expect(fruit.getName()).toBe(FRUIT_TABLE[1].name);
    });

    it('[US-007#2] spawns again after 170 dots have been eaten in the same level', () => {
      fruit.update(70, 16);
      fruit.collect();
      fruit.update(170, 16);
      expect(fruit.isActive()).toBe(true);
    });

    it('[US-007#2] does not re-trigger the same threshold twice', () => {
      fruit.update(70, 16);
      fruit.collect();
      fruit.update(75, 16);
      expect(fruit.isActive()).toBe(false);
    });
  });

  describe('despawn behavior', () => {
    it('[US-007#3] despawns automatically after the timeout elapses', () => {
      fruit.update(70, 16);
      expect(fruit.isActive()).toBe(true);
      fruit.update(70, FRUIT_DESPAWN_MS);
      expect(fruit.isActive()).toBe(false);
    });

    it('[US-007#3] remains active before the timeout elapses', () => {
      fruit.update(70, 16);
      fruit.update(70, FRUIT_DESPAWN_MS - 1000);
      expect(fruit.isActive()).toBe(true);
    });

    it('[US-007#3] despawn() immediately hides the fruit without awarding points', () => {
      fruit.update(70, 16);
      fruit.despawn();
      expect(fruit.isActive()).toBe(false);
      expect(fruit.collect()).toBeNull();
    });
  });

  describe('points awarded on collection', () => {
    it('[US-007#4] awards the level-scaled points when collected while active', () => {
      fruit.update(70, 16);
      expect(fruit.collect()).toBe(FRUIT_TABLE[1].points);
    });

    it('[US-007#4] awards higher points for higher-level fruit', () => {
      const level5Fruit = new BonusFruit(5);
      level5Fruit.update(70, 16);
      expect(level5Fruit.collect()).toBe(FRUIT_TABLE[5].points);
    });

    it('[US-007#4] returns null when collecting with no active fruit', () => {
      expect(fruit.collect()).toBeNull();
    });

    it('[US-007#4] deactivates the fruit after collection', () => {
      fruit.update(70, 16);
      fruit.collect();
      expect(fruit.isActive()).toBe(false);
    });
  });

  describe('reset', () => {
    it('[US-007#5] reset() clears active state and triggered thresholds', () => {
      fruit.update(70, 16);
      fruit.reset();
      expect(fruit.isActive()).toBe(false);
      fruit.update(70, 16);
      expect(fruit.isActive()).toBe(true);
    });
  });

  describe('setLevel', () => {
    it('[US-007#1] uses the newly set level when spawning', () => {
      fruit.setLevel(3);
      fruit.update(70, 16);
      expect(fruit.getName()).toBe(FRUIT_TABLE[3].name);
    });
  });
});
