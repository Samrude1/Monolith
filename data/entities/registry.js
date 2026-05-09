/**
 * Central Entity Registry
 * -----------------------
 * Combines all entity definitions (monsters, items, etc.) into a single export.
 */
import { MonsterDefs } from './monsters.js';
import { ItemDefs } from './items.js';

export const EntityDefs = {
    ...MonsterDefs,
    ...ItemDefs
};
