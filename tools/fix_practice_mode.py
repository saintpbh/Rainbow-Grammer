#!/usr/bin/env python3
"""Fix openPracticeMode function - ensure it's added correctly"""

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Check if function exists
if 'function openPracticeMode()' not in content:
    print("Function not found, adding it...")
    
    # Find a good insertion point - after showExitModal function
    practice_functions = '''
        let isPracticeMode = false;
        let practiceStartIndex = 0;

        function openPracticeMode() {
            // Calculate which days are completed
            const currentDay = Math.floor(currentLevelGlobalIndex / 10) + 1;
            const selector = document.getElementById('day-selector');
            selector.innerHTML = '';
            
            for (let day = 1; day <= 28; day++) {
                const dayDiv = document.createElement('div');
                dayDiv.className = 'day-option';
                
                if (day < currentDay) {
                    dayDiv.classList.add('completed');
                    dayDiv.onclick = () => startPracticeDay(day);
                } else if (day === currentDay) {
                    dayDiv.classList.add('completed');
                    dayDiv.innerHTML = `
                        <div class="day-number">Day ${day}</div>
                        <div class="day-status">Current</div>
                    `;
                    dayDiv.onclick = () => startPracticeDay(day);
                } else {
                    dayDiv.classList.add('locked');
                    dayDiv.innerHTML = `
                        <div class="day-number">Day ${day}</div>
                        <div class="day-status">🔒 Locked</div>
                    `;
                }
                
                if (day < currentDay || day === currentDay) {
                    dayDiv.innerHTML = `
                        <div class="day-number">Day ${day}</div>
                        <div class="day-status">✓ Review</div>
                    `;
                }
                
                selector.appendChild(dayDiv);
            }
            
            document.getElementById('practice-modal').classList.add('active');
        }

        function closePracticeMode() {
            document.getElementById('practice-modal').classList.remove('active');
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
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    background: #424242;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 20px;
                    cursor: pointer;
                    z-index: 1000;
                    font-weight: 700;
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
    
    content = content.replace(
        'function showExitModal() {',
        practice_functions
    )
    
    # Also modify nextLevel to handle practice mode properly
    if 'if (isPracticeMode)' not in content:
        old_next = '''function nextLevel() {
            currentLevelGlobalIndex++;
            
            // Don't save progress in practice mode
            if (!isPracticeMode) {
                saveProgress();
            }'''
        
        new_next = '''function nextLevel() {
            currentLevelGlobalIndex++;
            
            // Don't save progress in practice mode
            if (!isPracticeMode) {
                saveProgress();
            }
            
            // Check if practice day is complete
            if (isPracticeMode) {
                const sentencesInPractice = currentLevelGlobalIndex - practiceStartIndex;
                if (sentencesInPractice >= 10) {
                    alert('Practice Day Complete! 🎉');
                    const exitBtn = document.getElementById('exit-practice-btn');
                    if (exitBtn) exitBtn.click();
                    return;
                }
            }'''
        
        content = content.replace(old_next, new_next)
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ Added practice mode functions")
else:
    print("✓ Functions already exist")
