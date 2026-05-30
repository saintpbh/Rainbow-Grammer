#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json

# Load existing curriculum
with open('grammar_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Week 2 curriculum - 70 sentences
week2_sentences = [
    # Day 8: S + V + O (Simple Objects) - 10 sentences
    {"id": "2-1-1", "section": "Day 8", "description": "Subject + Verb + Object: Basic transitive verb pattern", "korean": "나는 음악을 사랑한다.", "english": "I love music.", "chunks": [{"text": "I", "role": "Subject", "color": "#FF0000"}, {"text": "love", "role": "Verb", "color": "#FF7F00"}, {"text": "music", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-1-2", "section": "Day 8", "description": "Subject + Verb + Object: Basic transitive verb pattern", "korean": "그녀는 책을 읽는다.", "english": "She reads books.", "chunks": [{"text": "She", "role": "Subject", "color": "#FF0000"}, {"text": "reads", "role": "Verb", "color": "#FF7F00"}, {"text": "books", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-1-3", "section": "Day 8", "description": "Subject + Verb + Object: Basic transitive verb pattern", "korean": "그는 커피를 마신다.", "english": "He drinks coffee.", "chunks": [{"text": "He", "role": "Subject", "color": "#FF0000"}, {"text": "drinks", "role": "Verb", "color": "#FF7F00"}, {"text": "coffee", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-1-4", "section": "Day 8", "description": "Subject + Verb + Object: Basic transitive verb pattern", "korean": "우리는 영화를 본다.", "english": "We watch movies.", "chunks": [{"text": "We", "role": "Subject", "color": "#FF0000"}, {"text": "watch", "role": "Verb", "color": "#FF7F00"}, {"text": "movies", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-1-5", "section": "Day 8", "description": "Subject + Verb + Object: Basic transitive verb pattern", "korean": "그들은 노래를 부른다.", "english": "They sing songs.", "chunks": [{"text": "They", "role": "Subject", "color": "#FF0000"}, {"text": "sing", "role": "Verb", "color": "#FF7F00"}, {"text": "songs", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-1-6", "section": "Day 8", "description": "Subject + Verb + Object: Basic transitive verb pattern", "korean": "나는 사과를 먹는다.", "english": "I eat apples.", "chunks": [{"text": "I", "role": "Subject", "color": "#FF0000"}, {"text": "eat", "role": "Verb", "color": "#FF7F00"}, {"text": "apples", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-1-7", "section": "Day 8", "description": "Subject + Verb + Object: Basic transitive verb pattern", "korean": "그녀는 그림을 그린다.", "english": "She draws pictures.", "chunks": [{"text": "She", "role": "Subject", "color": "#FF0000"}, {"text": "draws", "role": "Verb", "color": "#FF7F00"}, {"text": "pictures", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-1-8", "section": "Day 8", "description": "Subject + Verb + Object: Basic transitive verb pattern", "korean": "그는 자전거를 탄다.", "english": "He rides a bicycle.", "chunks": [{"text": "He", "role": "Subject", "color": "#FF0000"}, {"text": "rides", "role": "Verb", "color": "#FF7F00"}, {"text": "a bicycle", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-1-9", "section": "Day 8", "description": "Subject + Verb + Object: Basic transitive verb pattern", "korean": "아이들은 장난감을 좋아한다.", "english": "Children like toys.", "chunks": [{"text": "Children", "role": "Subject", "color": "#FF0000"}, {"text": "like", "role": "Verb", "color": "#FF7F00"}, {"text": "toys", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-1-10", "section": "Day 8", "description": "Subject + Verb + Object: Basic transitive verb pattern", "korean": "우리는 진실을 안다.", "english": "We know the truth.", "chunks": [{"text": "We", "role": "Subject", "color": "#FF0000"}, {"text": "know", "role": "Verb", "color": "#FF7F00"}, {"text": "the truth", "role": "Object", "color": "#FFFF00"}]},
    
    # Day 9: S + V + O (Complex Objects) - 10 sentences
    {"id": "2-2-1", "section": "Day 9", "description": "Subject + Verb + Object: Objects with modifiers", "korean": "나는 아름다운 드레스를 샀다.", "english": "I bought a beautiful dress.", "chunks": [{"text": "I", "role": "Subject", "color": "#FF0000"}, {"text": "bought", "role": "Verb", "color": "#FF7F00"}, {"text": "a beautiful dress", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-2-2", "section": "Day 9", "description": "Subject + Verb + Object: Objects with modifiers", "korean": "그는 어려운 문제를 풀었다.", "english": "He solved the difficult problem.", "chunks": [{"text": "He", "role": "Subject", "color": "#FF0000"}, {"text": "solved", "role": "Verb", "color": "#FF7F00"}, {"text": "the difficult problem", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-2-3", "section": "Day 9", "description": "Subject + Verb + Object: Objects with modifiers", "korean": "그녀는 흥미로운 책을 읽었다.", "english": "She read an interesting book.", "chunks": [{"text": "She", "role": "Subject", "color": "#FF0000"}, {"text": "read", "role": "Verb", "color": "#FF7F00"}, {"text": "an interesting book", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-2-4", "section": "Day 9", "description": "Subject + Verb + Object: Objects with modifiers", "korean": "우리는 새로운 집을 지었다.", "english": "We built a new house.", "chunks": [{"text": "We", "role": "Subject", "color": "#FF0000"}, {"text": "built", "role": "Verb", "color": "#FF7F00"}, {"text": "a new house", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-2-5", "section": "Day 9", "description": "Subject + Verb + Object: Objects with modifiers", "korean": "그들은 맛있는 저녁을 요리했다.", "english": "They cooked a delicious dinner.", "chunks": [{"text": "They", "role": "Subject", "color": "#FF0000"}, {"text": "cooked", "role": "Verb", "color": "#FF7F00"}, {"text": "a delicious dinner", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-2-6", "section": "Day 9", "description": "Subject + Verb + Object: Objects with modifiers", "korean": "나는 좋은 친구를 만났다.", "english": "I met a good friend.", "chunks": [{"text": "I", "role": "Subject", "color": "#FF0000"}, {"text": "met", "role": "Verb", "color": "#FF7F00"}, {"text": "a good friend", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-2-7", "section": "Day 9", "description": "Subject + Verb + Object: Objects with modifiers", "korean": "그는 큰 차를 운전한다.", "english": "He drives a big car.", "chunks": [{"text": "He", "role": "Subject", "color": "#FF0000"}, {"text": "drives", "role": "Verb", "color": "#FF7F00"}, {"text": "a big car", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-2-8", "section": "Day 9", "description": "Subject + Verb + Object: Objects with modifiers", "korean": "그녀는 예쁜 꽃을 심었다.", "english": "She planted beautiful flowers.", "chunks": [{"text": "She", "role": "Subject", "color": "#FF0000"}, {"text": "planted", "role": "Verb", "color": "#FF7F00"}, {"text": "beautiful flowers", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-2-9", "section": "Day 9", "description": "Subject + Verb + Object: Objects with modifiers", "korean": "학생들은 중요한 시험을 봤다.", "english": "Students took an important exam.", "chunks": [{"text": "Students", "role": "Subject", "color": "#FF0000"}, {"text": "took", "role": "Verb", "color": "#FF7F00"}, {"text": "an important exam", "role": "Object", "color": "#FFFF00"}]},
    {"id": "2-2-10", "section": "Day 9", "description": "Subject + Verb + Object: Objects with modifiers", "korean": "우리는 특별한 선물을 받았다.", "english": "We received a special gift.", "chunks": [{"text": "We", "role": "Subject", "color": "#FF0000"}, {"text": "received", "role": "Verb", "color": "#FF7F00"}, {"text": "a special gift", "role": "Object", "color": "#FFFF00"}]},
    
    # Continue with remaining days (10-14)...
]

# Append to curriculum
data['curriculum'].extend(week2_sentences)

# Save back
with open('grammar_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Added {len(week2_sentences)} Week 2 sentences to curriculum")
print(f"Total sentences now: {len(data['curriculum'])}")
