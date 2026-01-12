#!/usr/bin/env python3
"""
Phase 3.3: Vocabulary CEFR Alignment
Ensure vocabulary difficulty is appropriate for learners
"""

import json

# CEFR vocabulary levels (simplified for demonstration)
CEFR_VOCABULARY = {
    'A1': ['I', 'you', 'is', 'are', 'the', 'a', 'an', 'cat', 'dog', 'run', 'see', 'eat', 'happy', 'big', 'small',
           'sun', 'moon', 'star', 'shine', 'sleep', 'wake', 'water', 'fire', 'bird', 'tree', 'flower', 'day', 'night'],
    'A2': ['because', 'when', 'where', 'how', 'book', 'read', 'write', 'study', 'work', 'play', 'friend', 'family',
           'house', 'car', 'food', 'drink', 'want', 'need', 'like', 'love', 'think', 'know', 'understand'],
    'B1': ['although', 'however', 'therefore', 'moreover', 'achieve', 'develop', 'improve', 'manage', 'organize',
           'explain', 'describe', 'compare', 'discuss', 'consider', 'suggest', 'recommend']
}

def classify_word_cefr(word):
    """Classify a word's CEFR level"""
    word_lower = word.lower()
    
    for level in ['A1', 'A2', 'B1']:
        if word_lower in [w.lower() for w in CEFR_VOCABULARY[level]]:
            return level
    
    # Default to A1 for simple words, B1 for complex
    if len(word) <= 4:
        return 'A1'
    elif len(word) <= 7:
        return 'A2'
    else:
        return 'B1'

def analyze_curriculum_cefr():
    """Analyze curriculum vocabulary CEFR levels"""
    
    week_analysis = {}
    
    for week in range(1, 5):
        try:
            with open(f'week{week}.json', 'r', encoding='utf-8') as f:
                week_data = json.load(f)
            
            week_vocab = {'A1': 0, 'A2': 0, 'B1': 0, 'total': 0}
            week_words = []
            
            # week_data is a list of days
            for day in week_data:
                for sentence in day['sentences']:
                    for chunk in sentence['chunks']:
                        word = chunk['text']
                        level = classify_word_cefr(word)
                        week_vocab[level] += 1
                        week_vocab['total'] += 1
                        week_words.append((word, level))
            
            week_analysis[f'Week {week}'] = {
                'distribution': week_vocab,
                'a1_percentage': round(week_vocab['A1'] / week_vocab['total'] * 100, 1) if week_vocab['total'] > 0 else 0,
                'a2_percentage': round(week_vocab['A2'] / week_vocab['total'] * 100, 1) if week_vocab['total'] > 0 else 0,
                'b1_percentage': round(week_vocab['B1'] / week_vocab['total'] * 100, 1) if week_vocab['total'] > 0 else 0,
            }
            
        except Exception as e:
            print(f"Could not analyze week {week}: {e}")
            continue
    
    # Save CEFR analysis
    with open('cefr_analysis.json', 'w', encoding='utf-8') as f:
        json.dump(week_analysis, f, indent=2)
    
    print("\n=== CEFR Vocabulary Analysis ===")
    for week, data in week_analysis.items():
        print(f"\n{week}:")
        print(f"  A1 (Beginner): {data['a1_percentage']}%")
        print(f"  A2 (Elementary): {data['a2_percentage']}%")
        print(f"  B1 (Intermediate): {data['b1_percentage']}%")
        print(f"  Total words: {data['distribution']['total']}")
    
    print(f"\n✓ Full CEFR analysis saved to cefr_analysis.json")
    
    # Recommendations
    print("\n=== Recommendations ===")
    print("✓ Week 1 should be 70%+ A1 vocabulary (currently varies)")
    print("✓ Gradually increase A2/B1 vocabulary in Weeks 2-4")
    print("✓ Consider vocabulary progression: simple → complex")

def add_cefr_display():
    """Add CEFR level indicator to UI (optional)"""
    
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add CEFR metadata to vocabulary tracking
    cefr_tracking = '''
        function trackVocabularyExposure() {
            if (!currentChunks) return;
            
            currentChunks.forEach(chunk => {
                const word = chunk.text.toLowerCase();
                
                if (!learningStats.vocabularyExposure[word]) {
                    learningStats.vocabularyExposure[word] = {
                        count: 0,
                        lastSeen: Date.now(),
                        firstSeen: Date.now(),
                        contexts: [],
                        cefr: classifyWordCEFR(word) // Add CEFR classification
                    };
                }
                
                const vocab = learningStats.vocabularyExposure[word];
                vocab.count++;
                vocab.lastSeen = Date.now();
                
                // Track context (what pattern it appeared in)
                if (!vocab.contexts.includes(currentItem.section)) {
                    vocab.contexts.push(currentItem.section);
                }
            });
            
            // Save to localStorage
            localStorage.setItem('grammar_analytics', JSON.stringify(learningStats));
        }

        function classifyWordCEFR(word) {
            const a1 = ['i', 'you', 'is', 'are', 'the', 'a', 'an', 'cat', 'dog', 'run', 'see', 'eat', 'happy', 'big', 'small', 'sun', 'moon', 'star', 'shine', 'sleep', 'water', 'fire', 'bird', 'tree', 'flower'];
            const a2 = ['because', 'when', 'where', 'how', 'book', 'read', 'write', 'study', 'work', 'play', 'friend', 'house'];
            
            const lower = word.toLowerCase();
            if (a1.includes(lower)) return 'A1';
            if (a2.includes(lower)) return 'A2';
            return word.length <= 4 ? 'A1' : 'A2';
        }

        function getVocabularyReport() {'''
    
    content = content.replace(
        'function getVocabularyReport() {',
        cefr_tracking
    )
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ Added CEFR classification to vocabulary tracking")

if __name__ == '__main__':
    print("Phase 3.3: Vocabulary CEFR Alignment")
    print("=" * 50)
    
    try:
        # Analyze curriculum
        analyze_curriculum_cefr()
        
        # Add CEFR tracking to app
        add_cefr_display()
        
        print("=" * 50)
        print("✓ Phase 3.3 complete!")
        print("\nFeatures added:")
        print("  - CEFR vocabulary classification")
        print("  - Curriculum difficulty analysis")
        print("  - CEFR tracking in analytics")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
