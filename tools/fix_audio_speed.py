#!/usr/bin/env python3
"""Fix audio speed control and add 1.5x option"""

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add 1.5x button to HTML
old_buttons = '''<div class="audio-controls">
                    <button class="speed-btn" onclick="changeSpeed(0.75)">0.75×</button>
                    <button class="speed-btn active" onclick="changeSpeed(1.0)">1.0×</button>
                    <button class="speed-btn" onclick="changeSpeed(1.25)">1.25×</button>
                </div>'''

new_buttons = '''<div class="audio-controls">
                    <button class="speed-btn" onclick="changeSpeed(0.75)">0.75×</button>
                    <button class="speed-btn active" onclick="changeSpeed(1.0)">1.0×</button>
                    <button class="speed-btn" onclick="changeSpeed(1.25)">1.25×</button>
                    <button class="speed-btn" onclick="changeSpeed(1.5)">1.5×</button>
                </div>'''

content = content.replace(old_buttons, new_buttons)

# 2. Fix changeSpeed function to properly handle button clicks
old_change_speed = '''function changeSpeed(rate) {
            speechRate = rate;
            
            // Update active button
            document.querySelectorAll('.speed-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Save preference
            localStorage.setItem('audio_speed', rate);
        }'''

new_change_speed = '''function changeSpeed(rate) {
            speechRate = rate;
            
            // Update active button
            document.querySelectorAll('.speed-btn').forEach(btn => {
                btn.classList.remove('active');
                // Check if this button matches the selected rate
                const btnRate = parseFloat(btn.textContent.replace('×', ''));
                if (btnRate === rate) {
                    btn.classList.add('active');
                }
            });
            
            // Save preference
            localStorage.setItem('audio_speed', rate);
            
            console.log(`✓ Audio speed set to ${rate}x`);
        }'''

content = content.replace(old_change_speed, new_change_speed)

# 3. Fix loadAudioPreference to properly set the active button
old_load = '''function loadAudioPreference() {
            const saved = localStorage.getItem('audio_speed');
            if (saved) {
                speechRate = parseFloat(saved);
                // Update button state
                document.querySelectorAll('.speed-btn').forEach(btn => {
                    if (btn.textContent.includes(saved)) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
        }'''

new_load = '''function loadAudioPreference() {
            const saved = localStorage.getItem('audio_speed');
            if (saved) {
                speechRate = parseFloat(saved);
                // Update button state
                document.querySelectorAll('.speed-btn').forEach(btn => {
                    btn.classList.remove('active');
                    const btnRate = parseFloat(btn.textContent.replace('×', ''));
                    if (btnRate === parseFloat(saved)) {
                        btn.classList.add('active');
                    }
                });
            }
        }'''

content = content.replace(old_load, new_load)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Added 1.5× speed option")
print("✓ Fixed changeSpeed function")
print("✓ Fixed button active state toggle")
print("✓ Audio speed control now works properly")
