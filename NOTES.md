# prompt-index notes

status: complete

## Spike (T1.c/T1.d, 2026-11-23 16:12)
OQ-1: (a) — jump by the session.append uuid; no renderId needed.
Evidence: .spike.jsonl, 3 new prompts (idle "hello", "explain git…", mid-turn "second one"): each UserMessage render requestId == its append uuid; 5 presses, all deny=null; Pedro: "all 3 jumped".
Gap: fresh session had no older prompts, so 0 backfill rows were logged. Backfill uses the same id by the API doc (SessionMessage.uuid "as session.append carries it", d.ts ~14984). Not proven live yet: the T3.a live check presses Enter on a backfilled row.
Seen: one render with requestId "placeholder" before the append (the engine's draft row). It never gets a uuid, so the index skips it.

## Copy drift vs PRD
FR-8 says "N older prompts not reachable". The API gives no total count, so the pane shows "Older prompts may not be reachable" when the read hits its 4096-row cap. Compaction detection is dropped from v1.

## Live check (T3.a/T3.b, 2026-11-23 16:17)
Pedro: all 4 worked (backfilled, slash cmd and new prompt jumps; new prompt appears with pane open; Esc back to typing, pane stays), 0 noise rows.
Backfill jump now proven live: old rows jump by their session.messages uuid.
Debug log: 72 prompt-index lines, module loaded, 0 skip/fail/error/disabled lines; toggles, session-board, haiku-search also loaded.
