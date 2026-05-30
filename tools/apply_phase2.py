#!/usr/bin/env python3
"""
Apply Phase 2 High Priority Improvements to Rainbow Grammar
Adds: Diagnostic Feedback, Learning Analytics, Spaced Repetition foundation
"""
import json

def add_diagnostic_feedback():
    """Add detailed error analysis and feedback system"""
    
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add CSS for error feedback
    feedback_css = '''
        /* Diagnostic Feedback */
        .error-feedback {
            background: linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%);
            border-left: 4px solid #F44336;
            border-radius: 12px;
            padding: 16px;
            margin: 1rem 0;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s;
            display: none;
        }

        .error-feedback.active {
            opacity: 1;
            transform: translateY(0);
            display: block;
        }

        .feedback-icon {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .feedback-message {
            font-size: 1rem;
            color: #C62828;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }

        .feedback-hint {
            font-size: 0.9rem;
            color: #E64A19;
            background: rgba(255, 255, 255, 0.5);
            padding: 8px 12px;
            border-radius: 8px;
            margin-top: 0.5rem;
        }

        .try-again-btn {
            background: #FF5722;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 20px;
            font-weight: 700;
            cursor: pointer;
            margin-top: 0.5rem;
            transition: all 0.2s;
        }

        .try-again-btn:hover {
            background: #E64A19;
            transform: translateY(-2px);
        }

        .keyboard-hints.show {'''
    
    content = content.replace(
        '.keyboard-hints.show {',
        feedback_css
    )
    
    # 2. Add HTML for error feedback
    feedback_html = '''
        <!-- Error Feedback -->
        <div class="error-feedback" id="error-feedback">
            <div class="feedback-icon">❌</div>
            <div class="feedback-message" id="feedback-message">Not quite right...</div>
            <div class="feedback-hint" id="feedback-hint"></div>
            <button class="try-again-btn" onclick="resetAfterError()">Try Again</button>
        </div>

        <div class="answer-area" id="answer-slot">'''
    
    content = content.replace(
        '<div class="answer-area" id="answer-slot">',
        feedback_html
    )
    
    # 3. Add error analysis JavaScript
    error_analysis_js = '''
        function analyzeError(userAnswer) {
            const correctAnswer = currentChunks;
            const feedback = {
                message: '',
                hint: ''
            };
            
            // Check word count
            if (selectedIndices.length !== correctAnswer.length) {
                if (selectedIndices.length > correctAnswer.length) {
                    feedback.message = "You have too many words!";
                    feedback.hint = `Remove ${selectedIndices.length - correctAnswer.length} word(s). The sentence needs ${correctAnswer.length} words total.`;
                } else {
                    feedback.message = "You need more words!";
                    feedback.hint = `Add ${correctAnswer.length - selectedIndices.length} more word(s). The sentence needs ${correctAnswer.length} words total.`;
                }
                return feedback;
            }
            
            // Check each position
            for (let i = 0; i < selectedIndices.length; i++) {
                const selectedIdx = selectedIndices[i];
                const correctIdx = i;
                
                if (selectedIdx !== correctIdx) {
                    feedback.message = `Check word #${i + 1}`;
                    const correctChunk = correctAnswer[correctIdx];
                    feedback.hint = `Position ${i + 1} should be a ${correctChunk.role} (${correctChunk.text})`;
                    return feedback;
                }
            }
            
            feedback.message = "Almost there!";
            feedback.hint = "Double-check the order of your words.";
            return feedback;
        }

        function showErrorFeedback(feedback) {
            document.getElementById('feedback-message').textContent = feedback.message;
            document.getElementById('feedback-hint').textContent = feedback.hint;
            document.getElementById('error-feedback').classList.add('active');
            
            // Auto-hide after 8 seconds
            setTimeout(() => {
                document.getElementById('error-feedback').classList.remove('active');
            }, 8000);
        }

        function resetAfterError() {
            document.getElementById('error-feedback').classList.remove('active');
            // Keep the selected words but allow reordering
        }

        function undoLastSelection() {'''
    
    content = content.replace(
        'function undoLastSelection() {',
        error_analysis_js
    )
    
    # 4. Modify handleChunkClick to use diagnostic feedback
    # Find the failure sound section and add feedback
    old_fail = '''playFailureSound();
        // Simple shake animation on the button?
        btnElement.style.transform = "translateX(5px)";'''
    
    new_fail = '''playFailureSound();
        
        // Show diagnostic feedback
        const feedback = analyzeError(selectedIndices);
        showErrorFeedback(feedback);
        
        // Simple shake animation on the button
        btnElement.style.transform = "translateX(5px)";'''
    
    content = content.replace(old_fail, new_fail)
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ Added Diagnostic Feedback System")

def add_learning_analytics():
    """Add learning analytics tracking and display"""
    
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add analytics tracking variables
    analytics_vars = '''
        let currentFocusIndex = -1;
        let availableChunks = [];

        // Learning Analytics
        let learningStats = {
            patternAccuracy: {},
            dailyProgress: [],
            totalAttempts: 0,
            correctAttempts: 0,
            startTime: Date.now()
        };

        function trackAttempt(isCorrect, pattern) {
            learningStats.totalAttempts++;
            if (isCorrect) learningStats.correctAttempts++;
            
            // Track pattern-specific accuracy
            if (!learningStats.patternAccuracy[pattern]) {
                learningStats.patternAccuracy[pattern] = {
                    attempts: 0,
                    correct: 0,
                    accuracy: 0
                };
            }
            
            const patternStats = learningStats.patternAccuracy[pattern];
            patternStats.attempts++;
            if (isCorrect) patternStats.correct++;
            patternStats.accuracy = Math.round((patternStats.correct / patternStats.attempts) * 100);
            
            // Save to localStorage
            localStorage.setItem('grammar_analytics', JSON.stringify(learningStats));
        }

        function loadAnalytics() {
            const saved = localStorage.getItem('grammar_analytics');
            if (saved) {
                learningStats = JSON.parse(saved);
            }
        }

        function getWeakPatterns() {
            const patterns = Object.entries(learningStats.patternAccuracy)
                .filter(([_, stats]) => stats.attempts >= 3)
                .sort((a, b) => a[1].accuracy - b[1].accuracy)
                .slice(0, 3);
            return patterns;
        }

        function showStatsModal() {
            const weak = getWeakPatterns();
            const overall = learningStats.totalAttempts > 0
                ? Math.round((learningStats.correctAttempts / learningStats.totalAttempts) * 100)
                : 0;
            
            let weakHtml = '<h3>Areas to Practice:</h3><ul>';
            weak.forEach(([pattern, stats]) => {
                weakHtml += `<li>${pattern}: ${stats.accuracy}% (${stats.correct}/${stats.attempts})</li>`;
            });
            weakHtml += '</ul>';
            
            alert(`Overall Accuracy: ${overall}%\\n\\n${weakHtml.replace(/<[^>]*>/g, '\\n')}`);
        }

        let currentFocusIndex = -1;'''
    
    content = content.replace(
        'let currentFocusIndex = -1;\n        let availableChunks = [];',
        analytics_vars
    )
    
    # 2. Track correct answers
    track_correct = '''function checkAnswer() {
            if (selectedIndices.length === currentChunks.length) {
                // Check if correct
                let isCorrect = true;
                for (let i = 0; i < selectedIndices.length; i++) {
                    if (selectedIndices[i] !== i) {
                        isCorrect = false;
                        break;
                    }
                }
                
                if (isCorrect) {
                    // Track analytics
                    const pattern = currentItem.description || 'Unknown';
                    trackAttempt(true, pattern);
                    
                    todayScore += POINTS_PER_WIN;'''
    
    content = content.replace(
        '''function checkAnswer() {
            if (selectedIndices.length === currentChunks.length) {
                // Since we enforced order in click, this is guaranteed correct
                todayScore += POINTS_PER_WIN;''',
        track_correct
    )
    
    # 3. Initialize analytics on load
    content = content.replace(
        'loadGame();\n        initKeyboardNavigation();',
        '''loadGame();
        initKeyboardNavigation();
        loadAnalytics();'''
    )
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ Added Learning Analytics Tracking")

def add_audio_speed_control():
    """Add audio speed control (Phase 3 feature, but quick to implement)"""
    
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add CSS for audio controls
    audio_css = '''
        /* Audio Speed Control */
        .audio-controls {
            display: flex;
            gap: 4px;
            align-items: center;
            margin-top: 4px;
        }

        .speed-btn {
            background: #ECEFF1;
            border: 1px solid #B0BEC5;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
        }

        .speed-btn.active {
            background: var(--accent);
            color: white;
            border-color: var(--accent);
        }

        .speed-btn:hover {
            background: #CFD8DC;
        }

        .speed-btn.active:hover {
            background: #00897B;
        }

        .score-box.total {'''
    
    content = content.replace(
        '.score-box.total {',
        audio_css
    )
    
    # Add HTML for audio controls in HUD
    audio_html = '''
                <div class="score-group">
                    <span class="score-label">Total</span>
                    <span id="score-total" class="score-box total">0000</span>
                </div>
                <div class="audio-controls">
                    <button class="speed-btn" onclick="changeSpeed(0.75)">0.75×</button>
                    <button class="speed-btn active" onclick="changeSpeed(1.0)">1.0×</button>
                    <button class="speed-btn" onclick="changeSpeed(1.25)">1.25×</button>
                </div>'''
    
    content = content.replace(
        '''<div class="score-group">
                    <span class="score-label">Total</span>
                    <span id="score-total" class="score-box total">0000</span>
                </div>''',
        audio_html
    )
    
    # Add JavaScript for speed control
    speed_js = '''
        let speechRate = 1.0;

        function changeSpeed(rate) {
            speechRate = rate;
            
            // Update active button
            document.querySelectorAll('.speed-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Save preference
            localStorage.setItem('audio_speed', rate);
        }

        function loadAudioPreference() {
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
        }

        function trackAttempt(isCorrect, pattern) {'''
    
    content = content.replace(
        'function trackAttempt(isCorrect, pattern) {',
        speed_js
    )
    
    # Update speakText to use speechRate
    old_speak = 'utterance.rate = 0.9;'
    new_speak = 'utterance.rate = speechRate || 0.9;'
    content = content.replace(old_speak, new_speak)
    
    # Load audio preference on init
    content = content.replace(
        'loadAnalytics();',
        '''loadAnalytics();
        loadAudioPreference();'''
    )
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ Added Audio Speed Control")

if __name__ == '__main__':
    print("Applying Phase 2 High Priority Improvements...")
    print("=" * 50)
    
    try:
        add_diagnostic_feedback()
        add_learning_analytics()
        add_audio_speed_control()
        
        print("=" * 50)
        print("✓ Phase 2 improvements applied successfully!")
        print("\nFeatures added:")
        print("  1. Diagnostic Feedback (specific error messages)")
        print("  2. Learning Analytics (pattern accuracy tracking)")
        print("  3. Audio Speed Control (0.75×, 1.0×, 1.25×)")
        print("\nNext: Test at http://localhost:3001")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
