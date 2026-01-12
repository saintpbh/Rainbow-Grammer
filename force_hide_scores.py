#!/usr/bin/env python3
"""Add CSS to hide score displays completely"""

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Add CSS rule to hide score groups
hide_score_css = '''
        /* Hide score displays */
        .score-group {
            display: none !important;
        }

        .test-audio-btn {'''

content = content.replace(
    '.test-audio-btn {',
    hide_score_css
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Added CSS to hide .score-group with !important")
print("✓ Hard refresh required: Ctrl+Shift+R")
