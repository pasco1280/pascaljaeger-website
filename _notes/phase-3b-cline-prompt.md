# Phase 3b: Cline-Prompt für das eigentliche Fundament (2026-07-02)

Lauf 1 (2.7.) hat die Bug-Liste sauber abgearbeitet (Marquee-Richtung, reduced-motion-Lücken, Phantomfarbe, Soundbar-Vars, .case-hero-Dedup, Gallery-Lightbox/Resize, 404.html, Case-Nummern). Was fehlt, ist das Fundament aus dem Design-Brief. Diesen Prompt in Cline einfügen:

```
Setze das Fundament aus dem Design-Brief um. Lies zuerst
_notes/design-brief-2026.md (Abschnitte 2, 3, 5) und
_notes/bestandsaufnahme-2026-07-01.md (Abschnitte CSS und Bewegungs-Inventar).

WICHTIG: Den Hero der Startseite (Reel, .reel/.pin, initReel in wrlz.js,
Katzen-Pfoten) NICHT anfassen. Der wird in Phase 5 separat ersetzt.
Auch _notes/ und _old/ nicht anfassen.

1. FONTS: Lade Zodiak (Variable) von fontshare.com herunter und lege die
   WOFF2-Dateien nach assets/fonts/Zodiak/. Konvertiere die vorhandene
   Plus Jakarta Sans Variable-TTF zu WOFF2 (einmalig lokal, z.B. npx
   ttf2woff2; es darf keine Dependency im Projekt landen, nur die
   WOFF2-Dateien). Beide @font-face-Definitionen in wrlz.css mit NEUEN
   Dateinamen (der 1-Jahr-immutable-Cache auf /assets/fonts/* verlangt
   das). Zodiak als --serif-Display-Var, Einsatz: Case-Headlines, grosse
   Sektionstitel. Jakarta bleibt Fliesstext.

2. FARB-TOKENS: Ergänze in wrlz.css die neuen Palette-Vars aus Brief §2:
   --karton #B5885A, --umbra #57432E, --aegaeis #2F6B66,
   --maya-eisblau #AED9E4, --glut #DFA75C. Bestehende Vars bleiben.

3. TYPO-SKALA: Baue eine benannte clamp-Skala als CSS-Vars
   (--fs-display, --fs-h1, --fs-h2, --fs-lede, --fs-body, --fs-small,
   --fs-mono, Verhältnis um 1.25) und ersetze die verstreuten
   font-size-Werte der Site durch die Skala (die Bestandsaufnahme zählt
   66 distinkte Werte). Sichtbare Grössen dürfen sich dabei nur minimal
   ändern, im Zweifel den nächstliegenden Skalenwert nehmen.

4. SPACING-TOKENS: --sp-1 bis --sp-8 auf 8er-Basis, Sektionsabstände
   darauf umstellen.

5. PARALLAX-ABRISS (Brief §5, Bewegungs-Monopol): Entferne alle
   data-px/data-px-x-Attribute ausser im Hero (33 statische Stellen laut
   Inventar), entferne die JS-generierten Drifts in gallery.html
   (data-px-Zuweisungen im Inline-Script), entferne data-px von den
   Case-Hero-Layern (data-tilt/data-depth bleibt), entferne alle
   Bewegungen der Statement-Sektion auf der Startseite, entferne den
   ungenutzten data-px-rot-Code in wrlz.js.

Danach: Screenshots jeder Sektion Desktop und Mobile, und eine kurze
Liste, welche font-size-Werte du auf welchen Skalenwert gemappt hast.
```

Prüfliste nach dem Lauf (Pascal): Zodiak sichtbar in Case-Headlines, keine Layout-Sprünge bei 375/768/1440, Gallery ruhig ohne Drifts, Hero unverändert funktionsfähig, `git diff --stat` zeigt Änderungen in wrlz.css, wrlz.js, allen HTML-Seiten.
