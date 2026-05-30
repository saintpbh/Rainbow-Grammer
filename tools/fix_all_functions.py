#!/usr/bin/env python3
"""Fix all missing functions properly"""

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    content = ''.join(lines)

# 1. Check and add speakSequence if missing
if 'function speakSequence' not in content:
    print("Adding speakSequence function...")
    # Add before or after speakText function
    speak_sequence = '''
        async function speakSequence(text) {
            // Repeat 3 times for sensory loop
            for (let i = 0; i < 3; i++) {
                await speakText(text);
                if (i < 2) await new Promise(r => setTimeout(r, 300));
            }
        }

        function speakText(text) {'''
    
    content = content.replace('function speakText(text) {', speak_sequence)
    print("✓ Added speakSequence")

# 2. Fix openPracticeMode - make sure it exists and is in global scope
if 'function openPracticeMode' not in content:
    print("Adding Practice Mode functions...")
    
    # Find where to insert - after confirmExit function
    practice_code = '''
        function confirmExit() {
            // Force save current progress
            saveProgress();
            
            // Double-check save
            const saved = loadProgress();
            if (saved) {
                console.log('✓ Progress saved:', saved);
            }
            
            // Show confirmation and reload
            closeExitModal();
            
            // Show success message
            const container = document.getElementById('game-container');
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem;">
                    <h1 style="font-size: 3rem; margin-bottom: 1rem;">🎉</h1>
                    <h2 style="color: var(--primary); margin-bottom: 1rem;">학습이 저장되었습니다!</h2>
                    <p style="color: #666; margin-bottom: 2rem; font-size: 1.1rem;">
                        다음에 접속하시면<br>
                        <strong style="color: var(--accent);">Day ${Math.floor(currentLevelGlobalIndex / 10) + 1}, Sentence ${(currentLevelGlobalIndex % 10) + 1}</strong>부터<br>
                        이어서 학습하실 수 있습니다.
                    </p>
                    <button onclick="location.reload()" style="
                        background: var(--primary);
                        color: white;
                        border: none;
                        padding: 16px 32px;
                        border-radius: 30px;
                        font-size: 1.1rem;
                        font-weight: 700;
                        cursor: pointer;
                    ">다시 시작하기</button>
                </div>
            `;
            
            // Auto-save analytics
            if (learningStats) {
                localStorage.setItem('grammar_analytics', JSON.stringify(learningStats));
            }
        }

        // Practice Mode functions
        let isPracticeMode = false;
        let practiceStartIndex = 0;

        function openPracticeMode() {
            const currentDay = Math.floor(currentLevelGlobalIndex / 10) + 1;
            const selector = document.getElementById('day-selector');
            if (!selector) return;
            
            selector.innerHTML = '';
            
            for (let day = 1; day <= 28; day++) {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'day-option';
                
                if (day <= currentDay) {
                    dayDiv.classList.add('completed');
                    dayDiv.innerHTML = `
                        <div class="day-number">Day ${day}</div>
                        <div class="day-status">${day === currentDay ? 'Current' : '✓ Review'}</div>
                    `;
                    dayDiv.onclick = () => startPracticeDay(day);
                } else {
                    dayDiv.classList.add('locked');
                    dayDiv.innerHTML = `
                        <div class="day-number">Day ${day}</div>
                        <div class="day-status">🔒 Locked</div>
                    `;
                }
                
                selector.appendChild(dayDiv);
            }
            
            document.getElementById('practice-modal').classList.add('active');
        }

        function closePracticeMode() {
            const modal = document.getElementById('practice-modal');
            if (modal) modal.classList.remove('active');
        }

        function startPracticeDay(day) {
            isPracticeMode = true;
            practiceStartIndex = (day - 1) * 10;
            const savedIndex = currentLevelGlobalIndex;
            
            currentLevelGlobalIndex = practiceStartIndex;
            closePracticeMode();
            loadLevel();
            
            document.getElementById('level-btn').textContent = `📚 Practice: Day ${day}`;
            document.getElementById('level-btn').style.background = '#9C27B0';
            
            if (!document.getElementById('exit-practice-btn')) {
                const exitBtn = document.createElement('button');
                exitBtn.id = 'exit-practice-btn';
                exitBtn.textContent = '← Return to Main';
                exitBtn.style.cssText = `
                    position: fixed; top: 80px; right: 20px;
                    background: #424242; color: white;
                    border: none; padding: 10px 20px;
                    border-radius: 20px; cursor: pointer;
                    z-index: 1000; font-weight: 700;
                `;
                exitBtn.onclick = () => exitPracticeMode(savedIndex);
                document.body.appendChild(exitBtn);
            }
        }

        function exitPracticeMode(savedIndex) {
            isPracticeMode = false;
            currentLevelGlobalIndex = savedIndex;
            const exitBtn = document.getElementById('exit-practice-btn');
            if (exitBtn) exitBtn.remove();
            loadLevel();
        }

        function showExitModal() {'''
    
    # Find and replace confirmExit with the extended version
    old_confirm = 'function confirmExit() {'
    if old_confirm in content:
        # Find the end of confirmExit function
        start = content.find(old_confirm)
        # Find matching closing brace
        count = 0
        i = start + len(old_confirm)
        while i < len(content):
            if content[i] == '{':
                count += 1
            elif content[i] == '}':
                if count == 0:
                    break
                count -= 1
            i += 1
        
        # Replace from confirmExit to just before showExitModal
        next_func = content.find('function showExitModal() {', i)
        if next_func > i:
            content = content[:start] + practice_code + content[next_func:]
            print("✓ Added Practice Mode functions")
    
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✓ All missing functions added")
print("✓ Browser hard refresh required: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)")
