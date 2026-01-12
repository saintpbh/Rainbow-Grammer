#!/usr/bin/env python3
"""Cleanup script structure and fix double closing tags"""

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix double </script>
content = content.replace('</script></script>', '</script>')

# 2. Move Practice Mode functions up to ensure they are loaded
# Define the block of code to move
practice_block_start = '// Practice Mode functions'
practice_code = ''

if practice_block_start in content:
    start_idx = content.find(practice_block_start)
    end_idx = content.rfind('</script>')
    
    if start_idx != -1 and end_idx != -1:
        # Extract the block
        practice_code = content[start_idx:end_idx]
        # Remove it from the bottom
        content = content[:start_idx] + content[end_idx:]

# Insert it earlier, e.g., before window.speechSynthesis
insert_point = 'window.speechSynthesis.getVoices();'
if insert_point in content and practice_code:
    content = content.replace(insert_point, practice_code + '\n        ' + insert_point)
    print("✓ Moved Practice Mode functions up")

# 3. Ensure showExitModal is also available
# It was added in the same block as Practice Mode functions in previous fixes
# So moving the block should handle it.

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed double </script> tag")
print("✓ Reorganized script structure")
