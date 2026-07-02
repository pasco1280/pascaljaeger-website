# Phase 2: Material-Kuration und Kling-Specs (2026-07-02)

Alle Dateien in `_notes/material/`. Materialsheet-Status: gelockt, vorbehaltlich Pascals Bestätigung der zwei Startframes.

## Kuration

| Datei | Urteil | Rolle |
|---|---|---|
| m01_anker.png | **LOCK.** Deutsche Altstadt, Giebel, Kirchturm, Material perfekt. | Look-Anker, sref-Quelle. Erledigt. |
| m02a_startframe.png | Gut, aber m02b schlägt es: kräftig blauer Himmel, weniger Staub. | Reserve |
| m02b_startframe.png | **EMPFOHLEN als Startframe Sequenz A.** Blasserer Dunst-Himmel, stärkere Laternen, Staub im Licht, tiefes dunkles Straßenende (das Ziel der Dolly-Fahrt). | Kling Take A |
| m03a_fassade.png | Stuck-Schichten aus gerissener Pappe, exzellent. | Material-Referenz, Grading |
| m03b_fassade.png | Gestanzte Fenster mit ausgefransten Rahmen, Materialwahrheit pur. | Vorlage für die Alpha-Kanten-Textur der Naht |
| m04_makro.png | Flute-Querschnitt mit chalk-weißem Kern, Fasern im Licht. | Naht-Kante, Korn-Sampling fürs CSS-Grain |
| m05a_naht.png | Schöne Dramatik, aber Neon-Grün statt Grass, Sternenhimmel im Portal ist falsch (dahinter liegt Strandlicht). | Stimmungs-Referenz Kantenverhalten |
| m05b_naht.png | Der U-Schacht mit sich biegenden Flute-Schichten und warmem Rim-Light ist GENAU das Türrahmen-Kantenverhalten aus dem Brief. Grün zu gesättigt. | Direkte Vorlage für die Kanten-Choreografie der Naht |
| m06a_strand.png | Episch (Sonne über Bergsilhouette), aber unruhiger und dunkler. | Reserve |
| m06b_strand.png | **EMPFOHLEN als Startframe Sequenz B.** Ruhe, saubere Horizontlinie, freier Himmel für die Title Card, lange Sonnenspiegelung als Leuchtzentrum. | Kling Take B |
| m07_strand_mobil.png | Sauberes Hochformat, ruhiger Himmel oben (Nav-Zone). LOCK. | Kling Take B mobil |
| m08_stadt_mobil.png | Untersicht zwischen kippenden Türmen, blasser Himmelsschlitz, erdrückend. Stärkstes Mobile-Bild. LOCK. | Kling Take A mobil |

## Drei Grading-Notizen (meine Arbeit beim Zerlegen, keine Aktion nötig)

1. Beide Strand-Bilder sind dunkler als die Lichtkurve verlangt (nach dem Umschlag springt Helligkeit aufs Maximum). Ich hebe die Mitten im Grading, Ziel ist glühende goldene Stunde, nicht Dämmerung.
2. Das Meer-Teal liegt nahe Aegaeis, muss aber an der Naht an Grass `#8FB1A6` anschließen. Macht der Portal-Gradient plus Naht-Grading, Abnahme per Sampling-Skript.
3. m05-Grüntöne sind zu gesättigt, die echten Naht-Frames entstehen als Compositing (Alpha-Kante aus m03b/m04-Material, Live-Gradient, Strand dahinter), nicht aus m05 direkt.

## Kling-Specs (Web-App, image-to-video, höchste Qualität, 1080p+)

Reihenfolge: **Take B zuerst** (einfacher, validiert Workflow und liefert mir sofort Material für Naht-Prototyp und Grading). Downloads als MP4 nach `_notes/video/`, Benennung `seqB_take1.mp4` usw.

### Take B, Strand (Startbild: m06b_strand.png, 10 s) — v2 nach Take-1-Sichtung

Take 1 (2.7.) hatte einen Vorwärts-Drift aufs Meer, am Ende fehlte der Sand. Kamera ab jetzt komplett statisch: die Pfotenabdruck-Schicht braucht stillstehenden Boden, die gefühlte Kamerafahrt liefert das wachsende s-Portal, und ein statischer Take komprimiert deutlich besser. Rauszoomen wäre falsch (Kling müsste Bildinhalt außerhalb des Startframes erfinden, Flacker-Risiko).

Prompt:
```
completely static camera, locked off tripod shot, no camera movement at all, no zoom, gentle small waves rolling toward the shore, water surface shimmering softly, the sun reflection flickering calmly on the sea, warm light breathing slowly, everything calm and quiet, no people, no boats, photorealistic
```

Abnahme: Kamera bewegt sich NICHT (wichtigstes Kriterium), Sonne bleibt stabil (kein Pulsieren, kein Formwechsel), Wellen ruhig und klein, nichts Neues erscheint im Bild (keine Menschen, Boote, Vögel), Sandband unten bleibt durchgehend sichtbar.

### Take A, Stadt (Startbild: m02b_startframe.png, 10 s)

Prompt:
```
slow steady forward dolly along the cardboard street at ground level, the cardboard buildings begin to lean and collapse one after another, first on the left then on the right, walls folding along their crease lines, punched window panels breaking out and falling, thick paper dust rising through the warm side light, debris tumbling across the street, the camera keeps moving forward into the dark end of the street, constant speed, heavy physical weight, everything stays thick cardboard and kraft paper, no camera shake
```

Abnahme: Material bleibt Pappe (kein Morphing zu echtem Beton), Kollaps wirkt schwer statt gummiartig, mindestens 4 bis 5 zeitlich getrennte Kollaps-Momente, Kamera gleichmäßig, kein Texture-Flackern.

### Take B mobil (Startbild: m07_strand_mobil.png, 10 s)

Gleicher Prompt wie Take B v2 (statisch, Stativ).

### Take A mobil (Startbild: m08_stadt_mobil.png, 10 s)

Prompt:
```
camera slowly craning upward between the leaning cardboard towers, the towers begin to crumble and fold inward one after another, cardboard panels and window pieces falling past the camera, thick paper dust drifting through the warm light, the pale sky slit narrowing as the towers lean closer, heavy physical weight, everything stays cardboard, steady continuous camera motion, no shake
```

Abnahme: wie Take A, zusätzlich darf der Himmelsschlitz nie ganz zugehen (Restlicht bleibt).

## Regeln

EIN Take pro Szene generieren, Ergebnis zeigen, erst nach Sichtung ein Retake. Nie Frames aus verschiedenen Takes mischen. Erst Take B, dann sehen wir weiter.
