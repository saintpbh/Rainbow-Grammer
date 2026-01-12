import json
import os

file_path = 'week1.json'

def update_week1():
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Day 1 Questions Mapping
    questions = [
        "What do stars do?",
        "What do birds do?",
        "What do babies do?",
        "What do dogs do?",
        "What do fish do?",
        "What do you do?",   # I run
        "What do you do?",   # You sleep
        "What do we do?",    # We walk
        "What do they do?",  # They laugh
        "What do cars do?"   # Cars move
    ]

    for i, item in enumerate(data['curriculum']):
        if i < 10:
            item['question'] = questions[i]
            print(f"Updated {item['id']}: {item['question']}")
        else:
            # Placeholder for others to prevent errors if logic expects it
            # Or just leave empty to test 'no question' fallback
            pass

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print("week1.json updated successfully.")

if __name__ == "__main__":
    update_week1()
