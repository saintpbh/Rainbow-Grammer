#!/usr/bin/env python3
"""Add Save & Exit button with reliable progress saving"""

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add CSS for Save & Exit button
save_btn_css = '''
        /* Save & Exit Button */
        .save-exit-btn {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 25px;
            font-weight: 700;
            font-size: 0.9rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(255, 82, 82, 0.3);
            transition: all 0.3s;
            z-index: 1000;
        }

        .save-exit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(255, 82, 82, 0.4);
        }

        .save-exit-btn:active {
            transform: translateY(0);
        }

        /* Exit Confirmation Modal */
        .exit-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.75);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
        }

        .exit-modal.active {
            opacity: 1;
            pointer-events: all;
        }

        .exit-modal-content {
            background: white;
            border-radius: 20px;
            padding: 2.5rem;
            max-width: 450px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .exit-modal-content h2 {
            color: var(--primary);
            margin-bottom: 1rem;
        }

        .exit-modal-content p {
            color: #546E7A;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }

        .exit-modal-buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
        }

        .exit-cancel-btn,
        .exit-confirm-btn {
            padding: 12px 28px;
            border-radius: 25px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
        }

        .exit-cancel-btn {
            background: #E0E0E0;
            color: #424242;
        }

        .exit-cancel-btn:hover {
            background: #BDBDBD;
        }

        .exit-confirm-btn {
            background: var(--primary);
            color: white;
        }

        .exit-confirm-btn:hover {
            background: #7C4DFF;
            transform: translateY(-2px);
        }

        .test-audio-btn {'''

content = content.replace(
    '.test-audio-btn {',
    save_btn_css
)

# 2. Add HTML for Save & Exit button and modal
save_btn_html = '''
    <!-- Save & Exit Button -->
    <button class="save-exit-btn" onclick="showExitModal()">💾 학습 마치기</button>

    <!-- Exit Confirmation Modal -->
    <div class="exit-modal" id="exit-modal">
        <div class="exit-modal-content">
            <h2>✨ 좋은 학습이었어요!</h2>
            <p>
                <strong>현재 진행 상황이 저장됩니다.</strong><br>
                다음에 접속하시면 바로 이어서 학습할 수 있습니다.
            </p>
            <div id="exit-info" style="background: #F5F5F5; padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem;">
                <div style="font-size: 0.9rem; color: #666;">현재 위치</div>
                <div id="exit-progress" style="font-weight: 700; color: var(--primary); margin-top: 0.5rem;"></div>
            </div>
            <div class="exit-modal-buttons">
                <button class="exit-cancel-btn" onclick="closeExitModal()">계속 학습</button>
                <button class="exit-confirm-btn" onclick="confirmExit()">저장하고 나가기</button>
            </div>
        </div>
    </div>

    <button class="test-audio-btn"'''

content = content.replace(
    '<button class="test-audio-btn"',
    save_btn_html
)

# 3. Add JavaScript functions for Save & Exit
save_exit_js = '''
        function showExitModal() {
            // Update current progress info
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

        function showExitModal() {'''

content = content.replace(
    'function showExitModal() {',
    save_exit_js
)

# 4. Make sure progress is saved on every level completion
# Enhance nextLevel function to always save
enhance_save = '''function nextLevel() {
            currentLevelGlobalIndex++;
            
            // Always save progress after completing a sentence
            saveProgress();
            
            if (currentLevelGlobalIndex >= curriculum.length) {'''

content = content.replace(
    '''function nextLevel() {
            currentLevelGlobalIndex++;
            if (currentLevelGlobalIndex >= curriculum.length) {''',
    enhance_save
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Added Save & Exit button with reliable progress saving")
print("✓ Progress now auto-saves after every sentence")
print("✓ Exit confirmation modal with current progress display")
