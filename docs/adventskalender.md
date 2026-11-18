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

In jeder Runde verschwindet im Tunnel ein Fahrgast. Der Schaffner ruft sie per Lautsprecher zum Tunnel, wer den Ruf hört, geht wie im Schlaf. Eine Gestalt, die genauso aussieht wie Joseph (der „andere Joseph“, schreibt die Briefe in Josephs Handschrift), führt sie weg. Dem Schaffner ist an einem Weihnachtsabend etwas passiert. In Tür 13 kommt heraus: Alle Fahrgäste – auch Joseph („J.“) – saßen in jener Weihnachtsnacht in genau diesem Zug, der seinen Bahnhof nie erreichte. In Tür 14 (Zeitung vom 25.12.): Der Zug ist im Tunnel verschollen; Frau und Tochter des Schaffners saßen darin, er selbst blieb am Bahnsteig zurück. In Tür 15 zeigt Mira (die Tochter, nicht gealtert) eine Zeichnung: ihr Papa mit Josephs Mütze und Schal führt Leute in den Tunnel – „Das ist Papa. Er bringt alle nach Hause.“ In Tür 16 (Funkraum): Der Schaffner hatte vom Bahnsteig per Funk gewarnt („Weiche 7 falsch“, 23:41), aber niemand im Zug hörte es – alle waren bei der Weihnachtsfeier. In Tür 17 (Gewächshaus, Versteck des anderen Joseph): Auf seiner Fahrgastliste fehlen nur noch Herr Tick und „J.“ – „Der Letzte ist J. Dann sind alle wieder zusammen.“ In Tür 18 (Schaffnerabteil): Der Schaffner hatte seinen Dienst am 24.12. getauscht, um zu Hause Weihnachten vorzubereiten – seine Familie sollte mit dem Zug nachkommen. Weiche 7 lässt sich nur von der Lok aus stellen, der Lok-Schlüssel fehlt. In Tür 19 (Fotolabor): Der Zug ist nicht verunglückt, sondern an Weiche 7 abgebogen – und den Lok-Schlüssel hat der andere Joseph.

## Auflösung (entschieden)

- **Joseph ist selbst der Schaffner, nur jünger.** Er hat in der Schleife vergessen, wer er ist. **Der andere Joseph ist sein späteres Ich – der Schaffner**, der schon versteht, was zu tun ist.
- Er bringt die Fahrgäste in den Tunnel, weil sie dort aus der Zeitschleife entkommen, wieder altern und weiterleben können. Der Tunnel ist der Ausweg, nicht die Gefahr.
- Josephs „Rettungen“ (z. B. Herr Tick in Tür 11) halten die Fahrgäste in Wahrheit in der Schleife fest – das versteht Joseph erst am Ende.
- **Am 24.** versteht Joseph alles, geht zurück ins Schaffnerabteil, evakuiert alle Fahrgäste und bringt den Zug zum Entgleisen, damit niemand mehr einsteigen kann.
- **Schluss:** Joseph wacht als erwachsener Schaffner auf, mit seiner Tochter Mira und seiner Frau, und sie feiern Weihnachten.
- Die Ähnlichkeit zwischen Joseph und dem jungen Schaffner auf dem Familienfoto (Tür 13) ist damit gewollt und bleibt.
- Angepasst: Miras Zeichnung in Tür 15 zeigt nur **eine** Figur.

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
| 15 | Di 15.12. | Spielzimmer, Mira (Tochter des Schaffners, nicht gealtert) | „Ich sehe was, was du nicht siehst“ mit Mira (3 Runden, indirekte Hinweise, letzte Lösung: Fenster zum Tunnel); Modellbahn mit 14 Mini-Waggons in Reihenfolge der Türen 1–14 aufs Gleis setzen (an winzigen Details erkennbar) → Bahn hält im Spielzeugtunnel, darin ein Schlüssel; Puppenhaus-Bahnhof: Figuren wie auf dem Pressefoto aufstellen (Schaffner auf den Bahnsteig, Frau + Tochter in den Zug) → Fach mit Türcode | Miras Zeichnung: ihr Papa mit Josephs Mütze und Schal führt Leute in den Tunnel. „Das ist Papa. Er bringt alle nach Hause.“ |
| 16 | Mi 16.12. | Funkraum (ohne Person) | Antenne ausrichten: Empfang nur in dem Moment der Runde, in dem der Zug am Turmlicht aus Wagen 1 vorbeifährt → Antenne auf den Turm; Logbuch des Funkers: Frequenzen folgen einem Zahlenmuster, letzter Eintrag verschmiert → nächste Frequenz ausrechnen und einstellen; Morse-Funkspruch mit Morsetabelle aus Wagen 1: „Hier Bahnhof. Zug 24 sofort halten. Weiche 7 falsch. Bitte antworten.“ → Logbuch-Uhrzeit 23:41 = Türcode | Die Stimme am Funk ist der Schaffner: Er warnte vom Bahnsteig, aber im Zug saß niemand am Funk – alle waren bei der Weihnachtsfeier |
| 17 | Do 17.12. | Gewächshaus (Versteck des anderen Joseph, er selbst nur kurz durch die Scheibe) | Heizungsventile so drehen, dass warmes Wasser alle Beete erreicht → Scheiben beschlagen, Fingerschrift = Gießplan; Gießkannen 3 l + 5 l → genau 4 l für die Rose (Umfüll-Rätsel) → Rosenblüte öffnet sich, kleiner Schlüssel; Kiste unter dem Pflanztisch (neben Schlafsack): Notizbuch mit Fahrgastliste, fast alle abgehakt → Wagennummern der offenen Namen (Herr Tick = 11, J. = 1) = Türcode | „Der Letzte ist J. Dann sind alle wieder zusammen.“ Durch die beschlagene Scheibe läuft der andere Joseph davon |
| 18 | Fr 18.12. | Schaffnerabteil (Schaffner nur Stimme) | Schichtplan der Weihnachtswoche im Dienstbuch mit Tauschvermerken (Logik) → am 24.12. hätte der Schaffner Dienst gehabt, hat aber getauscht; Name des Vertreters = Wort fürs Schubladenschloss; 12 Schlüssel nach Bartform den Umrissen am Schlüsselbrett zuordnen → ein Haken bleibt leer: „Lok“; Gleisplan: Weichen 1–7 so stellen, dass ein Weg aus dem Ring zum Bahnhof führt → Stellungen = Türcode; echter Hebel für Weiche 7 verplombt: „Nur von der Lok aus.“ | Der Schaffner hatte getauscht, um zu Hause Weihnachten vorzubereiten; seine Familie sollte mit dem Zug nachkommen. Für Weiche 7 braucht Joseph den Lok-Schlüssel – der fehlt |
| 19 | Sa 19.12. | Fotolabor (ohne Person) | Kameratasche des Fotografen: Zahlenschloss, Belichtungstabelle im Deckel + Notiz „Tunnel, fast kein Licht“ → Blende + Zeit = Code, darin unentwickelter Film; Dunkelkammer in der richtigen Reihenfolge (Tür zu, Licht aus, Rotlicht an), sonst Film verdorben bis zur nächsten Runde; Entwickeln: 3 unbeschriftete Flaschen (Entwickler, Stoppbad, Fixierer) nach Farbe, Geruch und halb zerrissener Anleitung in die Schalen, Zeiten an der Laborzeituhr; Kontaktbogen mit 12 Negativen (hell/dunkel vertauscht) nach Tunnellampen ordnen → Bild kurz vor Weiche 7; Vergrößerer auf das Lokfenster: Gestalt mit Josephs Mütze, Hand am Hebel, Lok-Schlüssel im Schloss; Kilometerstein „24,7“ → Türcode 247 | Der Zug ist nicht verunglückt, er ist an Weiche 7 abgebogen. Den Lok-Schlüssel hat der andere Joseph |
| 20–24 | | noch nicht besprochen. Ideen von früher: Packwagen mit nie ausgepackten Weihnachtsgeschenken (Namen der Fahrgäste), Kesselwagen (Heizer, weiß, wer den Lok-Schlüssel hat), Tunnel/Wartungsgang mit dem anderen Joseph, Lok (Notbremse + Weiche zu zweit), Ankunft am 24. | | |

Personen bisher: Mira (Tochter des Schaffners), Koch Bruno, Oma Ilse, Herr K., Barkeeper, Herr Tick, Herr Moll, Schaffner (bisher nur Stimme), der andere Joseph.

## Grafiken

Alle unter `assets/reference/tuer-XX/` (WebP, so wie von ChatGPT).

- **Block 1 (Türen 2–6): komplett.** Hintergründe 2–6, Bruno, Abteil von Herrn K. (Suchbild), Fundbüro-Regal (Wimmelbild).
- **Block 2 (Türen 7–12): komplett.** Hintergründe 7–12, Herr K., Barkeeper, Filmbild aus dem Tunnel, Herr Tick, Herr Moll.
- **Block 3 (Türen 13–18): Befehle stehen auf der Planungsseite, Bilder noch offen.** 9 Bilder: Hintergründe 13–18, Familienfoto des Schaffners (13), Pressefoto vom Bahnsteig (14, Uhrzeiger setzt Claude ein), Mira (15). Claude zeichnet selbst: Kreuzworträtsel, Zeitungsseite + Schnipsel, Modellbahn-Waggons, Puppenhaus-Figuren, Miras Zeichnung, Logbuch, Fingerschrift, Notizbuch, Dienstbuch, Schlüssel, Gleisplan; der andere Joseph hinter der Scheibe = abgedunkelte Joseph-Figur.

## Noch zu bauen (Code)

Wagenwechsel, Türchen-Sperre nach Datum (mit Test-Schalter), Spielstand speichern, Wagen 2–13 umsetzen, Gesprächssystem, neue Rätselarten (Sortieren, Waage, Regler, Töne, Licht/Spiegel, Uhrzeiger, Suchbild, Takt, Runden planen, Logik), Online stellen (GitHub Pages).
