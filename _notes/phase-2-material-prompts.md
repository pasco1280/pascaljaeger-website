# Phase 2, Schritt 1: Materialsheet-Prompts für Midjourney (2026-07-01, v3)

**v3-Änderung:** Die Stadt ist eine normale westliche Stadt (deutsche Altstadt, Gründerzeit, Büroblöcke, Richtung Heidelberg/Düsseldorf), keine Fantasie-Zitadelle. Außerdem überschreiben alle Prompts jetzt explizit die Profil-Defaults (`--chaos 0 --weird 0 --stylize 100`), die Werte aus dem Global-Profil (chaos 20, stylize 250, weird 4) treiben sonst ins Fantastische. Für diese Serie am besten zusätzlich das Personalization-Profil in den Einstellungen ausschalten.

Ziel: den Material-Look der Pappstadt einfrieren (Prompt-Lock laut Brief §8.1), plus die Startbilder für die Kling-Videos. Ablage aller Favoriten in `_notes/material/`, Dateinamen mit Präfix (m01_, m02_, ...).

## Wenn „Creation failed" kommt

1. **Mini-Test zuerst:** `corrugated cardboard city --ar 16:9` eingeben. Läuft der durch, liegt es am Prompt. Failt schon der, liegt es an Midjourney oder deinen Einstellungen.
2. Prompt **als eine Zeile** einfügen, ohne Zeilenumbruch (beim Kopieren aus Dateien schleichen sich Umbrüche ein, im Zweifel einmal durch ein Textfeld ziehen).
3. In den Midjourney-Einstellungen prüfen: **Modell v7** (nicht Niji), kein Sonder-Modus. Failt es weiter, einmal ohne ` --style raw` versuchen.
4. Danach wieder mit dem vollen Prompt arbeiten. Bleibt der Fehler: 10 Minuten warten, das ist oft serverseitig.

## Ablauf

1. **Zuerst NUR M01 generieren.** Ein bis zwei Grids, den besten Kandidaten hochskalieren. M01 ist der Look-Anker für alles Weitere.
2. Die Bild-URL des M01-Favoriten bei M02, M03, M04, M05 und M08 hinten anhängen als ` --sref <URL>`. Das hält das Material über alle Stadt-Bilder konsistent.
3. Pro Prompt reichen 1 bis 2 Favoriten. Kein Perfektionismus, ich kuratiere danach.
4. M06 und M07 (Strand) bekommen ein eigenes sref: das Pexels-Sonnenuntergangs-Bild (`assets/img/pexels-daniela-elena-tentis-118658-716247.jpg`) in Midjourney hochladen und seine URL als ` --sref <URL>` anhängen. Es liefert Licht und Farbwelt (Terrakotta-Himmel, warmer Sand), der Prompt-Text liefert die leere Komposition. NICHT das Stadt-sref verwenden, die fotografische Welt soll anders aussehen als die Pappe.
5. Wenn alles in `_notes/material/` liegt: kurz Bescheid geben, dann kuratiere ich, wir locken den Look, und ich schreibe die Kling-Specs.

Wenn ein Ergebnis in die Niedlichkeits-Falle läuft (Miniatur-Look, Bastelstunde): verwerfen, nicht retten. Die Stadt muss aussehen wie Architektur, die zufällig aus Pappe ist.

## Die Prompts

### M01, Stadt-Establishing (Look-Anker, zuerst!)

```
ordinary german city street rebuilt entirely from corrugated cardboard, gruenderzeit townhouses with gabled roofs and bay windows cut from kraft paper, a church spire and tram wires overhead, rows of punched windows, visible flute at every cut edge, glue tabs, narrow street, extreme low angle from sidewalk level, one hard warm side light from the left, dust in the light, deep umber and black shadows, oppressive everyday mood, monumental scale, cinematic film still, deep focus --ar 16:9 --style raw --chaos 0 --weird 0 --stylize 100 --no miniature, bokeh, people, text, cars
```

### M02, Stadt-Startframe für Kling Sequenz A (Kamerafahrt-Ausgangspunkt)

```
straight narrow street in a german city rebuilt from corrugated cardboard, one point perspective with central vanishing point, gruenderzeit facades and plain modern office blocks made of kraft paper, punched windows, tram wires overhead, street lamps cut from cardboard, only a thin strip of pale overcast paper-grey sky visible between the roofs, camera low above the street, one hard warm side light, long shadows, dust in the light, dark far end, oppressive monumental scale, cinematic film still, deep focus --ar 16:9 --style raw --chaos 0 --weird 0 --stylize 100 --no miniature, bokeh, people, text, cars
```

### M03, Stadt-Detail (Fenster und Laschen)

```
close view of a gruenderzeit house facade rebuilt from corrugated cardboard, stucco ornaments and window frames cut from kraft paper, rows of punched windows with ragged edges, folded glue tabs and dried glue strings, paper fiber texture, hard warm raking light from the left, deep umber shadows inside the openings, architectural photography, deep focus --ar 3:2 --style raw --chaos 0 --weird 0 --stylize 100 --no miniature, bokeh, text
```

### M04, Material-Makro (die Schnittkante)

```
macro photo of a cut edge of corrugated cardboard, kraft paper top layer, exposed wavy flute, chalk white paper core, frayed hand cut edge, paper fibers in hard warm side light from the left, dark umber background, sharp focus across the whole edge --ar 3:2 --style raw --no bokeh, text
```

### M05, Naht-Studie (Pappe vor Gegenlicht, der Umschlagpunkt)

```
dark corrugated cardboard wall with a tall narrow cut opening, muted sage green light glowing through from behind, the paper around the opening slightly translucent like a theater backdrop lit from behind, flute visible along the cut edge, chalk white core catching the green light, thin warm rim light, dust in the glow, black shadows everywhere else, cinematic film still --ar 16:9 --style raw --no bokeh, people, text
```

### M06, Strand-Startframe für Kling Sequenz B (die fotografische Welt)

```
photorealistic film still of a quiet greek island beach at golden hour, camera very low above the sand looking at the sea, low golden sun over calm water, deep teal sea fading to muted sage green at the horizon, warm linen sand, soft warm light, fine film grain, 35mm, empty and serene --ar 16:9 --style raw --no people, boats, buildings, text
```

### M07, Strand Hochformat (Mobile-Startframe)

```
photorealistic film still of a quiet greek island beach at golden hour, vertical composition, camera very low above the sand, low golden sun over calm water in the upper third, deep teal sea with muted sage green at the horizon, warm linen sand in the lower half, fine film grain, 35mm, empty and serene --ar 9:16 --style raw --no people, boats, buildings, text
```

### M08, Stadt Hochformat (Mobile-Startframe)

```
narrow vertical street in a german city rebuilt from corrugated cardboard, extreme low angle looking up, gruenderzeit facades and office blocks of kraft paper leaning inward almost touching at the top, only a thin strip of pale overcast paper-grey sky between the roofs, punched windows, tram wires overhead, flute edges and glue tabs, one hard warm side light, dust in the light, deep umber and black shadows, monumental scale, cinematic film still, deep focus --ar 9:16 --style raw --chaos 0 --weird 0 --stylize 100 --no miniature, bokeh, people, text, cars
```

## Wozu welches Bild dient

| Bild | Zweck |
|---|---|
| M01 | Look-Anker, sref-Quelle, Jury-Referenz für alles Stadt-Material |
| M02 | Startbild Kling Sequenz A (Stadt-Kollaps, 10 s) |
| M03, M04 | Material-Lock-Details, Referenz für Naht-Frames und Grading |
| M05 | Vorlage für den Naht-Frame-Prototyp (der wichtigste Moment) |
| M06 | Startbild Kling Sequenz B (Strand, 8 bis 10 s) |
| M07, M08 | Startbilder für die Mobile-Hochformat-Takes |
