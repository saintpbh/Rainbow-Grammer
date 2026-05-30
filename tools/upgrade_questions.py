#!/usr/bin/env python3
"""
Phase 2: Intelligent Question Upgrade for Levels 1-6
=====================================================
Replaces generic "Translate" / "Review Time" / "Review" questions
with context-appropriate, pedagogically meaningful questions.

Educational Philosophy:
- Level 0: "What does X do?" (simple comprehension)
- Level 1: "What do you see/feel?" (sensory + vocabulary)
- Level 2: "What happened?" / "When/Where?" (tense awareness)
- Level 3: "Why/How?" / "Connect the ideas" (logic + causality)
- Level 4: "What does this expression mean?" (idiom interpretation)
- Level 5: "What is the main idea?" (reading comprehension)
- Level 6: "What is the speaker's message?" (rhetoric analysis)
"""

import json
import os
import re

BASE = os.path.join(os.path.dirname(__file__), '..', 'data')


def load(level, week):
    fp = os.path.join(BASE, f'level{level}', f'week{week}.json')
    if not os.path.exists(fp):
        return None, fp
    with open(fp, 'r', encoding='utf-8') as f:
        return json.load(f), fp


def save(data, fp):
    with open(fp, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ─────────────────────────────────────────────────────────
# Level 1 Questions (초등 3-4학년): Vocabulary + Sensory
# ─────────────────────────────────────────────────────────

def generate_l1_question(item):
    eng = item['english']
    lower = eng.lower().rstrip('.!?')
    chunks = item.get('chunks', [])
    roles = [c.get('role', '') for c in chunks]

    # Imperatives
    first = lower.split()[0] if lower.split() else ''
    imperative_verbs = ['study', 'speak', 'listen', 'come', 'start', 'run',
                        'sit', 'stand', 'look', 'open', 'close', 'stop',
                        'wait', 'go', 'put', 'take', 'pick', 'turn', 'clean',
                        'wash', 'move', 'finish', 'read', 'write', 'eat']
    if first in imperative_verbs or (len(chunks) <= 2 and 'Subject' not in roles):
        return "What should you do?"

    # Questions
    if eng.strip().endswith('?'):
        return "Answer this question."

    # Size/Shape adjectives
    size_words = ['big', 'small', 'tall', 'short', 'long', 'wide', 'narrow',
                  'thick', 'thin', 'huge', 'tiny', 'large']
    for w in size_words:
        if re.search(r'\b' + w + r'\b', lower):
            return "What does it look like?"

    # Feeling/Emotion
    feeling_words = ['happy', 'sad', 'angry', 'excited', 'tired', 'hungry',
                     'thirsty', 'scared', 'brave', 'proud']
    for w in feeling_words:
        if re.search(r'\b' + w + r'\b', lower):
            return "How does someone feel?"

    # Sensory adjectives
    sensory = ['hot', 'cold', 'sweet', 'spicy', 'soft', 'hard', 'loud',
               'quiet', 'rough', 'smooth', 'warm', 'cool']
    for w in sensory:
        if re.search(r'\b' + w + r'\b', lower):
            return "How does it feel?"

    # Location
    if re.search(r'\b(in|at|on|under|behind|near|to|from|into)\s+(the\s+)?\w+', lower):
        return "Where does this happen?"

    # Time
    if re.search(r'\b(early|late|tomorrow|yesterday|daily|soon|always|never|before|now)\b', lower):
        return "When does this happen?"

    # Default for S+V+O
    if 'Object' in roles:
        subj = chunks[0]['text'] if chunks else 'they'
        return f"What does {subj.lower()} do?"

    return "What is happening?"


# ─────────────────────────────────────────────────────────
# Level 2 Questions (초등 5학년): Tense Awareness
# ─────────────────────────────────────────────────────────

def generate_l2_question(item):
    eng = item['english']
    lower = eng.lower().rstrip('.!?')

    # Questions
    if eng.strip().endswith('?'):
        return "Answer this question."

    # Imperatives / suggestions
    if lower.startswith("let's") or lower.startswith("don't"):
        return "What is suggested?"

    # Past tense
    past_markers = ['yesterday', 'last week', 'last month', 'ago', 'before']
    if any(m in lower for m in past_markers):
        return "What happened in the past?"

    # Past tense verbs
    if re.search(r'\b(visited|played|watched|cleaned|danced|rained|cooked|studied|arrived|loved|went|came|saw|ate|drank|got|made|took|gave|found|lost|told|said|wrote|read|knew|thought|left|met|bought|sold|sent|built|ran|swam|broke|chose|forgot|spoke|taught|learned|heard|felt|hit|hurt|shut|cut|put|set|sang|sat|stood|won|wore|woke|drove|flew|grew|drew|threw|caught|brought|fought|held|kept|slept|paid|began|became|fell|forgot|understood|grew)\b', lower):
        return "What happened?"

    # Future
    if re.search(r'\b(will|going to|shall)\b', lower):
        return "What will happen?"

    # Present perfect
    if re.search(r'\b(have|has)\s+(been|done|gone|seen|made|had|taken|given|found|said|come|known|got|left|thought|told|called|tried|asked|needed|become|kept|let|begun|seemed|helped|shown|heard|turned|played|run|moved|lived|believed)\b', lower):
        return "What has happened so far?"

    # Progressive
    if re.search(r'\b(am|is|are|was|were)\s+\w+ing\b', lower):
        return "What is happening right now?"

    # Negation
    if re.search(r"\b(not|n't|never|no one|nothing|nowhere)\b", lower):
        return "What is NOT the case?"

    # Passive
    if re.search(r'\b(was|were|is|are|been|be|get|got)\s+(made|built|written|called|given|taken|seen|told|asked|used|found|kept|broken|done|left|held|brought|known|shown|sent)\b', lower):
        return "What was done?"

    return "What is this sentence about?"


# ─────────────────────────────────────────────────────────
# Level 3 Questions (초등 졸업): Logic & Causality
# ─────────────────────────────────────────────────────────

def generate_l3_question(item):
    eng = item['english']
    lower = eng.lower().rstrip('.!?')

    if eng.strip().endswith('?'):
        return "Answer this question."

    # Conjunctions — cause/effect
    if re.search(r'\b(because|since|so)\b', lower):
        return "Why did this happen?"

    # Contrast
    if re.search(r'\b(but|however|although|even though|yet|while)\b', lower):
        return "What is the contrast?"

    # Condition
    if re.search(r'\bif\b', lower):
        return "What is the condition?"

    # Time clauses
    if re.search(r'\b(when|before|after|while|until|as soon as)\b', lower):
        return "When does this happen?"

    # Relative clauses
    if re.search(r'\b(who|which|that|where|whose|whom)\b', lower):
        return "Who or what is described?"

    # "and" compound
    if ' and ' in lower:
        return "What two things are connected?"

    # "or" choice
    if ' or ' in lower:
        return "What are the choices?"

    # Superlative
    if re.search(r'\b(best|worst|most|least|biggest|smallest|tallest)\b', lower):
        return "Which one stands out?"

    return "What is the main idea?"


# ─────────────────────────────────────────────────────────
# Level 4 Questions (중등 1-2): Idiom Interpretation
# ─────────────────────────────────────────────────────────

def generate_l4_question(item):
    eng = item['english']
    lower = eng.lower().rstrip('.!?')
    section = item.get('section', '')
    desc = item.get('description', '')

    if eng.strip().endswith('?'):
        return "Answer this question."

    # Phrasal verbs (Day 1-7 roughly)
    phrasal_verbs = ['get up', 'turn on', 'turn off', 'give up', 'pick up',
                     'put on', 'take off', 'wake up', 'come in', 'look at',
                     'look up', 'look for', 'run away', 'go on', 'work out',
                     'find out', 'set up', 'break down', 'bring up', 'hang out',
                     'check out', 'watch out', 'hold on', 'go over', 'come up']
    for pv in phrasal_verbs:
        if pv in lower:
            return "What does this phrasal verb mean?"

    # Idioms
    idiom_phrases = ['piece of cake', 'break a leg', 'hit the road', 'under the weather',
                     'spill the beans', 'cost an arm and a leg', 'breeze', 'raining cats',
                     'steal my thunder', 'kill the cat', 'cry over spilt milk',
                     'chickens before', 'wrap your head', 'when pigs fly',
                     'once in a blue moon', 'blessing in disguise', 'best of both worlds',
                     'speak of the devil', 'see eye to eye', 'miss the boat',
                     'burn the midnight oil', 'bite the bullet', 'barking up the wrong']
    for idm in idiom_phrases:
        if idm in lower:
            return "What does this idiom really mean?"

    # Proverbs / wisdom
    proverb_markers = ['better late', 'easier said', 'actions speak', 'practice makes',
                       'the pen is', 'knowledge is', 'every cloud', 'the early bird',
                       'two heads', 'rome was', 'look before', 'stitch in time',
                       'the apple doesn', 'laughter is', 'where there is']
    for pm in proverb_markers:
        if pm in lower:
            return "What lesson does this teach?"

    # Comparisons / the more... the more
    if re.search(r'\bthe\s+\w+er.*the\s+\w+er\b', lower) or 'the more' in lower or 'the less' in lower:
        return "What is the relationship described?"

    # Inversions / Emphasis
    if re.search(r'^(not only|never|hardly|seldom|rarely|little|up went|down came|here comes|there goes)', lower):
        return "What is being emphasized?"

    # Nominal subjects (What I... / All I...)
    if re.search(r'^(what\s+i|all\s+i|the\s+thing)', lower):
        return "What matters most?"

    return "What is the meaning?"


# ─────────────────────────────────────────────────────────
# Level 5 Questions (중등 졸업): Reading Comprehension
# ─────────────────────────────────────────────────────────

def generate_l5_question(item):
    eng = item['english']
    lower = eng.lower().rstrip('.!?')
    section = item.get('section', '')
    q = item.get('question', '')

    # Keep existing good questions
    if q and q not in ('Translate', 'Review', 'Review Time'):
        return q

    # News topics
    if any(kw in section for kw in ['News', 'Economy', 'Tech', 'Eco', 'Politics']):
        return "What is the news about?"

    # Speeches / Quotes
    if any(kw in section for kw in ['Jobs', 'Graduation', 'Wisdom', 'Shakespeare']):
        return "What is the speaker's message?"

    # Literature
    if 'Lit' in q or 'Shakespeare' in section:
        return "What does the author mean?"

    return "What is the main point?"


# ─────────────────────────────────────────────────────────
# Level 6 Questions (고등과정): Rhetoric Analysis
# ─────────────────────────────────────────────────────────

def generate_l6_question(item):
    eng = item['english']
    lower = eng.lower().rstrip('.!?')
    section = item.get('section', '')
    desc = item.get('description', '')
    q = item.get('question', '')

    # Keep existing well-formed questions
    if q and q not in ('Translate', 'Review', 'Review Time'):
        return q

    # Famous speeches
    if any(kw in desc for kw in ['Persuasion', 'Leadership', 'Philosopher', 'Emotional']):
        return "What is the deeper meaning?"

    if re.search(r'\b(dream|hope|freedom|justice|truth|courage|wisdom|love|beauty|power)\b', lower):
        return "What ideal is expressed here?"

    if re.search(r'\b(must|shall|should|cannot|let us|we must)\b', lower):
        return "What is being urged?"

    if re.search(r'\b(never|always|only|every|no one|nothing)\b', lower):
        return "What absolute claim is made?"

    return "What is the core message?"


# ─────────────────────────────────────────────────────────
# Main execution
# ─────────────────────────────────────────────────────────

GENERATORS = {
    1: generate_l1_question,
    2: generate_l2_question,
    3: generate_l3_question,
    4: generate_l4_question,
    5: generate_l5_question,
    6: generate_l6_question,
}


def upgrade_questions():
    total_upgraded = 0

    for level in range(1, 7):
        gen = GENERATORS[level]
        level_count = 0

        for week in range(1, 5):
            data, fp = load(level, week)
            if data is None:
                continue

            changed = False
            for item in data.get('curriculum', []):
                q = item.get('question', '')
                # Only upgrade generic questions
                if q in ('Translate', 'Review', 'Review Time', ''):
                    new_q = gen(item)
                    if new_q != q:
                        item['question'] = new_q
                        changed = True
                        level_count += 1

            if changed:
                save(data, fp)

        total_upgraded += level_count
        print(f"  Level {level}: upgraded {level_count} questions")

    print(f"\nTotal questions upgraded: {total_upgraded}")


def audit_questions():
    """Show question distribution per level."""
    for level in range(7):
        q_dist = {}
        total = 0
        for week in range(1, 5):
            data, fp = load(level, week)
            if data is None:
                continue
            for item in data.get('curriculum', []):
                total += 1
                q = item.get('question', '(empty)')
                if q not in q_dist:
                    q_dist[q] = 0
                q_dist[q] += 1

        print(f"\nLevel {level} ({total} items):")
        for q, c in sorted(q_dist.items(), key=lambda x: -x[1])[:8]:
            print(f"  [{c:3d}x] {q}")


if __name__ == '__main__':
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == 'audit':
        audit_questions()
    else:
        print("Phase 2: Upgrading question fields...")
        upgrade_questions()
        print("\n--- Question Distribution After Upgrade ---")
        audit_questions()
