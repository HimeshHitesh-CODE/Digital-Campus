import json, os

target = r"C:\Users\HiteshHimesh\.gemini\antigravity\scratch\Digital-Campus\scratch\full_user_request.txt"
with open(r"C:\Users\HiteshHimesh\.gemini\antigravity\brain\408cfbe0-82b7-4e34-817d-a7627aace1fd\.system_generated\logs\transcript_full.jsonl", "r", encoding="utf-8") as f:
    for line in f:
        obj = json.loads(line)
        if obj.get("step_index") == 5884:
            with open(target, "w", encoding="utf-8") as out:
                out.write(obj.get("content", ""))
            print("Wrote full user request to", target, "Size:", len(obj.get("content", "")))
            break
