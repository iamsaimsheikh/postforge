# PostForge Setup Guide

You are helping someone set up PostForge, an AI-powered LinkedIn content pipeline. Walk them through configuration step by step.

## What PostForge Does

Generates daily LinkedIn, X, and Instagram posts with photo-backed image cards. Pulls trending content from RSS feeds, Reddit, and Google News so posts react to real industry topics instead of generating generic content.

## Setup Steps

### 1. Config File

Copy `postforge.config.example.yaml` to `postforge.config.yaml`. Ask the user for:
- Their name
- Their professional tagline
- Their niche/industry
- Preferred accent color (hex, default #c8ff00)

### 2. Topics

Help them define 4-8 post types for their niche. Each topic needs:
- `id`: kebab-case identifier
- `label`: uppercase tag shown on cards (max 2 words)
- `description`: tells Claude what kind of post to write
- `weight`: frequency in rotation (1-3)

Examples by niche:
- **Software Engineering**: coding-tip, tool-review, architecture-take, career-lesson, open-source
- **Marketing**: strategy-tip, case-study, trend-analysis, tool-review, campaign-breakdown
- **Finance**: market-insight, investment-tip, regulation-update, career-advice, data-analysis
- **Healthcare**: clinical-insight, research-summary, tech-in-medicine, career-path, policy-update
- **Design**: design-principle, tool-review, case-study, trend-analysis, process-tip

### 3. Content Rules

Copy `content/rules.example.md` to `content/rules.md`. Customize it:
- Replace {{NAME}} and {{NICHE}} placeholders (or they auto-fill from config)
- Add industry-specific voice guidelines
- Add hook formulas relevant to their field
- Add CTA styles that fit their audience

### 4. Sources

Help them pick trending content sources:
- **Reddit**: 2-4 subreddits relevant to their niche
- **RSS feeds**: Industry publications with RSS feeds
- **News keywords**: 2-3 Google News search queries

### 5. Photos

They need background photos in the `photos/` directory. Options:
- Organize by category in subdirectories (e.g., `photos/tech/`, `photos/workspace/`)
- Or dump all photos flat in `photos/`
- Recommended: 10-20 high-quality stock photos, dark/moody works best
- Sources: Unsplash, Pexels, Pixabay (free stock photos)

### 6. Fonts

They need three font files in `fonts/`:
- `Inter-Regular.ttf`
- `Inter-Bold.ttf`
- `Poppins-Bold.ttf`

Download from:
- https://fonts.google.com/specimen/Inter
- https://fonts.google.com/specimen/Poppins

### 7. API Key

Set the ANTHROPIC_API_KEY environment variable:
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

Or create a `.env` file (not committed to git).

### 8. Discord Delivery (optional)

If they want posts delivered to Discord:
1. Go to their Discord server
2. Server Settings > Integrations > Webhooks > New Webhook
3. Copy the webhook URL
4. Paste it in `postforge.config.yaml` under `delivery.discord_webhook`

### 9. Test Run

```bash
npm install
npm run generate
```

This generates one post immediately. Check the `output/` directory.

### 10. Schedule

For daily automatic posting:
```bash
npm run schedule
```

Or use system cron/pm2/systemd to keep it running.

## File Structure

```
postforge.config.yaml    <- your config (from example)
content/rules.md         <- your content rules (from example)
photos/                  <- your background photos
fonts/                   <- Inter + Poppins .ttf files
output/                  <- generated posts saved here
```

## Troubleshooting

- "No fonts found": Download Inter and Poppins TTF files to fonts/
- "No photos found": Add .jpg/.png images to photos/
- "No postforge.config.yaml": Copy the example file
- "AI generation failed": Check ANTHROPIC_API_KEY is set
- Cards render with solid bg instead of photo: Add photos to photos/ directory
