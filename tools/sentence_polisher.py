#!/usr/bin/env python3
"""
Sentence Polisher — Safe, non-destructive sentence quality enhancer.
Purpose: Add missing question fields to Level 0 data only. No template overwrite.
"""

import json
import os
import re


def generate_question(english: str) -> str:
    """Generate a contextual question prompt based on the English sentence structure."""
    eng = english.strip().rstrip('.')
    lower = eng.lower()

    # Imperative sentences (commands)
    imperative_starts = [
        'run', 'sit', 'stand', 'look', 'come', 'go', 'stop', 'open', 'close',
        'read', 'write', 'eat', 'drink', 'sleep', 'wake', 'jump', 'walk',
        'sing', 'play', 'give', 'take', 'put', 'let', 'help', 'try',
        'listen', 'watch', 'wait', 'speak', 'tell', 'ask', 'clean',
        'wash', 'brush', 'turn', 'pick', 'bring', 'hold', 'push', 'pull',
        'throw', 'catch', 'draw', 'paint', 'build', 'make', 'find', 'keep',
        'show', 'move', 'start', 'finish', 'break', 'fix', 'check', 'call'
    ]
    first_word = lower.split()[0] if lower.split() else ''
    if first_word in imperative_starts and not lower.startswith('i '):
        return "What should you do?"

    # Questions (already a question)
    if english.strip().endswith('?'):
        return "Answer this question."

    # Exclamatory
    if english.strip().endswith('!'):
        return "What is being expressed?"

    # Location-based
    loc_patterns = [
        r'\b(in the|at the|on the|near the|under the|above the|behind the|beside the)\b',
        r'\b(here|there|outside|inside|upstairs|downstairs)\b',
        r'\b(school|park|house|home|kitchen|room|garden|store|office|library)\b'
    ]
    for pat in loc_patterns:
        if re.search(pat, lower):
            return "Where does this happen?"

    # Time-based
    time_patterns = [
        r'\b(yesterday|today|tomorrow|morning|evening|night|afternoon)\b',
        r'\b(always|never|sometimes|often|usually|every day|every week)\b',
        r'\b(when|after|before|during|while)\b'
    ]
    for pat in time_patterns:
        if re.search(pat, lower):
            return "When does this happen?"

    # Reason-based
    if re.search(r'\b(because|so that|in order to|since)\b', lower):
        return "Why does this happen?"

    # Emotion / state
    emotion_words = [
        'happy', 'sad', 'angry', 'tired', 'hungry', 'thirsty',
        'scared', 'excited', 'surprised', 'proud', 'love', 'like',
        'enjoy', 'miss', 'hate', 'feel', 'beautiful', 'wonderful'
    ]
    for ew in emotion_words:
        if re.search(r'\b' + ew + r'\b', lower):
            return "How does someone feel?"

    # Nature / weather
    if re.search(r'\b(rain|snow|sun|wind|cloud|weather|bloom|grow|fall|sky)\b', lower):
        return "What is happening in nature?"

    # Action / movement
    if re.search(r'\b(runs?|walks?|jumps?|flies?|swims?|dances?|plays?|drives?)\b', lower):
        return "What is happening?"

    # Subject + verb pattern: "Who/What does X?"
    # Try to extract subject
    subjects = {
        'i': "What do I do?",
        'he': "What does he do?",
        'she': "What does she do?",
        'we': "What do we do?",
        'they': "What do they do?",
        'it': "What does it do?",
        'you': "What do you do?",
    }
    if first_word in subjects:
        return subjects[first_word]

    # Possessive/description about specific things
    if re.search(r'^(the|a|an|my|your|his|her|our|their)\b', lower):
        return "What is being described?"

    # Default
    return "What is this sentence about?"


def polish_level0():
    """Add missing question fields to Level 0 data files."""
    base = os.path.join(os.path.dirname(__file__), '..', 'data', 'level0')
    weeks = ['week1.json', 'week2.json', 'week3.json', 'week4.json']

    total_fixed = 0
    for wk in weeks:
        fp = os.path.join(base, wk)
        if not os.path.exists(fp):
            continue

        with open(fp, 'r', encoding='utf-8') as f:
            data = json.load(f)

        changed = False
        for item in data.get('curriculum', []):
            if not item.get('question', '').strip():
                item['question'] = generate_question(item.get('english', ''))
                changed = True
                total_fixed += 1

        if changed:
            with open(fp, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"  ✓ {wk}: fixed {sum(1 for i in data['curriculum'] if not i.get('question','').strip() == '')} items")

    print(f"\nTotal questions added: {total_fixed}")


def full_audit():
    """Comprehensive audit of all data files."""
    base = os.path.join(os.path.dirname(__file__), '..', 'data')
    levels = [f'level{i}' for i in range(7)]
    weeks = ['week1.json', 'week2.json', 'week3.json', 'week4.json']

    total_items = 0
    issues = []

    for lvl in levels:
        for wk in weeks:
            fp = os.path.join(base, lvl, wk)
            if not os.path.exists(fp):
                continue

            with open(fp, 'r', encoding='utf-8') as f:
                data = json.load(f)

            for item in data.get('curriculum', []):
                total_items += 1
                iid = item.get('id', '?')
                eng = item.get('english', '')
                kor = item.get('korean', '')
                q = item.get('question', '')

                # Critical checks
                if not eng.strip():
                    issues.append(f"CRITICAL [{lvl}/{wk}:{iid}] Empty english")
                if not kor.strip():
                    issues.append(f"CRITICAL [{lvl}/{wk}:{iid}] Empty korean")
                if not q.strip():
                    issues.append(f"WARNING  [{lvl}/{wk}:{iid}] Empty question")

                # Broken template detection
                broken_patterns = [
                    'The the which',
                    'but we must stay focused on our goal',
                    'Under no circumstances should you forget how',
                    'The active The lovely',
                    'has been accomplished successfully',
                ]
                for bp in broken_patterns:
                    if bp in eng:
                        issues.append(f"CRITICAL [{lvl}/{wk}:{iid}] Broken template: '{bp}' in '{eng[:60]}'")

                # Structural sanity
                words = eng.split()
                if 'words' in item:
                    expected_words = item['words']
                    # Check if words array matches the sentence
                    if len(expected_words) == 0:
                        issues.append(f"WARNING  [{lvl}/{wk}:{iid}] Empty words array")

    print(f"=== FULL AUDIT REPORT ===")
    print(f"Total items scanned: {total_items}")
    print(f"Issues found: {len(issues)}")
    
    critical = [i for i in issues if i.startswith('CRITICAL')]
    warnings = [i for i in issues if i.startswith('WARNING')]
    
    print(f"  Critical: {len(critical)}")
    print(f"  Warnings: {len(warnings)}")
    
    if critical:
        print(f"\n--- CRITICAL ISSUES ---")
        for c in critical[:20]:
            print(f"  {c}")
    
    if warnings:
        print(f"\n--- WARNINGS (first 10) ---")
        for w in warnings[:10]:
            print(f"  {w}")

    return len(critical) == 0


if __name__ == '__main__':
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == 'audit':
        ok = full_audit()
        sys.exit(0 if ok else 1)
    else:
        print("Step 1: Adding missing questions to Level 0...")
        polish_level0()
        print("\nStep 2: Running full audit...")
        full_audit()
