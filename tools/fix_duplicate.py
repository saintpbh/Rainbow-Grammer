#!/usr/bin/env python3
"""Fix duplicate currentFocusIndex declaration"""

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find and remove the duplicate at line 1415 (0-indexed: 1414)
# The duplicate is "        let currentFocusIndex = -1;\n"

if len(lines) > 1414:
    line_1415 = lines[1414]
    if 'let currentFocusIndex = -1;' in line_1415:
        # Remove this line
        del lines[1414]
        print(f"✓ Removed duplicate declaration at line 1415")
    else:
        print(f"Line 1415 content: {line_1415}")
        print("Duplicate not found at expected location")

# Write back
with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("✓ File updated successfully")
