# COMPLETE AUDIT REPORT: Report JSON Display Issue

**FILE:** `/technician/index.html` (branch: `claude/dev-lab-7iGKi`)
**DATE:** 2026-01-20
**PROBLEM:** Raw JSON shows in chat bubbles instead of being filtered/rendered. This happens BOTH when AI responds live AND when loading from database.

---

## FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLOW A: LIVE AI RESPONSE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User sends message                                                         │
│        │                                                                    │
│        ▼                                                                    │
│  sendMsg() [line 11894]                                                     │
│        │                                                                    │
│        ▼                                                                    │
│  fetch(webhookUrl) [line 12081]                                             │
│        │                                                                    │
│        ▼                                                                    │
│  aiResponse = data.response [line 12102]                                    │
│        │                                                                    │
│        ├──► Extract REPORT_DATA → updateDrawerPreview() [lines 12104-12127] │
│        │                                                                    │
│        ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │ cleanResponse = aiResponse.replace(                             │        │
│  │     /\[REPORT_DATA\][\s\S]*?\[\/REPORT_DATA\]/g, ''            │        │
│  │ ).trim()  [line 12134]                                          │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│        │                                                                    │
│        ▼                                                                    │
│  parsedResponse = parseMarkdown(cleanResponse) [line 12135]                 │
│        │                                                                    │
│        ▼                                                                    │
│  addMsg(panel, 'ai', parsedResponse) [line 12141]  ◄── DISPLAYED            │
│        │                                                                    │
│        ▼                                                                    │
│  chatHistory.push(aiResponse) [line 12144]  ◄── ORIGINAL with REPORT_DATA   │
│        │                                                                    │
│        ▼                                                                    │
│  saveMessage(..., aiResponse) [line 12149]  ◄── SAVED with REPORT_DATA      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLOW B: DATABASE LOAD                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  loadProject(projectId) [line 8757]                                         │
│        │                                                                    │
│        ▼                                                                    │
│  db.from('messages').select('*') [line 8901]                                │
│        │                                                                    │
│        ▼                                                                    │
│  for (const msg of messages) [line 8915]                                    │
│        │                                                                    │
│        ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │ content = parseMarkdown(msg.content)  [line 8952]               │        │
│  │          ▲                                                      │        │
│  │          │                                                      │        │
│  │   msg.content has ORIGINAL with [REPORT_DATA] block!            │        │
│  └─────────────────────────────────────────────────────────────────┘        │
│        │                                                                    │
│        ▼                                                                    │
│  addMsg(chat.chat_type, role, content) [line 8953]  ◄── DISPLAYED           │
│        │                                                                    │
│        ▼                                                                    │
│  Extract REPORT_DATA → updateDrawerPreview() [lines 8955-8974]              │
│                                                                             │
│  ═══ ALSO: switchMode() has same pattern at lines 7959-7974 ═══             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ALL JSON FILTERING POINTS (with line numbers)

| # | Line | Type | Regex/Condition | Works For |
|---|------|------|-----------------|-----------|
| 1 | 11424-11441 | `[REPORT_DATA]` wrapper | `/\[REPORT_DATA\]([\s\S]*?)\[\/REPORT_DATA\]/` | ✅ Proper REPORT_DATA format |
| 2 | 11443 | Strip unparseable | `/\[REPORT_DATA\][\s\S]*?\[\/REPORT_DATA\]/g` | Fallback strip |
| 3 | 11477-11494 | Markdown code block | `/```\s*(?:json)?\s*([\s\S]*?)\s*```/` | ✅ `resume`, `resultat`, `travaux` |
| 4 | 11496-11506 | Raw JSON (pure) | `startsWith('{') && endsWith('}')` | ✅ `resume`, `resultat`, `travaux` |
| 5 | **11509** | **Embedded JSON** | `/^([\s\S]*?)\s*(\{[\s\S]*"type"\s*:\s*"report"[\s\S]*\})\s*$/` | ❌ **ONLY `type:report`** |

---

## ROOT CAUSE IDENTIFIED

### The Bug: Line 11509 - Embedded JSON Regex

```javascript
// CURRENT (BROKEN):
const embeddedJsonMatch = trimmed.match(/^([\s\S]*?)\s*(\{[\s\S]*"type"\s*:\s*"report"[\s\S]*\})\s*$/);
```

This regex **ONLY** matches JSON containing `"type": "report"`.

But the AI returns JSON with fields like:
```json
{"client": {...}, "site": {...}, "resultat": {...}}
```

**NO `type: "report"` field** → Regex fails → JSON shows raw!

---

## WHY LARGE JSON FAILS

There's **NO character limit issue**. The problem is the **regex pattern**, not size.

**Scenario that fails:**
```
Voici les informations extraites du message:
{"client": {"societe": "ACME Corp"}, "site": {"adresse": "123 rue..."}, "resultat": {"status": "resolu"}}
```

| Filter | Why it fails |
|--------|--------------|
| REPORT_DATA (line 11425) | No `[REPORT_DATA]` wrapper |
| Code block (line 11477) | No ``` markers |
| Raw JSON (line 11497) | Doesn't START with `{` (has intro text) |
| **Embedded JSON (line 11509)** | **No `"type": "report"` in JSON** |

**Result:** All filters bypass → JSON displayed as raw text!

---

## COMPARISON: main vs technician

| Aspect | main (/index.html) | technician (/technician/index.html) |
|--------|-------------------|-------------------------------------|
| REPORT_DATA handling | Just strips (no render) | **HAS render fix** (lines 11424-11441) |
| Embedded JSON regex | Only `"type":"report"` | Only `"type":"report"` ❌ |
| Missing fix | Same issue | Same issue |

**CRITICAL:** The fix made on `claude/mermaid-diagram-styling-1Fdwy` is **NOT merged to dev-lab**!

---

## THE COMPLETE FIX

### Change Line 11509:

```javascript
// FROM (broken):
const embeddedJsonMatch = trimmed.match(/^([\s\S]*?)\s*(\{[\s\S]*"type"\s*:\s*"report"[\s\S]*\})\s*$/);

// TO (fixed):
const embeddedJsonMatch = trimmed.match(/^([\s\S]*?)\s*(\{[\s\S]*(?:"client"|"resultat"|"resume"|"travaux_effectues"|"type"\s*:\s*"report")[\s\S]*\})\s*$/);
```

This fix **already exists** on branch `claude/mermaid-diagram-styling-1Fdwy` (commit `cac01e4`).

### Why This Works:

The updated regex matches JSON containing **ANY** of:
- `"client"`
- `"resultat"`
- `"resume"`
- `"travaux_effectues"`
- `"type": "report"`

---

## ACTION REQUIRED

**Option 1:** Merge PR from `claude/mermaid-diagram-styling-1Fdwy` into `claude/dev-lab-7iGKi`

**Option 2:** Cherry-pick commit `cac01e4` to dev-lab

**Option 3:** Apply the fix directly to dev-lab

---

## RELATED COMMITS

| Commit | Branch | Description |
|--------|--------|-------------|
| `cce4642` | mermaid-diagram-styling-1Fdwy | fix: render REPORT_DATA in parseMarkdown before stripping |
| `dcfd292` | mermaid-diagram-styling-1Fdwy | fix: update REPORT_DATA detection to match actual AI JSON format |
| `cac01e4` | mermaid-diagram-styling-1Fdwy | fix: update embedded JSON regex to match actual AI response format |
