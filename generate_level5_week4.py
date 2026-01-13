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

# --- Day 22: Advanced News ---
day22_data = [
    ("Experts predict economic recovery soon.", "전문가들은 곧 경제 회복을 예측한다.", [("Experts", "Subj", S), ("predict", "Verb", V), ("economic recovery", "Obj", O), ("soon", "Adv", A)]),
    ("The report highlights significant progress in health.", "그 보고서는 건강 분야의 상당한 진전을 강조한다.", [("The report", "Subj", S), ("highlights", "Verb", V), ("significant progress", "Obj", O), ("in health", "Mod", M)]),
    ("Despite challenges, the team succeeded.", "도전에도 불구하고, 팀은 성공했다.", [("Despite challenges", "Mod", M), ("the team", "Subj", S), ("succeeded", "Verb", V)]),
    ("Negotiations reached a critical stage today.", "협상은 오늘 중요한 단계에 도달했다.", [("Negotiations", "Subj", S), ("reached", "Verb", V), ("a critical stage", "Obj", O), ("today", "Adv", A)]),
    ("Scientists warn of potential risks ahead.", "과학자들은 앞으로의 잠재적 위험을 경고한다.", [("Scientists", "Subj", S), ("warn", "Verb", V), ("of potential risks ahead", "Obj", O)]),
    ("The new policy aims to reduce poverty.", "새 정책은 빈곤을 줄이는 것을 목표로 한다.", [("The new policy", "Subj", S), ("aims", "Verb", V), ("to reduce poverty", "Obj", O)]),
    ("Innovation drives market growth globally.", "혁신은 전 세계적으로 시장 성장을 주도한다.", [("Innovation", "Subj", S), ("drives", "Verb", V), ("market growth", "Obj", O), ("globally", "Adv", A)]),
    ("Education remains a top priority for us.", "교육은 우리에게 최우선 과제로 남아 있다.", [("Education", "Subj", S), ("remains", "Verb", V), ("a top priority", "Comp", C), ("for us", "Mod", M)]),
    ("Investment in infrastructure creates jobs.", "인프라 투자는 일자리를 창출한다.", [("Investment", "Subj", S), ("creates", "Verb", V), ("jobs", "Obj", O)]),
    ("Climate change demands urgent action.", "기후 변화는 긴급한 조치를 요구한다.", [("Climate change", "Subj", S), ("demands", "Verb", V), ("urgent action", "Obj", O)])
]
for i, (eng, kor, chunks_raw) in enumerate(day22_data):
    chunks = [{"text": t, "role": r, "color": c} for t, r, c in chunks_raw]
    curriculum.append(create_item(f"6-4-{i+1}", "Day 22", "Complex News", "News Analysis", kor, eng, chunks))

# --- Day 24: Business ---
day24_data = [
    ("We apologize for the inconvenience caused.", "불편을 끼쳐 드려 죄송합니다.", [("We", "Subj", S), ("apologize for", "Verb", V), ("the inconvenience caused", "Obj", O)]),
    ("Please find the attached document below.", "아래 첨부된 문서를 확인해 주세요.", [("Please find", "Verb", V), ("the attached document", "Obj", O), ("below", "Adv", A)]),
    ("I look forward to hearing from you.", "당신의 소식을 듣기를 기대합니다.", [("I", "Subj", S), ("look forward to", "Verb", V), ("hearing from you", "Obj", O)]),
    ("Thank you for your prompt response.", "신속한 답변에 감사드립니다.", [("Thank you", "Verb", V), ("for your prompt response", "Mod", M)]),
    ("We appreciate your business partnership.", "귀하와의 비즈니스 파트너십에 감사드립니다.", [("We", "Subj", S), ("appreciate", "Verb", V), ("your business partnership", "Obj", O)]),
    ("Could you please clarify the details?", "세부 사항을 명확히 해주실 수 있나요?", [("Could you", "Subj", S), ("please clarify", "Verb", V), ("the details", "Obj", O)]),
    ("We are committed to quality service.", "우리는 양질의 서비스에 전념하고 있습니다.", [("We", "Subj", S), ("are committed", "Verb", V), ("to quality service", "Obj", O)]),
    ("Let's schedule a meeting next week.", "다음 주에 회의 일정을 잡읍시다.", [("Let's schedule", "Verb", V), ("a meeting", "Obj", O), ("next week", "Adv", A)]),
    ("Please confirm your attendance by Friday.", "금요일까지 참석 여부를 확인해 주십시오.", [("Please confirm", "Verb", V), ("your attendance", "Obj", O), ("by Friday", "Mod", M)]),
    ("Feel free to contact us anytime.", "언제든지 주저 말고 연락해 주십시오.", [("Feel free", "Verb", V), ("to contact us", "Obj", O), ("anytime", "Adv", A)])
]
for i, (eng, kor, chunks_raw) in enumerate(day24_data):
    chunks = [{"text": t, "role": r, "color": c} for t, r, c in chunks_raw]
    curriculum.append(create_item(f"6-4-{10+i+1}", "Day 24", "Business", "Formal Email", kor, eng, chunks))

# --- Day 28: Finale ---
day28_data = [
    ("Your dreams await at the end.", "당신의 꿈이 끝에서 기다리고 있다.", [("Your dreams", "Subj", S), ("await", "Verb", V), ("at the end", "Mod", M)]),
    ("This is just the beginning.", "이것은 단지 시작일 뿐이다.", [("This", "Subj", S), ("is", "Verb", V), ("just the beginning", "Comp", C)]),
    ("You have mastered the art of grammar.", "당신은 문법의 기술을 마스터했다.", [("You", "Subj", S), ("have mastered", "Verb", V), ("the art of grammar", "Obj", O)]),
    ("The world is your oyster now.", "세상은 이제 당신의 것이다.", [("The world", "Subj", S), ("is", "Verb", V), ("your oyster", "Comp", C), ("now", "Adv", A)]),
    ("Go forth and speak with confidence.", "나가서 자신 있게 말하라.", [("Go forth", "Verb", V), ("and speak", "Verb", V), ("with confidence", "Mod", M)]),
    ("Learning never exhausts the mind.", "배움은 결코 마음을 지치게 하지 않는다.", [("Learning", "Subj", S), ("never exhausts", "Verb", V), ("the mind", "Obj", O)]),
    ("You are ready for the world.", "당신은 세상을 향해 나아갈 준비가 되었다.", [("You", "Subj", S), ("are", "Verb", V), ("ready", "Comp", C), ("for the world", "Mod", M)]),
    ("Make your mark on history.", "역사에 당신의 자취를 남겨라.", [("Make", "Verb", V), ("your mark", "Obj", O), ("on history", "Mod", M)]),
    ("Believe in yourself always.", "항상 자신을 믿어라.", [("Believe", "Verb", V), ("in yourself", "Mod", M), ("always", "Adv", A)]),
    ("Farewell and good luck!", "잘 가요, 행운을 빕니다!", [("Farewell", "Verb", V), ("and good luck", "Obj", O)])
]
for i, (eng, kor, chunks_raw) in enumerate(day28_data):
    chunks = [{"text": t, "role": r, "color": c} for t, r, c in chunks_raw]
    curriculum.append(create_item(f"6-4-{20+i+1}", "Day 28", "Grand Finale", "Conclusion", kor, eng, chunks))


# Save
with open("data/level5/week4.json", 'w', encoding='utf-8') as f:
    json.dump({"curriculum": curriculum}, f, indent=2, ensure_ascii=False)
print("Week 4 Generated")
