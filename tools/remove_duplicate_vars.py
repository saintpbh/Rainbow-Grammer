#!/usr/bin/env python3
"""Remove duplicate isPracticeMode declaration"""

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find all occurrences
declarations = []
for i, line in enumerate(lines):
    if 'let isPracticeMode' in line:
        declarations.append(i)

print(f"Found Declarations at lines: {[d+1 for d in declarations]}")

if len(declarations) > 1:
    # Keep the first one (which we moved up), remove the others
    # Remove from bottom to top to preserve indices
    for idx in reversed(declarations[1:]):
        print(f"Removing duplicate at line {idx+1}")
        del lines[idx]
        
        # Also check if next line is 'let practiceStartIndex' and remove it too if duplicate
        if idx < len(lines) and 'let practiceStartIndex' in lines[idx]:
            print(f"Removing duplicate practiceStartIndex at line {idx+1}")
            del lines[idx]

    with open('index.html', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print("✓ Removed duplicate declarations")

# Also check for duplicate practice StartIndex separately just in case
with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_indices = []
for i, line in enumerate(lines):
    if 'let practiceStartIndex' in line:
        start_indices.append(i)

if len(start_indices) > 1:
    print(f"Found duplicate practiceStartIndex at lines: {[d+1 for d in start_indices]}")
    # Remove duplicates (keep first)
    for idx in reversed(start_indices[1:]):
        print(f"Removing duplicate practiceStartIndex at line {idx+1}")
        del lines[idx]
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("✓ Removed duplicate practiceStartIndex")


print("✓ Cleanup complete")
