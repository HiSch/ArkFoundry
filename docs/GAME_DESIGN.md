# SpaceCraftIdle – Spielprinzip-Ideen

Ziel dieses Dokuments: ein paar Konzepte für das Kernprinzip sammeln, eines davon
als Empfehlung ausarbeiten und das Pacing so planen, dass

- das **Spielziel sofort sichtbar** ist,
- es aber **erst nach mehreren Prestiges** erreichbar wird,
- der **erste Prestige nach ca. 2 Tagen aktivem bzw. 3–4 Tagen gelegentlichem Spiel** möglich ist,
- jeder Prestige **Punkte für kleine, dauerhafte Vorteile** bringt.

---

## 1. Drei Konzepte im Überblick

### Konzept A – „Die Arche“ (Empfehlung)
Die Heimatwelt stirbt. Ziel: das Generationenschiff **ARCHE** bauen und mit
10.000 Kolonisten zu einem fernen Planeten schicken.

- Beim Spielstart sieht man sofort den Bauplan der Arche mit **7 leeren Modul-Slots**
  (Rumpf, Antrieb, Reaktor, Habitat, Kryo-Deck, Schild, Navigation).
- Pro Durchlauf baut man eine Wirtschaft auf (Bergbau → Raffinerie → Werft) und
  kann am Ende **ein Modul fertigstellen und ins Orbitaldock starten**.
- Der Start eines Moduls ist der **Prestige**: die Kolonie wird zurückgesetzt, aber
  das Modul bleibt im Dock. Das Ziel füllt sich also sichtbar mit jedem Prestige.
- Spätere Module brauchen mehr Ressourcen bzw. neue Ressourcenarten, als ein Lauf
  ohne Prestige-Boni liefern kann.

**Stärke:** Ziel und Fortschritt sind ein einziges Bild – man sieht, wie die Arche
wächst. Jeder Prestige fühlt sich wie ein Erfolg an, nicht wie ein Verlust.

### Konzept B – „Sprung ins Unbekannte“
Man beginnt in einem Sonnensystem und will das **galaktische Zentrum** erreichen.
Die Sternkarte mit dem Weg (z. B. 10 Systeme) ist von Anfang an sichtbar.

- Jeder Prestige = **Sprung ins nächste System**. Dort startet man mit einer
  kleinen Flotte neu.
- Jedes System hat Modifikatoren (z. B. „Eisreich: +50 % Wasser, −30 % Metall“,
  „Neutronenstern: Energie ×3, Bauten verfallen“).
- Prestige-Punkte = gesammelte Navigationsdaten.

**Stärke:** viel Abwechslung pro Durchlauf. **Schwäche:** Balancing aufwendiger.

### Konzept C – „Zeitschleife“
Die Sonne wird in 72 h zur Supernova. Man muss ein Fluchtschiff bauen,
schafft es aber nicht – die Schleife startet neu, das Wissen bleibt.

- Prestige = Schleife neu starten; Punkte = „Erinnerungen“.
- Sehr starke Story und klarer Druck, passt aber weniger zu entspanntem Idle-Spiel
  (Countdown kann Gelegenheitsspieler stressen).

### Kombination
A als Hauptspiel. B kann später als **Endgame / New Game+** dienen: Wenn die Arche
fliegt, reist man durch Systeme mit Modifikatoren (zweite Prestige-Ebene).

---

## 2. Ausgearbeitet: „Die Arche“

### 2.1 Ressourcen-Kette

| Stufe | Ressource      | Quelle                              | Freigeschaltet |
|-------|----------------|-------------------------------------|----------------|
| 1     | Erz            | Klick, später Bergbau-Drohnen       | sofort         |
| 2     | Energie        | Solarfelder                         | ~5 min         |
| 3     | Metall         | Raffinerie (Erz + Energie)          | ~15 min        |
| 4     | Credits        | Handel / Verkauf von Metall         | ~30 min        |
| 5     | Forschung      | Labore, Forschung läuft in Echtzeit | ~1 h           |
| 6     | Legierungen    | Schmelze (Metall + Energie)         | ~4 h           |
| 7     | Bauteile       | Orbitalwerft                        | ~10 h          |
| 8     | Helium-3       | Mond-/Asteroidenbergbau             | ~20 h          |
| 9     | Exotische Materie | ab 3. Modul / späteren Prestiges | Prestige 2+   |

Jedes Arche-Modul kostet eine Mischung aus Bauteilen, Legierungen und ab
Modul 3 auch Helium-3 / Exotische Materie.

### 2.2 Pacing des ersten Durchlaufs (Ziel: 2 Tage aktiv / 3–4 Tage gelegentlich)

Das Pacing wird über **zwei Hebel** gesteuert:

1. **Forschung in Echtzeit (Untergrenze):** Der kritische Forschungspfad bis zur
   Orbitalwerft dauert in Summe ca. **36–40 h Echtzeit**. Forschung läuft auch
   offline weiter. Damit kann selbst ein Dauerspieler den ersten Prestige nicht
   wesentlich vor ~1,5–2 Tagen erreichen.
2. **Lagerkapazität / Offline-Limit (Strafe für Inaktivität):** Produktion läuft
   offline mit 100 %, aber nur bis die Lager voll sind (Start: ca. 4 h Kapazität,
   ausbaubar auf ~8 h). Wer selten reinschaut, verliert Produktion und braucht
   eher 3–4 Tage.

Aktive Spieler bekommen zusätzlich kleine Boni, die aber nicht dominieren:
Klicks am Anfang, zufällige Ereignisse (Meteoritenschauer, Händler, Notruf), die
man manuell einsammeln muss, und das rechtzeitige Leeren der Lager.

| Zeit (aktiv)   | Phase                                                         |
|----------------|---------------------------------------------------------------|
| 0–15 min       | Erz klicken, erste Drohnen, Solarfeld                         |
| 15 min – 2 h   | Raffinerie, Credits, erste Automatisierung                    |
| 2 – 8 h        | Labore, Forschungsbaum, Schmelze                              |
| 8 – 24 h       | Orbitalwerft (Forschung), Lagerausbau, Ereignisse             |
| 24 – 40 h      | Helium-3-Bergbau, Bauteil-Produktion                          |
| 40 – 48 h      | Rumpf-Modul bauen → **erster Prestige verfügbar**             |

Kostenkurve als Ausgangspunkt: Gebäudekosten `basis × 1,12^n`,
Produktionsboni in Stufen (×2 bei 25/50/100 Gebäuden). Die Zahlen werden später
mit einer Simulation (aktiver vs. gelegentlicher Spieler) feinjustiert.

### 2.3 Prestige: „Modul starten“

Beim Prestige:

- **Bleibt:** Arche-Module im Dock, Prestige-Punkte, gekaufte Prestige-Upgrades,
  Statistik/Erfolge.
- **Wird zurückgesetzt:** Ressourcen, Gebäude, Forschung.

**Prestige-Punkte = Sternkarten (SK)**

```
SK = floor( 10 × sqrt( Gesamt-Legierungen dieses Laufs / 1e9 ) ) + Modul-Bonus
```

- Erster Prestige ergibt ca. **10–15 SK**.
- Wer länger im Lauf bleibt, bekommt mehr SK (Wurzel → abnehmender Ertrag),
  sodass „zu frühes“ und „zu spätes“ Prestigen beides nicht optimal ist.
- Jede SK gibt passiv **+1 % Produktion** (klein, aber spürbar), zusätzlich
  können SK im Prestige-Baum ausgegeben werden – ausgegebene SK behalten den
  passiven Bonus (keine Zwickmühle zwischen Sparen und Ausgeben).

### 2.4 Prestige-Baum (kleine Vorteile)

| Upgrade                    | Wirkung                                        | Kosten (SK) |
|----------------------------|------------------------------------------------|-------------|
| Startkapital               | Start mit 5 Drohnen und 500 Credits            | 2           |
| Erfahrene Ingenieure       | Forschung +10 % schneller (stapelbar 5×)       | 3 / Stufe   |
| Größere Silos              | Offline-/Lagerkapazität +1 h (stapelbar 4×)    | 3 / Stufe   |
| Auto-Käufer: Drohnen       | Kauft Drohnen automatisch                      | 5           |
| Bauplan-Archiv             | Erste 3 Forschungen sofort fertig              | 5           |
| Händlerkontakte            | Handelsereignisse häufiger und besser          | 4           |
| Effiziente Raffinerie      | Raffinerie verbraucht 10 % weniger Erz         | 4           |
| Dock-Synergie              | Jedes fertige Modul: +5 % auf alles            | 8           |
| Auto-Käufer: Gebäude       | Automatischer Bau aller Grundgebäude           | 12          |
| Exotik-Forschung           | Schaltet Exotische Materie frei (für Modul 4+) | 15          |

Die Vorteile sind einzeln klein, verkürzen aber in Summe die frühen Phasen
deutlich – das Spiel fühlt sich nach jedem Prestige schneller an.

### 2.5 Langzeitbogen bis zum Ziel

| Modul (Prestige) | Neue Anforderung              | Ungefähre Laufdauer |
|------------------|-------------------------------|---------------------|
| 1 Rumpf          | Bauteile                      | 2 Tage (3–4 casual) |
| 2 Reaktor        | mehr Energie                  | ~1,5 Tage           |
| 3 Antrieb        | Helium-3 in großen Mengen     | ~1,5 Tage           |
| 4 Habitat        | Exotische Materie             | ~1–2 Tage           |
| 5 Kryo-Deck      | Kolonisten (neue Ressource)   | ~1–2 Tage           |
| 6 Schild         | alle Ketten gleichzeitig      | ~2 Tage             |
| 7 Navigation     | Großprojekt, mehrere Läufe    | 2–3 Läufe           |

→ Arche fertig nach etwa **9–12 Prestiges**, ca. **3–5 Wochen** Spielzeit.
Optionale Zusatzprestiges (Module verbessern, mehr SK farmen) helfen bei
Modulen, an denen man hängt.

Da spätere Module jeweils eine **neue Mechanik** einführen, ist jeder Lauf mehr
als „das Gleiche nur schneller“.

### 2.6 Endgame-Ideen
- **Der Start der Arche:** Abspann + Statistik, dann New Game+ nach Konzept B
  (Reise durch Systeme mit Modifikatoren, zweite Prestige-Währung).
- **Herausforderungs-Läufe:** z. B. „ohne Solarenergie“, „Lager halbiert“ –
  geben einmalig besondere SK-Boni.
- **Erfolge** mit kleinen permanenten Boni (+1 % je 10 Erfolge).

---

## 3. Offene Fragen
- Plattform: Browser (TypeScript + Canvas/DOM) oder Mobile? Für große Zahlen
  bietet sich `break_infinity.js` an.
- Soll es Klick-Elemente geben oder rein Idle?
- Soll Offline-Zeit begrenzt sein (Lager-Mechanik wie oben) oder unbegrenzt
  mit reduzierter Effizienz?
- Story-Ton: ernst (sterbende Erde) oder locker?
