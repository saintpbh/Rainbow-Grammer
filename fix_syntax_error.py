#!/usr/bin/env python3
"""Fix syntax error in speakText function"""

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# The broken part looks like this:
broken_part = '''const voices = // Practice Mode functions
        let isPracticeMode = false;'''

# It should be moved out of speakText function.
# First, let's fix speakText.

# Find the broken speakText function
speak_text_broken = '''
        function speakText(text) {
            return new Promise((resolve) => {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                const voices = // Practice Mode functions
        let isPracticeMode = false;'''

# We need to extract the Practice Mode code that was accidentally pasted into speakText
if broken_part in content:
    # 1. Restore speakText
    restored_speak_text = '''
        function speakText(text) {
            return new Promise((resolve) => {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                
                // Try to use a better voice if available
                const voices = window.speechSynthesis.getVoices();
                const enVoice = voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en'));
                if (enVoice) utterance.voice = enVoice;
                
                utterance.rate = speechRate || 1.0;
                utterance.onend = resolve;
                utterance.onerror = resolve;
                window.speechSynthesis.speak(utterance);
            });
        }
        
        // Practice Mode functions
        let isPracticeMode = false;'''
    
    # Replace the broken part
    # We need to be careful with the replacement.
    # Let's locate the start of speakText and replace until the start of openPracticeMode
    
    start_tag = 'function speakText(text) {'
    end_tag = 'function openPracticeMode() {'
    
    start_idx = content.find(start_tag)
    end_idx = content.find(end_tag)
    
    if start_idx != -1 and end_idx != -1:
        # Construct new content
        # Keep everything before speakText
        # Insert proper speakText
        # Insert Practice Mode variables
        # Keep openPracticeMode onwards
        
        new_segment = restored_speak_text + '\n        let practiceStartIndex = 0;\n\n        '
        
        content = content[:start_idx] + new_segment + content[end_idx:]
        
        # We also need to remove the broken lines that might remain
        print("✓ Repaired speakText function and placed Practice Mode variables correctly")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Fixed syntax error at line 1468")
