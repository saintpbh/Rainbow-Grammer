#!/usr/bin/env python3
"""
Phase 3: Medium Priority Features
1. Practice Mode - Review completed days
2. Spaced Repetition - Track and recycle vocabulary
3. Vocabulary CEFR Alignment - Ensure appropriate difficulty
4. Thematic Organization - Begin Week 1 reorganization
"""

def add_practice_mode():
    """Add Practice Mode for reviewing completed days"""
    
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add CSS for Practice Mode
    practice_css = '''
        /* Practice Mode */
        .practice-mode-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 30px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(156, 39, 176, 0.3);
            transition: all 0.3s;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .practice-mode-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 16px rgba(156, 39, 176, 0.4);
        }

        .practice-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 4000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
        }

        .practice-modal.active {
            opacity: 1;
            pointer-events: all;
        }

        .practice-modal-content {
            background: white;
            border-radius: 24px;
            padding: 2.5rem;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        }

        .practice-modal-content h2 {
            color: var(--primary);
            margin-bottom: 1.5rem;
        }

        .day-selector {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 12px;
            margin-bottom: 2rem;
        }

        .day-option {
            background: #F5F5F5;
            border: 2px solid #E0E0E0;
            border-radius: 12px;
            padding: 16px 12px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }

        .day-option:hover {
            background: #E8F5E9;
            border-color: #4CAF50;
        }

        .day-option.completed {
            background: #E8F5E9;
            border-color: #4CAF50;
        }

        .day-option.locked {
            opacity: 0.4;
            cursor: not-allowed;
        }

        .day-option.locked:hover {
            background: #F5F5F5;
            border-color: #E0E0E0;
        }

        .day-number {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--primary);
        }

        .day-status {
            font-size: 0.7rem;
            color: #666;
            margin-top: 4px;
        }

        .practice-buttons {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }

        .exit-modal.active {'''
    
    content = content.replace(
        '.exit-modal.active {',
        practice_css
    )
    
    # 2. Add HTML for Practice Mode
    practice_html = '''
    <!-- Practice Mode Button -->
    <button class="practice-mode-btn" onclick="openPracticeMode()">
        📚 Practice Mode
    </button>

    <!-- Practice Mode Modal -->
    <div class="practice-modal" id="practice-modal">
        <div class="practice-modal-content">
            <h2>📚 Practice Mode</h2>
            <p style="color: #666; margin-bottom: 1.5rem;">
                Choose a day to review. You can practice any completed day without affecting your progress.
            </p>
            <div class="day-selector" id="day-selector"></div>
            <div class="practice-buttons">
                <button class="exit-cancel-btn" onclick="closePracticeMode()">Cancel</button>
            </div>
        </div>
    </div>

    <!-- Save & Exit Button -->'''
    
    content = content.replace(
        '<!-- Save & Exit Button -->',
        practice_html
    )
    
    # 3. Add JavaScript for Practice Mode
    practice_js = '''
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
            practiceStartIndex = (day - 1) * 10; // Each day has 10 sentences
            
            // Save current progress
            const savedIndex = currentLevelGlobalIndex;
            
            // Load practice day
            currentLevelGlobalIndex = practiceStartIndex;
            closePracticeMode();
            loadLevel();
            
            // Show practice mode indicator
            document.getElementById('level-btn').textContent = `📚 Practice: Day ${day}`;
            document.getElementById('level-btn').style.background = '#9C27B0';
            
            // Add exit practice button
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
                `;
                exitBtn.onclick = () => exitPracticeMode(savedIndex);
                document.body.appendChild(exitBtn);
            }
        }

        function exitPracticeMode(savedIndex) {
            isPracticeMode = false;
            currentLevelGlobalIndex = savedIndex;
            
            // Remove practice button
            const exitBtn = document.getElementById('exit-practice-btn');
            if (exitBtn) exitBtn.remove();
            
            // Restore normal mode
            loadLevel();
        }

        function showExitModal() {'''
    
    content = content.replace(
        'function showExitModal() {',
        practice_js
    )
    
    # 4. Modify nextLevel to handle practice mode
    old_next = '''function nextLevel() {
            currentLevelGlobalIndex++;
            
            // Always save progress after completing a sentence
            saveProgress();'''
    
    new_next = '''function nextLevel() {
            currentLevelGlobalIndex++;
            
            // Don't save progress in practice mode
            if (!isPracticeMode) {
                saveProgress();
            }
            
            // Check if practice day is complete (10 sentences)
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
    
    print("✓ Added Practice Mode")
    print("  - Day selector with completion status")
    print("  - Practice without affecting progress")
    print("  - Return to main mode button")

if __name__ == '__main__':
    print("Applying Phase 3 Features...")
    print("=" * 50)
    
    try:
        add_practice_mode()
        
        print("=" * 50)
        print("✓ Phase 3.1 (Practice Mode) complete!")
        print("\nNext steps:")
        print("  2. Spaced Repetition (vocabulary tracking)")
        print("  3. Vocabulary CEFR Alignment")
        print("  4. Thematic Organization")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
