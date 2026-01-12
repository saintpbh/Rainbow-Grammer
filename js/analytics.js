export let learningStats = {
    patternAccuracy: {},
    dailyProgress: [],
    totalAttempts: 0,
    correctAttempts: 0,
    startTime: Date.now(),
    vocabularyExposure: {}
};

export function loadAnalytics() {
    const saved = localStorage.getItem('grammar_analytics');
    if (saved) {
        learningStats = JSON.parse(saved);
        // Ensure vocabularyExposure exists for migrated data
        if (!learningStats.vocabularyExposure) {
            learningStats.vocabularyExposure = {};
        }
    }
}

export function trackAttempt(isCorrect, pattern) {
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

export function trackVocabularyExposure(currentChunks, currentSection) {
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
        if (!vocab.contexts.includes(currentSection)) {
            vocab.contexts.push(currentSection);
        }
    });

    // Save to localStorage
    localStorage.setItem('grammar_analytics', JSON.stringify(learningStats));
}

export function classifyWordCEFR(word) {
    const a1 = ['i', 'you', 'is', 'are', 'the', 'a', 'an', 'cat', 'dog', 'run', 'see', 'eat', 'happy', 'big', 'small', 'sun', 'moon', 'star', 'shine', 'sleep', 'water', 'fire', 'bird', 'tree', 'flower'];
    const a2 = ['because', 'when', 'where', 'how', 'book', 'read', 'write', 'study', 'work', 'play', 'friend', 'house'];

    const lower = word.toLowerCase();
    if (a1.includes(lower)) return 'A1';
    if (a2.includes(lower)) return 'A2';
    return word.length <= 4 ? 'A1' : 'A2';
}

export function getVocabularyReport() {
    const vocab = learningStats.vocabularyExposure;
    const entries = Object.entries(vocab);

    // Sort by exposure count
    const sorted = entries.sort((a, b) => b[1].count - a[1].count);

    console.log('=== Vocabulary Exposure Report ===');
    console.log(`Total unique words: ${entries.length}`);
    console.log('\nTop 10 most seen words:');
    sorted.slice(0, 10).forEach(([word, data]) => {
        console.log(`  ${word}: ${data.count} times, contexts: ${data.contexts.join(', ')}`);
    });

    return sorted;
}

export function getWeakPatterns() {
    const patterns = Object.entries(learningStats.patternAccuracy)
        .filter(([_, stats]) => stats.attempts >= 3)
        .sort((a, b) => a[1].accuracy - b[1].accuracy)
        .slice(0, 3);
    return patterns;
}

export function showStatsModal() {
    const weak = getWeakPatterns();
    const overall = learningStats.totalAttempts > 0
        ? Math.round((learningStats.correctAttempts / learningStats.totalAttempts) * 100)
        : 0;

    let weakHtml = '<h3>Areas to Practice:</h3><ul>';
    weak.forEach(([pattern, stats]) => {
        weakHtml += `<li>${pattern}: ${stats.accuracy}% (${stats.correct}/${stats.attempts})</li>`;
    });
    weakHtml += '</ul>';

    alert(`Overall Accuracy: ${overall}%\n\n${weakHtml.replace(/<[^>]*>/g, '\n')}`);
}
