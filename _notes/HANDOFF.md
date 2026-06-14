# HANDOFF — Portfolio v4 (pascaljaeger.online)

Stand: 2026-06-14. Für den nächsten Chat. Lies erst diese Datei, dann `_notes/session-2026-06-14.md`.

## Was das ist
Statisches, dependency-freies Multipage-Portfolio. Ziel: Pascal in die KI-Branche. Positionierung: Out-of-the-box-„Scanner“/ADHS-Denker, der komplettes Produktdenken + KI-Orchestrierung macht (kein „SAP Product Owner“). Jede Seite ist ein eigenes Artwork. Ruhige, sophistizierte „Flyer-Palette“, provokant aber erwachsen. Bunt wie er.

## Stack & Regeln
- Reines HTML/CSS/Vanilla-JS, **kein Build**. Deploy: Cloudflare (Workers Static Assets, `wrangler.toml`).
- Smooth-Scroll selbst gehostet: `assets/js/lenis.min.js`.
- Alle Interaktionen in `assets/js/wrlz.js`, Styles in `assets/css/wrlz.css`.
- Texte: Skills `precht-style` (schön/philosophisch) und `precht-clear` (technisch/klar). **Nie Gedankenstriche, nie Antithesen** (Pascal-Regel).
- Tonregeln & Working Style stehen in `/Users/wrlz.ai/Desktop/claude/CLAUDE.md`.
- **Projekt-Skill** mit allen Konventionen liegt unter `~/.claude/skills/pascaljaeger-portfolio/SKILL.md` — bei jeder Portfolio-Arbeit zuerst lesen.

## Seiten
- `index.html` — Landing. Reel-Hero (3D-Pappbuchstaben PACAL + s-Tunnel/Dolly-Zoom in die Sinus-Fläche), Katzen-Pfoten (Sand-Imprint, SVG-Filter), About, Stats, Leistungen, Marquee, Work-Grid, Kontakt (E-Mail + Calendly, KEIN Formular mehr).
- `case-fairi.html`, `case-hntz.html`, `case-wrlz.html`, `case-kanzlei.html`, `case-matchachin.html` — je eigenes Artwork.
- `gallery.html` — „Buntkram“ (heute fertig, siehe Session-Log).
- `impressum.html`, `datenschutz.html`.

## Wichtige Fakten (nicht aus Code ableitbar)
- HNTZ: 15 Beta-Tester, neue Landing live, Maskottchen **Tricho Jenkins** — Name wird erst auf der **Cannafair** verraten. Tricho-Figur **nur im HNTZ-Case** zeigen, nirgends sonst.
- Pascals Track: **„Pride Tears“ von Adamn Sampler (= Pascal)**, Beatport Charts 2012 (~Platz 47, Newcomer). `assets/audio/pride-tears.mp3`.
- Matchachin: Bilder in `assets/img/matchachin/` (bottle-lifestyle.jpg, guayusa1.png, matchachin_hp.png).

## OFFENE PUNKTE (zuerst klären)
1. **Index-Header-Kopf** (`.hero-peek`, index.html:25/163): Pascal will ihn größer + weniger versteckt. Konflikt: aktuell Tricho (`hntz/mascot.png`), der nur in HNTZ sein darf. → Pascal fragen: andere Illustration für den Header, oder Ausnahme?
2. Waveform animiert nur bei echtem Browser-Klick (Web Audio gesture) — auf echtem Gerät testen.

## Preview-Workaround (wichtig)
Lenis fängt programmatisches Scrollen ab und Preview-Tabs pausieren rAF → Screenshots im gescrollten Zustand sind unzuverlässig. Trick: temporär `window.__lenis = lenis;` in `wrlz.js` setzen, mit `window.__lenis.scrollTo(y,{immediate:true,force:true})` scrollen, screenshoten, **Handle danach wieder entfernen**. Bei Desync per DOM-Reads verifizieren.

## Deploy
Commit liegt auf `master` (heute). Push triggert Cloudflare-Deploy — nur pushen wenn Pascal live will.
