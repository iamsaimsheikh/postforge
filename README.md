# PostForge

**AI-powered LinkedIn content pipeline. Configure your niche, plug in your sources, get daily posts.**

PostForge generates LinkedIn, X, and Instagram posts with photo-backed image cards every day. It pulls trending content from your industry's RSS feeds, Reddit communities, and Google News, then writes posts that react to real topics instead of generating generic content.

Built and maintained by [Edge of Tech](https://edgeof.tech). Part of the Edge Pipelines (EP) automation suite.

![Edge Pipelines](assets/ep-logo.png)

---

## What You Get

- Daily LinkedIn post with photo-backed image card (1200x1200)
- X/Twitter post with card (1200x675)
- Instagram post with card (1080x1350)
- Content that reacts to real trending topics in your niche
- Configurable post types, brand colors, and voice
- Discord delivery with one-click review
- Everything saved to local `output/` directory with full history

## How It Works

1. PostForge pulls trending content from your configured sources (Reddit, RSS, Google News)
2. Claude generates a post reacting to the most relevant trending topic
3. Satori + Sharp renders photo-backed image cards with your branding
4. Posts are delivered to Discord (or saved locally) for you to review and publish

## Quick Start

```bash
git clone https://github.com/iamsaimsheikh/postforge.git
cd postforge
npm install
```

### Setup with Claude Code

If you have [Claude Code](https://claude.ai/code), just open the project and tell Claude what your niche is. It reads the CLAUDE.md setup guide and walks you through everything.

```bash
claude
# then say: "Help me set up PostForge for [your niche]"
```

### Manual Setup

**1. Config**

```bash
cp postforge.config.example.yaml postforge.config.yaml
```

Edit `postforge.config.yaml` with your details:

```yaml
name: "Your Name"
tagline: "Software Engineer"
niche: "software engineering and web development"

brand:
  accent: "#c8ff00"
  theme: "dark"
```

**2. Topics**

Define your post types in the config. Each one needs an id, label, description, and weight:

```yaml
topics:
  - id: "tip"
    label: "PRO TIP"
    description: "Share one specific, actionable technique."
    weight: 3
  - id: "industry-take"
    label: "HOT TAKE"
    description: "React to a trending topic. Take a stance."
    weight: 2
```

**3. Content Rules**

```bash
cp content/rules.example.md content/rules.md
```

Customize `content/rules.md` with your voice, hook formulas, and CTA styles.

**4. Sources**

Configure where PostForge pulls trending content from:

```yaml
sources:
  reddit:
    - "programming"
    - "webdev"
  rss:
    - url: "https://dev.to/feed"
      name: "Dev.to"
  news_keywords:
    - "software engineering"
```

**5. Photos**

Add 10-20 background photos to `photos/`. Organize by category or dump them flat.

Good free sources: [Unsplash](https://unsplash.com), [Pexels](https://pexels.com), [Pixabay](https://pixabay.com)

Dark, moody photos work best with the gradient overlay.

**6. Fonts**

Download and place in `fonts/`:
- [Inter](https://fonts.google.com/specimen/Inter): `Inter-Regular.ttf`, `Inter-Bold.ttf`
- [Poppins](https://fonts.google.com/specimen/Poppins): `Poppins-Bold.ttf`

**7. API Key**

```bash
export ANTHROPIC_API_KEY="sk-ant-your-key-here"
```

**8. Generate**

```bash
# One-time generation
npm run generate

# Run on schedule (cron)
npm run schedule
```

## Discord Delivery

Create a webhook in your Discord server (Server Settings > Integrations > Webhooks) and add the URL to your config:

```yaml
delivery:
  discord_webhook: "https://discord.com/api/webhooks/..."
```

Posts arrive with the full LinkedIn text, image cards, and metadata.

## Output

Every run saves to `output/YYYY-MM-DD/`:
- `linkedin.png` (1200x1200)
- `x.png` (1200x675)
- `instagram.png` (1080x1350)
- `content.json` (post text, metadata, card data)

## Example Niches

PostForge works for any professional niche. Some examples:

| Niche | Reddit Sources | RSS Feeds | Topics |
|-------|---------------|-----------|--------|
| Software Engineering | r/programming, r/webdev | dev.to, HN | coding-tip, tool-review, architecture |
| Marketing | r/marketing, r/digital_marketing | MarketingBrew | strategy, case-study, trend |
| Finance | r/finance, r/investing | Bloomberg RSS | market-insight, regulation, analysis |
| Logistics | r/logistics, r/supplychain | FreightWaves | operations-tip, trade-explainer |
| Design | r/design, r/UI_Design | Sidebar.io | design-principle, tool-review |
| Healthcare | r/medicine, r/healthIT | STAT News | clinical-insight, research, policy |

## Tech Stack

- **Claude** (Anthropic) for content generation
- **Satori** for JSX to SVG rendering
- **Sharp** for image processing and photo backgrounds
- **node-cron** for scheduling

## About Edge of Tech

PostForge is built by [Edge of Tech](https://edgeof.tech), a software development and AI automation agency. We build custom platforms, AI agents, and automation pipelines.

PostForge is one module from our Edge Pipelines (EP) suite, which powers automated content generation, lead warming, and business operations for our clients.

**More from Edge of Tech:**
- [edgeof.tech](https://edgeof.tech)
- [LinkedIn](https://linkedin.com/company/edgeoftech)
- [GitHub](https://github.com/iamsaimsheikh)

## License

MIT
