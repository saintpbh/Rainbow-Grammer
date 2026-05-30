#!/usr/bin/env python3
"""
Manual Sentence-by-Sentence Review & Upgrade Engine
====================================================
Rules:
  1. NEVER rewrite all sentences — only fix individual issues.
  2. Preserve the chunk structure (roles, colors).
  3. Only modify: english, korean, question, context, description fields.
  4. If english changes, chunks MUST be updated to match.
  5. Educational level calibration:
     - Level 0: 초등 1-2학년 (S+V, S+V+C, S+V+Adv, S+V+PP)
     - Level 1: 초등 3-4학년 (S+V+O with adjectives, prepositions, imperatives)
     - Level 2: 초등 5학년 (Tenses, questions, negation, present perfect)
     - Level 3: 초등 졸업 (Compound/complex sentences, conjunctions, relative clauses)
     - Level 4: 중등 1-2학년 (Idioms, inversions, emphasis, cleft sentences)
     - Level 5: 중등 졸업 (Literature, rhetoric, advanced proverbs)
     - Level 6: 고등과정 (Academic English, philosophy, sophisticated rhetoric)
"""

import json
import os
import copy


def load_file(level, week):
    fp = os.path.join(os.path.dirname(__file__), '..', 'data', f'level{level}', f'week{week}.json')
    if not os.path.exists(fp):
        return None, fp
    with open(fp, 'r', encoding='utf-8') as f:
        return json.load(f), fp


def save_file(data, fp):
    with open(fp, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def make_chunks(text_parts):
    """
    Helper: build chunks from a list of (text, role, color) tuples.
    """
    return [{"text": t, "role": r, "color": c} for t, r, c in text_parts]


# ─────────────────────────────────────────────────────────
# LEVEL 0 FIXES — Individual sentence corrections
# ─────────────────────────────────────────────────────────

LEVEL0_FIXES = {
    # Question mismatches (question doesn't match the sentence)
    "1-1-4": {"question": "What does time do?"},
    "1-1-5": {"question": "What does the wind do?"},
    "1-1-6": {"question": "What do dogs do?"},
    "1-1-7": {"question": "What do flowers do?"},
    "1-1-8": {"question": "What does water do?"},
    "1-1-9": {"question": "What does the sun do?"},
    "1-1-10": {"question": "What does the moon do?"},

    # "Rain comes" → "It rains" (more natural)
    "1-2-4": {
        "english": "It rains.",
        "korean": "비가 온다.",
        "chunks": make_chunks([("It", "Subject", "#FF0000"), ("rains", "Verb", "#FF7F00")]),
        "question": "What is happening?"
    },

    # Complement questions need to be about identity/state, not action
    "1-3-3": {"question": "What is the speaker?"},
    "1-3-4": {"question": "What are they?"},
    "1-3-5": {"question": "What is this?"},
    "1-3-6": {"question": "What is that?"},
    "1-3-7": {"question": "What is Seoul?"},
    "1-3-8": {"question": "What is Jane?"},
    "1-3-9": {"question": "What did Tom become?"},
    "1-3-10": {"question": "What are we?"},

    # "The flower smells beautiful" → collocation fix
    "1-4-5": {
        "english": "The flower smells sweet.",
        "korean": "꽃에서 달콤한 향이 난다.",
        "chunks": make_chunks([
            ("The flower", "Subject", "#FF0000"),
            ("smells", "Verb", "#FF7F00"),
            ("sweet", "Complement", "#00FF00")
        ]),
        "question": "How does the flower smell?",
        "context": "Use when describing the scent of flowers"
    },

    # Better question for Day 4 items
    "1-4-1": {"question": "What color is the sky?"},
    "1-4-2": {"question": "How does she look?"},
    "1-4-3": {"question": "How does the food taste?"},
    "1-4-4": {"question": "How does the weather feel?"},
    "1-4-6": {"question": "How does he seem?"},
    "1-4-7": {"question": "How is the room?"},
    "1-4-8": {"question": "How is the car?"},
    "1-4-9": {"question": "How does the story sound?"},
    "1-4-10": {"question": "How is the water?"},

    # Day 6 question fixes
    "1-6-1": {"question": "Where do they live?"},
    "1-6-3": {"question": "When does he wake up?"},
    "1-6-8": {"question": "When do we rest?"},
    "1-6-10": {"question": "How does he go?"},

    # Day 7 review fixes
    "1-7-1": {"question": "What does the sun do?"},
    "1-7-2": {"question": "What is the speaker?"},
    "1-7-3": {"question": "How is the weather?"},
    "1-7-6": {"question": "What do stars do?"},
}


# ─────────────────────────────────────────────────────────
# LEVEL 1 FIXES
# ─────────────────────────────────────────────────────────

LEVEL1_FIXES = {}  # Will be populated after inspection


# ─────────────────────────────────────────────────────────
# Apply fixes to a level
# ─────────────────────────────────────────────────────────

def apply_fixes(level, fixes):
    """Apply a dict of {id: {field: value}} fixes to a level's data files."""
    modified_files = set()
    fix_count = 0

    for week in range(1, 5):
        data, fp = load_file(level, week)
        if data is None:
            continue

        changed = False
        for item in data.get('curriculum', []):
            iid = item.get('id', '')
            if iid in fixes:
                for key, value in fixes[iid].items():
                    item[key] = value
                    changed = True
                fix_count += 1

        if changed:
            save_file(data, fp)
            modified_files.add(fp)

    return fix_count, modified_files


def verify_consistency(level):
    """Verify that chunks text matches english for all items in a level."""
    issues = []
    for week in range(1, 5):
        data, fp = load_file(level, week)
        if data is None:
            continue
        for item in data.get('curriculum', []):
            eng = item.get('english', '')
            chunks = item.get('chunks', [])
            if not chunks:
                continue
            reconstructed = ' '.join(c['text'] for c in chunks)
            # Normalize: remove trailing punctuation for comparison
            eng_clean = eng.rstrip('.!?').strip()
            rec_clean = reconstructed.rstrip('.!?').strip()
            if eng_clean != rec_clean:
                issues.append(f"[{item['id']}] english=\"{eng}\" vs chunks=\"{reconstructed}\"")
    return issues


if __name__ == '__main__':
    import sys

    print("=" * 60)
    print(" MANUAL SENTENCE REVIEW & UPGRADE ENGINE")
    print("=" * 60)

    # Apply Level 0 fixes
    print("\n--- Level 0: Applying fixes ---")
    count, files = apply_fixes(0, LEVEL0_FIXES)
    print(f"  Applied {count} fixes to {len(files)} files")

    # Verify Level 0
    issues = verify_consistency(0)
    if issues:
        print(f"  ⚠ Consistency issues found:")
        for i in issues:
            print(f"    {i}")
    else:
        print(f"  ✓ All chunks consistent with english text")

    # Verify all levels
    print("\n--- Full Consistency Check ---")
    total_issues = 0
    for lvl in range(7):
        issues = verify_consistency(lvl)
        if issues:
            print(f"  Level {lvl}: {len(issues)} issues")
            for i in issues[:3]:
                print(f"    {i}")
            total_issues += len(issues)
        else:
            print(f"  Level {lvl}: ✓ OK")

    print(f"\nTotal consistency issues: {total_issues}")
