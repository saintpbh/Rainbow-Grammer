#!/usr/bin/env python3
"""Remove duplicate trackVocabularyExposure function"""

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find all lines with the function declaration
duplicates = []
for i, line in enumerate(lines):
    if 'function trackVocabularyExposure' in line:
        duplicates.append(i + 1)  # 1-indexed

print(f"Found trackVocabularyExposure at lines: {duplicates}")

if len(duplicates) > 1:
    print(f"Removing duplicate at line {duplicates[1]}")
    
    # Find the end of the second function (matching closing brace)
    start = duplicates[1] - 1  # Convert to 0-indexed
    
    # Count braces to find function end
    brace_count = 0
    end = start
    found_opening = False
    
    for i in range(start, len(lines)):
        for char in lines[i]:
            if char == '{':
                brace_count += 1
                found_opening = True
            elif char == '}':
                brace_count -= 1
                if found_opening and brace_count == 0:
                    end = i
                    break
        if found_opening and brace_count == 0:
            break
    
    # Remove lines from start to end (inclusive)
    print(f"Removing lines {start+1} to {end+1}")
    del lines[start:end+2]  # +2 to include the closing brace line and potential blank line
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print("✓ Removed duplicate function")
else:
    print("✓ No duplicate found (may need hard refresh)")
