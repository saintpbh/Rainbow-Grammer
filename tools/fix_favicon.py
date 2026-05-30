#!/usr/bin/env python3
"""Add data URI favicon to prevent 404"""

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

if '<link rel="icon"' not in content:
    content = content.replace(
        '<title>Grammar Rainbow Game</title>',
        '<title>Grammar Rainbow Game</title>\n    <link rel="icon" href="data:;base64,iVBORw0KGgo=">'
    )
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ Added data URI favicon")
else:
    print("✓ Favicon already present")
