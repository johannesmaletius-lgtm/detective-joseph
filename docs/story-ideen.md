# Story-Ideen: Der Zug im Kreis

**Die feste Grundidee**

- Joseph steht in einem nächtlichen Zug und weiß nicht, wie er dort hingekommen ist.
- Der Zug fährt im Kreis. Es gibt kein Ende, nur Runden.
- Jedes Abteil hat eigene Rätsel und Interaktionen.

Unten folgen vier Vorschläge, die sich in Ton und Auflösung deutlich unterscheiden. Danach kommen Bausteine,
die in jede Version passen, und ein konkretes Einstiegsrätsel für das erste Abteil, das es schon gibt.

---

## Was das Spiel schon zeigt – und was es bedeuten könnte

| Schon im Spiel | Mögliche Bedeutung in der Geschichte |
| --- | --- |
| Der Mond wandert in jeder Runde einmal um den Zug herum. | Die Uhr der Schleife. Später könnte der Mond mit jeder Runde voller werden (Countdown bis Vollmond). |
| Ein ferner Turm mit rotem Licht steht immer still im selben Fenster. | Die Mitte des Kreises – das, worum sich alles dreht. Das Licht kann Botschaften blinken. |
| An der Nahtstelle jeder Runde fährt der Zug durch einen Tunnel. | Der Moment, in dem etwas zurückgesetzt wird, das Licht ausgeht oder etwas geschieht. |
| Die Laternen stehen in jeder Runde an denselben Stellen. | Ein Muster, das man zählen kann, zum Beispiel für einen Code. |
| Das Spiel zählt die Runden mit (`game.scene.motion.lap`). | Dinge verändern sich von Runde zu Runde. |
| Totenkopf-Bildschirm mit Rauschen, Schaltpult, Brief-Symbol, grünes Glas, Rucksack, Zeitungen | Die ersten anklickbaren Dinge (Schritt 3 und 4). |

---

## Vorschlag 1: „Ringbahn“ – Krimi in der Zeitschleife

**Kurz gesagt:** In jeder Runde geht im Tunnel das Licht aus. Wenn es wieder angeht, ist ein Fahrgast verschwunden.
Danach beginnt alles von vorn, und nur Joseph erinnert sich. Er hat so viele Runden Zeit, wie er braucht, um
herauszufinden, wer es war.

**Warum er sich nicht erinnert:** Er hat diese Runde schon hundertmal erlebt. Der Tunnel löscht jedes Mal alles,
auch sein Gedächtnis. Diesmal ist etwas schiefgegangen, und ein Rest ist geblieben: Auf seinem Handrücken steht in
seiner eigenen Schrift **„NICHT EINSCHLAFEN“**.

**Regeln der Schleife**

- Alle Fahrgäste machen in jeder Runde genau dasselbe, zur selben Zeit. Jede Figur hat ihren eigenen Fahrplan.
- Im Tunnel kehren alle Gegenstände an ihren Platz zurück. Nur was Joseph in sein **Notizbuch** schreibt, bleibt.
- Joseph kann den Ablauf verändern: einen Koffer vertauschen, eine Uhr verstellen, eine Tür absperren. Dann läuft
  die Runde anders.

**Die Abteile**

> **Umgesetzt (Teil 1):** Wagen 1–4 – erstes Abteil, Speisewagen, Schlafwagen, Gepäckwagen – stehen in
> `src/story/wagon1.js` bis `wagon4.js`. Abweichend vom Entwurf: Im Speisewagen wird Herr Brandt (der Schaffner)
> jede Runde vergiftet, und Joseph rettet ihn, indem er das Glas über den Tunnel bei sich trägt. Im Schlafwagen
> führt Frau Adlers Satz zum Wort im Spiegel (nur im Mondlicht). Im Gepäckwagen ersetzt Kasimir, ihr Papagei,
> die Detektivakte – und am Ende steigt der zweite Joseph aus dem Schrankkoffer und verschwindet im Postwagen.

1. **Erstes Abteil (das jetzige):** Der Totenkopf-Bildschirm zeigt nur Rauschen. Mit der richtigen Tastenfolge am
   grünen Pult erscheint für einen Moment das Bild einer Überwachungskamera, und die Kamera hängt im Tunnel. Der Brief
   über dem Pult ist an „J.“ adressiert und in Josephs eigener Schrift geschrieben.
2. **Speisewagen:** Der Koch serviert jede Runde dasselbe Menü, und ein Gast bekommt immer das vergiftete Glas.
   *Rätsel:* Herausfinden, wer wann welches Glas bekommt, und die Gläser vertauschen. *Interaktion:* Gespräche
   belauschen, beim Kellner bestellen.
3. **Schlafwagen:** Eine alte Dame spricht im Schlaf, jede Runde ein anderes Stück desselben Satzes. *Rätsel:* den
   Satz über mehrere Runden zusammensetzen. Weckt Joseph sie, gerät sie in Panik und zieht die Notbremse. Die
   funktioniert nicht.
4. **Gepäckwagen:** Auf jedem Koffer steht derselbe Zielbahnhof: „Ringbahnhof“. Ein Koffer trägt Josephs Namen. Darin
   liegt seine eigene Detektivakte zu diesem Fall, halb ausgefüllt.
5. **Postwagen:** Briefe mit Poststempeln aus der Zukunft („Runde 41“). *Rätsel:* die Postsäcke nach Runden sortieren.
   Ein Brief warnt vor dem, was in der nächsten Runde passiert.
6. **Schaffnerabteil:** Der Fahrplan ist ein Kreis aus lauter gleichen Uhrzeiten. Den Schaffner sieht man nie, man
   hört nur seine Stimme aus dem Lautsprecher.
7. **Der Tunnel:** Joseph muss in der Dunkelheit einmal am richtigen Ort stehen, um zu sehen, wer es tut. Das ist das
   Finale.

**Die Auflösung:** Der Täter ist ein zweiter Joseph, nämlich der aus der vorigen Runde. Er hat sich im Tunnel
versteckt, statt sich zurücksetzen zu lassen, und versucht seitdem, die Runde „richtig“ zu machen. Dabei macht er sie
jedes Mal kaputt. Am Ende müssen beide Josephs zusammenarbeiten: Im Tunnel müssen gleichzeitig die Notbremse gezogen
und die Weiche umgestellt werden, und das schafft man nur zu zweit.

**Ton:** Agatha Christie trifft „Und täglich grüßt das Murmeltier“. Ein Detektivspiel, in dem die Zeitschleife das
wichtigste Werkzeug ist.

---

## Vorschlag 2: „Der letzte Fahrgast“ – zwischen Leben und Tod

**Kurz gesagt:** Der Zug sammelt Menschen ein, die nicht mehr wissen, wohin sie gehören. Wer seine Geschichte zu Ende
bringt, darf aussteigen. Joseph ist der Einzige, der gar keine Geschichte mehr hat.

**Warum er sich nicht erinnert:** Joseph liegt nach einem Unfall im Koma. Das erfährt er erst ganz am Schluss. Der Zug
ist der Ort dazwischen.

**Was die Dinge bedeuten**

- **Turm mit rotem Licht:** Josephs Herzschlag. Das Blinken wird langsamer, wenn er zu lange zögert (sanfter
  Zeitdruck), und kräftiger, wenn er vorankommt.
- **Totenkopf-Bildschirm:** Durch das Rauschen dringen Stimmen aus dem Krankenhaus. Mit jeder Runde werden sie
  deutlicher („Er reagiert auf Licht …“).
- **Tunnel:** Dort ist es still. Manchmal hört man darin ein leises Piepen.
- **Mond:** Er wird mit jeder Runde voller. Bei Vollmond hält der Zug, und Joseph muss sich entscheiden.

**Die Abteile: jedes gehört einem Fahrgast**

1. **Erstes Abteil:** Leer bis auf einen Rucksack, der nicht Joseph gehört. Darin steckt ein Kinderbuch mit einer
   Widmung. *Rätsel:* Wem gehört der Rucksack?
2. **Abteil der Musikerin:** Ihr Grammophon bricht die Melodie immer an derselben Stelle ab. *Rätsel:* Die fehlenden
   Töne stecken im Takt der Schienenstöße („ta-dam … ta-dam“). Joseph hört genau hin und spielt sie auf dem Klavier nach.
3. **Gewächshaus-Wagen:** Ein alter Gärtner gießt eine Pflanze, die nie blüht. *Rätsel über mehrere Runden:* Die
   Pflanze muss ins Mondlicht. Weil der Mond wandert, braucht es jede Runde ein anderes Fenster. Nach drei Runden blüht
   sie.
4. **Kinderabteil:** Ein Mädchen spielt mit einer Spielzeugeisenbahn, die ebenfalls im Kreis fährt. *Interaktion:* Was
   Joseph an der kleinen Bahn verändert, passiert auch mit dem echten Zug. Hält er die kleine Lok an, stockt auch der
   große Zug.
5. **Fotolabor:** Zum Trocknen hängen Fotos, auf denen jeder Fahrgast beim Einsteigen zu sehen ist. Josephs Foto ist
   noch weiß. *Rätsel:* Mit Chemikalien aus den anderen Abteilen entwickelt er es Stück für Stück, und mit jedem Stück
   kehrt eine Erinnerung zurück.
6. **Lok:** Kein Lokführer, nur ein Hebel mit zwei Stellungen: „Bleiben“ und „Weiterfahren“.

**Ablauf:** Jedes gelöste Abteil entlässt seinen Fahrgast. Der Zug hält dafür kurz an einem Bahnsteig, den es vorher
nie gab (in der Animation: `speed: 0`). Danach ist das Abteil leer und still.

**Das Ende:** Joseph kann bleiben und als Schaffner anderen helfen. Oder er stellt den Hebel auf „Weiterfahren“: Der
Zug verlässt zum ersten Mal den Kreis, und Joseph wacht im Krankenhaus auf. Neben dem Bett hängt der Rucksack.

**Ton:** Leise, warm, traurig-schön. Wie „Spiritfarer“, nur im Nachtzug.

---

## Vorschlag 3: „Die Modellbahn“ – alles nur Spielzeug

**Kurz gesagt:** Der Zug fährt im Kreis, weil er auf einer Modelleisenbahn auf einem Dachboden steht. Joseph ist eine
Spielfigur, die plötzlich aufgewacht ist.

**Warum er sich nicht erinnert:** Er hat nie etwas erlebt, denn er wurde erst gestern bemalt. Seine „Erinnerungen“
sind die Abenteuer, die sich das Kind beim Spielen ausgedacht hat.

**Hinweise, die immer deutlicher werden**

- Die Landschaft ist jede Runde exakt gleich, bis auf den letzten Grashalm.
- Der Mond ist zu rund und ein bisschen zu nah. In einer späten Runde sieht man ein Kabel an ihm hängen.
- Der Turm in der Mitte ist eine Schreibtischlampe, und sein rotes Licht ist die Kontrollleuchte des Trafos.
- Der Tunnel ist aus Pappmaché. Einmal sieht man durch einen Riss ein riesiges Auge.
- Wenn das Licht flackert, hat jemand am Trafo gedreht, und der Zug wird kurz langsamer.

**Die Abteile**

1. **Erstes Abteil:** Der Rucksack lässt sich nicht öffnen, weil er nur aufgemalt ist. Das ist der erste Hinweis. Der
   Totenkopf-Bildschirm ist ein Wackelbild-Sticker. *Rätsel:* einen Aufziehschlüssel für die Tür finden.
2. **Zinnsoldaten-Wagen:** Zinnsoldaten bewachen den Durchgang und gehorchen nur Befehlen aus dem Spielheft des Kindes.
   *Rätsel:* die richtigen Befehle in der richtigen Reihenfolge.
3. **Spieluhr-Abteil:** Eine Tänzerin dreht sich nur, solange Musik läuft. *Rätsel:* ein Schiebepuzzle aus
   Schienenstücken, über das die Melodie zur Tänzerin geleitet wird.
4. **Magnetwagen:** Unter dem Wagen hängt ein Magnet, deshalb kleben Gegenstände an der Decke. *Interaktion:* Mit einem
   Hufeisenmagneten bewegt Joseph Dinge durch die Wand.
5. **Der Pappbahnhof:** Er ist nur von vorne echt, dahinter ist Karton. Dort wohnt der Bahnhofsvorsteher, eine alte,
   kaputte Figur, die schon alles weiß.
6. **Die Weiche:** Aus einem Kreis kommt man nur über eine Weiche heraus. *Letztes Rätsel:* außen am fahrenden Zug
   entlangklettern und die Weiche umstellen.

**Das Ende:** Der Zug biegt ab, fährt über die Tischkante, eine Rampe aus Büchern hinunter und quer durch das
Kinderzimmer. Das Kind wacht auf, sieht den Zug am falschen Ort und lächelt. Mögliche Fortsetzung: die anderen
Spielzeuge.

**Ton:** „Toy Story“ trifft „Coraline“. Verspielt, mit einer großen Enthüllung. Passt gut zum Comic-Stil der Grafik.

---

## Vorschlag 4: „Versuchsstrecke 7“ – das Experiment

**Kurz gesagt:** Die Kreisbahn ist eine geheime Versuchsanlage. Joseph ist Proband Nr. 7, und jede Durchfahrt durch den
Tunnel löscht sein Gedächtnis.

**Warum er sich nicht erinnert:** Im Tunnel steht ein „Löschtor“. Joseph behält nur, was er sich selbst aufschreibt oder
irgendwo einritzt.

**Was die Dinge bedeuten**

- **Turm:** der Kontrollturm im Zentrum, von dem aus beobachtet wird. Das rote Licht blinkt, wenn die Kameras
  aufnehmen. Später blinkt es Morsezeichen von jemandem, der helfen will.
- **Totenkopf-Bildschirm:** Er zeigt Anweisungen der Versuchsleitung: „Proband 7, bitte setzen Sie sich.“ Gehorchen
  oder nicht – das ist die erste Entscheidung.
- **Grünes Glas auf der Gepäckablage:** Probe Nr. 7.

**Kernmechanik: Botschaften an sich selbst.** Kurz vor dem Tunnel kann Joseph Hinweise hinterlassen: an die Wand
kritzeln, in den Rucksack stecken, in den Schal knoten. Nach dem Tunnel findet er sie und weiß nicht, wer sie
geschrieben hat, bis er seine eigene Schrift erkennt.

**Die Abteile sind Testkammern**

1. **Kammer 1 (das jetzige Abteil):** Gehorsamstest. Wer der Lautsprecherstimme gehorcht, bleibt in der Schleife.
   *Rätsel:* das Schaltpult so kurzschließen, dass der Bildschirm etwas zeigt, das Joseph nicht sehen soll: seine
   Versuchsakte mit seinem eigenen Foto.
2. **Spiegelkammer:** Sein Spiegelbild ist eine Runde hinterher und macht, was Joseph in der letzten Runde getan hat.
   *Rätsel:* Das Spiegelbild wird zum zweiten Spieler, der auf der anderen Seite einen Schalter drückt.
3. **Uhrenkammer:** Hundert Uhren laufen verschieden schnell. *Rätsel:* Die eine Uhr finden, die genau mit dem Mond
   läuft. Sie zeigt, wie viele Runden noch bleiben, bis das Experiment endet.
4. **Funkraum:** Joseph stellt das Funkgerät auf den Takt des Turmlichts ein. Der Morsecode ist der Hilferuf einer
   anderen Probandin in einem zweiten Zug auf demselben Kreis. Dessen Lichter sieht man nur im Tunnel, auf dem
   Gegengleis.
5. **Archivwagen:** Akten aller Probanden. Joseph findet heraus, dass er die Anlage selbst gebaut hat, bevor man ihn
   hineingesetzt hat.
6. **Wartungstür im Tunnel:** der einzige Ausgang. Joseph muss in den wenigen Sekunden im Tunnel aussteigen, bevor das
   Löschtor ihn erwischt.

**Das Ende:** Joseph läuft durch den dunklen Wald zum Turm in der Mitte. Oben ist kein Wissenschaftler, nur ein leerer
Stuhl, sein eigenes Notizbuch und ein Hebel. Er zieht ihn, und der Zug hält. Durch das Fenster sieht er, wer jetzt
auf seinem Platz sitzt: Proband Nr. 8.

**Ton:** „Portal“ trifft „Severance“ und „Dark“. Unheimlich und rätsellastig.

---

## Bausteine für jede Version

### Wie Joseph merkt, dass der Zug im Kreis fährt

Am besten in dieser Reihenfolge, jede Erkenntnis ein kleines Aha:

1. Die Laternen kommen in derselben Reihenfolge wieder. *(schon im Spiel)*
2. Der Turm bewegt sich nie. *(schon im Spiel)*
3. Der Mond verschwindet hinten rechts und taucht hinten links wieder auf. *(schon im Spiel)*
4. **Der große Moment:** Joseph legt etwas ab, zum Beispiel seinen Schal. Dann geht er durch die hintere Tür des letzten
   Wagens und kommt vorne im ersten Abteil wieder heraus. Dort liegt sein Schal.
5. Ein Fahrplan, auf dem Abfahrt und Ankunft derselbe Bahnhof sind.

### Ideen, die mit den Runden spielen

- Der Mond wird jede Runde voller. Bei Vollmond passiert etwas – ein sanfter Countdown.
- Ein Fahrgast wird mit jeder Runde älter (oder jünger).
- Eine Pflanze wächst jede Runde eine Stufe: in Runde 1 säen, in Runde 4 ernten.
- Der Totenkopf-Bildschirm zeigt jede Runde ein anderes Bild (die Bilder `tv1`–`tv6` liegen schon in
  `assets/reference/screen-animation/`).
- Im Tunnel kehren Gegenstände an ihren Platz zurück, außer denen im Inventar.
- Josephs Kommentare ändern sich: Beim zweiten Anschauen in einer späteren Runde sagt er „Das kenne ich doch …“.

### Rätsel, die die fertige Zug-Animation nutzen

- **Laternen zählen ergibt einen Code.** Mit den jetzigen Einstellungen fahren pro Runde 7 Laternen links und 8 rechts
  vorbei, also Code **78**. (Ändert man `lap`, `tunnel` oder `lanternEvery`, ändert sich auch die Zahl.)
- **Turmlicht morst:** Das rote Licht blinkt ein Wort oder eine Zahl.
- **Geheimschrift im Tunnellicht:** Nur im orangen Licht der Tunnellampen wird eine Schrift an der Wand sichtbar. Joseph
  muss im Tunnel am richtigen Platz stehen.
- **Mondlicht:** abwarten, bis der Mond im richtigen Fenster steht, damit sein Licht auf ein Bild oder eine Lupe fällt.
- **Das Quietschen der Räder** übertönt alles. Genau dann kann Joseph etwas Lautes tun, ohne gehört zu werden.
- **Rhythmus-Schloss:** Es öffnet sich nur, wenn man im Takt der Schienenstöße drückt.

### Interaktionen pro Abteil (passend zu den vier Cursorn)

- **Anschauen (Auge):** Joseph beschreibt, was er sieht, und in späteren Runden kommt Neues dazu.
- **Benutzen / Nehmen (Hand):** Gegenstände ins Inventar, miteinander kombinieren oder auf etwas anwenden.
- **Sprechen (Sprechblase):** Gespräche mit den Fahrgästen. Manche Antworten gibt es erst, wenn Joseph etwas aus einer
  früheren Runde weiß.
- **Laufen (Schritte):** zur Tür und ins nächste Abteil.

---

## Einstiegsrätsel für das erste Abteil (passt zu allen Versionen)

> **Umgesetzt und ausgebaut** – mit Vorschlag 1 („Ringbahn“) in `src/story/wagon1.js`. Aus dem kurzen
> Einstiegsrätsel unten ist eine Rätselkette für etwa 20 Minuten geworden: Die Tür hat jetzt vier Rädchen mit
> vier Zeichen (Tunnel, Laterne links, Laterne rechts, Turm). Dazu kommen ein zerrissener Fahrplan zum
> Zusammensetzen, ein Zahlenquadrat für das Kofferschloss, das Turmlicht als Morsezeichen (Fernglas), ein
> Verteilerkasten mit Tunnelkamera und die „Botschaften an sich selbst“ aus Vorschlag 4: Was Joseph wegnimmt,
> ist nach dem Tunnel wieder da – so bekommt er die zweite Batterie. Die Lösung steht im README.

Ein kurzes Rätsel, das genau die nächsten Schritte im Fahrplan abdeckt (Schritt 3: anklickbare Objekte, Schritt 4:
Inventar und Tür):

1. Joseph steht im Abteil. **Tür anschauen:** „Abgeschlossen. Ein Zahlenschloss mit zwei Rädchen.“
2. **Brief über dem Schaltpult nehmen:** Darin steht in Josephs eigener Schrift: „Zähl die Laternen. Erst links, dann
   rechts. Du hast es schon einmal geschafft.“ Er erkennt die Schrift nicht.
3. **Rucksack an der Wand öffnen:** Darin sind eine Taschenlampe ohne Batterie und eine Fahrkarte „Gültig für 1 Runde“.
4. **Kiste auf dem Tisch öffnen:** Darin liegt eine Batterie. Mit ihr funktioniert die Taschenlampe.
5. **Laternen zählen:** Joseph kann eine Runde lang aus dem Fenster schauen. Wer nicht zählen will, leuchtet im Tunnel
   mit der Taschenlampe an die Wand und findet dort eine Strichliste, die Joseph in einer früheren Runde selbst
   gemacht hat.
6. **Code 78 an der Tür:** Die Tür geht auf, und das zweite Abteil beginnt.

---

## Empfehlung

**Vorschlag 1 („Ringbahn“)** passt am besten zum Titel *Detective Joseph*. Joseph löst einen Fall, und die Zeitschleife
ist dabei sein wichtigstes Werkzeug, nicht nur Kulisse. Der Tunnel, die Laternen und der Rundenzähler, die es schon
gibt, werden direkt zu Spielmechanik.

Gut dazu passen die **Botschaften an sich selbst** aus Vorschlag 4 und der **Turm als Herzschlag** aus Vorschlag 2.

Wer lieber eine große Überraschung am Ende möchte, nimmt **Vorschlag 3**. Er passt besonders gut zur bunten
Comic-Grafik.
