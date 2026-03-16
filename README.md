# The Innovative Lawyer — AI-beleidsscan

## Deploy naar Netlify

### Optie 1: Via GitHub (aanbevolen)

1. Push deze folder naar een GitHub repository
2. Ga naar [app.netlify.com](https://app.netlify.com) en klik **"Add new site" → "Import an existing project"**
3. Selecteer je GitHub repo
4. De build-instellingen worden automatisch gelezen uit `netlify.toml`
5. **Voeg je API key toe:** ga naar **Site settings → Environment variables** en voeg toe:
   - Key: `ANTHROPIC_API_KEY`
   - Value: je Anthropic API key (van console.anthropic.com)
6. Klik **Deploy**

### Optie 2: Handmatig deployen (drag & drop)

1. Installeer dependencies lokaal: `npm install`
2. Build het project: `npm run build`
3. Ga naar [app.netlify.com](https://app.netlify.com) → **"Add new site" → "Deploy manually"**
4. Sleep de `dist` folder naar het upload-veld
5. **Let op:** bij handmatige deploy moet je de Netlify Function apart configureren. GitHub-deploy is hiervoor makkelijker.

### API Key instellen

De API key wordt **nooit** in de code opgeslagen. In plaats daarvan:

- De frontend stuurt requests naar `/api/generate` (je eigen Netlify Function)
- De Netlify Function leest `ANTHROPIC_API_KEY` uit de environment variables
- De key is alleen zichtbaar in je Netlify dashboard, niet voor bezoekers

Stel de key in via: **Netlify Dashboard → Site settings → Environment variables**

### Lokaal ontwikkelen

```bash
npm install
npm run dev
```

Let op: lokaal werkt de Netlify Function niet zonder `netlify dev`. Installeer daarvoor de Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

En maak een `.env` bestand aan (staat in `.gitignore`):

```
ANTHROPIC_API_KEY=sk-ant-...
```
