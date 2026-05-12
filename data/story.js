/**
 * Narrative triggers and story data.
 * Format:
 * [levelId]: [
 *   { x, y, id, title, text, img, once: true }
 * ]
 */

export const STORY_DATA = {
    1: [
        {
            x: 1, y: 1, // Start of Level 1
            id: "WELCOME_DUNGEON",

            title: "THE DARK DESCENT",
            text: "The heavy iron portcullis slams shut behind you with a final, echoing thud. The air here is thick with the scent of damp stone and ancient rot. You are now a prisoner of the Vector Dungeon, and your only way out is through the darkness.",
            once: true
        },
        {
            x: 10, y: 12,
            id: "SKELETON_WARNING",
            title: "A GRIM DISCOVERY",
            text: "You stumble upon the remains of a previous adventurer. Their bones are picked clean, and their sword is rusted beyond use. Scrawled on the wall in what looks like dried blood are the words: 'THEY NEVER SLEEP'.",
            once: true
        }
    ]
};
