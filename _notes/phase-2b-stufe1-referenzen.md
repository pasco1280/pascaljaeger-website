# Phase 2b, Stufe 1: Maya-Referenz-Kuration (2026-07-01)

Basis: 17 Fotos in `_notes/maya/`, alle gesichtet. Maya ist eine Lynx-Point-Katze mit heller Creme-Grundfarbe, dunkler Marmorierung an Flanke und Beinen, gestreiftem Tabby-Gesicht, dunkel geringeltem Schwanz mit dunkler Spitze und eisblauen Augen. Noch kein Asset generiert.

## Die 5 Referenzen für Stufe 2 und 3

1. **Screenshot_20251123_194201_Gallery.jpg** (Tunnel, sitzend, leuchtende Augen)
   Wofür: Augen-Glow und Sitzpose. Das ist das Zielbild der gesamten Maya-Idee: dunkle Umgebung, ruhige frontale Sitzhaltung, die Augen leuchten als einziges helles Detail. Intensität und Wirkung des Glows hier abnehmen, auch für die Stillstands-Belohnung (Maya setzt sich).

2. **20250319_202917.jpg** (Badewanne, sitzend frontal, Blick nach oben)
   Wofür: Augenform bei Licht. Mandelförmig, leicht schräg gestellt, eisblau mit dunklem Rand. Die beste Vorlage, um die Augen "dezent, nicht comichaft" zu konstruieren. Zusätzlich saubere aufrechte Sitzhaltung mit eng gestellten Vorderpfoten und umgelegtem Schwanz.

3. **20240602_150935.jpg** (stehend, von oben, Kopf zur Kamera gedreht)
   Wofür: Silhouette und Proportionen. Ganzer Körper im Stand auf allen vieren, Rückenlinie, Kopf-Körper-Verhältnis, Marmorierung entlang der Wirbelsäule. Vorlage für die Grundform der Rauch-Silhouette.

4. **20240611_202405.jpg** (Garten, stehend, Schwanz sichtbar)
   Wofür: Silhouette mit Schwanz. Der geringelte Schwanz mit dunkler Spitze ist das stärkste Erkennungsmerkmal der Silhouette, hier in natürlicher Haltung leicht gebogen. Ohne diesen Schwanz ist die Rauchkatze irgendeine Katze.

5. **20240611_202406.jpg** (Garten, Vorderbein im Schritt gestreckt)
   Wofür: Gangart-Ansatz. Einzige Aufnahme mit echter Bewegung: gestrecktes Vorderbein, Schulterrotation im Schrittansatz. Als alleinige Gangzyklus-Vorlage zu dünn, aber der beste vorhandene Anker.

Ergänzende Muster-Referenz (kein Pflicht-Input): IMG_20240513_122754.jpg zeigt die Marmorierung von oben am klarsten, falls die Rauch-Textur Musterandeutungen tragen soll.

## Gangzyklus: Video liegt vor (Update 2.7.)

`_notes/maya/maya_video.mp4` (42 s, 720p, 120 fps Zeitlupe). In den letzten 20 Sekunden balanciert Maya über Geländer und Mauer: vorsichtiger Gang, Pfote vor Pfote in einer Linie, charakteristisches Vorderbein-Strecken. Diese bedachte Gangart ist die Referenz für die Rauchkatze (ruhig, würdevoll, kein Tapsen). 8 Schlüsselposen gesichert in `_notes/maya/gang/`. Einschränkungen: Dämmerlicht mit Bewegungsunschärfe, Kamera nah und schräg, kein sauberes Seitenprofil auf ebenem Boden. Reicht zum Bauen des prozeduralen Zyklus. Optionales Upgrade, kein Blocker: 15 Sekunden Tageslicht, 2 bis 3 Meter Abstand, echtes Seitenprofil, ebener Boden.

## Entscheidung: Augenfarbe

Der Brief (v1.1) sah die Augen als warme Glutpunkte `#DFA75C` vor. Mayas echte Augen sind eisblau. Entscheidung: **die Rauchkatze bekommt eisblaue Augen (`#AED9E4`, nach den Referenzen 1, 2 und 16)**, Glut bleibt ausschließlich den Glanzlichtern auf dem Wasser vorbehalten. Begründung: erstens ist es die echte Maya, die persönliche Erdung ist das stärkste Argument der ganzen Site. Zweitens funktioniert ein kühler Lichtpunkt in der warmen Strandszene als präziser Blickfang, der Kontrast führt das Auge genau dorthin, wo die Katze erst beim zweiten Hinsehen ganz erscheint. Im Brief als Punktfarben-Gesetz aktualisiert. Reversibel, falls Pascal die warme Variante will.
