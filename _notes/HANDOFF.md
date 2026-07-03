# HANDOFF — Portfolio v4 (pascaljaeger.online)

## MOBILE PICKER-LAYOUT-SPRUNG (3.7. Nacht, NOCH NICHT COMMITTED/DEPLOYED)
Pascal auf dem Live-Handy: beim Umschalten The Tide <-> Pride Tears auf dem Play-Screen
"bewegt sich alles", der Credit-Text unter dem Play-Button war nicht zentriert und hat den
Rest verschoben. Ursache: `.credit` (unter `#ui{display:grid;place-items:center}` /
`.entry{justify-items:center}`) hatte kein `text-align`, wurde als Grid-Item aber auf volle
Spaltenbreite (375px) aufgeblasen sobald der laengere Pride-Tears-Text ("· Beatport Charts
2012") auf 2 Zeilen umbrach — Text stand dadurch linksbuendig am Bildschirmrand statt
zentriert, UND weil die Zeilenzahl (1 vs. 2) die Gesamthoehe von `.entry` veraenderte, hat
`#ui`s Zentrierung den KOMPLETTEN Block (Picker + Play-Button + Credit) neu einsortiert —
das war das gemeldete "alles versetzt sich". Fix in `atelier/index.html`: `.credit` bekommt
`text-align:center`, `line-height:1.5`, `min-height:3em` (reserviert IMMER 2 Zeilen Platz,
The Tide mit 1 Zeile Text schiebt dadurch nichts mehr), mobil zusaetzlich `max-width:280px`
fuer einen ausgewogeneren Umbruch statt einer sehr langen + einer sehr kurzen Zeile. Verifiziert:
`#play`-Bounding-Box exakt identisch (x:141,y:360.5) bei The Tide UND Pride Tears auf 375px,
Desktop weiterhin einzeilig ohne sichtbaren Effekt durch die reservierte Mindesthoehe.

## NACHBESSERUNGEN NACH DEM ERSTEN LIVE-CHECK (3.7. spaete Nacht, COMMIT b8fa02c, DEPLOYED)
Pascal hat nach dem Deploy live getestet, drei Punkte kamen zurueck:
1. **Mobile-Hero-Ruckeln (Android)**: gemeldet als "subtile Glitches beim Scrollen, Meer/Katze
   betroffen, haengt mit der nicht ganz starren Android-Navi zusammen". Untersucht per Subagent
   + selbst verifiziert: `.reel`/`.breath` in index.html und `body{min-height}` in wrlz.css
   standen auf `vh` statt `svh`, UND der `resize`-Listener in wrlz.js (Zeile ~627) feuerte
   ungebremst bei JEDEM Resize-Event — Android feuert bei jeder Adressleisten-Ein/Ausblendung
   ein reines Hoehen-Resize, das loeste mitten im Scroll ein volles `layout()` + Redraw beider
   Canvas (teure `findInkAnchor()`, destination-in-Maskierung) aus. Fix: `vh`->`svh` an allen drei
   Stellen (matcht die bereits bestehende `.reel-pin{100svh}`-Konvention), Resize-Listener
   ignoriert jetzt reine Hoehenaenderungen (`Math.abs(w-lastW)<2` => return), reagiert nur auf
   echte Breitenaenderung. Verifiziert im Preview: Hoehen-only-Resize aendert Canvas-Groesse NICHT
   mehr, echte Breitenaenderung (Rotation) loest weiterhin korrekt neu aus. Kein SVG-Filter-
   Problem gefunden (initPaws() ist bereits inaktiv, totes Code), kein Lenis-Bug.
2. **In-Dive-Track-Wechsel**: Pascal wollte einen Button WAEHREND der Fahrt (nicht nur auf dem
   Play-Screen) um direkt zum anderen Track zu springen. Umgesetzt als Zeile im HUD-Panel
   ("⇄ [anderer Titel]"), Klick blendet die Leinwand kurz ab (kaschiert den Dispose/Rebuild-
   Sprung), wechselt Audio+Szene ueber das bestehende ensureTrackLoaded(), taucht wieder ein
   (diveT-Reset spielt den Sink-Effekt erneut, verdeckt vom Abblenden). `applyTrackSelection()`
   als gemeinsamer Helfer extrahiert (Picker-Klick und In-Dive-Wechsel nutzen denselben Code,
   Play-Screen-Picker bleibt nach Exit konsistent mit der zuletzt gewaehlten Spur). `#hud`
   brauchte `pointer-events:auto` im `.hud-on`-Zustand (war vorher nur Text, nicht klickbar).
   Verifiziert: Klick wechselt Track+Audio+HUD korrekt, kein Fehler, Picker nach Exit konsistent.
3. **Eigene og-card fuers Atelier**: Pascal meinte mit "Info-Bild bei Pride Tears" (per Rueckfrage
   geklaert) das Social-Share-Vorschaubild — die Atelier-Seite nutzte bisher die generische
   Seiten-og-card ("Pascal Jäger — Produkte denken. KI orchestrieren.", Strand-Foto), nicht
   Track-spezifisch. Neue eigene Karte gebaut: `assets/img/og-card-atelier.jpg` (1200x630,
   Unterwasser-Palette aus scene.js PALETTE, Lichtkabel-Andeutung in den TRACK_COLORS-Tönen,
   Zodiak-Headline "The Tide", Text in der etablierten dritten-Person-Stimme der Seite). Gebaut
   als eigenstaendige HTML-Komposition, per `google-chrome --headless --screenshot` exakt in
   1200x630 gerendert (kein Design-Tool involviert, kein WebGL-Frame-Grab noetig). `atelier/
   index.html`s `og:image` zeigt jetzt darauf statt auf die generische Karte.
Alle drei Punkte lokal verifiziert, aber NOCH NICHT committed/deployed — auf Pascals naechstes
"deploy" warten wie beim ersten Mal.

## DEPLOYED + SICHERHEITSVORFALL (3.7. Nacht): Atelier Dive ist live, .env war kurz offen
Commit `57d41a5`, dann `npx wrangler deploy` auf Pascals Wort "deploy". Live:
https://pascaljaeger.pasco1280.workers.dev — `/`, `/atelier/`, `/gallery` (Clean-URL-Redirect
von gallery.html, normal), Audio/MIDI-Assets alle mit 200 geprueft.
SICHERHEITSVORFALL beim ersten Deploy: `.env` (enthaelt KLING_ACCESS_KEY, KLING_SECRET_KEY,
LEONARDO_API_KEY) stand NICHT in `.assetsignore` und wurde von wrangler als oeffentliche
Static-Asset-Datei mit hochgeladen (HTTP 200 auf /.env bestaetigt). Sofort bemerkt (Wrangler-
Log zeigte `+ /.env` in der Upload-Liste), `.env`+`.env.local` zu `.assetsignore` ergaenzt,
sofort neu deployed — `/.env` liefert jetzt 404, verifiziert. Exposure-Fenster war kurz
(Sekunden bis niedrige Minuten zwischen den beiden Deploys), aber die Datei WAR live erreichbar.
**Pascal sollte die drei Keys (Kling Access+Secret, Leonardo) sicherheitshalber rotieren**,
auch wenn es keinen Hinweis auf Abgriff gibt — bei einem oeffentlich erreichbaren Secret kann
man Zugriff durch Dritte nie zu 100% ausschliessen. Andere Dotfiles/wrangler.toml/.git wurden
nachtraeglich geprueft, alle korrekt mit 404 (kein weiterer Vorfall).
LEHRE: `.assetsignore` und `.gitignore` sind ZWEI GETRENNTE Listen mit unterschiedlichem Zweck.
`.env` stand in `.gitignore` (daher nie im Git-Repo), aber NICHT in `.assetsignore` (daher live
exponiert) — beide muessen bei jedem neuen Secret/Config-File separat gepflegt werden, das eine
schuetzt nicht automatisch vor dem anderen.

## ATELIER DIVE GEBAUT (3.7. Mittag, Claude Code / Fable 5): /atelier als 3D-Tauchfahrt
Neue Route `atelier/index.html` + `atelier/src/*.js` (ES-Module, kein Build): WebGL-Unterwasserwelt
nach dem George-&-Jonathan-Prinzip. Pride Tears läuft als <audio>+AnalyserNode (Bänder wie im
Gallery-Bus), die Noten aus `assets/audio/pride-tears.mid` stehen als LICHT-SKULPTUR im Raum:
Zeit = Z-Achse (SPEED 7 u/s), Pitch = Y, Spur = Farbe (TRACK_COLORS in beams.js), Länge = Dauer,
alles eine InstancedBufferGeometry, Envelope rechnet der Vertex-Shader allein aus uTime (kein
CPU-Update). Pro Note ein Lichtfleck (Points, flammt beim Playhead). Kamera folgt dem Playhead,
Maus-Drag orbitet frei (XYZ), Wheel zoomt, Beat gibt FOV-Kick. Atmosphäre: FogExp2 (Farb-Lerp
Oberfläche→Tiefe), 1400 Plankton-Partikel (GPU-gewrappt um Kamera), Voronoi-Kaustik-Boden
(bass-reaktiv), 36 God-Rays (pulsieren mit Energy), warme Sonne am Start + Finale-Sonne ab
t-45s. 14 Werke aus der Gallery-Liste hängen als schwebende Tafeln (Passepartout + Halo,
lazy Texturen, toneMapped false) entlang der Reise. Einstieg: Endbild-Strand + Play-Kreis,
Dive-Transition (Blur/Kälte/Ripple, Kamera sinkt 6s), Ende: Endcard (Zodiak) mit Replay/Links.
THREE.js r170 selbst gehostet (`atelier/lib/three.module.min.js`, 676 KB), eigener MIDI-Parser
(~100 Zeilen, Tempo-Map, Multi-Track-ready). Fallbacks: kein WebGL2/reduced-motion/Save-Data →
Endbild + Musik (mode-still, Kenburns nur ohne reduced-motion). Esc/× beendet sauber.
Verifiziert im Preview: 61 fps Desktop UND mobil 375px, Orbit/Zoom/Replay/Exit/Endcard getestet.
Test-Hook: `window.__dive` (seek/time/stage/el — Achtung: Dev-Server kann kein HTTP-Range,
Seek klemmt lokal, live auf Cloudflare geht es).
WICHTIGE FALLE: `active` ist reserviertes GLSL-Wort (kostete eine Debug-Runde).

NACHMITTAGS-PASS (Pascals Feedback + 4 Stem-MIDIs): Der Raum ist jetzt RUHIG (kein FOV-Kick,
keine Kamera-Sinuswelle, Kaustik/Partikel fast entkoppelt vom Audio), NUR die Spuren leben.
Pascal hat 4 Stems geliefert (assets/audio/pride-tears-{bass,drums,other,vocals}.mid,
1059/3546/4952/219 Noten, volle Länge — die Vocal-Lücke ist Geschichte). main.js lädt die
Liste MIDI_URLS, eine Datei = eine Spur = eine Lane/Farbe (parseMidi(buf, forceTrack)):
0 Bass grün unten links, 1 Drums chalk-weiß unten rechts, 2 Other (Triangle-Synths) = warme
Leitspur Mitte (#E8925C, Pascals „rote Linie"), 3 Vocals rosé oben. DAW-Prinzip: parallele
Lanes, Akkorde fächern über pitch%24 vertikal (sonst brennt additive Überlagerung weiß aus).
Kamera (2. Iteration nach Pascals Feedback „anstrengend, limitiert"): DRAG-Orbit unbegrenzt in
alle Richtungen (theta unbounded, auch Rückwärtsblick auf anfliegende Spuren), Schwung beim
Loslassen, Maus-Position nur noch feines Parallax (±0.22 rad), Wheel + Pinch zoomen.
Beams (3. Iteration, „weniger Glow, runde Kabel"): Noten sind jetzt OPAKE Kapsel-Impostor
(rundes Profil via sqrt(1-r²), runde Kappen, discard-Kante, eigener Fog-Mix, depthWrite an,
KEIN Additiv-Stacking mehr), Grundleuchtkraft 0.75, weißer Kern nur beim Aufleuchten.
God-Rays als getrenntes weiches Additiv-Mesh, Lichtflecken dezenter, Werk-Halo 0.14.
AV-Latenz: anchor-basierte Clock, avOffset = 0.04 + outputLatency,
live tunebar via `__dive.setOffset(s)` — Pascal soll hörend nachstellen, Richtung: Bild zu
früh → Offset erhöhen. PREVIEW-FALLE: Panel setzt document.hidden → rAF pausiert →
`__dive.step()` rendert synchron einen Frame (wie __reel).
Sync-Werkzeug (Pascals Beat-Latenz-Feedback): Ziffer 0-4 waehlt Master/Bass/Drums/Other/Vocals,
Pfeil hoch/runter schiebt die Spur in 5ms-Schritten frueher/spaeter (beams.js setTrackOffset
verschiebt Position UND Trigger-Zeit zusammen, damit Kabel und Aufleuchten synchron bleiben),
gespeichert in localStorage (dive-track-sync). Grund fuer die Verspaetung: KI-Audio-zu-MIDI-
Transkription erkennt perkussive Einsaetze praezise, gehaltene Toene (Other/Vocals) systematisch
zu spaet (50-200ms), kein Bug im Sync-Code selbst (eine Uhr treibt alle Noten gleich).

GEOMETRIE-PASS (Pascals Feedback „Glitches beim Beruehren", „Zukunft muss verschlossen bleiben"):
Kabel sind jetzt ECHTE 3D-Zylinder (InstancedBufferGeometry auf CylinderGeometry-Basis, 6 radiale
Segmente, per-Instanz nur Skalierung/Verschiebung im Vertex-Shader, keine Rotationsmatrix noetig
weil die Geometrie einmalig per rotateX auf die Z-Achse gedreht wird) statt kamera-facing Billboard-
Impostor — kein Z-Fighting mehr moeglich, da echtes Volumen statt zweier sich kreuzender Ebenen.
Zukunfts-Sperre: `step(aMeta.x, uTime)` kollabiert die Geometrie auf einen Punkt (nullflaechig,
wird nicht gerastert) bis der Playhead die Note erreicht, danach normale Groesse — Vergangenheit
bleibt sichtbar (Envelope haelt nach dem Release einen Dimm-Sockel), Zukunft ist komplett
unsichtbar bis zum eigenen Einsatz. Verifiziert: kompletter Vorschub aller Noten +1000s macht die
Kabel vollstaendig unsichtbar (Regressionstest), 61fps trotz schwererer Geometrie, Screenshot mit
Blick zurueck zeigt nur Vergangenheit + aktuell aufleuchtende Kabel, keine Flacker-Artefakte.
PREVIEW-FALLE (neu entdeckt): Der Preview-Harness injiziert offenbar zwischen einzelnen Tool-
Aufrufen ein Escape, das den Escape-Handler (`stopAll()`) ausloest — Tests IMMER als EINEN
zusammenhaengenden eval-Call bauen (await/setTimeout innerhalb desselben Calls), nicht auf
State-Persistenz ueber mehrere separate Tool-Calls hinweg verlassen.

REFERENZ-ABGLEICH (Pascal schickte eine MKV-Aufnahme von georgeandjonathan.com, 3.7. Nachmittag):
Frames extrahiert und angeschaut (ffmpeg-Stills, kein Making-of-Text mehr noetig). Erkenntnisse:
geführte Text-Intro vor der freien Kamera ("Hello and welcome", "This is every note in the song",
"Drag the screen to move the camera"), runde Roehren mit weisser Spitze bestaetigen unseren Ansatz,
ABER Referenz-Palette ist sattes Neon (Magenta/Blau/Cyan/Limette) und Lanes liegen flacher/als
Fluchtpunkt-Korridor statt gestapelter Hoehen-Lanes. Pascal per AskUserQuestion entschieden:
Hybrid-Palette (eigene Markenfarben, aber satter) + kurze gefuehrte Intro wie die Referenz. Beides
umgesetzt (siehe unten). Volle Neon-Uebernahme und der Fluchtpunkt-Korridor-Umbau sind NICHT
gemacht (Pascal wollte die Lane-Geometrie nicht anfassen, nur Farbe+Intro).

ONPOINT-MIX + SYNC FINAL (3.7. Nachmittag): Pascal lieferte `Pridetears_onpoint.mp3` (identische
Laenge 411.48s, vermutlich Ableton-Re-Export mit korrigierter Stem-Ausrichtung) — eingesetzt als
assets/audio/pride-tears.mp3. Pascal hat per Pfeiltasten-Tool selbst auf -195ms Master-Offset
gestellt und das als richtig empfunden, jetzt als HARTER DEFAULT in audio.js (avOffset = -0.195,
localStorage-Override bleibt fuer weiteres Feintuning erhalten). Pro-Spur-Korrektur (setTrackOffset)
war mit dem Onpoint-Mix nicht mehr noetig, defaults bleiben bei [0,0,0,0].

FARBEN + INTRO UMGESETZT (3.7. Nachmittag): TRACK_COLORS in beams.js sind jetzt die echten
Seiten-Grundfarben (sage/chalk/plum/hot aus wrlz.css) rechnerisch in HSL aufgesaettigt (S+0.32,
L auf 0.58-0.68 angehoben) statt frei erfundener Hex-Werte: Bass `#71CFB1` (Sage), Drums `#EAC471`
(Chalk/Gold), Other/Leitspur `#E24672` (Plum/Magenta — bewusst die praesenteste Farbe fuer die
"rote Linie"), Vocals `#ED7E3B` (Hot/Orange). Kurze gefuehrte Intro in main.js (runIntroCaptions):
zwei Einblendungen nach dem Abtauchen ("Jede Spur ihr eigenes Licht" bei 2.2-5.8s, "Ziehen bewegt
die Kamera" bei 7.2-10.8s), eigenes `#caption`-Element in index.html im Look der Referenz-Textbox
(Border, Chalk-Text, dezenter Blur-Hintergrund), Timer werden in stopAll() sauber geklaert.
Verifiziert per Timeline-Log (0.5-0.8s-Schritte) und Screenshot: Timing exakt, keine Konsolenfehler.

MELODISCHE KONTUR (3.7. Nachmittag, Pascals Wunsch: "Spuren gehen auch mal hoch/runter/links/
rechts, nicht nur geradeaus"): layoutNote in beams.js ist jetzt zustandsbehaftet
(createLayout()-Factory statt reiner Funktion, ein Aufruf pro Szenenaufbau in main.js/createBeams,
noten muessen zeitlich sortiert durchlaufen werden — sind sie bereits). Pro Spur laeuft ein
gleitender Mittelwert (EMA, alpha 0.12) von Tonhoehe und Velocity mit; weicht eine Note davon ab,
verschiebt sich ihre Position in genau diese Richtung (hoeher als der Verlauf = Y nach oben,
lauter als der Verlauf = X zur Seite), auf ±9 Halbtoene bzw. ±0.55 Velocity geklemmt gegen
Ausreisser. GEFUNDENER BUG beim ersten Versuch: die Other-Spur lag bei x=0/y~9, praktisch exakt
auf der Default-Kameraposition (Kamera bei Theta=0 sitzt selbst nahe x=0) — der neue Ausschlag
schwenkte Noten direkt in die Linse, sah aus wie Kamera-Clipping (riesige rote Flaechen). Fix:
LANES-Basispositionen von x=0/y~9 weggerueckt, X-Skala von 9 auf 6 reduziert. Verifiziert:
Positions-Streuung deutlich groesser als die alten starren Spuren (X -7.8..8.1, Y -0.7..8.7 statt
vorher enger), kein Clipping mehr im Screenshot, 61fps unveraendert. LEHRE: bei jeder Aenderung an
Noten-Positionen pruefen, ob eine Spur zufaellig auf der Default-Kamera-Position liegt.

KARIBIK-PASS + HUD + LIGHTBOX (3.7. spaeter Nachmittag, Pascals Vier-Punkte-Feedback nach dem
Frau-Testlauf): (1) Wasser heller/tuerkiser statt Hamburger-Hafen-Gruen — PALETTE.fogSurface/
fogDeep in scene.js auf helles Tuerkis umgestellt, Fog-Dichte gesenkt (main.js + createStage),
toneMappingExposure 1.12->1.22. (2) Sandiger Boden — underwater.js floor ist nicht mehr rein
additiv/transparent auf Schwarz, sondern eine OPAKE Sand-Flaeche (warme Sand-Toene, Ripple+Grain-
Textur ohne Bild-Asset) mit der bestehenden Voronoi-Kaustik als Modulation obendrauf, nutzt jetzt
uni.fogColor/uni.fogDensity fuer den Distanz-Fade statt eigener Fade-Konstante. (3) Gallery-Werke
erscheinen frueher UND proportional zur Tracklaenge (t0=max(4,totalDur*0.02), t1=totalDur*0.92
statt fixer Sekundenwerte) — wichtig fuers geplante kuerzere Intro-Stueck. (4) Werke anklickbar:
gallery.js bekommt camera+canvas+onOpen-Parameter, eigene Pointer-Erkennung (Distanz>8px oder
Dauer>600ms = Drag, kein Klick), Raycaster gegen die Bild-Meshes, oeffnet eine neue Lightbox
(index.html #lightbox, groSSes Bild + eigener Schliessen-Button). BUG gefunden+gefixt: der
Lightbox-Close-Button lag exakt auf den Exit-Button-Koordinaten (beide top:22/right:26) — Fix ist
`.lightbox-on #exit { opacity:0; pointer-events:none }` plus den Close-Button als Kind von
#lightbox zu verschachteln (erbt automatisch dessen opacity/pointer-events-Kaskade, keine
doppelte Sichtbarkeits-Logik noetig). Escape schliesst jetzt zuerst nur die Lightbox (return),
zweites Escape verlaesst das Erlebnis — verifiziert in einem zusammenhaengenden eval-Call (die
Escape-Autoinjektion des Preview-Harness zwischen Tool-Calls verfaelscht sonst den Test, siehe
bekannte Falle oben).
HUD statt Kurz-Captions (Pascals Frau brauchte mehr Erklaerung): die alte 2-Zeilen-Sequenz
(#caption, runIntroCaptions) ist komplett ersetzt durch ein persistentes #hud-Panel oben links
im U-Boot-Look (ui-monospace-Font, Eckklammern via ::before/::after, pulsierender Punkt), zeigt
Trackname+Credit+Kurzerklaerung, bleibt 32s stehen (showHud()/hideHud() in main.js). Text ist
hart auf Pride Tears codiert, MUSS angepasst werden sobald der neue Suno-Track Standard wird.
Verifiziert: kein Shader-Fehler, Screenshot zeigt alle vier Punkte korrekt, 60-61fps stabil
(ein einzelner 46fps-Ausreisser war Tab-Ermuedung nach langer Testsession, kein Regressions-Bug,
durch Reload bestaetigt). Test-Hooks erweitert: `window.__dive.worksCtl()` und `.THREE`.

NAV-UMSTELLUNG + MOBILE-CHECK (3.7. Abend, Pascals Entscheidung "Galerie raus, Atelier drin"):
Site-weiter Nav-Link "Atelier" zeigt jetzt ueberall auf `atelier/index.html` statt `gallery.html`
(index.html x2, alle case-*.html, impressum.html, datenschutz.html — per sed ersetzt, verifiziert).
`gallery.html` bleibt als Datei bestehen (nicht geloescht, nur aus der Haupt-Nav entfernt) und
wurde umbenannt zu "Buntkram" (title/og:title/h1), damit nicht zwei Seiten denselben Atelier-
Titel tragen. atelier/index.html: der alte "← Atelier"-Zurueck-Link (zeigte auf gallery.html)
heisst jetzt "← Index" und zeigt auf ../index.html; die redundante "Zum Atelier"-Zeile in der
Endcard ist raus (man ist ja bereits im Atelier), Endcard hat jetzt nur noch Replay + Index.
sitemap.xml wurde NICHT angefasst (listet noch gallery.html, kein atelier/ — das ist ein
Deploy-Zeitpunkt-Thema, nicht jetzt).
Mobile-Verifikation der letzten Baenderung (375px): HUD-Panel ueberlappt den Exit-Button nicht
(24px Abstand gemessen), Lightbox oeffnet zuverlaessig per Touch-Tap (pointerType:'touch'
getestet, nicht nur Maus), Touch-Drag dreht die Kamera korrekt, Endcard sauber ohne die
entfernte Zeile, gallery.html traegt jetzt "Buntkram" im Titel. Keine Konsolenfehler.

THE TIDE EINGEBAUT (3.7. Abend): Pascals eigens komponierter Track ist jetzt der STANDARD-Beat
beim Eintauchen, Pride Tears ist die optionale Zweitauswahl. Dateien in `atelier_neu/music/the
tide/` (6 Stems: Drums/Bass/Keyboard/Percussion/Synth/Brass als WAV+MIDI, plus Master-MP3
"the tide.mp3", 232.6s/120bpm) kopiert nach `assets/audio/the-tide{,-drums,-bass,-keyboard,
-percussion,-synth,-brass}.{mp3,mid}`. main.js kennt jetzt ein TRACKS-Array (statt fest codierter
Konstanten) mit Titel/Credit/Audio-URL/MIDI-Liste/Spur-Labels/HUD-Text pro Track. Grosser Umbau
fuer Mehrfach-Track-Support:
- `ensureTrackLoaded(track)` ersetzt das alte einmalige `buildScene()`: promise-gepoolt (ein
  frueher Vorlade-Aufruf und ein Play-Klick auf denselben Track teilen sich dieselbe Promise,
  kein Doppel-Fetch), baut Audio IMMER frisch (neuer AudioContext pro Track), baut die 3D-Szene
  nur wenn sich der Track wirklich aendert (Replay desselben Tracks fasst weder Audio noch Szene
  an, wichtig weil Browser ein Limit an gleichzeitigen AudioContexts haben).
- beams.js/underwater.js/gallery.js haben jetzt alle eine `dispose()`-Funktion (Geometrien/
  Materialien/Texturen freigeben, Event-Listener abmelden), damit beim Track-Wechsel die alte
  Spur sauber aus der EINEN persistenten THREE.Scene raus- und die neue reinkommt — der Renderer/
  die Szene/Kamera selbst werden nur EINMAL erzeugt (zweiter `new THREE.WebGLRenderer` auf
  demselben Canvas waere riskant, siehe Kommentar in main.js).
- audio.js kennt keine Tracks/localStorage mehr: `createAudio(url, defaultOffset)` nimmt den
  Default als Parameter, persistiert nichts mehr selbst. main.js speichert Sync-Werte jetzt
  pro Track unter eigenen Keys (`dive-sync-<id>`, `dive-track-sync-<id>`), sonst wuerden sich
  Pride-Tears- und Tide-Korrekturen gegenseitig ueberschreiben (unterschiedliche Spur-Anzahl:
  4 vs. 6). The Tide hat noch KEINEN getesteten Sync-Default (defaultOffset:0, ungehoert) —
  Pascal muss das noch mit dem Pfeiltasten-Tool einmessen.
- Track-Picker auf dem Play-Screen (zwei Pill-Buttons, `.track-opt`), Klick laedt den
  gewaehlten Track schon im Hintergrund vor. HUD/Credit/Endcard sind jetzt komplett dynamisch
  (kein hart codierter Trackname mehr).
- Sync-Tool generalisiert: Zifferntasten 0-9 pruefen `currentTrack.labels.length`, ungueltige
  Tasten werden ignoriert (Pride Tears hat 4 Spuren "1-4", The Tide hat 6 "1-6").
Verifiziert: beide Tracks einzeln + Wechsel hin und zurueck (Dispose/Rebuild-Pfad), Replay ohne
Neuaufbau, Sync-Tool mit korrekten Labels pro Track, Endcard/HUD/Credit korrekt, keine
Konsolenfehler, 61fps mit The Tide.

OFFEN: (1) Pascal muss The Tide per Pfeiltasten-Tool einmessen (Standard ist aktuell 0ms,
ungetestet). (2) Feintuning (Lane-Positionen, Kamera-Default, ob die 6 Tide-Farben/Lanes so
passen) = Sonnet/Cline. (3) `atelier_neu/` (WAV-Rohdaten + MKV-Referenzaufnahme) ist in
.gitignore/.assetsignore. Dev-Server kann Verzeichnis-Index + avif/mp3/mid-MIME
(.claude/server.js erweitert), aber KEIN HTTP-Range (Audio-Seek klemmt lokal, live auf
Cloudflare geht es). (4) Noch nie deployed, alles nur lokal getestet — Deploy nur auf
explizites "deploy" von Pascal. (5) Nichts von alledem ist bisher committed.

PRE-DEPLOY-AUDIT (3.7. spaeter Abend, Pascal hat Commit+Deploy fuer "wenn das durch ist"
freigegeben): kompletter Pruefdurchgang vor dem ersten Go-Live.
- .gitignore/.assetsignore: `atelier_neu/` korrekt ausgeschlossen, `atelier/` UND alle neuen
  assets/audio/*-Dateien korrekt NICHT ausgeschlossen (waeren sonst live kaputt).
- git status sauber: nur erwartete Aenderungen, keine Stray-Dateien.
- Alle Audio/MIDI/Font/Frame-Pfad-Referenzen gegen echte Dateinamen gegengeprueft (Gross-/
  Kleinschreibung exakt gleich — macOS ist case-insensitive, Cloudflare-Deploy ist es nicht,
  klassische Falle die lokal nie auffaellt).
- Keine gallery.html-Restspuren mehr in anderen Seiten (nur noch ihr eigenes canonical-Tag).
  404.html unbetroffen.
- sitemap.xml war noch nicht aktualisiert: gallery.html stand mit Prioritaet 0.8 drin, /atelier/
  fehlte komplett. Gefixt: /atelier/ jetzt mit 0.8 (uebernimmt die Rolle), gallery.html auf 0.5
  runtergestuft (existiert weiter, ist aber nicht mehr die Hauptnav-Destination).
- ECHTER BUG GEFUNDEN UND GEFIXT: in main.js waren alle drei ensureTrackLoaded()-Aufrufstellen
  mit `if (full)` gated. Im Fallback-Modus (reduced-motion oder kein WebGL2) haette das bedeutet:
  `audio` bleibt fuer immer `null`, ein Klick auf Play crasht mit "Cannot read properties of
  null (reading 'play')". Fix: alle drei Aufrufe unconditional gemacht (ensureTrackLoaded baut
  Audio in jedem Fall, ueberspringt nur intern den 3D-Aufbau bei !full — das war schon richtig,
  nur die AUSSEREN if(full)-Gates drumherum waren der Fehler). Der reduced-motion-Modus liess
  sich im Preview-Tool nicht direkt erzwingen (keine Media-Emulation fuer prefers-reduced-motion
  verfuegbar), Fix ist stattdessen per Code-Lesung verifiziert (grep bestaetigt: keine if(full)
  mehr um die drei Aufrufstellen).
- Stresstest: 4x schnell hintereinander zwischen beiden Tracks gewechselt, dann eingetaucht —
  keine Konsolenfehler, kein Leck, Dispose/Rebuild haelt das aus.
Fazit: bereit fuer Commit+Deploy, SOBALD Pascal seinen Teil (The-Tide-Sync per Ohr einmessen)
bestaetigt hat. Bis dahin nicht deployen (Deploy-Trigger ist weiterhin das explizite Wort
"deploy", diese Freigabe war an die Bedingung geknuepft).

**UPDATE 2026-07-02 Abend: Relaunch KULISSENBRUCH, Stand für den neuen Chat.**

Lesereihenfolge: diese Datei, dann `_notes/session-2026-07-01.md` (komplettes Log beider Tage), dann `_notes/design-brief-2026.md` (freigegeben, v1.1 mit Nachträgen) und `_notes/bestandsaufnahme-2026-07-01.md`.

## Was FERTIG und gut ist (nicht neu machen)
- **Alle Assets produziert und im Budget:** 4 Kling-Sequenzen zerlegt und gegraded als AVIF-Frames in `_notes/frames/` (stadt 65/2,72 MB, strand 50/1,07 MB, m_stadt 60/1,74 MB, m_strand 45/1,27 MB), Endbilder (348 KB), Quellvideos in `_notes/video/`, Materialsheet kuratiert in `_notes/material/` (`_notes/phase-2-kuration.md`).
- **Maya:** Referenzen kuratiert (`_notes/phase-2b-stufe1-referenzen.md`), Gangposen aus 120-fps-Video in `_notes/maya/gang/`. Augen: Maya-Eisblau `#AED9E4`.
- **Cline Lauf 1:** Bug-Schicht erledigt (uncommitted im Working Tree!).
- **Phase 3b / Lauf 2: ERLEDIGT am 2.7. in Claude Code** (Cline hatte nur halb geliefert, Jakarta-WOFF2 fehlten komplett und das CSS zeigte ins Leere). Stand: Zodiak + Jakarta als WOFF2 mit `_2026`-Dateinamen, Typo-Skala komplett (`--fs-display` bis `--fs-mono-s`, 10 Steps), alle font-sizes auf der Skala bis auf 11 kommentierte Hero-/Artwork-/Icon-Ausnahmen (Case-Monolith, Marquee-Band, contact-mail Fit-Width, contact-ghost, Icons), Spacing-Tokens auf Sektionsabstände angewandt, Parallax-Abriss komplett (0 data-px site-weit, Gallery-JS-Drifts raus, Statement still inkl. Seesaw-Engine entfernt, rot-Code raus). Verifiziert bei 375/768/1440, Hero scrubbt, keine Konsolen-Fehler. Alles uncommitted im Working Tree.

## Phase 5 GEBAUT (2.7. Abend, Claude Code, /goal erfüllt)
Der Reel-Hero spielt den KULISSENBRUCH: Stadt-Frames als Canvas hinter den fallenden Buchstaben (retimed, Szene 01 steht bis p 0.08), das s bleibt als Ink-Glyphe im Wort, Tor öffnet sich 0.28 bis 0.42, Kamerafahrt 0.42 bis 0.68 via camTf/findInkAnchor, Clip-Freigabe bei rechnerischer Ink-Abdeckung 100 % (zMax = Viewport-Umkreis / Ink-Inkreis, Desktop ~50, Mobil ~90), danach Strand voll. Zentrale Phase-Map `PM` in wrlz.js, alles reine Funktion von p, rückwärts pixelidentisch (per Buffer-Hash belegt). Frames liegen in `assets/frames/` (JS-Weiche portrait/landscape vor dem Preload, Blobs komplett, Decode-Gleitfenster 10). reduced-motion/Save-Data/`?endbild`-QA zeigen das Endbild mit Title Card (Chalk auf Dämmerung). Wichtige Funde: CSS-clip auf SVG-Text kollabiert bei camZ > ~40 (Transform-Koordinaten sprengen die Clip-Rasterung), deshalb schneidet die Glyphe als Canvas-Maske (destination-in); der Anker wird direkt in Raster-Koordinaten gemappt (die alte Em-Box-Bruchteil-Mappung saß daneben, fiel nur nie auf, weil der grüne Crossfade sie kaschierte). Wellen/Puls sind raus (Brief-konform), Hint-Text nur noch „scroll", Test-Hook `window.__reel.setP/free/info` rendert synchron (Preview pausiert rAF). Offen für spätere Feinregie: Kollaps-Beats exakt auf Buchstaben-Aufschläge, Szenen-Slate, Skip-Link, Nav-Chalk auf Umbra-Streifen, Grass-Ring-Messung gegen die Naht-Toleranz, Maya (Szene 06), Title-Card-Copy (Phase 4).

## Szene 06 GEBAUT (3.7.): Rauch-Maya aus Kling-Take
Der prozedurale Weg (Canvas-Partikel, auch mit echten Video-Masken via Apple Vision) ist VERWORFEN, Pascals Urteil: sieht kacke aus, zu wenig Mystik. Gewonnen hat ein Kling-Take, den Pascal generiert hat (`_notes/video/maya_take1.mp4`, statisches Weitwinkel, ein Take ohne Schnitt): Qualm weht rein, verdichtet sich zur hellen leuchtenden Bengal mit eisblauem Auge, läuft die Wasserlinie entlang, löst sich vor den Felsen wieder in Licht auf. Einbau: 48 Frames (1,2 MB, gegraded wie der Rest) in `assets/frames/maya/`, PM: strand endet 0.78 und hält, maya 0.78 bis 0.985 mit Crossfade 0.78 bis 0.815, Title Card auf 0.90 bis 0.99 verschoben. Mobile-Maya NACHGEREICHT (3.7.): eigener Hochformat-Take (`_notes/video/maya_mobil_take1.mp4`, 810×1440, 34 Frames, 1,3 MB, `assets/frames/m_maya/`), Mobile-Gesamtbudget jetzt 4,55 MB (Ziel war 4,5). Deckkraft-Fix (Pascal: "Katze zu präsent"): `MAYA_MAX = 0.4` in applyScroll deckelt die Blend-Kurve, gilt für Desktop und Mobil gleich, der Strand scheint durchgehend durch sie hindurch. Atempause auf 60vh gekürzt, Abziehbild-Pfoten stillgelegt (initPaws ruht, sandpress-Filter bleibt für eine spätere Pfotenspur). WICHTIGE PIPELINE-FALLE: ffmpeg `-f image2` mit libsvtav1 splittet AVIFs kaputt (Chrome dekodiert sie nicht, ffmpeg schon!). Frames IMMER einzeln über den avif-Muxer encodieren: erst PNGs ziehen, dann pro Datei `ffmpeg -i m.png -frames:v 1 -c:v libsvtav1 -crf 36 out.avif`. Prompt-Lehren für Kling stehen im Chat-Log: keine Close-up-Details (erzwingt Schnitt), kein „tracking shot", Kopf nur im Profil (sonst Augen am Hinterkopf), Schluss-Beat explizit beschreiben.

## NARDI-PASS (3.7. Nacht): das Atelier ist jetzt das Instrument
Referenz auf Pascals Wunsch: Luca Nardi (Awwwards-Jury, immersive Sound-Portfolios). Prinzipien als Skill destilliert: `~/.claude/skills/luca-nardi-sound-design/SKILL.md` (Sound als Bindegewebe, Trägheits-Hierarchie, Farbe pulsiert als Licht nie als Fläche, benannte filmische Momente, Partikel nur im Licht, Scroll dirigiert mit, 60fps als Ästhetik). Umgesetzt in gallery.html: Puzzle-Shift der Papierbahnen auf Beats mit Federrückkehr (`--puz-a/b`, even/odd, GPU), Höhen-Licht als Overlay-Tint (`--au-high` × 0.22, Grass→Bubble→Hot als Licht), Werkstatt-Staub im Lichtkegel bei Bass-Kicks (Canvas, max 34 Partikel), Nadel-Drop-Aufwachwelle (gestaffelt, Welle führt translate bis waveUntil), Scroll-Geschwindigkeit fließt in den Puzzle-Stoß. Hero: fallCfg auf ECHTE Take-Beats gelegt (ffmpeg-Szenenanalyse seqA: Vorbeben p 0.14/0.18 ohne Buchstaben, Aufschläge auf 0.30/0.40/0.47). Alles verifiziert: 60fps mit sämtlichen Schichten, Puzzle schwingt, Tint koppelt, Staub zeichnet, Hero-Szene-01 steht bis 0.127. Noch offen aus der Feinregie: Szenen-Slate + Skip-Link im Hero, Cline-Politur-Lauf.

## GOAL AKTIV (Pascal, 3.7.): Awwwards-Nominierung als Messlatte
„Ein absolutes Erlebnis auf der kompletten Seite, das Sounderlebnis von Pride Tears in Kombination mit der Kunst." Gilt als Qualitätsanker für alles Weitere. Entscheidungen dazu (3.7. Abend): die Gallery-Seite ist jetzt TEXTFREI (ADHS-Nähkästchen entfernt, Hero nur noch visually-hidden h1, Einstieg = direkt das Deck auf der Papierlandschaft), site-weit heißt sie **Atelier** (Nav-Labels, title, og). Erlebnis-Schichten von Claude Code gebaut und verifiziert: wandernde Werkstattlampe (.lamp, Screen-Blend, --lamp-x/y), Licht-Winkel-System (--sh-x/--sh-y bei 10 Hz, alle Karten-Schatten folgen), Bass-Thump auf großen Werken, bebender Papier-Boden, Passepartouts + Archivnummern (PJ-001ff). 60fps mit Musik verifiziert. Gehirn/Vault nach Awwwards-/Atelier-Material durchsucht: nichts vorhanden.

## Phase 6 GESTARTET (3.7.): Gallery-Sanierung „Atelier bei Tag, Instrument bei Nacht"
Pascals Auftrag: kein Audio-Player mehr, die ganze Galerie ist EIN interaktives Kunstwerk, komplette Sanierung erlaubt. Konzept verschmilzt Brief §6 (Atelier) mit Audio-Reaktivität: ohne Musik ruhige Werkstatt, Nadel drauf → Raum dimmt, Karten tanzen auf Frequenzbändern, Beat-Blitze; Nadel runter → alles setzt sich. Grundgerüst von Claude Code committed: Audio-Bus in gallery.html (drei geglättete Bänder + Beat-Flag via Bass-Flux aus dem bestehenden AnalyserNode, Root-Vars `--au-bass`/`--au-energy`, translate-Prop auf sichtbaren Karten IO-gated, Rebind über CustomEvent `gallery:built`, `body.live` als Verwandlungs-Hook mit Overlay-Dim, altes EQ-Wellenfeld ERSATZLOS raus). Verifiziert im Preview: Deck-Klick startet Track, Bänder kommen an, Karten schwanken/heben, live-Toggle dimmt und resetted. Der Rest (Atelier-Look mit Passepartouts/Archivnummern, Nacht-Palette, Licht-Winkel, Tuning, Perf, A11y) ist Cline-Arbeit: fertiger Prompt in `_notes/phase-6-cline-prompt.md`. Modell-Ökonomie: Fable 5 wird ab hier nicht mehr gebraucht, Sonnet reicht für Cline-Review und alles Definierte; Fable nur zurückholen, wenn wieder konzeptionelles Neuland oder zähes Debugging ansteht.

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
