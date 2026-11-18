# PANAGEI+ – Entwicklungsworkflow

## Gemeinsamer Arbeitsstand
GitHub Issues sind die zentrale Liste für technische und konzeptionelle Aufgaben. Vor Beginn einer Aufgabe offene Issues und aktuellen Branch-Stand prüfen.

## Zuständigkeiten
- ChatGPT: Anforderungen, Konzepte, Akzeptanzkriterien und Priorisierung.
- Codex: Implementierung, technische Tests, Fehlerbehebung und Bereitstellung.
- Nutzer: Gerätetests und ausdrückliche Live-Freigabe.

## Übergabe
Neue Aufgaben als Issue anlegen (Titel, Zielversion, Zuständigkeit, Priorität P1/P2/P3, Status, Akzeptanzkriterien). Bestehende Issues aktualisieren statt duplizieren. Bearbeitungsbeginn und Ergebnisse als Kommentar dokumentieren. Status: offen, in Arbeit, Gerätetest, Freigabe, erledigt. Bei Rückfragen blockieren und konkret dokumentieren. Keine automatische Kommunikation oder automatische Ausführung zwischen Chats voraussetzen.

## Release-Regeln
- Test zuerst: Branch preview, Veröffentlichung über main/preview/.
- Live: main/index.html und zugehörige Root-Assets nur nach ausdrücklicher Nutzerfreigabe.
- Gemeinsame Datenbank: additive, rückwärtskompatible Änderungen bevorzugen; automatische Testnachrichten nur für Testgeräte.
- Keine persönlichen Projektdaten, Zugangsdaten, privaten Screenshots oder Schlüssel in diesem öffentlichen Repository oder dessen Issues.
- Vor Veröffentlichung Syntax, Änderungsumfang und Sicherheit prüfen; Gerätetests und nicht ausgeführte Prüfungen offen dokumentieren.
- Versionsstand am Quellcode prüfen, nicht aus historischen Notizen ableiten.

## Stand bei Einrichtung
Test v65.1, Live v63.1. JavaScript-Syntax in beiden HTML-Dateien geprüft. Mobile Darstellung, automatischer Push-Empfang und geräteübergreifender Abgleich sind noch praktisch zu prüfen.
