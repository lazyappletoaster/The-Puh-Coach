import { LEVELS_1_TO_2 } from './levels/level1_2';
import { LEVELS_3_TO_4 } from './levels/level3_4';
import { LEVELS_5_TO_6 } from './levels/level5_6';
import { LEVELS_7_TO_8 } from './levels/level7_8';
import { LEVELS_9_TO_10 } from './levels/level9_10';
import type { Level, Lesson } from '../types/curriculum';

export const CURRICULUM_LEVELS: Level[] = [
  ...LEVELS_1_TO_2,
  ...LEVELS_3_TO_4,
  ...LEVELS_5_TO_6,
  ...LEVELS_7_TO_8,
  ...LEVELS_9_TO_10,
];

export const ALL_LESSONS: Lesson[] = CURRICULUM_LEVELS.flatMap((lvl) => lvl.lessons);

export function getLessonById(lessonId: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === lessonId);
}

export function getLevelById(levelId: number): Level | undefined {
  return CURRICULUM_LEVELS.find((lvl) => lvl.id === levelId);
}
