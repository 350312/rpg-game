import { QuestProgress } from './types';

export interface QuestDescriptor {
  stage: number;
  chapter: string;
  title: string;
  objective: string;
  hint: string;
  levelName: string;
}

export const QUEST_CHAPTERS: QuestDescriptor[] = [
  {
    stage: 0,
    chapter: 'Chapter 1 · BUP Campus',
    title: 'Welcome to BUP',
    objective: 'Talk to Student Guide Tanvir at the Main Gate or walk north into campus',
    hint: 'Walk north along the promenade to explore FST, FASS, FBS, FMS, and the Central Library.',
    levelName: 'Level 1: The BUP Campus',
  },
  {
    stage: 1,
    chapter: 'Chapter 1 · BUP Campus',
    title: 'Seek the Central Library',
    objective: 'Head to BUP Central Library on the South-East Campus Lawn (Cols 36-44, Row 38)',
    hint: 'Follow the red-brick walkway east from the South Promenade to enter BUP Central Library.',
    levelName: 'Level 1: The BUP Campus',
  },
  {
    stage: 2,
    chapter: 'Chapter 2 · BUP Central Library',
    title: 'The Book of Monpura',
    objective: 'Inspect the glowing green tome "MONPURA TALES" in the North Reading Alcove',
    hint: 'Speak with Librarian Prof. Rahman and walk north along the red carpet to the reading lectern.',
    levelName: 'Level 2: BUP Central Library',
  },
  {
    stage: 3,
    chapter: 'Chapter 3 · Isle of Monpura',
    title: 'Three Sacred Seals',
    objective: 'Collect the 3 Sacred Seals of Monpura (Bamboo Grove, Village Orchard, Tidepool Shrine)',
    hint: 'Talk to Sage Karim near the Arrival Portal, then explore east, west, and north-west to unlock the Ruins Gate!',
    levelName: 'Level 3: Isle of Monpura',
  },
  {
    stage: 4,
    chapter: 'Chapter 4 · The Sunken Ruins',
    title: 'Depths of the Ruins',
    objective: 'Push boulders onto all 3 metal plates to raise the Iron Gate & descend to the Sanctum',
    hint: 'Grab the Pickaxe in the south-east chest to break cracked walls, then take the north-west stairs.',
    levelName: 'Level 4: The Sunken Ruins',
  },
  {
    stage: 5,
    chapter: 'Chapter 5 · Sanctum of Monpura',
    title: 'The Shadow Warden',
    objective: 'Defeat the Skeleton Lord and claim the Heart of Monpura',
    hint: 'Guard with [SPACE] against heavy strikes, cast Fireballs with [F], and seize the Heart of Monpura behind the gate!',
    levelName: 'Level 5: Sanctum of Monpura',
  },
  {
    stage: 6,
    chapter: 'Epilogue · Home at BUP',
    title: 'Guardian of Monpura',
    objective: 'Adventure Complete! Freely explore BUP Campus & Monpura anytime',
    hint: 'Visit any remaining campus buildings (FST, FASS, FBS, FMS) or spar at Third Place Arena!',
    levelName: 'Epilogue: BUP Campus',
  },
];

export function getQuestDescriptor(progress: QuestProgress): QuestDescriptor {
  const found = QUEST_CHAPTERS.find((c) => c.stage === progress.stage) || QUEST_CHAPTERS[0];
  if (progress.stage === 3) {
    const count = progress.sealsCollected.length;
    return {
      ...found,
      objective:
        count < 3
          ? `Collect the 3 Sacred Seals of Monpura (${count}/3 collected)`
          : 'All 3 Seals collected! Enter the Ancient Ruins Gate at the north shore (Col 24, Row 9)',
    };
  }
  return found;
}
