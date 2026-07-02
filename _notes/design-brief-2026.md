# Design-Brief: KULISSENBRUCH (Phase 1, 2026-07-01, v1.1)

Relaunch pascaljaeger.de. Kein Code, dieser Brief ist die Vorlage für Phase 2 (Assets), Phase 3 (Fundament, Cline), Phase 4 (Copy) und Phase 5 (Bewegungsregie).

Entstehung: drei unabhängige Konzepte (Regisseur, Bühnenbildner, Redakteur), bewertet von drei Juroren (Awwwards-Blick, Technik-Blick, Marken-Blick). Einstimmiger Sieger: KULISSENBRUCH, der Bühnenbildner-Ansatz, veredelt mit den besten Ideen der Verlierer. v1.1 arbeitet die Funde von zwei adversarialen Kritikern ein (Lektor-Pass und SOTD-Juror-Pass). Faktenbasis: `_notes/bestandsaufnahme-2026-07-01.md`.

## 1. Das Konzept

**Logline:** Der eigene Name steht als Pappmonolith in einer Stadt aus Wellpappe, bricht sie beim Scrollen auf und öffnet im s eine Kulissenwand. Dahinter liegt ein realer griechischer Strand, über den Maya als Rauchsilhouette läuft.

**Warum es Pascal trägt:** Die Kulissen-Metapher ist strategisch ehrlich für einen Einzelnen. Der Hero zeigt das fertige Set, das Atelier zeigt den Tisch, auf dem es gebaut wurde. Das ist eine Maker-Story. Die Erzählung Hamsterrad zu Stille ist zugleich die Positionierung.

**Der Auftrag "episch":** Episch entsteht hier durch Maßstab (Untersicht, Anschnitt, Monolithe), durch ein einziges hartes Streiflicht mit Schlagschatten, die ganze Straßenzüge fressen, durch Tempo-Dramaturgie mit Halte-Beats und durch Materialphysik mit Gewicht. Verboten, weil es Miniaturen putzig macht: Tilt-Shift, Makro-Unschärfe, Bounce- und Elastic-Easings, Wackler, Sticker-Elemente. Die Stadt wird fotografiert wie Architektur, nie wie ein Modell.

## 2. Farbsystem

| Name | Hex | Rolle |
|---|---|---|
| Karton | `#B5885A` | Neu. Leitfarbe der Stadtphase, Kraftpapier-Deckschicht. Ernster Verwandter von Hot. |
| Umbra | `#57432E` | Neu. Flute-Schatten, Kantenbrüche, Gassen ohne Licht. Verhindert Bastel-Optik. Gebackener Nav-Streifen der Stadtphase. |
| Ink | `#1C1B19` | Bestand. Schlagschatten, gestanzte Fenster, Buchstaben in Ruhe, Nav und Text der Strandphase. |
| Chalk | `#F4EFE4` | Bestand. Streiflicht, Staub im Lichtkegel, Schnittkern der Pappe, Mayas Rauchkörper, Nav der Stadtphase. |
| Grass | `#8FB1A6` | Bestand. Das Scharnier: hartkodierte Nahtfarbe des Tunnels (waveBg), Portal-Innenlicht, Grading-Referenz des Meeres. |
| Aegaeis | `#2F6B66` | Neu. Tiefes Wasser, Horizont, dunkle Anker der Strandphase, gebackener Streifen hinter der Nav-Zone. |
| Linen | `#EBE5D7` | Bestand. Sand, Seitenhintergrund nach dem Hero, verbindet Strandframe und Dokumentfluss. |
| Hot | `#C77E52` | Bestand. CTA, Lichtkante der tiefen Sonne. Die einzige laute Farbe der Site. |
| Plum | `#6E2E40` | Bestand. Dämmerkante am Himmel, tiefste Warmschatten, Anker zu den Case-Themes. |
| Glut | `#DFA75C` | Neu. Punktfarbe, ausschließlich Glanzlichter auf Wasser (siehe Regel 2). |
| Maya-Eisblau | `#AED9E4` | Neu. Punktfarbe, ausschließlich Mayas Augen, nach ihrer echten Augenfarbe (Referenz-Kuration 2026-07-01). |

**Farbregeln:**
1. **Farb-Embargo im Hero:** Außerhalb der s-Glyphe tragen Karton, Umbra, Ink und Chalk vor p 0.55 die gesamte Fläche. Einzige Ausnahme ist das Portal selbst: Grass als Gegenlicht und die Strandfarben innerhalb des sClip. Prüfbares Kriterium für den Umschlag: zuerst ändert sich die Transluzenz der Pappe, dann die Palette. Hot existiert vor p 0.55 nirgends.
2. **Punktfarben-Gesetz:** Glut ausschließlich für Glanzlichter auf Wasser, Maya-Eisblau ausschließlich für Mayas Augen. Jeder weitere Einsatzkontext einer der beiden Farben ist ein Regelverstoß. (Geändert am 2026-07-01: die Augen waren als Glut geplant, Mayas echte Augen sind eisblau, die echte Katze schlägt die Palette. Details: `_notes/phase-2b-stufe1-referenzen.md`.)
3. **Die Naht ist heilig:** Portal-Innenlicht und Meeres-Grundton schließen an `#8FB1A6` an. Abnahme per Pixel-Sampling: Grenzpixel sind der 12-px-Saum innerhalb der s-Kontur der Naht-Frames, Toleranz ΔE unter 2 (alternativ ±3 pro RGB-Kanal). Nie nach Gefühl.
4. **Die Cases bleiben bunt:** Bubble `#C98792` und Lime `#B7C8B6` leben auf den Case-Seiten weiter. Die Entsättigung gilt für den Hero, sie ist keine Site-Regel. Die Buntheit unterscheidet Pascal von grauen KI-Portfolios.

## 3. Typografie

**Display: Zodiak Variable** (Fontshare, ITF Free Font License). Spec: Variable WOFF2, Achse wght 400 bis 900, Subset Latin, self-hosted, neuer Dateiname wegen 1-Jahr-immutable-Cache auf `/assets/fonts/*`. Scharfe, kontrastreiche Display-Serif mit Klingen-Serifen. Wirkt wie eine Kinotafel: Gravitas ohne Kitsch, mediterrane Wärme in den Kurven, klare Kante für Title Card und Case-Headlines. Entscheidung gegen Fraunces: laut Jury der Default-Serif der Awwwards-Saison 2024/25. Fallback in der Hinterhand: Fraunces Variable mit SOFT und WONK per CSS hart auf 0 gesperrt, falls Zodiak in den Styleframes zu scharf wirkt.

**Body: Plus Jakarta Sans Variable bleibt** (liegt im Repo, ist die Stimme der Site). Konvertierung nach WOFF2 halbiert das Font-Gewicht (174 auf rund 87 KB), ebenfalls mit neuem Dateinamen. Kein dritter Font, der Kontrast Display-Serif gegen ruhige Sans reicht.

**Mono:** System-Stack bleibt (Slate, Archivnummern, Metriken).

**Hierarchie-Disziplin:** Die Bestandsaufnahme zählt 66 distinkte font-size-Werte. Neu: eine benannte Skala als CSS-Vars (Display, H1, H2, Lede, Body, Small, Mono). Die Wertetabelle (clamp-Ranges, Verhältnis um 1.25) und Spacing-Tokens (8er-Basis) sind Phase-3-Deliverable, alles außerhalb der Skala fliegt dort raus.

## 4. Choreografie: Kulissenbruch in sieben Szenen

Scroll-Fortschritt p läuft 0 bis 1 über den gepinnten Hero (bestehender Scrub-Kern tick/applyScroll). Rückwärts läuft alles exakt zurück, die Stadt baut sich wieder auf. Jede Szene hat einen Slate-Namen (siehe Szenen-Slate, §5) und ein messbares Abnahmekriterium.

| p | Szene | Wirkung | Abnahme |
|---|---|---|---|
| 0.00–0.08 | **01 STADT.** Untersicht in eine enge Wellpappe-Gasse, schiefe Türme, gestanzte Fenster, ein hartes Streiflicht von links, Staub im Lichtkegel. Die Pascal-Buchstaben ragen als Monolithe zwischen den Häusern (DOM-Layer vor der Canvas). | Maßstab und Beklemmung. Der Besucher ist klein, die Stadt drückt. | Außer Staub bewegt sich nichts. Nav-Kontrast auf dem Umbra-Streifen mindestens 4.5:1. |
| 0.08–0.30 | **02 BRUCH.** fallCfg lässt die Buchstaben nacheinander kippen, jeder Aufschlag ist ein Kollaps-Beat in der Stadtsequenz: Wände knicken an Klebelaschen, Fassaden reißen entlang der Flute, Fenster brechen als Tafeln heraus, Staub steigt. Kamera-Dolly in der Sequenz gebacken. | Gewalt mit Gewicht. Papier klingt nach Abriss. | Die 5 Kollaps-Beats des Takes liegen per Mapping-Tabelle exakt auf den Aufschlag-p der Buchstaben (Richtwerte p 0.10 / 0.14 / 0.19 / 0.24 / 0.28). |
| 0.30–0.50 | **03 SOG.** camTf-Dolly auf die s-Glyphe, die Trümmerstadt weicht aus dem Bild. Der s-Binnenraum wird Portal: Kraftpapier-Innenkante, offene Welle, chalk-weißer Schnittkern, salbeigrünes Gegenlicht exakt `#8FB1A6`. Canvas bekommt clip-path url(#sClip), erste Strandframes nur innerhalb der Glyphe. Tempo zieht zur Kante hin an. | Sog. Ein Ziel, ein Lichtpunkt, alle Trümmer werden Rahmen. | Das Gegenlicht ist ein Live-Gradient, kontinuierlich an p gekoppelt, kein sichtbarer Stufensprung. |
| 0.50–0.66 | **04 UMSCHLAG (Kern bei p ≈ 0.55).** Der sClip skaliert über den Viewport, das Materialereignis bekommt das dichteste Frame-Fenster der Site (20 bis 24 Frames): die Pappe wird erst transluzent wie eine Theaterwand vor Licht, dann steht dahinter fotografischer Horizont, reales Meer, tiefe Sonne. Kein Weißblitz, kein Wisch. Das Durchleuchten liegt doppelt an: in den Frames UND als Live-Gegenlicht-Layer im sClip, damit die Magie nicht allein an Frame-Dichte hängt. Die Karton-Schnittkante ist ein eigenes Alpha-PNG-Layer und gleitet wie ein Türrahmen aus dem Bild. Nav bleibt Chalk (siehe §7.7, Ink-Wechsel nur falls das finale Grading die Szene hell macht). | Der stärkste Moment der Site. | Besteht schnelles Hin-und-her-Scrubben ohne Wisch-Eindruck. Naht-Pixel ΔE unter 2 gegen `#8FB1A6`. |
| 0.66–0.78 | **05 STILLE.** Kamera fast still, tief über dem Sand, nur Wellen und atmendes Licht. Easing-Plateau, die p-Zuordnung ist flach gedehnt, der Abschnitt fühlt sich doppelt so lang an wie sein Scrollweg. | Stille als Belohnung. Das Tempo-Gefälle trägt die Ernsthaftigkeit. | Bewegungsenergie unter 10 Prozent der BRUCH-Phase, messbar an der Frame-Differenz. |
| 0.78–0.92 | **06 MAYA.** Fast durchsichtige Rauchsilhouette, prozedural im Canvas (Silhouettenpfad plus driftende Partikel, kein Video-Asset), läuft gemütlich von links über den Sand. Augen als zwei eisblaue Lichtpunkte `#AED9E4`, nach Mayas echter Augenfarbe. Pfotenabdrücke über den portierten sandpress-Filter, Reveal an Reel-p. Klick gehört ab p 0.55 exklusiv der Katzenflucht, pulse() ist ab dort deaktiviert, Hint-Text angepasst. Stillstands-Belohnung: wer zwischen p 0.62 und 0.92 rund 4 Sekunden nicht scrollt, sieht Maya sich setzen und einmal blinzeln. Mehr nicht, das ist der Kitsch-Guard. | Wärme ohne Kitsch. Die Stille ist bewohnt. Die Site belohnt Ruhe als Verhalten, nicht als Behauptung. | Deckkraft der Silhouette 0.25 bis 0.40. Auf Touch reagiert die Flucht nur auf Treffer der Silhouetten-Hitbox, nie viewport-weit. |
| 0.92–1.00 | **07 ÜBERGABE.** Letztes Frame friert als Standbild (identisch mit dem reduced-motion-Bild). Title Card in Zodiak: Kicker, Tagline, CTA, dazu die Mono-Zeile `01 / Arbeit` als leiser Wegweiser. Pin löst, Lenis übergibt in die Atempause, dann Work. | Ankunft mit Auftrag. Die Cases wirken danach wie Beweise. | Standbild erzählt die Geschichte allein (Test: Screenshot ohne Kontext). Title-Card-Kontrast WCAG AA. |

**Title-Card-Text (Phase-4-Deliverable mit Leitplanken):** Die Tagline greift das Material des Films auf, nicht die Kategorie. Negativliste, verboten: „Ruhe schaffen", „Klarheit", „entlasten" und jeder Calm-Tech-Claim, den jeder KI-Berater unterschreiben könnte. Kandidat als Richtungsbeispiel: „Der Film hier ist selbst gebaut. Die Systeme dahinter auch." Kicker und CTA-Text ebenfalls Phase 4, CTA-Funktion bleibt „Projekt starten" Richtung Kontakt.

**Atempause definiert:** Die bestehende Atempause-Sektion bleibt als fast leere Fläche im Sandton Linen, Höhe rund 60vh, nur der Mikrotext bleibt. Sie erbt den Sand des Endbilds und ist der Puffer zwischen Film und Work-Grid.

**Licht- und Tempokurve (Stützpunkte für die Phase-Map, Feinschliff in Phase 5):**

| p | Helligkeit (relativ 0–1) | Tempo/Frame-Dichte |
|---|---|---|
| 0.00 | 0.50 | niedrig |
| 0.30 | 0.30 | hoch (Bruch) |
| 0.50 | 0.15 (Minimum) | Spitze |
| 0.58 | 0.95 (Sprung am Umschlag) | dicht |
| 0.78 | 0.90 | fast null |
| 1.00 | 0.90 | null |

Der langsamste Abschnitt liegt direkt hinter dem schnellsten, dieses Gefälle ist die Emotion.

**Die Brücke zur Dienstleistung:** Der Hero beweist Motion-Design, das Ziel der Site ist KI-Orchestrierung. Deshalb schlägt die Title Card die Brücke explizit im Text, direkt danach folgen Work-Grid und Orchestrierungs-Diagramm als Beweise. Das Diagramm bleibt prominent.

## 5. Bewegungsregeln, site-weit

**Das Bewegungs-Monopol:** Der Hero bekommt die Bewegung, danach herrscht Magazin. Konkrete Abrissliste (aus dem Bewegungs-Inventar der Bestandsaufnahme):
- Alle 33 statischen data-px-Drifts: raus.
- Die 27 JS-generierten Gallery-Drifts: raus (das Werkstattlampen-Gimmick ersetzt sie).
- Tilt+Parallax-Doppelung auf den Case-Hero-Layern: Tilt bleibt, Parallax raus.
- Die 5 gleichzeitigen Bewegungen der Statement-Sektion: alle raus, der Satz steht still.
- Marquees: nur der eine nach der Hero-Übergabe bleibt, Richtungs-Bug wird dabei gefixt.
- Reveals bleiben, aber mit einer einzigen, ruhigen Kurve.
- data-px-rot (ungenutzt): Code entfernen.

Was bleibt, weil es erzählt: Reel-Hero, Orchestrierungs-Diagramm, TraceV-Slider, Technics-Deck plus Equalizer, Katzenpfoten, Hover-States.

**Szenen-Slate:** Die Mono-Hint-Zeile wird Filmklappe: `02 / 07 BRUCH`, live aus der Phase-Map gespeist, zählt beim Scrubben vor und zurück. Beantwortet nebenbei die wichtigste Usability-Frage gepinnter Heros (wie lange noch) und macht die Bühnen-Metapher als Interface erlebbar.

**Ein Licht für die ganze Site:** Der Streiflicht-Winkel des Heros wird als CSS-Var festgeschrieben (`--light-angle`), jeder Schatten der Site leitet sich daraus ab: Cards, Buttons, Case-Heros, Atelier-Passepartouts. Nur die Werkstattlampe im Atelier darf die Var lokal bewegen. Abnehmbar wie die Naht: ein Winkelwert, kein Gefühl.

**Easing-Gesetz:** Nur Cubic-Kurven mit langem Auslauf. Bounce, Elastic, Overshoot und Wackeln sind site-weit verboten.

**Film-Grain:** Das Grain-Tile wird aus einem echten Karton-Frame gesampelt (Papierfaser, kein generisches Rauschen), läuft als CSS-Overlay über der gesamten Hero-Strecke und gibt Karton- und Fotophase dieselbe Textur-DNA. Grain wird aus den Frames entfernt (bessere Kompression) und so als CSS zurückgegeben. Gelingt kein überzeugendes Faser-Tile, wird Grain ersatzlos gestrichen.

## 6. Atelier (Gallery)

Die Modellbau-Werkstatt hinter dem Set. Der Hero zeigt die fertige Kulisse, das Atelier den Tisch, auf dem sie gebaut wurde. Flyer-Papier-Hintergrund bleibt, bekommt Werkstatt-Requisiten in derselben Materialsprache: Schnittreste mit offener Flute, Klebelaschen, Bleistiftmarkierungen. Die 27 Werke hängen als Set-Karten mit schmalem Karton-Passepartout und Mono-Archivnummern (Kontaktbogen-Logik).

Ein einziges Interaktions-Gimmick: der Cursor ist die Werkstattlampe, ein warmes Streiflicht wandert mit, Schlagschatten der Karten drehen physikalisch korrekt über `--light-angle` mit (CSS-Var plus transform, der vorhandene Spotlight-Dead-Code wird reaktiviert). Technics-Deck bleibt als Werkstattradio, Equalizer bleibt. Pflicht-Fixes aus der Bestandsaufnahme: Lightbox mit Pfeilnavigation, Caption und Zähler (Abnahme: komplett ohne Maus bedienbar), fokussierbare Grid-Items, Resize-Rebuild, draw3D-Guard, Bilder von 19 MB auf 2 bis 3 MB rekomprimiert. Das Atelier ordnet sich unter: kein Pin, kein Scroll-Film, gleiche Palette, gleiche Lichtlogik.

## 7. Technische Leitplanken (für Phase 3 und 5)

1. **Phase-Map statt Magic Numbers:** Eine zentrale Tabelle in wrlz.js definiert alle p-Schwellen, Easing-Segmente, die Licht/Tempo-Kurve, die Slate-Namen und das p-zu-Frame-Mapping. Jede Stufe ist eine reine Funktion von p, keine einseitigen Trigger. Damit gilt Rückwärts-Scrubbing automatisch für alles: Frames, Nav-Umschalter, pulse-Deaktivierung, Hint/Slate, Pfoten-Reveal, fled-Reset.
2. **Frame-Technik:** Canvas als HTML-Layer (z-index 2, zwischen reel-svg 1 und reel-letters 3) mit CSS clip-path url(#sClip) in der Portal-Phase. Rendering im bestehenden tick(), keine dritte rAF-Loop. Variable Frame-Dichte über p (dicht bei BRUCH und UMSCHLAG, dünn in den Ruhephasen), Opacity-Crossfade zwischen Nachbarframes.
3. **Budgets (hart), Desktop maximal 7 MB gesamt:** Stadt ~65 Frames / 2,8 MB, Umschlag 20 bis 24 Frames / 1,4 MB, Strand ~50 Frames / 2,3 MB, Endbild 0,5 MB (AVIF plus JPEG-Fallback zusammen). Frames gesamt unter 140. Mobile eigene Hochformat-Sequenz, maximal 4,5 MB: Stadt 1,8 / Umschlag 0,9 / Strand 1,3 / Endbild 0,5, Frames unter 110. Eine JS-Weiche wählt VOR dem Preload genau eine Variante.
4. **RAM:** Nie alle Frames dekodiert halten. Gleitendes Decode-Fenster um das aktuelle p (Größenordnung 24 Bitmaps via createImageBitmap), sonst stirbt der Tab auf iPhones.
5. **LCP und Netz-Realität:** Frame 0 und das Umschlag-Fenster laden priorisiert, der Rest lazy in Chunks. Scrollt der Nutzer den Chunks davon: letztes dekodiertes Frame halten, nie Schwarz, nie Spinner. Save-Data und prefers-reduced-data routen auf das statische Endbild.
6. **Codec:** AVIF via ffmpeg/SVT-AV1 (lokal vorhanden). Decode-Latenz früh auf iOS Safari messen, Plan B ist JPEG mit mehr MB, Entscheidung vor der Massenproduktion.
7. **Nav im Pin:** mix-blend difference wird IM HERO komplett ersetzt (difference auf den Karton-Mitteltönen der Stadtphase ist kontrastlos). Stadtphase: festes Chalk auf gebackenem Umbra-Streifen im Bildmaterial. Prototyp-Funde vom 2.7. mit echtem Material: ein globaler Umschaltpunkt bei p 0.55 ist zu früh, das Portal wächst von der Mitte und die Nav-Ecken werden zuletzt verschluckt (Ink stand auf dunkler Stadt). Mit dem gewählten Dämmerungs-Strand (m06b) ist zudem die Strandphase selbst dunkel genug für durchgehendes Chalk, inklusive Title Card in Chalk mit weichem Schatten. Ob ein Ink-Wechsel überhaupt stattfindet, entscheidet das finale Grading; falls ja, frühestens bei p 0.63 und getestet in beide Richtungen, beim Pin-Release und beim schnellen Hin-und-her-Scrubben. Außerhalb des Heros bleibt difference (funktioniert dort laut Recon).
8. **reduced-motion:** Vollwertiges statisches Endbild inklusive Title Card, Tagline und CTA. Die wichtigste Zielgruppe öffnet den Link mobil aus LinkedIn, das Standbild muss die Geschichte allein erzählen.
9. **Skip ohne Entschuldigung:** „Direkt zur Arbeit" als Mono-Link, ab der ersten Sekunde sichtbar, erster oder zweiter Tab-Stop, springt per Anker hinter den Pin. Rückweg-Falle vermeiden: Logo- und Anker-Klicks überspringen den Pin (Lenis immediate), rückwärts gescrubbt wird nur freiwillig.
10. **375px:** Eigene Bildkomposition (Safe-Area mittig, Türme beschnitten, nie gestaucht). Kein Layout-Bruch.
11. **Naht-Abnahme automatisiert:** Skript sampelt den 12-px-Saum innerhalb der s-Kontur der Naht-Frames gegen `#8FB1A6`, Toleranz ΔE unter 2, schlägt bei Abweichung Alarm.
12. **Phase-3-Pflicht:** Alle bestätigten Bugs und CSS-Befunde der Bestandsaufnahme werden in Phase 3 behoben (Case-Nummerierung, Marquee-Richtung, draw3D-Guard, reduced-motion-Lücken, hartcodierte Farben, .case-hero-Doppeldeklaration). Dazu eine 404.html im Konzept-Look: eine umgefallene Pappkulisse, eine Zeile, ein Link zurück. Ein Bild, kein Film.
13. **Preserve-Liste der Bestandsaufnahme gilt vollständig** (kein Build, Script-Reihenfolge, translate/rotate-Trennung, Buchstaben und Pfoten werden umgebaut, nie gelöscht).

## 8. Asset-Brief (Vorlage für Phase 2)

**Export-Spec (gilt für alle Sequenzen):** Desktop 1600×900, Mobile 810×1440. Extraktion aus dem Take mit ffmpeg, Reduktion auf die Zielframes über die p-Mapping-Tabelle (variable Dichte), AVIF-Qualität so, dass der Frame-Durchschnitt die Budgets aus §7.3 hält (Richtwert Desktop ≤ 45 KB, Mobile ≤ 30 KB pro Frame). Namensschema `stadt_0001.avif`, `naht_0001.avif`, `strand_0001.avif` plus Mobile-Präfix `m_`.

1. **Materialsheet zuerst** (6 bis 8 Styleframes als Prompt-Lock; Werkzeug: Midjourney bevorzugt, Pascal generiert manuell nach gelieferten Prompts, Ablage in `_notes/material/`, Leonardo-API als automatisierter Fallback; die freigegebenen Frames dienen Motion als Bildreferenz für Image-to-Video): einwellige Wellpappe (E-Welle), unbedrucktes Kraftpapier-Deckblatt, sichtbare Flute an jeder Schnittkante, chalk-weißer Papierkern, gestanzte Fenster mit leichtem Grat, Klebelaschen und Heißkleberfäden, handgeschnittene leicht unpräzise Kanten, Staub im Streiflicht. Licht: eine einzige harte warme Quelle flach von links. Kamera: Weitwinkel, Untersicht, durchgehende Schärfe, ausdrücklich kein Tilt-Shift. Architektur (ergänzt 2026-07-01): die Stadt ist eine normale westliche Alltagsstadt aus Pappe, deutsche Altstadt- und Gründerzeitfassaden plus schlichte Büroblöcke, Richtung Heidelberg/Düsseldorf, keine Fantasie-Zitadelle. Das Hamsterrad muss als eigener Alltag erkennbar sein. Erst nach Freigabe des Materialsheets wird Video generiert.
2. **Sequenz A, Stadt** (Kling-Web-App, manuell nach gelieferter Spec, EIN Take, 10 s, Startbild aus dem Materialsheet): Dolly durch die kollabierende Wellpappe-Stadt, Türme kippen, Wände knicken, Staub steigt. Farbwelt Karton/Umbra/Ink. Ohne Buchstaben, die bleiben DOM-Layer. Der Take braucht 5 klar erkennbare, zeitlich getrennte Kollaps-Beats; synchronisiert wird über die p-Mapping-Tabelle (Beats auf p 0.10 / 0.14 / 0.19 / 0.24 / 0.28), nicht über Video-Zeit. Frames extrahieren, nie Einzelbilder mischen (Flacker-Gefahr ist der Make-or-Break).
3. **Sequenz B, Strand** (Kling-Web-App, manuell nach gelieferter Spec, EIN Take, ~8 bis 10 s, Startbild aus dem Materialsheet): realer griechischer Inselstrand, tiefe goldene Sonne, ruhige Wellen, Kamera tief mit minimalem Drift. Grading auf Aegaeis/Linen/Hot/Plum, Meer-Grundton an `#8FB1A6` anschließend (Toleranz siehe §2 Regel 3).
4. **Naht: Live-Compositing statt gebackener Frames (umgesetzt und verifiziert am 2.7.):** Die Naht besteht aus vier Code-Schichten, keine Bild-Frames nötig. Erstens Karton-Schnittkante als SVG-Pattern-Stroke entlang der s-Kontur (Tile aus m04 gesampelt, `_notes/frames/naht/karton_kante.jpg`, 24 KB; Dicke wächst mit dem Zoom wie echte Pappdicke, gedeckelt; Flute-Richtung konstant wie bei echtem Pappschnitt). Zweitens Chalk-Schnittkern als dünne Innenlinie. Drittens Transluzenz: Grass-Glow auf der Stadtschicht um die wachsende Portalform (p 0.38 bis 0.56, die Wand wird durchleuchtet wie eine Theaterwand). Viertens Grass-Gegenlicht-Ring im Portal-Innern (Vermittlung zum dunklen Teal-Meer, Ring-Messung dRGB 18 gegen #8FB1A6). Vorteile: aufloesungsunabhaengig scharf, exakt scrubbing-synchron, der Budget-Posten von 0,8 MB entfaellt. Wichtig: ein CSS-drop-shadow-Filter um den geclippten Canvas rendert schwarz (Compositing-Falle), der Glow MUSS auf die Canvas-Schichten gezeichnet werden.
5. **Statisches Endbild:** Strand mit Pfotenspur, AVIF plus JPEG-Fallback (zusammen ≤ 0,5 MB). Dient als reduced-motion-Bild, noscript-Fallback, Save-Data-Ziel und Vorlage der neuen og-card (og bleibt PNG/JPG).
6. **Mobile-Kompositionen** von A und B (Hochformat-Kadrierung, eigene Bühne, siehe §7.10).
7. **Maya:** Referenz-Kuration ist erledigt (`_notes/phase-2b-stufe1-referenzen.md`, 5 Fotos ausgewählt und begründet), PLUS Abnahme des prozeduralen Canvas-Prototyps selbst (der Rauch darf nicht nach Partikeldemo aussehen). Die Rauchkatze wird prozedural gebaut, kein Alpha-Video nötig. Offene Bitte an Pascal: 10 bis 20 Sekunden Video von Maya im Profil beim Gehen, für den Gangzyklus in Stufe 3.

**Produktionsreihenfolge mit Notausstieg:** Zuerst ein einziger Naht-Frame-Prototyp: ein Übergangsbild, Grading-Abnahme per Sampling-Skript, Test im echten sClip, Bestehen beim schnellen Hin-und-her-Scrubben (nicht als Standbild). Sitzt die Naht nicht, ist der stärkste Moment ein Bug und der Rest Investitionsruine. Cut-down-Fallback, falls die Video-Pipeline scheitert: statisches Portal-Standbild im s plus Foto-Strand, die Choreografie bleibt, nur der Film entfällt.

## 9. Selbstkritik gegen generische KI-Defaults

1. **Genre-Ehrlichkeit:** Gepinnter Scroll-Film, Papierwelt, Portal im Buchstaben, Rauchtier: jedes Element gab es 2025/26 mehrfach auf Awwwards. Das Konzept gewinnt nichts durch seine Idee, es gewinnt durch Naht-Präzision, Material-Konsistenz und die persönliche Erdung (echter Name, echte Katze, echte Positionierung). Deshalb: Materialsheet-Lock, Ein-Take-Regel, Naht-Prototyp zuerst, Szenen-Slate und Licht-Var als eigene Handschrift.
2. **Font-Falle umgangen:** Inter und Space Grotesk waren nie im Rennen, aber auch Fraunces (Erstwahl des Sieger-Konzepts) ist der Serif-Default der Award-Saison. Darum Zodiak, mit Fraunces (Achsen gesperrt) als geprüftem Fallback.
3. **AI-Slop-Risiko:** Flackernde Papptextur zwischen Frames liest sich 2026 sofort als KI-Ramsch und Juroren strafen das härter als jedes andere Defizit. Ein Take pro Sequenz, Abnahme-Schleife mit Verwerfen ganzer Takes, Grain aus echtem Karton-Frame statt generischem Noise.
4. **Pathos-Kippgefahr:** Nebel, Lichtstrahlen, zu viel Rauch an der Katze, Musik-Gestik: ein Schritt zu weit und der Hero wird Trailer-Kitsch. Die Halte-Beats und die leere Atempause sind die Versicherung. Im Zweifel wird gestrichen. Maya ist der Kitsch-Kipppunkt: weniger Rauch, mehr Silhouette, die Pfotenspuren tragen die Szene, die Stillstands-Belohnung bleibt bei Sitzen plus einem Blinzeln.
5. **Purple-Gradient-Check:** bestanden, die Palette bleibt erdig. Die echte Versuchung ist Über-Entsättigung: wenn die ganze Site Karton wird, stirbt die Buntheit, die Pascal unterscheidbar macht. Darum Farbregel 4.
6. **Der blinde Fleck der Konzeptrunde:** Alle drei Konzepte waren dieselbe Grundidee in drei Anzügen, eine echte strategische Alternative (etwa ganz ohne Scroll-Film) wurde nicht getestet. Das Risiko ist akzeptiert und durch den Cut-down-Fallback abgefedert. Der Hero beweist zudem Motion-Design und nicht KI-Orchestrierung, diese Lücke schließen Title Card und Diagramm, nicht der Film.
7. **Sprach-Guard für Phase 4:** Regieanweisungen dieses Briefs („Gewalt mit Gewicht", „Wärme ohne Kitsch") sind Arbeitssprache und dürfen nicht in die Site-Copy rutschen, sie sind klassische Antithesen-Muster. Für die Tagline gilt die Negativliste aus §4.

## 10. Was unangetastet bleibt

Fallende Buchstaben und Katzenpfoten (Umbau ja, Löschen nie). Kein Build, kein Framework, keine npm-Dependency. Lenis bleibt. Fünf Cases als Kernstück mit eigenen Artworks und Theme-Slots. Stärkste Copy-Stellen (HNTZ-Lesespalte, Kanzlei-Türsteher, fairi-Schluss, Credo). Matchachin ist Guayusa. Tricho nur im HNTZ-Case. Kein Deploy ohne explizites „deploy".
