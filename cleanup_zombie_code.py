#!/usr/bin/env python3
"""Cleanup zombie code from broken edits"""

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# We need to remove lines 1560 to 1568 (approx)
# Based on the content: 
# "                const enVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices.find(v => v.lang.startsWith('en'));"
# to
# "        }"

start_line = -1
end_line = -1

for i, line in enumerate(lines):
    if "const enVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google'))" in line:
        start_line = i
    if start_line != -1 and "});" in line and i > start_line:
        # Check if next line is close brace
        if i+1 < len(lines) and "}" in lines[i+1]:
            end_line = i + 1
            break

if start_line != -1 and end_line != -1:
    print(f"Removing zombie code from line {start_line+1} to {end_line+1}")
    del lines[start_line:end_line+1]
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    
    print("✓ Removed orphan code block")
else:
    print("Could not find exact block, trying wider context search")
    # Fallback: look for the pattern around line 1560
    # Line 1559: window.speechSynthesis.getVoices();
    # Line 1560: const enVoice ...
    
    for i, line in enumerate(lines):
        if "window.speechSynthesis.getVoices();" in line:
            # Check if next line looks like broken code
            if i+1 < len(lines) and "const enVoice =" in lines[i+1]:
                # Found it
                print(f"Found orphaned block after line {i+1}")
                # Remove from i+1 until we see `testAudio` or `speak3x`
                remove_start = i + 1
                remove_end = -1
                for j in range(remove_start, len(lines)):
                    if "window.testAudio =" in lines[j] or "async function speak3x" in lines[j]:
                        remove_end = j
                        break
                
                if remove_end != -1:
                    print(f"Removing lines {remove_start+1} to {remove_end}")
                    del lines[remove_start:remove_end]
                    
                    with open('index.html', 'w', encoding='utf-8') as f:
                        f.writelines(lines)
                    print("✓ Removed orphan code block (fallback method)")
                    break

