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
        } if id.endswith("-1") else None # Only first item gets guide
    }

# Colors
S = "#FF0000" # Subject
V = "#FF7F00" # Verb
O = "#FFD700" # Object
C = "#BA68C8" # Complement
M = "#B0BEC5" # Modifier
A = "#BA68C8" # Adverb

curriculum = []

# --- Day 1: Economy ---
# 10 Unique Sentences
day1_data = [
    ("Stock market crashes as prices rise.", "가격이 상승함에 따라 주식 시장이 붕괴한다.", 
     [("Stock market", "Subject", S), ("crashes", "Verb", V), ("as prices rise", "Modifier", M)]),
    ("Inflation hit a record high last month.", "인플레이션이 지난달 최고치를 기록했다.",
     [("Inflation", "Subject", S), ("hit", "Verb", V), ("a record high", "Object", O), ("last month", "Adverb", A)]),
    ("The central bank raised interest rates again.", "중앙은행이 금리를 다시 인상했다.",
     [("The central bank", "Subject", S), ("raised", "Verb", V), ("interest rates", "Object", O), ("again", "Adverb", A)]),
    ("Unemployment rate dropped to three percent.", "실업률이 3퍼센트로 떨어졌다.",
     [("Unemployment rate", "Subject", S), ("dropped", "Verb", V), ("to three percent", "Modifier", M)]),
    ("Oil prices surged due to supply shortage.", "공급 부족으로 유가가 급등했다.",
     [("Oil prices", "Subject", S), ("surged", "Verb", V), ("due to supply shortage", "Modifier", M)]),
    ("Housing market shows signs of recovery.", "주택 시장이 회복의 조짐을 보인다.",
     [("Housing market", "Subject", S), ("shows", "Verb", V), ("signs of recovery", "Object", O)]),
    ("Tech stocks led the market rally today.", "기술주가 오늘 시장 반등을 주도했다.",
     [("Tech stocks", "Subject", S), ("led", "Verb", V), ("the market rally", "Object", O), ("today", "Adverb", A)]),
    ("Consumers are spending less on luxury goods.", "소비자들은 명품에 지출을 줄이고 있다.",
     [("Consumers", "Subject", S), ("are spending", "Verb", V), ("less", "Object", O), ("on luxury goods", "Modifier", M)]),
    ("Global trade volume decreased significantly.", "세계 무역량이 크게 감소했다.",
     [("Global trade volume", "Subject", S), ("decreased", "Verb", V), ("significantly", "Adverb", A)]),
    ("Investors worry about a possible recession.", "투자자들은 가능한 경기 침체를 우려한다.",
     [("Investors", "Subject", S), ("worry", "Verb", V), ("about a possible recession", "Modifier", M)])
]

for i, (eng, kor, chunks_raw) in enumerate(day1_data):
    chunks = [{"text": t, "role": r, "color": c} for t, r, c in chunks_raw]
    curriculum.append(create_item(f"6-1-{i+1}", "Day 1", "Economy News", "Topic: Economy", kor, eng, chunks))

# --- Day 2: Technology ---
day2_data = [
    ("AI replaces human workers in factories.", "AI가 공장에서 인간 노동자들을 대체한다.",
     [("AI", "Subject", S), ("replaces", "Verb", V), ("human workers", "Object", O), ("in factories", "Modifier", M)]),
    ("New smartphone model features foldable screen.", "새 스마트폰 모델은 접이식 화면을 특징으로 한다.",
     [("New smartphone model", "Subject", S), ("features", "Verb", V), ("foldable screen", "Object", O)]),
    ("Scientists developed a cure for the virus.", "과학자들은 그 바이러스의 치료법을 개발했다.",
     [("Scientists", "Subject", S), ("developed", "Verb", V), ("a cure for the virus", "Object", O)]),
    ("Cyber attacks target major financial banks.", "사이버 공격이 주요 금융 은행들을 겨냥한다.",
     [("Cyber attacks", "Subject", S), ("target", "Verb", V), ("major financial banks", "Object", O)]),
    ("Electric cars are gaining popularity fast.", "전기차들이 빠르게 인기를 얻고 있다.",
     [("Electric cars", "Subject", S), ("are gaining", "Verb", V), ("popularity", "Object", O), ("fast", "Adverb", A)]),
    ("Virtual reality changes how we learn.", "가상 현실이 우리가 배우는 방식을 바꾼다.",
     [("Virtual reality", "Subject", S), ("changes", "Verb", V), ("how we learn", "Object", O)]),
    ("Robots can perform complex surgeries now.", "로봇들이 이제 복잡한 수술을 수행할 수 있다.",
     [("Robots", "Subject", S), ("can perform", "Verb", V), ("complex surgeries", "Object", O), ("now", "Adverb", A)]),
    ("Social media influences public opinion heavily.", "소셜 미디어가 여론에 크게 영향을 미친다.",
     [("Social media", "Subject", S), ("influences", "Verb", V), ("public opinion", "Object", O), ("heavily", "Adverb", A)]),
    ("Drones deliver packages to remote areas.", "드론이 외진 지역으로 소포를 배달한다.",
     [("Drones", "Subject", S), ("deliver", "Verb", V), ("packages", "Object", O), ("to remote areas", "Modifier", M)]),
    ("Quantum computers solve problems instantly.", "양자 컴퓨터는 문제를 즉시 해결한다.",
     [("Quantum computers", "Subject", S), ("solve", "Verb", V), ("problems", "Object", O), ("instantly", "Adverb", A)])
]
for i, (eng, kor, chunks_raw) in enumerate(day2_data):
    chunks = [{"text": t, "role": r, "color": c} for t, r, c in chunks_raw]
    curriculum.append(create_item(f"6-2-{i+1}", "Day 2", "Tech News", "Topic: Tech", kor, eng, chunks))

# --- Day 3: Environment ---
day3_data = [
    ("Global warming threatens polar bear habitats.", "지구 온난화가 북극곰 서식지를 위협한다.",
     [("Global warming", "Subject", S), ("threatens", "Verb", V), ("polar bear habitats", "Object", O)]),
    ("Plastic waste pollutes our oceans daily.", "플라스틱 쓰레기가 매일 우리 바다를 오염시킨다.",
     [("Plastic waste", "Subject", S), ("pollutes", "Verb", V), ("our oceans", "Object", O), ("daily", "Adverb", A)]),
    ("Renewable energy sources are essential now.", "재생 가능 에너지원은 이제 필수적이다.",
     [("Renewable energy sources", "Subject", S), ("are", "Verb", V), ("essential", "Complement", C), ("now", "Adverb", A)]),
    ("Deforestation causes loss of biodiversity.", "산림 벌채는 생물 다양성의 상실을 초래한다.",
     [("Deforestation", "Subject", S), ("causes", "Verb", V), ("loss of biodiversity", "Object", O)]),
    ("Governments ban single-use plastic bags.", "정부들은 일회용 비닐봉지를 금지한다.",
     [("Governments", "Subject", S), ("ban", "Verb", V), ("single-use plastic bags", "Object", O)]),
    ("Clean water is becoming scarce globally.", "깨끗한 물이 전 세계적으로 부족해지고 있다.",
     [("Clean water", "Subject", S), ("is becoming", "Verb", V), ("scarce", "Complement", C), ("globally", "Adverb", A)]),
    ("Solar panels reduce electricity bills significantly.", "태양광 패널은 전기 요금을 상당히 줄여준다.",
     [("Solar panels", "Subject", S), ("reduce", "Verb", V), ("electricity bills", "Object", O), ("significantly", "Adverb", A)]),
    ("Wildfires destroyed thousands of acres.", "산불이 수천 에이커를 파괴했다.",
     [("Wildfires", "Subject", S), ("destroyed", "Verb", V), ("thousands of acres", "Object", O)]),
    ("We must protect endangered species.", "우리는 멸종 위기 종을 보호해야 한다.",
     [("We", "Subject", S), ("must protect", "Verb", V), ("endangered species", "Object", O)]),
    ("Recycling saves energy and resources.", "재활용은 에너지와 자원을 절약한다.",
     [("Recycling", "Subject", S), ("saves", "Verb", V), ("energy and resources", "Object", O)])
]
for i, (eng, kor, chunks_raw) in enumerate(day3_data):
    chunks = [{"text": t, "role": r, "color": c} for t, r, c in chunks_raw]
    curriculum.append(create_item(f"6-3-{i+1}", "Day 3", "Eco News", "Topic: Environment", kor, eng, chunks))

# --- Day 4: Politics ---
day4_data = [
    ("President announces new tax policy today.", "대통령이 오늘 새로운 세금 정책을 발표한다.",
     [("President", "Subject", S), ("announces", "Verb", V), ("new tax policy", "Object", O), ("today", "Adverb", A)]),
    ("Parliament voted on the new bill.", "의회는 새 법안에 대해 투표했다.",
     [("Parliament", "Subject", S), ("voted", "Verb", V), ("on the new bill", "Modifier", M)]),
    ("Leaders gathered for the peace summit.", "지도자들이 평화 정상 회담을 위해 모였다.",
     [("Leaders", "Subject", S), ("gathered", "Verb", V), ("for the peace summit", "Modifier", M)]),
    ("Citizens protested against the corruption.", "시민들은 부패에 맞서 시위했다.",
     [("Citizens", "Subject", S), ("protested", "Verb", V), ("against the corruption", "Modifier", M)]),
    ("The election results were announced late.", "선거 결과가 늦게 발표되었다.",
     [("The election results", "Subject", S), ("were announced", "Verb", V), ("late", "Adverb", A)]),
    ("Diplomats are negotiating a trade deal.", "외교관들이 무역 협정을 협상 중이다.",
     [("Diplomats", "Subject", S), ("are negotiating", "Verb", V), ("a trade deal", "Object", O)]),
    ("The mayor promised better public transport.", "시장은 더 나은 대중교통을 약속했다.",
     [("The mayor", "Subject", S), ("promised", "Verb", V), ("better public transport", "Object", O)]),
    ("Opposition party criticized the decision.", "야당은 그 결정을 비판했다.",
     [("Opposition party", "Subject", S), ("criticized", "Verb", V), ("the decision", "Object", O)]),
    ("New laws protect consumer rights.", "새로운 법률은 소비자 권리를 보호한다.",
     [("New laws", "Subject", S), ("protect", "Verb", V), ("consumer rights", "Object", O)]),
    ("Freedom of speech is a basic right.", "표현의 자유는 기본적인 권리이다.",
     [("Freedom of speech", "Subject", S), ("is", "Verb", V), ("a basic right", "Complement", C)])
]
for i, (eng, kor, chunks_raw) in enumerate(day4_data):
    chunks = [{"text": t, "role": r, "color": c} for t, r, c in chunks_raw]
    curriculum.append(create_item(f"6-4-{i+1}", "Day 4", "Politics", "Topic: Politics", kor, eng, chunks))

# Save
with open("data/level5/week1.json", 'w', encoding='utf-8') as f:
    json.dump({"curriculum": curriculum}, f, indent=2, ensure_ascii=False)
print("Week 1 Generated")
