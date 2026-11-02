import json

with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd\.system_generated\logs\transcript.jsonl", "r", encoding="utf-8") as f:
    user_inputs = []
    for line in f:
        obj = json.loads(line)
        if obj.get("type") == "USER_INPUT":
            user_inputs.append((obj.get("step_index"), obj.get("content", ""), obj.get("media", [])))

print(f"Total USER_INPUTs: {len(user_inputs)}")
for step, content, media in user_inputs[-3:]:
    print(f"--- STEP {step} ---")
    print("Media:", media)
    print("Content preview:", str(content)[:500])
