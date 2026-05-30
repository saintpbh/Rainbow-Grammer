#!/usr/bin/env python3
"""Fix initialization and global scope issues"""

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove any existing window assignments to avoid duplication/mess
# We will add a clean block at the end
clean_assignments = '''
        // --- Initialization & Global Attachments ---
        
        // Make functions globally available for HTML onclick handlers
        window.startGame = startGame;
        window.proceedToNextLevel = proceedToNextLevel;
        window.openPracticeMode = openPracticeMode;
        window.closePracticeMode = closePracticeMode;
        window.showExitModal = showExitModal;
        window.closeExitModal = closeExitModal;
        window.confirmExit = confirmExit;
        window.startPracticeDay = startPracticeDay;
        window.exitPracticeMode = exitPracticeMode;
        window.changeSpeed = changeSpeed;
        window.testAudio = testAudio;
        
        // Start the game
        window.speechSynthesis.getVoices(); // Init voices
        loadGame();
        initKeyboardNavigation();
        loadAnalytics();
        loadAudioPreference();
        
    </script>'''

# Find the end of the script tag
if '</script>' in content:
    # Replace the end of script with our initialization block
    # We look for the last few known lines or just append before </script>
    
    # Let's verify if loadGame() is already called at the bottom. The agent said NO.
    # But let's look for existing calls to avoid double calling if I was wrong.
    
    # We will remove any potential dangling calls at the end and replace with our clean block.
    # We'll search for the last function definition and append after it.
    
    # Search for confirmExit function end
    confirm_exit_pos = content.rfind('function confirmExit() {')
    if confirm_exit_pos != -1:
        # Find the closing brace of confirmExit
        # Simple heuristic: find next function or script end
        script_end_pos = content.rfind('</script>')
        
        # We will keep content up to script_end_pos, but we need to see what's between confirmExit and script end.
        # It might be empty or have some loose code.
        # Let's just insert our block right before </script>
        
        new_content = content[:script_end_pos] + clean_assignments + content[script_end_pos+9:] # +9 is length of </script>
        
        # However, earlier edits might have left `window.speechSynthesis.getVoices();` etc. 
        # Duplicating them is fine, but cleaner to remove.
        # Let's just append. It's safer.
        
        content = content.replace('</script>', clean_assignments + '\n</body>')
        # Wait, replace </script> removes it. clean_assignments has </script>.
        
        # Let's fix the replace logic.
        content = content[:script_end_pos] + clean_assignments + content[script_end_pos+9:]
        
    else:
        # Fallback
        content = content.replace('</script>', clean_assignments)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Added global function assignments")
print("✓ Added initialization calls (loadGame, etc)")
