import json

def create_item(id, section, desc, question, kor, eng, chunks):
    return {
        "id": id,
        "section": section,
        "description": desc,
        "question": question,
        "korean": kor,
        "english": eng,
        "chunks": chunks,
        "context": desc,
        "grammarGuide": {
             "title": desc,
             "structure": [{"text": c["role"], "color": c["color"]} for c in chunks]
        } if id.endswith("-1") else None
    }

S, V, O, C, M, A = "#FF0000", "#FF7F00", "#FFD700", "#BA68C8", "#B0BEC5", "#BA68C8"
curriculum = []

# --- Day 8: Steve Jobs ---
day8_data = [
    ("Stay hungry stay foolish.", "항상 갈망하라, 항상 우직하라.", [("Stay", "Verb", V), ("hungry", "Comp", C), ("stay", "Verb", V), ("foolish", "Comp", C)]),
    ("Connect the dots looking backward.", "과거를 돌아보며 점들을 연결하라.", [("Connect", "Verb", V), ("the dots", "Obj", O), ("looking backward", "Mod", M)]),
    ("Love what you do.", "당신이 하는 일을 사랑하라.", [("Love", "Verb", V), ("what you do", "Obj", O)]),
    ("Your time is limited.", "당신의 시간은 제한되어 있다.", [("Your time", "Subj", S), ("is", "Verb", V), ("limited", "Comp", C)]),
    ("Don't let the noise drown your voice.", "소음이 당신의 목소리를 덮게 하지 마라.", [("Don't let", "Verb", V), ("the noise", "Obj", O), ("drown your voice", "Mod", M)]),
    ("Have the courage into follow your heart.", "당신의 마음을 따를 용기를 가져라.", [("Have", "Verb", V), ("the courage", "Obj", O), ("to follow your heart", "Mod", M)]),
    ("Death is very likely the single best invention.", "죽음은 아마 최고의 발명품일 것이다.", [("Death", "Subj", S), ("is", "Verb", V), ("the single best invention", "Comp", C)]),
    ("Live each day as if it was your last.", "마치 마지막 날인 것처럼 하루를 살아라.", [("Live", "Verb", V), ("each day", "Obj", O), ("as if it was your last", "Mod", M)]),
    ("I was lucky I found what I loved.", "나는 사랑하는 일을 찾아서 운이 좋았다.", [("I", "Subj", S), ("was", "Verb", V), ("lucky", "Comp", C), ("I found what I loved", "Mod", M)]),
    ("Keep looking, don't settle.", "계속 찾아라, 안주하지 마라.", [("Keep looking", "Verb", V), ("don't settle", "Verb", V)])
]
for i, (eng, kor, chunks_raw) in enumerate(day8_data):
    chunks = [{"text": t, "role": r, "color": c} for t, r, c in chunks_raw]
    curriculum.append(create_item(f"6-2-{i+1}", "Day 8", "Steve Jobs", "Quote: Jobs", kor, eng, chunks))

# --- Day 9: MLK Jr ---
day9_data = [
    ("I have a dream.", "나에게는 꿈이 있습니다.", [("I", "Subj", S), ("have", "Verb", V), ("a dream", "Obj", O)]),
    ("Let freedom ring from every mountain.", "모든 산에서 자유가 울려 퍼지게 하라.", [("Let", "Verb", V), ("freedom", "Obj", O), ("ring", "Verb", V), ("from every mountain", "Mod", M)]),
    ("Free at last!", "마침내 자유다!", [("Free", "Comp", C), ("at last", "Mod", M)]),
    ("Judge not by the color of skin.", "피부색으로 판단하지 말라.", [("Judge not", "Verb", V), ("by the color of skin", "Mod", M)]),
    ("Content of their character matters.", "그들의 인격 수준이 중요하다.", [("Content of their character", "Subj", S), ("matters", "Verb", V)]),
    ("We cannot walk alone.", "우리는 홀로 걸을 수 없다.", [("We", "Subj", S), ("cannot walk", "Verb", V), ("alone", "Mod", M)]),
    ("Injustice anywhere is a threat to justice everywhere.", "어디서든 불의는 모든 곳의 정의에 대한 위협이다.", [("Injustice anywhere", "Subj", S), ("is", "Verb", V), ("a threat", "Comp", C), ("to justice everywhere", "Mod", M)]),
    ("Darkness cannot drive out darkness.", "어둠은 어둠을 몰아낼 수 없다.", [("Darkness", "Subj", S), ("cannot drive out", "Verb", V), ("darkness", "Obj", O)]),
    ("Only light can do that.", "오직 빛만이 그것을 할 수 있다.", [("Only light", "Subj", S), ("can do", "Verb", V), ("that", "Obj", O)]),
    ("Love is the only force.", "사랑만이 유일한 힘이다.", [("Love", "Subj", S), ("is", "Verb", V), ("the only force", "Comp", C)])
]
for i, (eng, kor, chunks_raw) in enumerate(day9_data):
    chunks = [{"text": t, "role": r, "color": c} for t, r, c in chunks_raw]
    curriculum.append(create_item(f"6-2-{10+i+1}", "Day 9", "Martin Luther King Jr.", "Quote: MLK", kor, eng, chunks))

# --- Day 10: Lincoln ---
day10_data = [
    ("Government of the people.", "국민의 정부.", [("Government", "Subj", S), ("of the people", "Mod", M)]),
    ("By the people, for the people.", "국민에 의한, 국민을 위한.", [("By the people", "Mod", M), ("for the people", "Mod", M)]),
    ("Shall not perish from the earth.", "이 땅에서 사라지지 않을 것이다.", [("Shall not perish", "Verb", V), ("from the earth", "Mod", M)]),
    ("Four score and seven years ago.", "87년 전에.", [("Four score and seven years ago", "Adverb", A)]),
    ("All men are created equal.", "모든 인간은 평등하게 창조되었다.", [("All men", "Subj", S), ("are created", "Verb", V), ("equal", "Comp", C)]),
    ("A house divided cannot stand.", "분열된 집안은 바로 설 수 없다.", [("A house divided", "Subj", S), ("cannot stand", "Verb", V)]),
    ("With malice toward none.", "누구에게도 악의를 품지 않고.", [("With malice", "Mod", M), ("toward none", "Mod", M)]),
    ("With charity for all.", "모두에게 자비를 베풀며.", [("With charity", "Mod", M), ("for all", "Mod", M)]),
    ("Let us strive to finish the work.", "우리가 그 일을 끝내도록 노력합시다.", [("Let us strive", "Verb", V), ("to finish the work", "Obj", O)]),
    ("The world will little note.", "세상은 별로 기억하지 않을 것이다.", [("The world", "Subj", S), ("will little note", "Verb", V)])
]
for i, (eng, kor, chunks_raw) in enumerate(day10_data):
    chunks = [{"text": t, "role": r, "color": c} for t, r, c in chunks_raw]
    curriculum.append(create_item(f"6-2-{20+i+1}", "Day 10", "Lincoln", "Quote: Lincoln", kor, eng, chunks))

# Save
with open("data/level5/week2.json", 'w', encoding='utf-8') as f:
    json.dump({"curriculum": curriculum}, f, indent=2, ensure_ascii=False)
print("Week 2 Generated")
