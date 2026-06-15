# HANDOFF — Portfolio v4 (pascaljaeger.online)

Stand: 2026-06-15. Für den nächsten Chat. Lies erst diese Datei, dann `_notes/session-2026-06-15.md`, dann den Projekt-Skill `~/.claude/skills/pascaljaeger-portfolio/SKILL.md`.

## Was das ist
Statisches, dependency-freies Multipage-Portfolio. Ziel: Pascal in die KI-Branche. Positionierung: out-of-the-box „Scanner"/ADHS-Denker, der komplettes Produktdenken + KI-Orchestrierung macht. Jede Seite ein eigenes Artwork. Ruhige Flyer-Palette, provokant aber erwachsen.

## LIVE
- Deployed: **https://pascaljaeger.pasco1280.workers.dev** (Cloudflare Workers Static Assets, Worker-Name `pascaljaeger`).
- Echte Domain **pascaljaeger.de** ist NICHT gemappt (separat im Cloudflare-Dashboard, noch offen).
- Deploy-Befehl: `npx wrangler deploy` (Pascal ist eingeloggt, OAuth `pasco1280@gmail.com`). **Deploy nur auf explizites „deploy" von Pascal** (Publish-Aktion).
- Git: alles committed auf `master`, letzter Commit `0c71bc3`.

## Stack & Regeln
- Reines HTML/CSS/Vanilla-JS, **kein Build**. Smooth-Scroll selbst gehostet (`assets/js/lenis.min.js`).
- Logik in `assets/js/wrlz.js`, Styles in `assets/css/wrlz.css`. Case-spezifisches CSS/JS inline pro Seite.
- Texte: Skills `precht-style` / `precht-clear`. **Nie Gedankenstriche, nie Antithesen.**
- Working Style: `/Users/wrlz.ai/Desktop/claude/CLAUDE.md`. Konventionen: Projekt-Skill (s.o.).

## Seiten
- `index.html` — Reel-Hero (3D-Pappbuchstaben „PaScal" + s-Tunnel/Dolly-Zoom in die Sinus-Fläche, klickbare Katzen-Pfoten mit mehreren Atempunkten), About + **Credo-Block**, Stats, Leistungen, **KI-Orchestrierungs-Diagramm** („KI als System", animierte Knoten + Selbstcheck-Schleife), Work-Grid, Kontakt (E-Mail + Calendly).
- `case-{fairi,hntz,wrlz,kanzlei,matchachin}.html` — je eigenes Artwork. Alle mit: Rückgrat-Band (`.case-spine`: Problem/Ansatz/Ergebnis + 3 Beweis-Kacheln), subtilem Brand-Logo-Wasserzeichen im Hero (`.hero-logo`), Live-Link im Hero (`.case-live`). fairi/hntz/matchachin zusätzlich mit Precht-Lesetext (`.read-col`). WRLZ zusätzlich mit **TraceV-Mini-Case** (Vorher/Nachher-Slider `.ba`).
- `gallery.html` — „Buntkram": Flyer-Papier-Hintergrund (überlappende Blätter), Technics-1210-Plattenspieler spielt `pride-tears.mp3`, **buntes 3D-Equalizer-Feld** (Frequenz-getrieben, additives Glühen), Lightbox auf Klick.
- `impressum.html`, `datenschutz.html`.

## Wichtige Fakten (nicht aus Code ableitbar)
- **Matchachin = Guayusa**, NIE Matcha. Quichua-Wort für den Wachzustand beim Guayusa-Trinken. Guayusa = koffeinreichste Pflanze der Welt. Dass „matcha" gleich geschrieben wird, war Zufall. Auf der Seite nie „matcha", auch nicht zur Abgrenzung. Siehe Memory `matchachin-bedeutung.md`. Live-Video (Beat als Intro): youtube.com/watch?v=b27ubyZfq4g.
- **TraceV** = Pascals KI-Vektorisierungs-Tool (geplante Domain `tracev.wrlz.ai`, WRLZ-Sub). „Freehand" ist nur das Design-Prinzip, NICHT der Name. Pre-MVP, lokal in `~/Desktop/claude/freehand_v2`. Live-Demo folgt.
- **Tricho Jenkins** = HNTZ-Maskottchen, Name-Reveal erst Cannafair. **Nur im HNTZ-Case** (Hero + Teaser), sonst nirgends. (Wurde aus dem Index-Hero entfernt.)
- Pascals Track: „Pride Tears" von Adamn Sampler (= Pascal), Beatport Charts 2012. `assets/audio/pride-tears.mp3`.
- Live-Links: WRLZ→wrlz.ai, fairi→fairi.app, HNTZ→hntz.app/beta.html, Matchachin→YouTube-Video. Kanzlei bewusst ohne (Enterprise/JustAI nicht öffentlich).

## OFFENE PUNKTE / mögliche nächste Schritte
1. **pascaljaeger.de mappen** (Custom Domain im Cloudflare-Dashboard), wenn die echte Domain live soll. Aktuell nur workers.dev.
2. **GitHub** (`pasco1280`) bewusst NICHT gefeatured: frisches Profil, 0 Sterne, „Repo Man", keine Bio. Erst nach Aufräumen (Name/Bio/Avatar, 3-4 Repos pinnen, READMEs) einen dezenten Footer-Link setzen.
3. **TraceV Live-Demo** (geführt, nur Sample-Bilder) auf Cloudflare deployen, dann Iframe in den WRLZ-Mini-Case. Key serverseitig, Abuse-Bremse.
4. Mobile + Performance bereits geprüft (60fps, keine langen Frames, Nav/Layout gefixt).

## Preview-Workaround (wichtig)
Lenis fängt programmatisches Scrollen ab, Preview pausiert rAF → gescrollte Screenshots unzuverlässig. Trick: temporär `window.__lenis = lenis;` in wrlz.js, mit `window.__lenis.scrollTo(y,{immediate:true,force:true})` scrollen, screenshoten, **Handle danach entfernen**. Sonst per DOM-Reads verifizieren. Audio/Equalizer brauchen eine echte Nutzergeste.
