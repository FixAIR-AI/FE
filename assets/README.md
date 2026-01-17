# FixAIR Assets

This folder contains static assets for the FixAIR application.

## Email Logo Files

For Supabase email templates, we need PNG logos (base64 SVG doesn't work in all email clients).

### Required Files:
- `logo-email.png` - Orange FixAIR logo (for dark email backgrounds)
- `logo-email-white.png` - White FixAIR logo (for light email backgrounds)

### How to Generate:

1. Open `logo-generator.html` in a browser
2. Click "Download PNG" for each logo variant
3. Save the files in this `/assets/` directory
4. Commit and push to git

### Usage in Supabase Email Templates:

```html
<img src="https://go.fixair.ai/assets/logo-email.png"
     alt="FixAIR"
     width="200"
     style="max-width:200px;height:auto;">
```

### URLs after deployment:
- PROD: `https://go.fixair.ai/assets/logo-email.png`
- DEV: `https://lab.fixair.ai/assets/logo-email.png`
