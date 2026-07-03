# Phase 6: Cline-Prompt für die Gallery-Sanierung (2026-07-03)

Das Grundgerüst steht (Claude Code, committed): Audio-Bus in gallery.html
(drei Bänder + Beat-Flag aus dem AnalyserNode, Root-Vars `--au-bass`/
`--au-energy`, translate auf sichtbaren Karten, IO-gated, `gallery:built`-
Rebind, `body.live` als Verwandlungs-Hook, altes EQ-Wellenfeld entfernt).
Diesen Prompt in Cline einfügen:

```
Saniere die Galerie (gallery.html) zum Konzept "Atelier bei Tag, Instrument
bei Nacht". Lies zuerst _notes/design-brief-2026.md Abschnitt 6 (Atelier)
und den bestehenden Audio-Bus im Inline-Script von gallery.html.

WICHTIG, NICHT ANFASSEN: die Audio-Bus-Logik (readBands/tick/start/stop),
die Werke-Liste und der Seed 20120401, die Lightbox-Logik, wrlz.js und
wrlz.css ausser du ergaenzt dort nur Vars. Kein Player-UI bauen (kein
Fortschrittsbalken, keine Buttons), die Platte bleibt der einzige Regler.
Keine Dependencies, kein Build.

1. ATELIER-LOOK (Tag-Zustand): Die Karten werden Set-Karten wie im Brief:
   schmales Karton-Passepartout (Toene um --karton/#B5885A, innen Chalk),
   Mono-Archivnummer auf jeder Karte (PJ-001 aufsteigend, Position wie
   Kontaktbogen), ruhige Schatten. Der Flyer-Papier-Hintergrund bleibt
   erhalten (Farben, Baender, Seed).

2. NACHT-MODUS (body.live, Hook existiert): Das Overlay auf .paper-stack
   dimmt schon auf 0.35, bau die Verwandlung aus: Karten-Schatten werden
   haerter und dunkler, Passepartout-Toene kippen Richtung Umbra #57432E,
   Hero und Naehkaestchen dimmen (vorhanden), tt-credit und tt-hint bleiben
   lesbar. Alle Uebergaenge um 1.2s ease, beim Stop setzt sich alles zurueck.

3. LICHT: Fuehre --light-angle als Root-Var ein (Startwert -35deg) und
   leite die box-shadow-Richtung der Karten daraus ab (cos/sin einmal in JS
   berechnen und als --sh-x/--sh-y setzen, CSS nutzt die Vars). Im
   live-Zustand wandert der Winkel langsam mit bus.energy (im tick eine
   Zeile: Winkel += energy * kleiner Faktor). Verfeinere .beat-hit:
   Chalk-Ring plus eine schmale Hot-Kante (#C77E52), kein Doppel-Schatten.

4. KARTEN-TUNING: lift 16 / sway 7 sind Startwerte, finde Werte, bei denen
   grosse Karten spuerbar auf Bass-Kicks reagieren und kleine auf Hi-Hats
   zittern, ohne dass die Galerie zappelig wird. Teste Hover waehrend Musik
   (translate und Hover-transform komponieren, darf nicht springen).
   Lightbox: das geoeffnete Werk bekommt einen dezenten Puls-Rahmen ueber
   --au-energy, der Hintergrund dimmt im live-Zustand staerker.

5. PERFORMANCE: 60fps auf mobil mit ~8 sichtbaren Karten. Keine filter-
   Transitions auf .pband (nur das vorhandene ::after-Overlay), keine
   box-shadow-Animationen pro Frame (Schattenwechsel nur ueber Klassen/
   Uebergaenge), translate bleibt die einzige Per-Frame-Property.

6. A11Y & REDUCED-MOTION: prefers-reduced-motion spielt Musik, aber keine
   Bewegung und kein Nacht-Dimmen (Guard existiert im Bus, pruefe CSS).
   Fokus-Ring auf .g-item sichtbar, Deck bleibt role=button mit
   Enter/Space (vorhanden).

Danach: Screenshots Tag-Zustand, Nacht-Zustand mit Musik, ein Beat-Moment,
und mobil 375px. Liste kurz, welche Werte du beim Karten-Tuning gewaehlt hast.
```

Prüfliste nach dem Lauf (Pascal): Platte an = Raum dimmt und Karten tanzen,
Platte aus = alles setzt sich zurück, Tag-Zustand sieht nach Werkstatt aus
(Passepartouts, Archivnummern), kein Player-UI, 375px ruhig, reduced-motion
nur Musik.
