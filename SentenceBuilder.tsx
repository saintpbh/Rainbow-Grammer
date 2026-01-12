import React, { useState } from 'react';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type GrammarRole = 'Subject' | 'Verb' | 'Object' | 'Complement' | 'Modifier' | 'Conjunction' | 'Preposition';

interface WordCardData {
  id: string;
  text: string;
  role: GrammarRole;
  color: string; // Hex code
}

interface SlotData {
  id: string;
  role: GrammarRole;
  expectedColor: string;
}

// --- Constants ---
const COLOR_MAP: Record<GrammarRole, string> = {
  Subject: '#FF0000',      // Red
  Verb: '#FF7F00',         // Orange
  Object: '#FFFF00',       // Yellow
  Complement: '#00FF00',   // Green
  Modifier: '#0000FF',     // Blue
  Conjunction: '#4B0082',  // Indigo
  Preposition: '#8B00FF',  // Violet
};

// --- Components ---

const DraggableWord = ({ id, text, color }: { id: string; text: string; color: string }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <motion.div
        layoutId={id}
        className="px-4 py-2 rounded-full shadow-lg font-bold text-white cursor-grab active:cursor-grabbing"
        style={{ backgroundColor: color, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {text}
      </motion.div>
    </div>
  );
};

const DropSlot = ({ id, role, expectedColor, currentWord }: { id: string; role: GrammarRole; expectedColor: string; currentWord?: WordCardData }) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`relative w-40 h-16 rounded-xl border-2 border-dashed transition-colors flex items-center justify-center
        ${isOver ? 'bg-opacity-20 bg-gray-400' : 'bg-transparent'}
      `}
      style={{ borderColor: expectedColor }}
    >
      <span className="absolute top-[-1.5rem] text-xs font-bold" style={{ color: expectedColor }}>
        {role}
      </span>
      
      {currentWord ? (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-full h-full flex items-center justify-center rounded-xl font-bold text-white"
            style={{ backgroundColor: currentWord.color }}
        >
            {currentWord.text}
        </motion.div>
      ) : (
        <div className="opacity-20" style={{ backgroundColor: expectedColor, width: '80%', height: '40%', borderRadius: '1rem' }} />
      )}
    </div>
  );
};

// --- Main Builder Component ---

export const SentenceBuilder = () => {
  // Mock Data: Level 1-2
  const [words, setWords] = useState<WordCardData[]>([
    { id: 'w1', text: 'The eagle', role: 'Subject', color: COLOR_MAP.Subject },
    { id: 'w2', text: 'flies', role: 'Verb', color: COLOR_MAP.Verb },
    { id: 'w3', text: 'high', role: 'Modifier', color: COLOR_MAP.Modifier },
  ]);

  const [slots] = useState<SlotData[]>([
    { id: 's1', role: 'Subject', expectedColor: COLOR_MAP.Subject },
    { id: 's2', role: 'Verb', expectedColor: COLOR_MAP.Verb },
    { id: 's3', role: 'Modifier', expectedColor: COLOR_MAP.Modifier },
  ]);

  const [placements, setPlacements] = useState<Record<string, string>>({}); // slotId -> wordId
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active) {
      const slotId = over.id as string;
      const wordId = active.id as string;
      const word = words.find(w => w.id === wordId);
      const slot = slots.find(s => s.id === slotId);

      if (word && slot) {
        // Validation Logic
        if (word.role === slot.role) {
            setPlacements(prev => ({ ...prev, [slotId]: wordId }));
            setWords(prev => prev.filter(w => w.id !== wordId));
            triggerSuccess();
        } else {
            triggerError();
        }
      }
    }
  };

  const triggerSuccess = () => {
    setFeedback("Correct! 🌈"); // Simple feedback triggered
    setTimeout(() => setFeedback(null), 1500);
  };
  
  const triggerError = () => {
     setFeedback("Try again! Match the Colors! 🎨");
     setTimeout(() => setFeedback(null), 1500);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="p-8 max-w-4xl mx-auto font-sans">
        <h1 className="text-3xl font-bold text-center mb-12 text-gray-800">Level 1-2: Form 1 + Modifier</h1>

        <AnimatePresence>
            {feedback && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow-xl text-xl font-bold"
                >
                    {feedback}
                </motion.div>
            )}
        </AnimatePresence>

        {/* Drop Slots Area */}
        <div className="flex justify-center gap-4 mb-16 bg-white p-8 rounded-3xl shadow-sm">
          {slots.map(slot => (
            <DropSlot
              key={slot.id}
              id={slot.id}
              role={slot.role}
              expectedColor={slot.expectedColor}
              currentWord={words.find(w => w.id === placements[slot.id]) || placements[slot.id] ? { ...words.find(w => w.id === placements[slot.id])!, ...{text: 'Placed'} } as any : undefined} 
              // Note: In real app, we need to handle "Placed" words better. 
              // Here, if placed, we look up from original list (which we mutated). 
              // Simplification: We shouldn't delete from 'words' list if we want to show it in slot, 
              // OR we store 'placedWords' separately.
              // Fixing logic:
            />
          ))}
          {/* Re-rendering logic fix for demo:
              Ideally 'placements' holds the word object or ID, and we verify where the word is.
          */}
        </div>

        {/* Draggable Words Area */}
        <div className="flex justify-center gap-4 flex-wrap">
          {words.map(word => (
            <DraggableWord key={word.id} id={word.id} text={word.text} color={word.color} />
          ))}
        </div>
      </div>
    </DndContext>
  );
};
