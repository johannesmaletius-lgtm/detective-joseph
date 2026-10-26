#!/bin/bash
# Doppelklick startet den Spiel-Server und öffnet Detective Joseph im Browser.
# Beenden: dieses Terminal-Fenster schließen (oder ctrl + C drücken).
cd "$(dirname "$0")"
(sleep 1 && open "http://localhost:8150") &
node server.js
