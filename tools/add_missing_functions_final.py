#!/usr/bin/env python3
"""Add missing functions at the end of script section"""

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the closing script tag
script_end = content.rfind('</script>')

if script_end == -1:
    print("ERROR: Could not find </script> tag")
    exit(1)

# Add the missing functions before </script>
missing_functions = '''
        // Exit Modal functions
        function showExitModal() {
            const currentDay = Math.floor(currentLevelGlobalIndex / 10) + 1;
            const sentenceInDay = (currentLevelGlobalIndex % 10) + 1;
            const currentWeek = Math.ceil(currentDay / 7);
            
            document.getElementById('exit-progress').innerHTML = `
                Day ${currentDay} of 28 (Week ${currentWeek})<br>
                Sentence ${sentenceInDay} of 10<br>
                <span style="color: #00BFA5;">Total Score: ${totalScore}</span>
            `;
            
            document.getElementById('exit-modal').classList.add('active');
        }

        function closeExitModal() {
            document.getElementById('exit-modal').classList.remove('active');
        }

        function confirmExit() {
            saveProgress();
            closeExitModal();
            
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

    </script>'''

# Insert functions before </script>
content = content[:script_end] + missing_functions + content[script_end:]

# Move one </script> that's now duplicated
content = content.replace('</script>\n    </script>', '</script>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Added all missing functions before </script>")
print("✓ showExitModal(), closeExitModal(), confirmExit()")
print("✓ openPracticeMode(), closePracticeMode(), startPracticeDay(), exitPracticeMode()")
