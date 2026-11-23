#!/bin/bash
# Doppelklick: wie start.command, aber alle 24 Wagen sind sofort auswählbar (Test-Modus).
# Beenden: dieses Terminal-Fenster schließen (oder ctrl + C drücken).
cd "$(dirname "$0")"
(sleep 1 && open "http://localhost:8150/?test") &
node server.js
