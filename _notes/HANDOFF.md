# HANDOFF — Portfolio v4 (pascaljaeger.online)

**UPDATE 2026-07-02 Abend: Relaunch KULISSENBRUCH, Stand für den neuen Chat.**

Lesereihenfolge: diese Datei, dann `_notes/session-2026-07-01.md` (komplettes Log beider Tage), dann `_notes/design-brief-2026.md` (freigegeben, v1.1 mit Nachträgen) und `_notes/bestandsaufnahme-2026-07-01.md`.

## Was FERTIG und gut ist (nicht neu machen)
- **Alle Assets produziert und im Budget:** 4 Kling-Sequenzen zerlegt und gegraded als AVIF-Frames in `_notes/frames/` (stadt 65/2,72 MB, strand 50/1,07 MB, m_stadt 60/1,74 MB, m_strand 45/1,27 MB), Endbilder (348 KB), Quellvideos in `_notes/video/`, Materialsheet kuratiert in `_notes/material/` (`_notes/phase-2-kuration.md`).
- **Maya:** Referenzen kuratiert (`_notes/phase-2b-stufe1-referenzen.md`), Gangposen aus 120-fps-Video in `_notes/maya/gang/`. Augen: Maya-Eisblau `#AED9E4`.
- **Cline Lauf 1:** Bug-Schicht erledigt (uncommitted im Working Tree!).
- **Phase 3b / Lauf 2: ERLEDIGT am 2.7. in Claude Code** (Cline hatte nur halb geliefert, Jakarta-WOFF2 fehlten komplett und das CSS zeigte ins Leere). Stand: Zodiak + Jakarta als WOFF2 mit `_2026`-Dateinamen, Typo-Skala komplett (`--fs-display` bis `--fs-mono-s`, 10 Steps), alle font-sizes auf der Skala bis auf 11 kommentierte Hero-/Artwork-/Icon-Ausnahmen (Case-Monolith, Marquee-Band, contact-mail Fit-Width, contact-ghost, Icons), Spacing-Tokens auf Sektionsabstände angewandt, Parallax-Abriss komplett (0 data-px site-weit, Gallery-JS-Drifts raus, Statement still inkl. Seesaw-Engine entfernt, rot-Code raus). Verifiziert bei 375/768/1440, Hero scrubbt, keine Konsolen-Fehler. Alles uncommitted im Working Tree.

## PASCALS URTEIL vom 2.7. Abend (bindend für den neuen Chat)
1. **Die Live-Site ist der Qualitätsmaßstab.** Ihr Reel-Hero (fallende Pappbuchstaben, s-Tunnel via camTf/findInkAnchor in wrlz.js) ist besser als alles, was der Prototyp daraus gemacht hat. Phase 5 baut AUF der bestehenden Mechanik auf (so stand es im Brief: Scrub-Skelett wiederverwenden), sie ersetzt sie nicht.
2. **VERWORFEN: die Fragment-/Partikel-Formation** des Namens aus v4 des Prototyps („Pixelkacke", viereckige Rechtecke, sieht billig aus gegen die detaillierte Pappstadt). Wenn „Name entsteht aus Trümmern" je wiederkommt, dann nur mit echten Pappstück-Sprites in Materialqualität. Für den Relaunch v1: gestrichen.
3. **Das Tor, exakte Spezifikation:** Die Kamera zoomt in das stehende S hinein. Der Anker liegt am tiefsten Punkt IM Buchstaben-Fleisch (findInkAnchor aus wrlz.js wiederverwenden, der naive Mittelpunkt driftet). Gezoomt wird, bis KEINE Kante des Buchstabens mehr im Viewport ist, rechnerisch geprüft (Ink-Abdeckung 100 %), erst DANN Clip-Freigabe. Der Buchstabe darf nie seitlich (links/rechts/oben/unten) aus dem Bild wandern.

## Was vom Prototyp trotzdem verwertbar ist (`_notes/prototyp/naht-mechanik.html`)
Die Technik-Bausteine, nicht die Optik: AVIF-Frame-Scrubbing mit Nachbar-Crossfade und Mapping-Tabelle (validiert, reversibel), Canvas-Layer mit clip-path url(#sClip) (Konflikt-1-Lösung), Grass-Glow-Vermittlung zur Naht plus Ring-Messung (`__pr.checkSeam`), Chalk-Nav durchgehend (Brief §7.7), Freeze-Hook `__pr.setP` für Preview-Screenshots. Warnung: CSS-drop-shadow um geclippte Canvas rendert schwarz.

## /goal (Pascals Frage: wo sind die Finalisierungen?)
Der Befehl existiert (Claude Code v2.1.139+), wurde in dieser Session aber nie gesetzt, wir haben konversationell gearbeitet. Prozessfehler, im neuen Chat pro Phase als Erstes setzen. Fertige /goal-Texte:
- **Phase 3b (nach Cline Lauf 2, zur Abnahme):** `/goal Zodiak und Jakarta laufen als selbst gehostete WOFF2 mit neuen Dateinamen, alle font-sizes liegen auf der neuen Skala, Spacing-Tokens existieren, alle data-px ausser im Hero sind entfernt, der Hero ist unveraendert funktionsfaehig, kein Layout-Bruch bei 375/768/1440. Stop nach 15 Turns.`
- **Phase 5 (Bewegungsregie im neuen Chat):** `/goal Der bestehende Reel-Hero ist erhalten und um die Frame-Sequenzen erweitert: Stadt-Frames hinter den fallenden Buchstaben, das s bleibt stehen, Kamera zoomt via camTf/findInkAnchor in das s bis Ink-Abdeckung 100 Prozent rechnerisch erreicht ist, erst dann Clip-Freigabe zum Strand. Rueckwaerts identisch, prefers-reduced-motion zeigt das Endbild mit Title Card, kein Layout-Bruch bei 375px. Belegt durch Screenshot-Sequenz in beide Richtungen. Stop nach 25 Turns.`
- **Phase 8 unverändert aus dem Plan.**

Der Rest dieser Datei beschreibt den Stand VOR dem Relaunch und bleibt als Basis gültig.

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
