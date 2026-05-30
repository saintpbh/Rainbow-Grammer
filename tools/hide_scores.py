#!/usr/bin/env python3
"""Hide score displays from UI (keep counting in background)"""

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the score display section in HUD and hide it with CSS
old_hud = '''            <div class="hud-right">
                <div class="score-group">
                    <span class="score-label">Today</span>
                    <span id="score-today" class="score-box">0000</span>
                </div>
                <div class="score-group">
                    <span class="score-label">Total</span>
                    <span id="score-total" class="score-box total">0000</span>
                </div>'''

new_hud = '''            <div class="hud-right" style="display: none;">
                <div class="score-group">
                    <span class="score-label">Today</span>
                    <span id="score-today" class="score-box">0000</span>
                </div>
                <div class="score-group">
                    <span class="score-label">Total</span>
                    <span id="score-total" class="score-box total">0000</span>
                </div>'''

content = content.replace(old_hud, new_hud)

# Also hide audio controls since they're in hud-right
# Move audio controls outside of hud-right
old_audio = '''                <div class="audio-controls">
                    <button class="speed-btn" onclick="changeSpeed(0.75)">0.75×</button>
                    <button class="speed-btn active" onclick="changeSpeed(1.0)">1.0×</button>
                    <button class="speed-btn" onclick="changeSpeed(1.25)">1.25×</button>
                    <button class="speed-btn" onclick="changeSpeed(1.5)">1.5×</button>
                </div>
            </div>'''

new_audio = '''            </div>
            
            <div class="audio-controls" style="position: fixed; top: 20px; right: 20px; z-index: 999;">
                <button class="speed-btn" onclick="changeSpeed(0.75)">0.75×</button>
                <button class="speed-btn active" onclick="changeSpeed(1.0)">1.0×</button>
                <button class="speed-btn" onclick="changeSpeed(1.25)">1.25×</button>
                <button class="speed-btn" onclick="changeSpeed(1.5)">1.5×</button>
            </div>'''

content = content.replace(old_audio, new_audio)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Hidden Today/Total score displays")
print("✓ Moved audio controls to top-right")
print("✓ Score counting continues in background")
