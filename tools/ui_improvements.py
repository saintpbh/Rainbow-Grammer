#!/usr/bin/env python3
"""UI improvements: Remove PERFECT overlay, extend score display, hide save button on mobile"""

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove "PERFECT!" success overlay
# Comment out the success overlay activation
old_success = '''document.getElementById('success-overlay').classList.add('active');'''
new_success = '''// Success overlay removed per user request
                // document.getElementById('success-overlay').classList.add('active');'''

content = content.replace(old_success, new_success)

# 2. Extend floating score display duration by 2 seconds
# Find the floating score timeout and increase it
old_timeout = '''setTimeout(() => {
                floatingScore.remove();
            }, 2000);'''

new_timeout = '''setTimeout(() => {
                floatingScore.remove();
            }, 4000); // Extended by 2 seconds'''

content = content.replace(old_timeout, new_timeout)

# 3. Hide save/exit button on mobile with media query
mobile_css = '''
        .save-exit-btn:active {
            transform: translateY(0);
        }

        /* Hide save button on mobile */
        @media (max-width: 768px) {
            .save-exit-btn {
                display: none;
            }
        }

        /* Exit Confirmation Modal */'''

old_css = '''        .save-exit-btn:active {
            transform: translateY(0);
        }

        /* Exit Confirmation Modal */'''

content = content.replace(old_css, mobile_css)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Removed 'PERFECT!' overlay")
print("✓ Extended score display to 4 seconds (+2 sec)")
print("✓ Hide 'Save & Exit' button on mobile (< 768px)")
