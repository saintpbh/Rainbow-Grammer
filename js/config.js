// Returns file paths for the given level
export const GET_LEVEL_FILES = (level) => {
    // For now, Level 0 is the full 4 weeks.
    // Level 1 sample has 1 day file.
    const baseUrl = `data/level${level}`;
    if (level === 0) {
        return [`${baseUrl}/week1.json`, `${baseUrl}/week2.json`, `${baseUrl}/week3.json`, `${baseUrl}/week4.json`];
    } else if (level === 1) {
        // Level 1: Full Curriculum
        return [`${baseUrl}/week1.json`, `${baseUrl}/week2.json`, `${baseUrl}/week3.json`, `${baseUrl}/week4.json`];
    }
    return [];
};

export const POINTS_PER_WIN = 20;

export const PRINCIPLES = {
    ACTIVE: "Active Construction",
    LOOP: "Sensory Loop (3x)",
    REVIEW: "Spaced Review"
};

export const ROLE_MAP = {
    "Subject": "S",
    "Verb": "V",
    "Object": "O",
    "Complement": "C",
    "Modifier": "M",
    "Adverb": "Adv",
    "Etc": "..."
};

export const SAVE_KEY = "grammar_rainbow_v2";
