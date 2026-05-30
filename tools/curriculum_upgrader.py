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
    # Strip punctuation
    clean_eng = re.sub(r'[^\w\s\']', '', english).strip()
    words = clean_eng.split()
    
    if len(words) < 2:
        return "Translate the sentence"

    # Lowercase words for matching
    lower_words = [w.lower() for w in words]
    
    # 1. Copula / BE Verb sentence (S + BE + C)
    if "is" in lower_words or "are" in lower_words or "am" in lower_words:
        # e.g., "She is a teacher." -> "What is her profession?" or "Who is she?"
        if "teacher" in lower_words:
            return "What is her profession?"
        if "student" in lower_words:
            return "What is your role?"
        if "blue" in lower_words:
            return "What color is the sky?"
        if "happy" in lower_words:
            return "How does she look?"
        # Fallback for BE verbs
        subject = words[0]
        return f"Describe {subject} or who they are."

    # 2. Sentences with because/if/when (Conjunctions)
    if "because" in lower_words:
        return "What is the reason or cause?"
    if "if" in lower_words:
        return "Under what condition will this happen?"
    if "when" in lower_words:
        return "At what time does this occur?"

    # 3. Transitive verb (S + V + O)
    # Check for common past tense
    if "bought" in lower_words:
        return "What did you buy?"
    if "solved" in lower_words:
        return "What did he solve?"
    if "read" in lower_words:
        return "What did she read?"
    if "built" in lower_words:
        return "What was built?"
    if "love" in lower_words:
        return "What do you love?"

    # 4. Passive Voice (S + be + p.p)
    if "written" in lower_words and "by" in lower_words:
        return "Who wrote this book?"
    if "spoken" in lower_words:
        return "Where or how is this language spoken?"
    if "built" in lower_words and "in" in lower_words:
        return "When was the structure constructed?"

    # 5. Modal verbs (can/must/should)
    if "should" in lower_words:
        return "What is highly recommended to do?"
    if "can" in lower_words:
        return "What ability do you possess?"
    if "must" in lower_words:
        return "What is a strict rule to follow?"

    # 6. Basic S+V (e.g. "Children play.")
    subject = words[0]
    verb = words[-1].lower()
    if verb.endswith('s') and not verb.endswith('ss'):
        return f"What does {subject.lower()} do?"
    else:
        return f"What do {subject.lower()} do?"

# 3. Restructuring / Upgrading Sentence and chunks for Spicy Levels (0-6)
# Each Level gets upgraded vocabulary, complexity, and distinct grammar chunks.
def upgrade_item_for_level(item, level):
    original_english = item.get("english", "")
    original_korean = item.get("korean", "")
    section = item.get("section", "Day 1")
    item_id = item.get("id", "0-0-0")
    
    # Base configuration mapping
    upgraded_eng = original_english
    upgraded_kor = original_korean
    
    # Rules to upgrade Level-by-Level (Adding complexity, adjectives, perfect tense, etc.)
    words = original_english.split()
    
    # We do a high-quality semantic transform depending on the level
    if level == 0:
        # Level 0 is the basic form. Ensure perfect Day 1 correction
        if original_english in DAY1_CORRECT_QUESTIONS:
            item["question"] = DAY1_CORRECT_QUESTIONS[original_english]
        elif not item.get("question") or item.get("question") == "Translate":
            item["question"] = generate_logical_question(original_english, original_korean)
        return item

    # Level 1: Spicy Modifier (Add beautiful descriptors/adverbs)
    elif level == 1:
        if original_english == "Stars shine.":
            upgraded_eng = "The beautiful stars shine brightly in the sky."
            upgraded_kor = "아름다운 별들이 하늘에서 밝게 빛난다."
        elif original_english == "Birds sing.":
            upgraded_eng = "The colorful birds sing happily in the morning."
            upgraded_kor = "그 다채로운 새들은 아침에 행복하게 노래한다."
        elif original_english == "Babies cry.":
            upgraded_eng = "The tiny babies cry loudly in their cribs."
            upgraded_kor = "그 작은 아기들이 그들의 요람에서 크게 운다."
        elif original_english == "Time flies.":
            upgraded_eng = "Time flies extremely fast when you are happy."
            upgraded_kor = "당신이 행복할 때 시간은 극도로 빠르게 흐른다."
        elif original_english == "Wind blows.":
            upgraded_eng = "The cold wind blows strongly from the north."
            upgraded_kor = "차가운 바람이 북쪽에서 강하게 분다."
        else:
            # Fallback level 1 modifier enrichment
            if len(words) >= 2:
                upgraded_eng = f"The lovely {words[0].lower()} always {words[-1].lower()} peacefully."
                upgraded_kor = f"그 사랑스러운 {original_korean.split()[0]}은 항상 평화롭게 작동한다."

    # Level 2: Spicy Time & Voice (Passive or Perfect Tense)
    elif level == 2:
        if "shine" in original_english.lower() or "Stars" in original_english:
            upgraded_eng = "The stars have been shining beautifully since dawn."
            upgraded_kor = "그 별들은 새벽부터 아름답게 계속 빛나고 있다."
        elif "sing" in original_english.lower() or "Birds" in original_english:
            upgraded_eng = "A lovely melody has been sung by the birds."
            upgraded_kor = "사랑스러운 멜로디가 새들에 의해 불려져 왔다."
        elif "cry" in original_english.lower() or "Babies" in original_english:
            upgraded_eng = "The babies had cried before they fell asleep."
            upgraded_kor = "아기들은 잠들기 전에 소리쳐 울었었다."
        else:
            # Passive transformation fallback
            upgraded_eng = f"A special task has been completed by {original_english.split()[0].lower()}."
            upgraded_kor = f"특별한 작업이 {original_korean.split()[0]}에 의해 완료되었다."

    # Level 3: Spicy Conjunctions (Compound/Complex sentences)
    elif level == 3:
        if "Stars" in original_english:
            upgraded_eng = "Stars shine because they produce immense energy in space."
            upgraded_kor = "별들은 우주에서 엄청난 에너지를 생성하기 때문에 빛난다."
        elif "Birds" in original_english:
            upgraded_eng = "Birds sing happily when the warm spring weather arrives."
            upgraded_kor = "따뜻한 봄 날씨가 찾아올 때 새들은 행복하게 노래한다."
        elif "Babies" in original_english:
            upgraded_eng = "Babies cry loudly if they are hungry or tired."
            upgraded_kor = "아기들은 배고프거나 피곤하면 크게 운다."
        else:
            upgraded_eng = f"{original_english} but we must stay focused on our goal."
            upgraded_kor = f"{original_korean} 하지만 우리는 우리의 목표에 계속 집중해야 한다."

    # Level 4: Spicy Relatives (Relative clauses / Infinitives)
    elif level == 4:
        if "Stars" in original_english:
            upgraded_eng = "The stars that we see at night are actually distant suns."
            upgraded_kor = "우리가 밤에 보는 별들은 사실 먼 태양들이다."
        elif "Birds" in original_english:
            upgraded_eng = "The colorful birds which live in the forest sing sweet songs."
            upgraded_kor = "숲속에 사는 다채로운 새들은 달콤한 노래를 부른다."
        elif "Babies" in original_english:
            upgraded_eng = "The babies who need attention usually cry to express themselves."
            upgraded_kor = "관심이 필요한 아기들은 보통 자신을 표현하기 위해 운다."
        else:
            upgraded_eng = f"The person who likes {original_english.split()[0].lower()} decided to learn more."
            upgraded_kor = f"{original_korean.split()[0]}을 좋아하는 사람은 더 많이 배우기로 결정했다."

    # Level 5: Max Spicy (Idioms & Advanced structures)
    elif level == 5:
        if "Stars" in original_english:
            upgraded_eng = "Seldom do stars lose their magnificent glow in the night."
            upgraded_kor = "밤에 별들이 그들의 장엄한 빛을 잃는 일은 좀처럼 없다."
        elif "Birds" in original_english:
            upgraded_eng = "It is highly essential for birds to exhibit their vocal prowess."
            upgraded_kor = "새들이 자신의 목소리 기량을 뽐내는 것은 대단히 필수적이다."
        elif "Babies" in original_english:
            upgraded_eng = "No sooner had the babies started crying than their mother arrived."
            upgraded_kor = "아기들이 울기 시작하자마자 어머니가 도착하셨다."
        else:
            upgraded_eng = f"Under no circumstances should you forget how {original_english.split()[0].lower()} works."
            upgraded_kor = f"어떤 상황에서도 {original_korean.split()[0]}이 어떻게 작용하는지 잊어서는 안 된다."

    # Level 6: Cosmic Rhetoric (Famous wisdom, highly complex phrasing)
    elif level == 6:
        if "Stars" in original_english:
            upgraded_eng = "Keep your eyes on the stars, and your feet on the ground."
            upgraded_kor = "눈은 별에 두고, 발은 땅에 디뎌라."
        elif "Birds" in original_english:
            upgraded_eng = "A bird does not sing because it has an answer, it sings because it has a song."
            upgraded_kor = "새는 답이 있어서 노래하는 것이 아니라, 노래가 있어서 노래하는 것이다."
        elif "Babies" in original_english:
            upgraded_eng = "A crying baby is the sweetest symbol of new life and pure potential."
            upgraded_kor = "우는 아기는 새로운 생명과 순수한 잠재력의 가장 달콤한 상징이다."
        else:
            upgraded_eng = f"To understand {original_english.split()[0].lower()} is to grasp the very core of wisdom."
            upgraded_kor = f"{original_korean.split()[0]}을 이해하는 것은 지혜의 핵심을 터득하는 것이다."

    # Commit upgrades
    item["english"] = upgraded_eng
    item["korean"] = upgraded_kor
    
    # 4. Generate chunks dynamically according to new English sentence
    clean_words = [re.sub(r'[^\w\s\']', '', w) for w in upgraded_eng.split()]
    new_chunks = []
    
    # Color mapping scheme (Consistent for all levels)
    # Subject: Red (#FF1744), Verb: Orange (#FF9100), Object: Green (#00E676), Modifiers: Blue/Purple
    chunk_colors = ["#FF1744", "#FF9100", "#00E676", "#2979FF", "#AA00FF", "#00E5FF", "#FFEA00"]
    chunk_roles = ["Subject", "Verb", "Object", "Modifier", "Adverb", "Complement", "Etc"]
    
    # Splitting logic: Let's split into 3-5 sensible semantic blocks depending on sentence length
    num_words = len(upgraded_eng.split())
    chunk_size = max(2, num_words // 4)
    
    words_list = upgraded_eng.split()
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
    
    # 5. Fix Question Alignments
    item["question"] = generate_logical_question(upgraded_eng, upgraded_kor)
    
    return item

# Main execution logic
def run_upgrader():
    print("🚀 Starting Rainbow Grammar Curriculum Upgrader...")
    
    base_dir = "data"
    levels = ["level0", "level1", "level2", "level3", "level4", "level5", "level6"]
    weeks = ["week1.json", "week2.json", "week3.json", "week4.json"]
    
    for lvl_idx, lvl in enumerate(levels):
        lvl_path = os.path.join(base_dir, lvl)
        if not os.path.exists(lvl_path):
            print(f"⚠️ Level directory {lvl_path} does not exist, creating it.")
            os.makedirs(lvl_path)
            
        for wk in weeks:
            wk_file = os.path.join(lvl_path, wk)
            source_file = wk_file
            
            # If the specific level file doesn't exist, we fall back to reading from level 0 for structural templates
            if not os.path.exists(wk_file):
                source_file = os.path.join(base_dir, "level0", wk)
                if not os.path.exists(source_file):
                    print(f"❌ Core source file {source_file} not found. Skipping.")
                    continue
            
            print(f"📖 Reading {source_file} for mapping to {lvl}...")
            with open(source_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                
            curriculum = data.get("curriculum", [])
            upgraded_curriculum = []
            
            for item in curriculum:
                # Avoid mutable shared state
                item_copy = json.loads(json.dumps(item))
                upgraded_item = upgrade_item_for_level(item_copy, lvl_idx)
                
                # Correct ID schema to reflect Spicy level
                # e.g., 1-1-1 for level 0 -> 2-1-1 for level 1
                orig_id = upgraded_item.get("id", "1-1-1")
                parts = orig_id.split("-")
                if len(parts) == 3:
                    parts[0] = str(lvl_idx + 1)
                    upgraded_item["id"] = "-".join(parts)
                
                upgraded_curriculum.append(upgraded_item)
                
            data["curriculum"] = upgraded_curriculum
            
            # Save upgraded curriculum
            print(f"💾 Saving upgraded curriculum to {wk_file}...")
            with open(wk_file, "w", encoding="utf-8") as out:
                json.dump(data, out, ensure_ascii=False, indent=2)
                
    print("✅ All Spicy Levels 0 to 6 completed upscaling and question alignments!")

if __name__ == "__main__":
    run_upgrader()
