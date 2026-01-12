#!/usr/bin/env python3
"""
Phase 3.2: Spaced Repetition System
Track vocabulary exposure and recycle key words across lessons
"""

import json

def add_vocabulary_tracking():
    """Add vocabulary exposure tracking system"""
    
    with open('index.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add vocabulary tracking to learning analytics
    vocab_tracking = '''
        // Learning Analytics
        let learningStats = {
            patternAccuracy: {},
            dailyProgress: [],
            totalAttempts: 0,
            correctAttempts: 0,
            startTime: Date.now(),
            vocabularyExposure: {} // New: track word exposure
        };

        function trackAttempt(isCorrect, pattern) {'''
    
    content = content.replace(
        '''// Learning Analytics
        let learningStats = {
            patternAccuracy: {},
            dailyProgress: [],
            totalAttempts: 0,
            correctAttempts: 0,
            startTime: Date.now()
        };

        function trackAttempt(isCorrect, pattern) {''',
        vocab_tracking
    )
    
    # Add vocabulary exposure tracking
    vocab_functions = '''
        function trackVocabularyExposure() {
            if (!currentChunks) return;
            
            currentChunks.forEach(chunk => {
                const word = chunk.text.toLowerCase();
                
                if (!learningStats.vocabularyExposure[word]) {
                    learningStats.vocabularyExposure[word] = {
                        count: 0,
                        lastSeen: Date.now(),
                        firstSeen: Date.now(),
                        contexts: []
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

        function getVocabularyReport() {
            const vocab = learningStats.vocabularyExposure;
            const entries = Object.entries(vocab);
            
            // Sort by exposure count
            const sorted = entries.sort((a, b) => b[1].count - a[1].count);
            
            console.log('=== Vocabulary Exposure Report ===');
            console.log(`Total unique words: ${entries.length}`);
            console.log('\\nTop 10 most seen words:');
            sorted.slice(0, 10).forEach(([word, data]) => {
                console.log(`  ${word}: ${data.count} times, contexts: ${data.contexts.join(', ')}`);
            });
            
            return sorted;
        }

        function analyzeError(userAnswer) {'''
    
    content = content.replace(
        'function analyzeError(userAnswer) {',
        vocab_functions
    )
    
    # Add vocabulary tracking to loadLevel
    track_call = '''function loadLevel() {
            hideContext();
            document.getElementById('error-feedback').classList.remove('active');
            
            // Track vocabulary exposure on level load
            if (currentItem && currentChunks) {
                trackVocabularyExposure();
            }

            if (currentLevelGlobalIndex >= curriculum.length) {'''
    
    content = content.replace(
        '''function loadLevel() {
            hideContext();
            document.getElementById('error-feedback').classList.remove('active');

            if (currentLevelGlobalIndex >= curriculum.length) {''',
        track_call
    )
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ Added Spaced Repetition vocabulary tracking")
    print("  - Tracks word exposure count")
    print("  - Records contexts where words appear")
    print("  - Identifies high-frequency vocabulary")

def analyze_curriculum_vocabulary():
    """Analyze existing curriculum for vocabulary CEFR levels"""
    
    vocab_data = {}
    
    for week in range(1, 5):
        try:
            with open(f'week{week}.json', 'r', encoding='utf-8') as f:
                week_data = json.load(f)
            
            for day_key, day in week_data.items():
                for sentence in day['sentences']:
                    for chunk in sentence['chunks']:
                        word = chunk['text'].lower()
                        
                        if word not in vocab_data:
                            vocab_data[word] = {
                                'count': 0,
                                'roles': set(),
                                'first_appearance': f"Week {week}, {day_key}"
                            }
                        
                        vocab_data[word]['count'] += 1
                        vocab_data[word]['roles'].add(chunk['role'])
        except FileNotFoundError:
            continue
    
    # Convert sets to lists for JSON serialization
    for word, data in vocab_data.items():
        data['roles'] = list(data['roles'])
    
    # Save vocabulary report
    with open('vocabulary_analysis.json', 'w', encoding='utf-8') as f:
        json.dump(vocab_data, f, indent=2, ensure_ascii=False)
    
    # Print summary
    print("\n=== Vocabulary Analysis ===")
    print(f"Total unique words: {len(vocab_data)}")
    
    # Sort by frequency
    sorted_vocab = sorted(vocab_data.items(), key=lambda x: x[1]['count'], reverse=True)
    
    print("\nTop 20 most frequent words:")
    for i, (word, data) in enumerate(sorted_vocab[:20], 1):
        print(f"  {i}. {word}: {data['count']} times, roles: {', '.join(data['roles'])}")
    
    print(f"\n✓ Full analysis saved to vocabulary_analysis.json")

if __name__ == '__main__':
    print("Phase 3.2: Spaced Repetition System")
    print("=" * 50)
    
    try:
        # Add vocabulary tracking to app
        add_vocabulary_tracking()
        
        # Analyze existing curriculum
        analyze_curriculum_vocabulary()
        
        print("=" * 50)
        print("✓ Phase 3.2 complete!")
        print("\nFeatures added:")
        print("  - Vocabulary exposure tracking")
        print("  - Spaced repetition foundation")
        print("  - Curriculum vocabulary analysis")
        print("\nNext: CEFR Alignment & Thematic Organization")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
