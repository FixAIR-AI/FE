# AUDIT_12 - External Dependencies & APIs

## CDN Libraries

| Library | Version | CDN | Used In | Purpose |
|---------|---------|-----|---------|---------|
| Supabase JS | @2 (latest) | jsdelivr | ALL apps | Database, auth, realtime |
| Tesseract.js | @5 | jsdelivr | technician, index, docs | OCR for photo text extraction |
| jsPDF | 2.5.1 | cdnjs | technician, index, docs | PDF generation |
| docx | 8.5.0 | unpkg | technician, samples | Word document generation |
| FileSaver.js | 2.0.5 | cdnjs | technician, samples | File download trigger |
| Mermaid | @10 | jsdelivr | technician, docs, master | Diagram rendering |
| ElevenLabs Client | latest | esm.run | docs | Conversational AI SDK |
| Mapbox GL JS | 2.15.0 | api.mapbox.com | operations | Map display for technician locations |
| Inter Font | wght@300-800 | Google Fonts | ALL apps | Primary typeface |

### Library Usage by App

| App | supabase | tesseract | jspdf | docx | filesaver | mermaid | elevenlabs |
|-----|----------|-----------|-------|------|-----------|---------|------------|
| technician | x | x | x | x | x | x | |
| index (landing) | x | x | x | | | | |
| docs | x | x | x | | | x | x |
| operations | x | | | | | | |
| manager | x | | | | | | |
| admin | x | | | | | | |
| master | x | | | | | x | |
| auth | x | | | | | | |
| debug | x | | | | | | |
| invite | x | | | | | | |
| referral (r/) | x | | | | | | |

## External APIs

### n8n Webhooks (cherhabil.app.n8n.cloud)

| Webhook URL Path | Used In | Purpose |
|-----------------|---------|---------|
| `/webhook/fixair-assistant` | index, docs | AI assistant (production) |
| `/webhook/fixair-assistant-dev` | technician | AI assistant (dev) |
| `/webhook/fixair-copilot` | technician, index, docs | AI copilot chat |
| `/webhook/fixair-extraction-dev` | technician | Report data extraction (dev) |
| `/webhook/fixair-ocr` | technician, index, docs | OCR processing |
| `/webhook/fixair-approval` | master | User/company approval |
| `/webhook/support-login` | master | Support magic link login |
| `/webhook/email-send` | master | Email sending |
| `/webhook` (API_BASE) | technician, index, docs | Base webhook URL |

**[SECURITY] Note:** The technician app uses `-dev` webhook endpoints while index/docs use production endpoints. This suggests the technician app at go.fixair.ai may be hitting dev webhooks in production.

### ElevenLabs API

| Endpoint | Used In | Purpose |
|----------|---------|---------|
| `api.elevenlabs.io/v1/speech-to-text` | technician, index, docs, manager, admin | Voice transcription |

**API Key handling:** ElevenLabs API key is fetched from Supabase `app_settings` table at runtime (not hardcoded). This is the correct approach. [SECURITY OK]

### Supabase Edge Functions

| Function | Used In | Purpose |
|----------|---------|---------|
| `send-invite` | admin, manager | Send team invitation emails |

### Stripe (Payment)

| URL | Used In | Purpose |
|-----|---------|---------|
| `pay.fixair.ai/b/dRm7sKa3MbPAgxdfgR2VG00` | technician | Stripe checkout for subscription |

## Supabase Configuration

- **Project ID:** fwuhzraxqrvmpqxnzpqm
- **URL:** https://fwuhzraxqrvmpqxnzpqm.supabase.co
- **Anon Key:** Publicly embedded (expected for frontend - this is the anon/public key, NOT a secret key)
- **Auth:** Email/password, magic links, password reset
- **Realtime:** Used in admin, manager, operations for live updates
- **Storage:** No storage bucket usage found in frontend code [UNCLEAR - photos may be stored via base64 in jsonb columns]

## Shared Assets (assets/ directory)

### fixair-diagrams.css (530 lines)
Premium Mermaid diagram styling with dark theme. CSS variables with `fd-` prefix namespace. Supports flowcharts, sequence diagrams, state diagrams, ER diagrams, and Gantt charts.

### fixair-diagrams.js (546 lines)
Mermaid initialization and rendering engine. Public API via `window.FixAIRDiagrams`:
- `init()` - Initialize Mermaid with FixAIR theme
- `render(el, code)` - Render single diagram
- `renderAll()` - Auto-render all `.mermaid-placeholder` elements
- `sanitize(code)` - Fix French characters for Mermaid compatibility
- `applyStyles(el)` - Post-process SVG styling
- `restyleAll()` - Restyle existing diagrams

### logo-generator.html (219 lines)
Browser-based PNG export tool for FixAIR email logos. Creates 400x80px canvas (2x retina), renders SVG to PNG.

## Node.js Dependencies (samples/ only)

From `samples/package.json`:
```json
{
  "dependencies": {
    "docx": "^8.5.0",
    "file-saver": "^2.0.5",
    "jszip": "^3.10.1"
  }
}
```

These are only used for the offline sample report generator tool, not for the main application.
