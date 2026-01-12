#!/usr/bin/env python3
"""
Apply Phase 1 Critical Improvements to Rainbow Grammar
Adds: Context Bubbles (complete), Grammar Tips Modal, Keyboard Navigation
"""

def add_context_html_and_js():
    """Add context bubble HTML and JavaScript functions to index.html"""
    
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add context bubble HTML (after success overlay, before Korean text)
    context_html = '''
        <!-- Context Bubble -->
        <div class="context-bubble" id="context-bubble">
            <div class="context-icon">💡</div>
            <div class="context-content">
                <div class="context-title">When to use</div>
                <div class="context-text" id="context-text"></div>
            </div>
            <div class="context-close" onclick="hideContext()">×</div>
        </div>

        <div class="korean-text" id="question-text">'''
    
    content = content.replace(
        '<div class="korean-text" id="question-text">',
        context_html
    )
    
    # 2. Add context functions after updateProgressHUD
    context_functions = '''
        function showContext() {
            if (currentItem && currentItem.context) {
                document.getElementById('context-text').textContent = currentItem.context;
                document.getElementById('context-bubble').classList.add('active');
                
                // Auto-hide after 6 seconds
                setTimeout(() => {
                    hideContext();
                }, 6000);
            } else {
                // Hide if no context
                hideContext();
            }
        }

        function hideContext() {
            document.getElementById('context-bubble').classList.remove('active');
        }

        function updatePhase(text) {'''
    
    content = content.replace(
        'function updatePhase(text) {',
        context_functions
    )
    
    # 3. Call showContext in loadLevel
    content = content.replace(
        '// Update Progress HUD\n            updateProgressHUD();',
        '''// Update Progress HUD
            updateProgressHUD();
            
            // Show context bubble
            showContext();'''
    )
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ Added context bubble HTML and JavaScript")

def add_grammar_tips_modal():
    """Add Grammar Tips Modal CSS, HTML, and JavaScript"""
    
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add CSS for grammar modal (after context bubble CSS)
    grammar_css = '''
        /* Grammar Tips Modal */
        .grammar-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
        }

        .grammar-modal.active {
            opacity: 1;
            pointer-events: all;
        }

        .grammar-modal-content {
            background: white;
            border-radius: 20px;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            padding: 2rem;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .grammar-modal-content h2 {
            color: var(--primary);
            margin-bottom: 1rem;
            font-size: 1.8rem;
        }

        .grammar-explanation {
            background: #F5F5F5;
            padding: 1rem;
            border-radius: 12px;
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }

        .grammar-examples {
            margin-bottom: 1.5rem;
        }

        .grammar-examples h3 {
            color: #546E7A;
            font-size: 1rem;
            margin-bottom: 0.5rem;
        }

        .grammar-examples ul {
            list-style: none;
            padding: 0;
        }

        .grammar-examples li {
            background: #E8F5E9;
            padding: 0.8rem 1rem;
            margin-bottom: 0.5rem;
            border-radius: 8px;
            border-left: 3px solid #4CAF50;
        }

        .context-close:hover {'''
    
    content = content.replace(
        '.context-close:hover {',
        grammar_css
    )
    
    # 2. Add HTML (after transition modal, before progress HUD)
    grammar_html = '''
        <!-- Grammar Tips Modal -->
        <div class="grammar-modal" id="grammar-modal">
            <div class="grammar-modal-content">
                <h2 id="grammar-title">Grammar Pattern</h2>
                <div class="grammar-explanation" id="grammar-explanation"></div>
                <div class="grammar-examples">
                    <h3>Examples:</h3>
                    <ul id="grammar-examples-list"></ul>
                </div>
                <button class="ready-btn" onclick="closeGrammarModal()">Got it! Let's practice 🚀</button>
            </div>
        </div>

        <!-- Progress Tracking HUD -->'''
    
    content = content.replace(
        '<!-- Progress Tracking HUD -->',
        grammar_html
    )
    
    # 3. Add JavaScript functions
    grammar_functions = '''
        function showGrammarTip() {
            // Check if this is first sentence of a new day
            const sentenceInDay = (currentLevelGlobalIndex % 10);
            
            if (sentenceInDay === 0 && currentItem && currentItem.grammarTip) {
                const tip = currentItem.grammarTip;
                document.getElementById('grammar-title').textContent = tip.title || 'Grammar Pattern';
                document.getElementById('grammar-explanation').textContent = tip.explanation || '';
                
                const examplesList = document.getElementById('grammar-examples-list');
                examplesList.innerHTML = '';
                if (tip.examples) {
                    tip.examples.forEach(ex => {
                        const li = document.createElement('li');
                        li.textContent = ex;
                        examplesList.appendChild(li);
                    });
                }
                
                document.getElementById('grammar-modal').classList.add('active');
            }
        }

        function closeGrammarModal() {
            document.getElementById('grammar-modal').classList.remove('active');
        }

        function showContext() {'''
    
    content = content.replace(
        'function showContext() {',
        grammar_functions
    )
    
    # 4. Call showGrammarTip in loadLevel
    content = content.replace(
        '// Show context bubble\n            showContext();',
        '''// Show context bubble
            showContext();
            
            // Show grammar tip if first sentence of day
            showGrammarTip();'''
    )
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ Added Grammar Tips Modal")

def add_keyboard_navigation():
    """Add keyboard navigation for accessibility"""
    
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add CSS for keyboard focus
    keyboard_css = '''
        /* Keyboard Navigation */
        .word-pill:focus {
            outline: 3px solid var(--accent);
            outline-offset: 2px;
            box-shadow: 0 0 0 4px rgba(0, 191, 165, 0.2);
        }

        .keyboard-hints {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.75rem;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
            z-index: 1000;
        }

        .keyboard-hints.show {
            opacity: 1;
        }

        .ready-btn:hover {'''
    
    content = content.replace(
        '.ready-btn:hover {',
        keyboard_css
    )
    
    # Add HTML for keyboard hints
    keyboard_html = '''
        <div class="keyboard-hints" id="keyboard-hints">
            Tab: Navigate | Enter: Select | Backspace: Undo | Ctrl+Enter: Submit | R: Replay Audio
        </div>
    </div>

    <button class="test-audio-btn"'''
    
    content = content.replace(
        '</div>\n\n    <button class="test-audio-btn"',
        keyboard_html
    )
    
    # Add JavaScript for keyboard handling
    keyboard_js = '''
        let currentFocusIndex = -1;
        let availableChunks = [];

        function initKeyboardNavigation() {
            document.addEventListener('keydown', handleKeyDown);
            
            // Show hints on first Tab press
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    document.getElementById('keyboard-hints').classList.add('show');
                    setTimeout(() => {
                        document.getElementById('keyboard-hints').classList.remove('show');
                    }, 3000);
                }
            }, { once: true });
        }

        function handleKeyDown(e) {
            // Get all available pills
            availableChunks = Array.from(document.querySelectorAll('#pool-area .word-pill:not(.used)'));
            
            if (e.key === 'Tab') {
                e.preventDefault();
                navigateChunks(e.shiftKey ? -1 : 1);
            } else if (e.key === 'Enter' && !e.ctrlKey) {
                e.preventDefault();
                if (currentFocusIndex >= 0 && availableChunks[currentFocusIndex]) {
                    availableChunks[currentFocusIndex].click();
                }
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                e.preventDefault();
                undoLastSelection();
            } else if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                submitAnswer();
            } else if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                if (currentItem) {
                    speakSequence(currentItem.english);
                }
            } else if (e.key === 'Escape') {
                closeGrammarModal();
                hideContext();
            }
        }

        function navigateChunks(direction) {
            if (availableChunks.length === 0) return;
            
            // Remove previous focus
            if (currentFocusIndex >= 0 && availableChunks[currentFocusIndex]) {
                availableChunks[currentFocusIndex].blur();
            }
            
            // Update index
            currentFocusIndex += direction;
            if (currentFocusIndex < 0) currentFocusIndex = availableChunks.length - 1;
            if (currentFocusIndex >= availableChunks.length) currentFocusIndex = 0;
            
            // Focus new element
            if (availableChunks[currentFocusIndex]) {
                availableChunks[currentFocusIndex].focus();
                availableChunks[currentFocusIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }

        function undoLastSelection() {
            if (selectedIndices.length > 0) {
                selectedIndices.pop();
                renderAnswer();
                renderPool();
            }
        }

        function submitAnswer() {
            checkAnswer();
        }

        function closeGrammarModal() {'''
    
    content = content.replace(
        'function closeGrammarModal() {',
        keyboard_js
    )
    
    # Initialize keyboard nav on load
    content = content.replace(
        'loadGame();',
        '''loadGame();
        initKeyboardNavigation();'''
    )
    
    # Make pills focusable
    content = content.replace(
        'pill.className = \'word-pill\';',
        '''pill.className = 'word-pill';
            pill.tabIndex = 0;'''
    )
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ Added Keyboard Navigation")

def add_sample_context_data():
    """Add context field to first 10 sentences in week1.json as example"""
    import json
    
    with open('week1.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Add context to first 10 sentences (Day 1)
    contexts = [
        "Use when describing what you see in the night sky",
        "Use when describing what you hear birds doing",
        "Use when describing what babies naturally do",
        "Use when talking about how time passes quickly",
        "Use when describing weather or air movement",
        "Use when describing sounds animals make",
        "Use when describing what flowers do in spring",
        "Use when describing how water or rivers move",
        "Use when talking about what happens in the morning",
        "Use when talking about what happens at night"
    ]
    
    for i in range(min(10, len(data['curriculum']))):
        if i < len(contexts):
            data['curriculum'][i]['context'] = contexts[i]
    
    with open('week1.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("✓ Added context to first 10 sentences in week1.json")

if __name__ == '__main__':
    print("Applying Phase 1 Critical Improvements...")
    print("=" * 50)
    
    try:
        add_context_html_and_js()
        add_grammar_tips_modal()
        add_keyboard_navigation()
        add_sample_context_data()
        
        print("=" * 50)
        print("✓ All Phase 1 improvements applied successfully!")
        print("\nFeatures added:")
        print("  1. Context Bubbles (complete with sample data)")
        print("  2. Grammar Tips Modal (ready for content)")
        print("  3. Keyboard Navigation (full accessibility)")
        print("\nNext: Test at http://localhost:3001")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
