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

# --- Day 15: Shakespeare ---
day15_data = [
    ("To be or not to be.", "죽느냐 사느냐.", [("To be or not to be", "Subj", S)]),
    ("All the world's a stage.", "온 세상은 무대이다.", [("All the world's", "Subj", S), ("a stage", "Comp", C)]),
    ("Parting is such sweet sorrow.", "이별은 달콤한 슬픔이다.", [("Parting", "Subj", S), ("is", "Verb", V), ("such sweet sorrow", "Comp", C)]),
    ("Cowards die many times.", "겁쟁이는 여러 번 죽는다.", [("Cowards", "Subj", S), ("die", "Verb", V), ("many times", "Adverb", A)]),
    ("The valiant never taste of death.", "용감한 자는 죽음을 결코 맛보지 않는다.", [("The valiant", "Subj", S), ("never taste", "Verb", V), ("of death", "Obj", O)]),
    ("Love looks not with the eyes.", "사랑은 눈으로 보지 않는다.", [("Love", "Subj", S), ("looks not", "Verb", V), ("with the eyes", "Mod", M)]),
    ("If music be the food of love, play on.", "음악이 사랑의 양식이라면 계속 연주하라.", [("If music be", "Mod", M), ("play on", "Verb", V)]),
    ("Shall I compare thee to a summer's day?", "그대를 여름날에 비유할까요?", [("Shall I compare", "Verb", V), ("thee", "Obj", O), ("to a summer's day", "Mod", M)]),
    ("What's in a name?", "이름에 무엇이 있는가?", [("What's", "Subj", S), ("in a name", "Mod", M)]),
    ("We are such stuff as dreams are made on.", "우리는 꿈이 만들어지는 재료와 같다.", [("We", "Subj", S), ("are", "Verb", V), ("such stuff", "Comp", C), ("as dreams are made on", "Mod", M)])
]
for i, (eng, kor, chunks_raw) in enumerate(day15_data):
    chunks = [{"text": t, "role": r, "color": c} for t, r, c in chunks_raw]
    curriculum.append(create_item(f"6-3-{i+1}", "Day 15", "Shakespeare", "Lit: Shakespeare", kor, eng, chunks))

# --- Day 16: Proverbs ---
day16_data = [
    ("A journey of a thousand miles begins with a step.", "천 리 길도 한 걸음부터.", [("A journey", "Subj", S), ("begins", "Verb", V), ("with a step", "Mod", M)]),
    ("Actions speak louder than words.", "행동이 말보다 더 크게 말한다.", [("Actions", "Subj", S), ("speak", "Verb", V), ("louder than words", "Mod", M)]),
    ("All good things must come to an end.", "모든 좋은 일에는 끝이 있다.", [("All good things", "Subj", S), ("must come", "Verb", V), ("to an end", "Mod", M)]),
    ("Beauty is in the eye of the beholder.", "아름다움은 보는 사람의 눈에 있다.", [("Beauty", "Subj", S), ("is", "Verb", V), ("in the eye", "Mod", M)]),
    ("Don't count your chickens before they hatch.", "달걀이 부화하기 전에 병아리를 세지 마라.", [("Don't count", "Verb", V), ("your chickens", "Obj", O), ("before they hatch", "Mod", M)]),
    ("Easy come, easy go.", "쉽게 얻은 것은 쉽게 잃는다.", [("Easy come", "Verb", V), ("easy go", "Verb", V)]),
    ("Fortune favors the bold.", "행운은 용감한 자의 편이다.", [("Fortune", "Subj", S), ("favors", "Verb", V), ("the bold", "Obj", O)]),
    ("Knowledge is power.", "아는 것이 힘이다.", [("Knowledge", "Subj", S), ("is", "Verb", V), ("power", "Comp", C)]),
    ("Practice makes perfect.", "연습이 완벽을 만든다.", [("Practice", "Subj", S), ("makes", "Verb", V), ("perfect", "Obj", O)]),
    ("When in Rome, do as the Romans do.", "로마에 가면 로마법을 따르라.", [("When in Rome", "Mod", M), ("do", "Verb", V), ("as the Romans do", "Mod", M)])
]
for i, (eng, kor, chunks_raw) in enumerate(day16_data):
    chunks = [{"text": t, "role": r, "color": c} for t, r, c in chunks_raw]
    curriculum.append(create_item(f"6-3-{10+i+1}", "Day 16", "Proverbs", "Wisdom", kor, eng, chunks))

# Save
with open("data/level5/week3.json", 'w', encoding='utf-8') as f:
    json.dump({"curriculum": curriculum}, f, indent=2, ensure_ascii=False)
print("Week 3 Generated")
