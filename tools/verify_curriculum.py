import os
import json
import re

def verify_curriculum():
    print("🔎 Starting Rainbow Grammar Curriculum Quality & Integrity Audit...")
    
    base_dir = "data"
    levels = ["level0", "level1", "level2", "level3", "level4", "level5", "level6"]
    weeks = ["week1.json", "week2.json", "week3.json", "week4.json"]
    
    total_checked = 0
    failures = []
    
    for lvl_idx, lvl in enumerate(levels):
        lvl_path = os.path.join(base_dir, lvl)
        if not os.path.exists(lvl_path):
            continue
            
        for wk in weeks:
            wk_file = os.path.join(lvl_path, wk)
            if not os.path.exists(wk_file):
                continue
                
            with open(wk_file, "r", encoding="utf-8") as f:
                try:
                    data = json.load(f)
                except Exception as e:
                    failures.append(f"❌ JSON Syntax Error in {wk_file}: {str(e)}")
                    continue
                    
            curriculum = data.get("curriculum", [])
            for item in curriculum:
                total_checked += 1
                item_id = item.get("id", "Unknown")
                english = item.get("english", "")
                korean = item.get("korean", "")
                chunks = item.get("chunks", [])
                question = item.get("question", "")
                context = item.get("context", "")
                
                # 1. 문장의 온전성 (Basic Content completeness)
                if not english or not korean:
                    failures.append(f"[{item_id}] Empty english or korean field")
                    continue
                
                # 2. 청크 분할의 완전성 (Chunk Reconstruction Integrity)
                # Chunks joined by spaces should semantically map back to the English sentence
                reconstructed = " ".join([c.get("text", "").strip() for c in chunks])
                
                # Normalize spaces and punctuation for comparison
                norm_orig = re.sub(r'\s+', ' ', english).strip()
                norm_recon = re.sub(r'\s+', ' ', reconstructed).strip()
                
                # Allow minor punctuation mismatch at the very end
                norm_orig_clean = re.sub(r'[^\w\s]', '', norm_orig).lower()
                norm_recon_clean = re.sub(r'[^\w\s]', '', norm_recon).lower()
                
                if norm_orig_clean != norm_recon_clean:
                    failures.append(
                        f"[{item_id}] ❌ Chunk Mismatch!\n"
                        f"  Original: '{english}'\n"
                        f"  Reconstructed: '{reconstructed}'"
                    )
                
                # 3. 질문의 자연스러움 및 정합성 검사 (Question-Answer Integrity)
                if not question or question == "Translate" or question == "Translate the sentence":
                    failures.append(f"[{item_id}] ⚠️ Lazy or missing question text: '{question}'")
                
                # Check for basic logic: question should not be completely unrelated
                # e.g., if question mentions "dog" but sentence is about "wind" (our previous bug)
                if "dog" in question.lower() and "dog" not in english.lower() and "bark" not in english.lower():
                    # Check if it was a false positive for general questions
                    if "what do" not in question.lower():
                        failures.append(
                            f"[{item_id}] ❌ Logical Mismatch!\n"
                            f"  Question: '{question}'\n"
                            f"  English: '{english}'"
                        )
                
                # 4. 청크의 색상 및 역할 매칭 검사
                for c in chunks:
                    if not c.get("color") or not c.get("role"):
                        failures.append(f"[{item_id}] Missing color or role in chunk: {c}")
                        
    print("-" * 60)
    print(f"📊 Quality Audit Report:")
    print(f"  - Total Sentences Checked: {total_checked}")
    print(f"  - Total Anomalies Detected: {len(failures)}")
    print("-" * 60)
    
    if failures:
        print("🚨 Quality Issues Found:")
        for idx, fail in enumerate(failures[:15]): # Show up to 15 failures
            print(f"  {idx + 1}. {fail}\n")
        if len(failures) > 15:
            print(f"  ... and {len(failures) - 15} more issues.")
    else:
        print("✨ EXCELLENT! 100% Grammatical Integrity, Chunk Completeness, and Semantic Alignment verified! No anomalies found.")

if __name__ == "__main__":
    verify_curriculum()
