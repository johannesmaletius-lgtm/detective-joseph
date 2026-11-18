# Adventskalender „Die Ringbahn“ – Planungsstand

Detective Joseph als Adventskalender für Johannes' Freundin: 24 Waggons, jeden Tag (1.–24. Dezember 2026) ein neuer Wagen.
Planungsseite (Artifact, mit Grafik-Befehlen und Haken pro Bild): https://claude.ai/artifact/PJZU72QAUCiWMff7BHSQmT

## Arbeitsweise

- **Immer nur eine Frage auf einmal** stellen, Antwortmöglichkeiten A/B/C anbieten, kurz halten.
- Pro Tür: erst Wagen auswählen lassen, dann Rätsel-Vorschlag, dann „Passt das so?“.
- Nach jedem Block von 6 Türen: ChatGPT-Befehle für die Grafiken als „Grafik-Block“ auf der Planungsseite.
- Bilder, die Johannes schickt: prüfen, nach `assets/reference/tuer-XX/` legen, committen, pushen, auf der Planungsseite abhaken (ArtifactData, Sammlung `bilder`, Dokument = Bild-ID, `{erledigt: true}`).

## Entscheidungen

- Sie spielt am **PC mit Maus** (nicht Handy).
- Sie spielt **Joseph**. Sie selbst kommt im Spiel nicht vor.
- Persönliches nur als **kleine Anspielungen** (z. B. ein Code mit einem Datum von euch). **Keine Fotos.**
- **Kein echtes Geschenk** am Ende – das Spiel endet im Spiel.
- Stimmung: **spannender Krimi** in der Zeitschleife, wie Wagen 1.
- Rätsel **knifflig**. Tipps (Taste H) nur, wenn sie danach fragt.
- Unter der Woche **10–15 Minuten** (3–4 Rätsel), am Wochenende länger (~25 Minuten, 4–5 Rätsel).
- Wagen 1 ist Tür 1, sie kennt ihn noch nicht.
- **ChatGPT nur für** Waggon-Hintergründe, Personen und ganz besondere Rätselbilder. Alle anderen Rätsel, Nahansichten, Schlösser und die meisten Gegenstände zeichnet Claude im Code (wie Signaltafel, Rätselheft, Verteilerkasten in Wagen 1).
- Johannes macht die Grafiken **in Blöcken** an längeren Abenden.
- Fenster in Hintergründen: reines **Magenta (#FF00FF)**. Spiegel und Leinwand: reines **Cyan (#00FFFF)**. Magenta-Fenster in Türen macht Claude selbst dunkel.
- Das Totenkopf-Pult aus Wagen 1 taucht in einigen Wagen wieder auf → bleibt: Es ist das Überwachungsnetz des Schaffners.

## Die Geschichte bisher (roter Faden)

In jeder Runde verschwindet im Tunnel ein Fahrgast. Der Schaffner ruft sie per Lautsprecher zum Tunnel, wer den Ruf hört, geht wie im Schlaf. Eine Gestalt, die genauso aussieht wie Joseph (der „andere Joseph“, schreibt die Briefe in Josephs Handschrift), führt sie weg. Dem Schaffner ist an einem Weihnachtsabend etwas passiert. In Tür 13 kommt heraus: Alle Fahrgäste – auch Joseph („J.“) – saßen in jener Weihnachtsnacht in genau diesem Zug, der seinen Bahnhof nie erreichte. In Tür 14 (Zeitung vom 25.12.): Der Zug ist im Tunnel verschollen; Frau und Tochter des Schaffners saßen darin, er selbst blieb am Bahnsteig zurück.

## Die Türen

| Tür | Tag | Wagen | Rätsel | Ergebnis |
| --- | --- | --- | --- | --- |
| 1 | Di 1.12. | Das Abteil (gebaut) | Fahrplan-Puzzle, Zahlenquadrat & Kofferschloss, Turmlicht/Morse, Verteilerkasten & Tunnelkamera, Kratzer im Dunkeln | Joseph findet seine halb leere Detektivakte |
| 2 | Mi 2.12. | Gepäckwagen | 12 Kofferanhänger nach Abfahrtszeit sortieren → Anfangsbuchstaben = Wort für Buchstabenschloss; Gepäckwaage (Gewicht verschlüsselt auf 1. Aktenseite, Gewichte kombinieren); Kofferstapel umschichten (Türme von Hanoi, 5 Koffer, 2 Kreidefelder); nach dem Tunnel ist der Stapel zurück → mit Notizen schneller | Akte komplett: Im Tunnel verschwindet jede Runde ein Fahrgast |
| 3 | Do 3.12. | Postwagen (ohne Person) | 24 Fächer nach Rundenstempel sortieren → leere Fächer = Code für Schrank des Postmeisters; Rohrpost-Weichen (manche drehen gemeinsam); verschlüsselter Brief an J. aus „Runde 108“ (Verschiebung = Rundennummer) → Wort fürs Türschloss; Bonus: im Dunkeln eingeritzte Zahlen in leeren Fächern | Brief: „Morgen verschwindet jemand. Achte auf die Gläser.“ |
| 4 | Fr 4.12. | Speisewagen, Koch Bruno | Tischordnung als Logikrätsel (Namenskärtchen vertauscht, Brunos Erinnerungsfetzen); welches Glas ist vergiftet (Bittermandel, jede Runde gleiche Reihenfolge); Glas tauschen, während die Räder quietschen; Rechnung als Rechenrätsel → Türcode. Gäste nur als Plätze/Mäntel, keine Figuren | Das Opfer sollte Herr K. sein |
| 5 | Sa 5.12. | Schlafwagen, Oma Ilse (schläft im Hintergrund) | Schlüssel von Abteil 4 mit Zettel + Messer unter der Tür hervorholen; Suchbild Abteil K. (6 Spuren: Hutschachtel, Tasse, nasse Fußspuren, Knopf – selbst einzeichnen, Fahrschein, Brille) → Schluss: freiwillig Richtung Tunnel; Ilses Satz über 3 Runden („Er hat den Koffer … unter Bett vier … der Schlüssel liegt … wo der Mond nicht hinkommt“); Schublade nur beim Quietschen öffnen, sonst Notbremse; Schattenfleck, wo nie Mondlicht hinfällt → Kofferschlüssel → Türcode | Foto von Herrn K. mit dem Schaffner |
| 6 | So 6.12. | Fundbüro (ohne Person, Stimme des Schaffners) | Klingel → „Nur gegen Fundschein“, Block hinter verriegelter Klappe; Wimmelregal: 8 Sachen von Herrn K. (Liste als Umschreibungen, z. B. „Was er bei Regen auf dem Kopf trug“); Karteikarten mit Daten aus der Zukunft → nach Datum sortiert = Schließfachcode; Schließfach: stehen gebliebene Taschenuhr (Tunnelzeit); Uhr stellen → beim Tunnel öffnet sich ein Fach mit Türcode | „Herr K. verschwindet erst morgen. Ich kann ihn noch warnen.“ |
| 7 | Mo 7.12. | Barwagen, Herr K. + Barkeeper | Unauffällig lauschen (Münze in Musikbox, Zeitung, Nebentisch); Getränk von Herrn K. erraten (Flaschenpegel + 3 leere Gläser); Bierdeckel-Strichliste mit den 4 Zeichen vom Türschloss aus Wagen 1 → Türcode; „Wenn der Schaffner ruft, gehe ich“ → Tunnel, Herr K. weg | Joseph konnte ihn nicht retten (Cliffhanger) |
| 8 | Di 8.12. | Bordkino (ohne Person) | Abgerissene Kinokarte → Platznummer = Code der Filmdose; 8 Filmbilder ordnen (Zug von außen: Mond wandert, Laternen in festen Abständen); Projektor scharf stellen (2 Räder, beeinflussen sich); letztes Bild: Gestalt mit Josephs Mütze/Brille/Schal führt Herrn K. in den Tunnel (sofort erkennbar – so gewollt), Rechtsklick → Bildnummer am Filmrand = Türcode | „Der Täter sieht aus wie ich.“ |
| 9 | Mi 9.12. | Spiegelwagen | Zwei Hebel gleichzeitig: Spiegelbild wiederholt die letzte Runde spiegelverkehrt (rechts ziehen → nächste Runde zieht es links); Lichtstrahl der Deckenlampe über 4 Standspiegel ins Glasauge; Kratzer an der Wand im Spiegel gelesen = Wort; im Spiegel kurz eine zweite Gestalt hinter Joseph | Es gibt zwei von ihm |
| 10 | Do 10.12. | Lautsprecherwagen (Schaffner nur Stimme) | 5 Sicherungen nach Ampere/Kabeldicke einsetzen; Tonband der Runde, in der Herr K. verschwand (Rundennummer im Notizbuch); Geschwindigkeit einstellen → „Fahrgast K., bitte zum Tunnel …“; rückwärts abspielen → „… wie die anderen. Elf ist der Nächste.“ → 11 = Code fürs Mischpult → Tür | Der Schaffner ruft die Fahrgäste; als Nächstes Wagen 11 |
| 11 | Fr 11.12. | Uhrenwagen, Herr Tick | Uhr finden, die mit dem Mond geht; Gespräch (108 Runden gezählt, Ruf immer kurz vor dem Tunnel); Standuhr + Kuckucksuhr so stellen, dass sie genau beim Ruf schlagen (ausrechnen, beide gehen verschieden falsch); gerettet! | Erste Rettung. Herr Tick gibt ein Zahnrad („Das wirst du vorne brauchen.“) |
| 12 | Sa 12.12. | Musiksalon, Herr Moll | 3 Notenstücke (Klavierbank, unter Teppichecke, Plattenhülle) zusammensetzen; Noten mit Kreuz → deutsche Notennamen (A H C D E F G, Es = S) = Botschaft des anderen Joseph; im Takt der Schienenstöße klopfen; Schluss am Klavier spielen (Moll summt bruchstückhaft); Moll erzählt: Lied auf einer Weihnachtsfeier für den Schaffner und seine Familie gespielt – „Seitdem fährt der Zug im Kreis.“ | Dem Schaffner ist an einem Weihnachtsabend etwas passiert |
| 13 | So 13.12. (3. Advent) | Kapelle | Kranz mit 12 Kerzen in Rätsel-Reihenfolge anzünden; Laterne durch Buntglas → Muster hebt Zeile der Gedenktafel hervor; 3 Glocken in der Melodie von Molls Lied; verrußte Gedenktafel mit Papier + Bleistift abreiben → „Zum Gedenken an den Weihnachtszug vom 24. Dezember, der seinen Bahnhof nie erreichte“ + Namen (Bruno, Ilse, Herr K., Herr Tick, Herr Moll … und „J.“); Opferstock mit Münze aus dem Barwagen → Türschlüssel + Familienbild (Schaffner mit Frau und Tochter vor Weihnachtsbaum) | Alle Fahrgäste, auch Joseph, saßen in jener Nacht in diesem Zug |
| 14 | Mo 14.12. | Zeitungswagen (ohne Person) | Kreuzworträtsel, halb ausgefüllt in Josephs Handschrift, Fragen zu Wagen 1–13 („Wonach roch das Gift?“), eine Antwort ist falsch → Lösungswort öffnet Archivschrank; Ausgabe vom 25.12. jenes Jahres mit herausgeschnittenen Wörtern auf der Titelseite, Schnipsel im Papierkorb → nach Form, Schriftgröße und passender Rückseite einsetzen; Schlagzeile „Weihnachtszug im Tunnel verschollen“, Pressefoto mit Lupe → Bahnhofsuhr zeigt 23:47 = Türcode | Bildunterschrift: „Unter den Fahrgästen: Frau und Tochter des Schaffners. Er selbst blieb am Bahnsteig zurück.“ |
| 15–24 | | noch nicht besprochen. Ideen von früher: Gewächshaus, Spielzimmer/Modellbahn, Funkraum, Fotolabor, Kesselwagen, Packwagen, Schaffnerabteil, Tunnel/Wartungsgang mit dem anderen Joseph, Lok (Notbremse + Weiche zu zweit), Ankunft am 24. | | |

Personen bisher: Koch Bruno, Oma Ilse, Herr K., Barkeeper, Herr Tick, Herr Moll, Schaffner (bisher nur Stimme), der andere Joseph.

## Grafiken

Alle unter `assets/reference/tuer-XX/` (WebP, so wie von ChatGPT).

- **Block 1 (Türen 2–6): komplett.** Hintergründe 2–6, Bruno, Abteil von Herrn K. (Suchbild), Fundbüro-Regal (Wimmelbild).
- **Block 2 (Türen 7–12): komplett.** Hintergründe 7–12, Herr K., Barkeeper, Filmbild aus dem Tunnel, Herr Tick, Herr Moll.
- **Block 3 (Türen 13–18): noch nicht erstellt.** Für Tür 13 nötig: Hintergrund Kapelle (Holzbänke, Buntglasfenster statt normaler Fenster, Kranz mit 12 Kerzen an der Decke, 3 Glocken an einem Balken, verrußte Gedenktafel an der Wand, Opferstock mit Münzschlitz, Laterne auf Ständer) und ein besonderes Bild: altes Familienfoto des Schaffners (Schaffner jung, mit Frau und kleiner Tochter vor einem Weihnachtsbaum).

## Noch zu bauen (Code)

Wagenwechsel, Türchen-Sperre nach Datum (mit Test-Schalter), Spielstand speichern, Wagen 2–13 umsetzen, Gesprächssystem, neue Rätselarten (Sortieren, Waage, Regler, Töne, Licht/Spiegel, Uhrzeiger, Suchbild, Takt, Runden planen, Logik), Online stellen (GitHub Pages).
