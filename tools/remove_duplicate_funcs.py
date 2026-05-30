#!/usr/bin/env python3
"""Remove duplicate openPracticeMode and related functions"""

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find occurrences of openPracticeMode
func_lines = []
for i, line in enumerate(lines):
    if 'function openPracticeMode' in line:
        func_lines.append(i + 1)

print(f"Found openPracticeMode at lines: {func_lines}")

if len(func_lines) > 1:
    # We want to keep the FIRST one (around line 1485) and remove the SECOND one (around 2229)
    # The block to remove starts at the second occurrence
    start_line = func_lines[1] - 1 # 0-indexed
    
    # We need to remove openPracticeMode, closePracticeMode, startPracticeDay, exitPracticeMode
    # Identify the block end. It's likely until the end of script or showExitModal
    
    # Let's find where the next safe function starts, or </script>
    end_line = -1
    for i in range(start_line, len(lines)):
        if "function showExitModal" in lines[i]: # Keep showExitModal if it's there
            end_line = i
            break
        if "</script>" in lines[i]:
            end_line = i
            break
            
    if end_line == -1:
        end_line = len(lines)
        
    print(f"Removing duplicate block from line {start_line+1} to {end_line}")
    del lines[start_line:end_line]
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print("✓ Removed duplicate Practice Mode functions")

# Also check for duplicate showExitModal, just in case
with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    
exit_lines = []
for i, line in enumerate(lines):
    if 'function showExitModal' in line:
        exit_lines.append(i + 1)
        
print(f"Found showExitModal at lines: {exit_lines}")
if len(exit_lines) > 1:
    print("Warning: Duplicate showExitModal found. You might need another pass.")
    # Assuming the previous deletion likely handled it or kept 1, correctness check
