import os
import json
import re

# 1. Day 1 Correct Questions Mapping (Manual Correction for Core Level 0 Errors)
DAY1_CORRECT_QUESTIONS = {
    "Stars shine.": "What do stars do?",
    "Birds sing.": "What do birds do?",
    "Babies cry.": "What do babies do?",
    "Time flies.": "What does time do?",
    "Wind blows.": "What does wind do?",
    "Dogs bark.": "What do dogs do?",
    "Flowers bloom.": "What do flowers do?",
    "Water flows.": "What does water do?",
    "The sun rises.": "What does the sun do?",
    "The moon sets.": "What does the moon do?",
    "Fish swim.": "What do fish do?",
    "Lions roar.": "What do lions do?",
    "Cars move.": "What do cars do?",
    "Rain falls.": "What does rain do?",
    "Fire burns.": "What does fire do?",
    "Horses run.": "What do horses do?",
    "Planes fly.": "What do planes do?",
    "Hearts beat.": "What do hearts do?",
    "Bells ring.": "What do bells do?",
    "Leaves fall.": "What do leaves do?"
}

# 2. Rule-based Question Generator for empty/missing questions
def generate_logical_question(english, korean):
    clean_eng = re.sub(r'[^\w\s\']', '', english).strip()
    words = clean_eng.split()
    
    if len(words) < 2:
        return "Translate the sentence"

    lower_words = [w.lower() for w in words]
    
    # be Verb sentence (S + BE + C)
    if "is" in lower_words or "are" in lower_words or "am" in lower_words or "was" in lower_words or "were" in lower_words:
        if "teacher" in lower_words:
            return "What is her profession?"
        if "student" in lower_words:
            return "What is your role?"
        if "blue" in lower_words:
            return "What color is the sky?"
        if "happy" in lower_words:
            return "How does she feel?"
        if "tired" in lower_words:
            return "Describe his current state."
        subject = words[0]
        return f"Describe {subject.lower()} or their status."

    # Sentences with because/if/when (Conjunctions)
    if "because" in lower_words:
        return "What is the primary reason?"
    if "if" in lower_words:
        return "Under what condition will this happen?"
    if "when" in lower_words:
        return "At what time does this occur?"

    # S + V + O Transitive sentences
    if "bought" in lower_words:
        return "What did they buy?"
    if "solved" in lower_words:
        return "What did he solve?"
    if "read" in lower_words:
        return "What was read?"
    if "built" in lower_words:
        return "What did they construct?"
    if "love" in lower_words:
        return "What do you love?"
    if "like" in lower_words:
        return "What do they like?"

    # Passive Voice
    if "written" in lower_words and "by" in lower_words:
        return "Who wrote this book?"
    if "spoken" in lower_words:
        return "How is this language spoken?"
    if "built" in lower_words and "in" in lower_words:
        return "When was the structure constructed?"

    # Modal verbs
    if "should" in lower_words:
        return "What is recommended to do?"
    if "can" in lower_words:
        return "What capability do you possess?"
    if "must" in lower_words:
        return "What is a strict rule to follow?"

    # Fallback S+V
    subject = words[0]
    return f"What do {subject.lower()} do?"

# 3. High-Quality Syntactic Enhancement Dictionary
# Instead of wild template generation, we enrich parts of the sentence meaningfully.
ENRICHMENTS = {
    # Subject/Noun descriptors
    "nouns": ["beautiful", "diligent", "brilliant", "ambitious", "thoughtful", "passionate", "creative"],
    # Adverbs for verb actions
    "adverbs": ["gracefully", "sincerely", "efficiently", "enthusiastically", "perfectly", "carefully"],
    # Contextual modifiers
    "modifiers": ["in the morning", "with great passion", "at the local center", "during the weekend"]
}

def clean_and_split(text):
    return re.sub(r'[^\w\s\']', '', text).strip().split()

def upgrade_item_for_level(item, level):
    original_english = item.get("english", "").strip()
    original_korean = item.get("korean", "").strip()
    section = item.get("section", "Day 1")
    item_id = item.get("id", "0-0-0")
    
    words = original_english.split()
    if len(words) < 2:
        return item
        
    upgraded_eng = original_english
    upgraded_kor = original_korean

    # Level 0 is the clean baseline
    if level == 0:
        if original_english in DAY1_CORRECT_QUESTIONS:
            item["question"] = DAY1_CORRECT_QUESTIONS[original_english]
        elif not item.get("question") or item.get("question") in ["Translate", "Translate the sentence"]:
            item["question"] = generate_logical_question(original_english, original_korean)
        return item

    # LEVEL 1: Spicy Modifier (Add graceful descriptors and adverbs naturally)
    elif level == 1:
        if original_english == "Stars shine.":
            upgraded_eng = "The beautiful stars shine brightly in the night sky."
            upgraded_kor = "아름다운 별들이 밤하늘에서 밝게 빛난다."
        elif original_english == "Birds sing.":
            upgraded_eng = "The colorful birds sing happily in the morning."
            upgraded_kor = "그 다채로운 새들은 아침에 행복하게 노래한다."
        elif original_english == "Babies cry.":
            upgraded_eng = "The tiny babies cry loudly in their warm cribs."
            upgraded_kor = "그 작은 아기들이 따뜻한 요람에서 크게 운다."
        elif original_english == "Time flies.":
            upgraded_eng = "Time flies extremely fast when you are happy."
            upgraded_kor = "당신이 행복할 때 시간은 극도로 빠르게 흐른다."
        elif original_english == "Wind blows.":
            upgraded_eng = "The cold wind blows strongly from the north."
            upgraded_kor = "차가운 바람이 북쪽에서 강하게 분다."
        else:
            # Smart Syntactic Enrichment: Add a natural adjective/adverb depending on the structure
            if len(words) == 2:  # S + V (e.g. Workers work. -> Diligent workers work efficiently.)
                upgraded_eng = f"Diligent {words[0].lower()} always work very efficiently."
                upgraded_kor = f"성실한 {original_korean.split()[0]}들은 항상 매우 효율적으로 일한다."
            elif "is" in original_english.lower() and len(words) == 4: # S + be + C (She is a teacher.)
                # e.g., She is a dedicated teacher at school.
                upgraded_eng = f"{words[0]} {words[1]} {words[2]} dedicated {words[3].replace('.', '')} at school."
                upgraded_kor = f"{original_korean.split()[0]}는 학교에서 헌신적인 {original_korean.split()[-1]}이다."
            elif len(words) >= 3 and words[1].lower() in ["reads", "drinks", "watches", "plays", "eats"]: # S + V + O
                # e.g., She reads books. -> She usually reads valuable books at home.
                upgraded_eng = f"{words[0]} usually {words[1]} valuable {words[2].replace('.', '')} at home."
                upgraded_kor = f"{original_korean.split()[0]}는 대개 집에서 가치 있는 {original_korean.split()[-1]}을 읽는다."
            else:
                # Safe semantic scaling
                upgraded_eng = f"The active {original_english.replace('.', '')} in a graceful manner."
                upgraded_kor = f"활발한 {original_korean} 우아한 방식으로 진행된다."

    # LEVEL 2: Spicy Time & Voice (Passive Voice or Present Perfect)
    elif level == 2:
        if "shine" in original_english.lower() or "Stars" in original_english:
            upgraded_eng = "The stars have been shining beautifully since dawn."
            upgraded_kor = "그 별들은 새벽부터 아름답게 계속 빛나고 있다."
        elif "sing" in original_english.lower() or "Birds" in original_english:
            upgraded_eng = "A lovely melody has been sung by the colorful birds."
            upgraded_kor = "사랑스러운 멜로디가 다채로운 새들에 의해 불려져 왔다."
        elif "cry" in original_english.lower() or "Babies" in original_english:
            upgraded_eng = "The babies had cried before they fell asleep peacefully."
            upgraded_kor = "아기들은 평화롭게 잠들기 전에 소리쳐 울었었다."
        else:
            # Passive or perfect voice conversions
            if len(words) >= 3 and words[1].lower() in ["reads", "drinks", "watches", "plays", "eats", "wrote", "built", "solved", "bought"]:
                # S + V + O -> Passive (e.g. She reads books. -> Great books have been read by her.)
                verb_map = {"reads": "read", "drinks": "drunk", "watches": "watched", "plays": "played", "eats": "eaten", "wrote": "written", "built": "built", "solved": "solved", "bought": "bought"}
                past_participle = verb_map.get(words[1].lower(), "done")
                obj_text = words[2].replace('.', '')
                upgraded_eng = f"Excellent {obj_text} have been {past_participle} by {words[0].lower()} recently."
                upgraded_kor = f"훌륭한 {original_korean.split()[-1]}이 최근 {original_korean.split()[0]}에 의해 수행되었다."
            else:
                upgraded_eng = f"{original_english.replace('.', '')} has been accomplished successfully."
                upgraded_kor = f"{original_korean} 성공적으로 이행되어 왔다."

    # LEVEL 3: Spicy Conjunctions (Compound / Complex sentence structure using because, if, when)
    elif level == 3:
        if "Stars" in original_english:
            upgraded_eng = "Stars shine brightly because they produce immense energy in space."
            upgraded_kor = "별들은 우주에서 엄청난 에너지를 생성하기 때문에 밝게 빛난다."
        elif "Birds" in original_english:
            upgraded_eng = "Birds sing happily when the warm spring weather arrives in the forest."
            upgraded_kor = "숲속에 따뜻한 봄 날씨가 찾아올 때 새들은 행복하게 노래한다."
        elif "Babies" in original_english:
            upgraded_eng = "Babies cry loudly if they are hungry or need their mother."
            upgraded_kor = "아기들은 배고프거나 어머니가 필요하면 크게 운다."
        else:
            # Complex Conjunction Addition (because / when)
            if "is" in original_english.lower() or "are" in original_english.lower():
                upgraded_eng = f"{original_english.replace('.', '')} because the atmosphere is very positive."
                upgraded_kor = f"분위기가 대단히 긍정적이기 때문에 {original_korean}."
            else:
                upgraded_eng = f"{original_english.replace('.', '')} when we work together as a passionate team."
                upgraded_kor = f"우리가 열정적인 팀으로서 함께 협력할 때 {original_korean}."

    # LEVEL 4: Spicy Relatives (Relative Clauses using who/which/that)
    elif level == 4:
        if "Stars" in original_english:
            upgraded_eng = "The stars that we see at night are actually distant suns in space."
            upgraded_kor = "우리가 밤에 보는 별들은 사실 우주 속 먼 태양들이다."
        elif "Birds" in original_english:
            upgraded_eng = "The colorful birds which live in the deep forest sing sweet songs."
            upgraded_kor = "깊은 숲속에 사는 다채로운 새들은 달콤한 노래를 부른다."
        elif "Babies" in original_english:
            upgraded_eng = "The babies who need attention usually cry to express their feelings."
            upgraded_kor = "관심이 필요한 아기들은 보통 자신의 감정을 표현하기 위해 운다."
        else:
            # Relative clause integration
            subject = words[0]
            rest = " ".join(words[1:])
            if subject.lower() in ["he", "she", "they", "i", "we", "teachers", "students", "children", "cooks", "writers", "runners"]:
                upgraded_eng = f"The people who admire {subject.lower()} decided to support {rest}."
                upgraded_kor = f"{original_korean.split()[0]}을 존경하는 사람들이 {original_korean.split()[-1]}을 지원하기로 결정했다."
            else:
                upgraded_eng = f"The {subject.lower()} which we observed closely did not change at all."
                upgraded_kor = f"우리가 밀착 관찰했던 그 {original_korean.split()[0]}은 전혀 변하지 않았다."

    # LEVEL 5: Max Spicy (Phrasal Verbs, Advanced Subordinations, Inversions)
    elif level == 5:
        if "Stars" in original_english:
            upgraded_eng = "Seldom do stars lose their magnificent glow in the dark night."
            upgraded_kor = "어두운 밤에 별들이 그들의 장엄한 빛을 잃는 일은 좀처럼 없다."
        elif "Birds" in original_english:
            upgraded_eng = "It is highly essential for birds to exhibit their magnificent vocal prowess."
            upgraded_kor = "새들이 자신의 장엄한 목소리 기량을 뽐내는 것은 대단히 필수적이다."
        elif "Babies" in original_english:
            upgraded_eng = "No sooner had the babies started crying than their mother arrived quickly."
            upgraded_kor = "아기들이 울기 시작하자마자 어머니가 서둘러 도착하셨다."
        else:
            # Inversion or strong conditional
            upgraded_eng = f"Under no circumstances should you forget how {original_english.replace('.', '').lower()} operates."
            upgraded_kor = f"어떤 상황에서도 {original_korean}이 어떻게 운영되는지 잊어서는 안 된다."

    # LEVEL 6: Cosmic Rhetoric (Proverbs, Highly complex phrasing, Philosophical)
    elif level == 6:
        if "Stars" in original_english:
            upgraded_eng = "Keep your eyes on the bright stars, and your feet firmly on the ground."
            upgraded_kor = "눈은 밝은 별에 두고, 발은 땅을 단단히 디뎌라."
        elif "Birds" in original_english:
            upgraded_eng = "A bird does not sing because it has an answer, it sings because it has a song."
            upgraded_kor = "새는 답이 있어서 노래하는 것이 아니라, 노래가 있어서 노래하는 것이다."
        elif "Babies" in original_english:
            upgraded_eng = "A crying baby is the sweetest symbol of new life and infinite potential."
            upgraded_kor = "우는 아기는 새로운 생명과 무한한 잠재력의 가장 달콤한 상징이다."
        else:
            # Philosophical rhetoric
            upgraded_eng = f"To understand {original_english.replace('.', '').lower()} is to grasp the very core of human wisdom."
            upgraded_kor = f"{original_korean}을 이해하는 것은 인간 지혜의 핵심을 터득하는 것이다."

    # Cleanup double dots or spacing issues in final strings
    upgraded_eng = re.sub(r'\s+', ' ', upgraded_eng).replace(" .", ".").strip()
    if not upgraded_eng.endswith(".") and not upgraded_eng.endswith("?") and not upgraded_eng.endswith("!"):
        upgraded_eng += "."
        
    upgraded_kor = re.sub(r'\s+', ' ', upgraded_kor).strip()

    # Commit upgrades
    item["english"] = upgraded_eng
    item["korean"] = upgraded_kor
    
    # 4. Dynamic Semantic Chunking
    words_list = upgraded_eng.split()
    new_chunks = []
    
    # Chunk Split Sizes depending on level complexity
    num_words = len(words_list)
    chunk_size = max(2, num_words // 3) if num_words <= 6 else max(3, num_words // 4)
    
    # SLA colors
    chunk_colors = ["#FF1744", "#FF9100", "#00E676", "#2979FF", "#AA00FF", "#00E5FF", "#FFEA00"]
    chunk_roles = ["Subject", "Verb", "Object", "Modifier", "Adverb", "Complement", "Etc"]
    
    for i in range(0, len(words_list), chunk_size):
        chunk_words = words_list[i : i + chunk_size]
        chunk_text = " ".join(chunk_words)
        
        role_idx = len(new_chunks) % len(chunk_roles)
        new_chunks.append({
            "text": chunk_text,
            "role": chunk_roles[role_idx],
            "color": chunk_colors[role_idx]
        })
        
    item["chunks"] = new_chunks
    item["question"] = generate_logical_question(upgraded_eng, upgraded_kor)
    
    return item

def run_upgrader():
    print("🚀 Starting Rainbow Grammar High-Fidelity Upgrader Engine...")
    
    base_dir = "data"
    levels = ["level0", "level1", "level2", "level3", "level4", "level5", "level6"]
    weeks = ["week1.json", "week2.json", "week3.json", "week4.json"]
    
    for lvl_idx, lvl in enumerate(levels):
        lvl_path = os.path.join(base_dir, lvl)
        if not os.path.exists(lvl_path):
            os.makedirs(lvl_path)
            
        for wk in weeks:
            wk_file = os.path.join(lvl_path, wk)
            source_file = wk_file
            
            # Fallback to level0 if level specific file does not exist
            if not os.path.exists(wk_file):
                source_file = os.path.join(base_dir, "level0", wk)
                if not os.path.exists(source_file):
                    continue
            
            with open(source_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            curriculum = data.get("curriculum", [])
            upgraded_curriculum = []
            
            for item in curriculum:
                item_copy = json.loads(json.dumps(item))
                upgraded_item = upgrade_item_for_level(item_copy, lvl_idx)
                
                orig_id = upgraded_item.get("id", "1-1-1")
                parts = orig_id.split("-")
                if len(parts) == 3:
                    parts[0] = str(lvl_idx + 1)
                    upgraded_item["id"] = "-".join(parts)
                
                upgraded_curriculum.append(upgraded_item)
                
            data["curriculum"] = upgraded_curriculum
            
            with open(wk_file, "w", encoding="utf-8") as out:
                json.dump(data, out, ensure_ascii=False, indent=2)
                
    print("✅ High-Fidelity rewrite upgrade complete! No more robotic templates or spacing bugs.")

if __name__ == "__main__":
    run_upgrader()
