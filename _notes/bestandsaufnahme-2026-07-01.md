# Bestandsaufnahme 2026-07-01 (ersetzt Phase 0 des Portfolio-2026-Plans)

Quelle: Claude Code Recon-Workflow, 7 parallele Leser, jeder Bug-Befund adversarial gegengeprüft (39 Agents). Volle Rohdaten mit Belegen und Preserve-Listen: `_notes/recon-2026-07-01.json`.

## Kurzfazit

Die Site ist funktional deutlich gesünder als vermutet. Keine doppelten IDs, keine toten Referenzen (170+ geprüft), alle externen Links liefern 200, Erstlast der Startseite nur ~303 KB. Der "0+"-Counter-Verdacht bestätigt sich im Normalbetrieb NICHT (Logik wrlz.js:256-276 korrekt, "0" erscheint nur ohne JS). Die echten Baustellen: vier strukturelle Hero-Konflikte für den geplanten Umbau, zu viel dekoratives Parallax, 19,5 MB Gallery-Bilder, und die Copy verletzt flächendeckend die eigene Antithesen-Regel.

## Bestätigte Bugs (Cline, Phase 3)

- [medium] case-wrlz.html:82 Case-Nummerierung kollidiert: WRLZ und fairi tragen beide /01, Kanzlei /03 statt /04 (Index führt WRLZ als /03).
- [low] assets/js/wrlz.js:750 Marquee-Richtung invertiert: data-dir='left' läuft nach rechts.
- [low] wrangler.toml:7 not_found_handling='404-page' konfiguriert, aber keine 404.html vorhanden. Tote URLs liefern eine leere Antwort.
- [low] gallery.html:349 draw3D() greift ohne Guard auf analyser zu. Schlägt ensureAudio() fehl, wirft draw3D einen uncaught TypeError.
- [medium] gallery.html:232 Grid-Items sind a-Elemente ohne href: per Tastatur nicht erreichbar, figcaption ohne figure (invalides HTML).
- [low] gallery.html:220 Chaos-Layout wird einmalig berechnet, kein Resize-Rebuild, Items können rechts geclippt werden.
- Risiken (JSON, bugs.other): Lightbox ohne Keyboard, Lazy-Images ohne width/height, Dead Code (Spotlight/Scatter/reveal-line), kein noscript-Fallback für .reveal-Inhalte.

## Bestätigte CSS-Befunde (Cline, Phase 3)

- [medium] index.html:480 Orchestrierungs-Pulse laufen ohne prefers-reduced-motion-Check als Dauer-rAF.
- [low] assets/js/wrlz.js:36 Anker-Fallback erzwingt scrollIntoView smooth auch bei reduced-motion.
- [low] assets/js/wrlz.js:210 Binary-Flipper [data-flip] prüft nur isTouch, ignoriert reduced-motion.
- [low] gallery.html:342 Turntable-Canvas-Loop ohne reduced-Check.
- [low] case-hntz.html:38 .case-hero doppelt deklariert im selben Inline-Block, overflow:hidden überschreibt still overflow:clip.
- [low] assets/js/wrlz.js:186 Soundbar-Farben hartcodiert, Duplikate von --grass/--hot/--bubble.
- [low] assets/css/wrlz.css:259 Phantomfarbe rgba(243,233,219) dreifach, entspricht keiner Palette-Var.
- Struktur: 8 Farb-Vars + 5 Theme-Slots, Case-Overrides gewinnen nur über Ladereihenfolge (gleiche Spezifität). 66 distinkte font-size-Werte unterhalb der clamp()-Skala, keine Spacing-Tokens. Dreifach kopierte Bausteine (.read-col, .invert-block, Legal-CSS).

## Bewegungs-Inventar (Phase 1/3, Parallax-Bereinigung)

Signature-Pieces mit Funktion: Reel-Hero, Orchestrierungs-Diagramm, TraceV-Slider, Technics-Deck, Katzenpfoten. Drumherum Beiwerk: 33 statische data-px-Elemente plus 27 JS-generierte in der Gallery, 32 data-depth-Tilt-Layer, 6 Marquees, 94 Reveal-Elemente. Größte Unruhequellen: Statement-Sektion (5 gleichzeitige Bewegungen auf einer Aussage), Gallery-Drifts (lateral bis 1,2x Scroll-Distanz), Tilt+Parallax doppelt auf denselben Case-Hero-Layern. data-px-rot ist implementiert und nirgends genutzt.

## Hero-Umbau: Konflikte und Chancen (Phase 5)

Konflikte (alle bestätigt):
1. wrlz.js:329 waveFull-Crossfade lebt von der use-Doppelreferenz auf #waveContent. Ein Canvas lässt sich so nicht duplizieren. Lösung: Canvas als HTML-Layer mit CSS clip-path:url(#sClip), camTf bleibt am clipText (viewBox mappt 1:1 auf CSS-Pixel).
2. wrlz.js:643 Pfoten-Reveal ist dokumentfluss-basiert (offsetTop/scrollY). Im sticky .reel-pin bricht die Logik, muss auf Reel-p umgestellt werden (plus build()-Maße und fled-Reset).
3. wrlz.js:559 + 670 Klick-Konflikt im Pin: pulse() und Katzenflucht feuern beide, sobald Pfoten im Pin liegen.
4. wrlz.js:522 Klick-Puls rendert ausschließlich über drawWaves auf SVG-paths. Ersetzt die Strandszene die Wellen, braucht der Puls eine Portierung oder der Hint-Text (index.html:201) eine Anpassung.

Chancen (wiederverwendbar):
- Scrub-Kern tick()+applyScroll (wrlz.js:548) ist ein sauberes generisches Skelett. Framesequenz dockt als frame=round(p*(N-1)) direkt an. Canvas-Rendering in tick() integrieren, keine dritte rAF-Loop.
- fallCfg-Staffelung (wrlz.js:342) trägt das Stadt-Aufbrechen ohne Strukturänderung.
- camTf-Dolly + findInkAnchor (wrlz.js:484) bleibt nutzbar, solange das s eine Text-Glyphe bleibt.
- Sand-Imprint-Filter #sandpress und Pfoten-Geometrie sind vollständig portabel.
- z-index-Slot für die Canvas: 2 (zwischen reel-svg 1 und reel-letters 3). Achtung: Nav nutzt mix-blend difference, eine helle Strandszene invertiert die Nav-Farbe.
- Die Phasen-Kette besteht aus verstreuten Magic Numbers. Beim Umbau eine zentrale Phase-Map anlegen.
- Nahtfarbe des Tunnels ist hartkodiert sage #8FB1A6 (waveBg). Die Strandszene muss farblich anschließen, sonst springt der Crossfade.
- reduced-motion braucht einen definierten statischen Fallback (z.B. letzter Strand-Frame).

## Gallery (Phase 6)

Nicht versteckt (Nav-Link auf allen 9 Seiten, Sitemap). Voll gescrollt ~19,5 MB: 27 Grid-Bilder = 19 MB, zushi.png allein 5,1 MB bei 2048px für ~540px Anzeige. MP3 (16,5 MB) lädt korrekt erst nach Klick. Kleinster Eingriff, größte Wirkung: Bilder rekomprimieren (Ziel 2-3 MB) plus Lightbox mit Pfeil-Navigation, Caption, Zähler und fokussierbaren Grid-Items.

## Performance / Infrastruktur

- Startseite ~303 KB Erstlast, größter Posten Jakarta-Variable-TTF 174 KB (WOFF2 würde halbieren, Achtung: 1-Jahr-immutable-Cache auf /assets/fonts/*, bei Formatwechsel neuer Dateiname).
- Deploy ~40,5 MB, davon 4,6 MB unreferenzierte Bilder. 23 MB tote Fonts liegen im Repo (Inter/Lora, via .assetsignore vom Deploy ausgeschlossen). Die Site lädt ausschließlich Plus Jakarta Sans Variable.
- mascot.png (884 KB) im HNTZ-Hero lädt eager, einzige Lazy-Lücke.
- ffmpeg vorhanden, AVIF via SVT-AV1 möglich, KEIN WebP-Encoder (bei Bedarf: brew install webp für cwebp).
- Keine .env vorhanden, .gitignore deckt .env ab.
- Canonical/og:url zeigen auf https://pascaljaeger.de/ (die Live-Domain).

## Copy (Phase 4)

- [high] case-wrlz.html:136 Widerspruch: WRLZ-Terminal zeigt laufende Kanzlei-Pipeline mit Tageszahlen, der Kanzlei-Case sagt, es sind noch keine echten Aktendaten angebunden.
- [high] Antithesen-Verstöße flächendeckend: fairi (86), WRLZ (84, inkl. Konkurrenz-Bashing), HNTZ (87), Matchachin (106, "Red Bull ohne Red Bull" nennt zweimal eine Fremdmarke), Kanzlei (74, dreifach wiederholt), Index (474 "Gebaut mit Haltung. Kein Template.", "Haltung" dreimal auf dem Index).
- [medium] index.html:6 Gedankenstriche in allen title-Tags, og:title und der visually-hidden h1.
- [medium] case-wrlz.html:221 Matchachin fehlt in der Nächster-Case-Kette, Case-Footer inkonsistent.
- Unbelegte Kernzahlen: 70% Fixkosten, 3.321 Leads.
- Kein einziger "matcha"-Verstoß. Zahlen innerhalb der Cases konsistent (Kanzlei 72=13+34+8+17, HNTZ 15 Tester / 20.000 Zeilen überall gleich).
- Stärkstes Material, nicht anfassen: HNTZ-Lesespalte (178-181), Kanzlei-Türsteher-Absatz (132, 146), fairi-Schluss (151), Credo (index 347).

## Fakten-Check der Plan-Annahmen

- /goal existiert in Claude Code (ab v2.1.139), funktioniert wie im Plan beschrieben.
- Sonnet 4.6 existiert (Feb 2026). Aktueller ist Sonnet 5 (Juni 2026, 1M Kontext). Empfehlung für Cline: Sonnet 5, falls wählbar.
- mcp.motion.so: Recherche fand KEINEN offiziellen MCP-Server für motion.so (den Video-Generator). Vor Tag 2 verifizieren. Fallback für Phase 2: Kling AI / Leonardo AI per API.
- Motion AI Kit (motion.dev, Animationsbibliothek) existiert und funktioniert mit Claude Code, dokumentiert aber keine Scroll-Scrubbing-Beispiele. Der bestehende Scrub-Kern in wrlz.js kann das Scrubbing ohnehin tragen, motion.dev ist für Phase 5 optional.

## Preserve (Kurzform, Details im JSON)

Fallende Pappbuchstaben und Katzenpfoten werden umgebaut, nie gelöscht. Kein Build, kein Framework, keine npm-Dependency. Parallax über translate/rotate-Props, Tilt über transform, nie zusammenlegen. Skript-Reihenfolge: Inline-Scripts vor lenis.min.js vor wrlz.js. Case-Theme-Slots hängen an der Ladereihenfolge wrlz.css vor Inline-Style. reduced-motion-Dreiklang (JS-Guard, CSS-Block, Gallery-Fallback) synchron halten. Gallery-Seed 20120401 bleibt. og-card.png bleibt PNG/JPG. Kein Deploy ohne explizites "deploy" von Pascal.
