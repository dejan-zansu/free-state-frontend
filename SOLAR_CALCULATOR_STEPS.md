# Solar Calculator - Trenutni Okvir

Kratak pregled kako trenutno funkcioniše kalkulator po koracima. Eksperti treba da definišu kako će se raditi i šta je potrebno.

---

## **KORAK 1: Unos Lokacije**

**Šta se radi:**
- Korisnik unosi adresu (autocomplete)
- Sistem automatski ekstrahuje geografsku poziciju

**Šta se prikuplja:**
- Adresa
- Latitude/Longitude

---

## **KORAK 2: Crtanje Površine Krova**

**Šta se radi:**
- Korisnik crta obris krova na satelitskoj mapi (klikom postavlja tačke)
- Može da edituje poligon nakon završetka

**Šta se prikuplja:**
- Poligon krova (koordinate)
- Površina krova (m²) - automatski izračunata
- Obim krova (m) - automatski izračunat

**Funkcionalnosti:**
- Auto-complete poligona (klik blizu prve tačke)
- Undo poslednje tačke
- Validacija (minimum 3 tačke)
- Provera samopresecanja

---

## **KORAK 3: Konfiguracija Krova i Orijentacije**

**Šta se radi:**
- Korisnik bira tip krova (ravan, nizak nagib, srednji nagib, strm)
- Korisnik bira orijentaciju panela (azimuth: 0-359°)
- Sistem automatski postavlja nagib panela na osnovu tipa krova

**Šta se prikuplja:**
- Tip krova
- Orijentacija panela (azimuth)
- Nagib panela (tilt)

**Funkcionalnosti:**
- Automatsko podešavanje nagiba na osnovu tipa krova
- Vizuelni kompas za orijentaciju
- Prikaz efikasnosti konfiguracije

---

## **KORAK 4: Izbor Solarnog Sistema**

**Šta se radi:**
- Korisnik bira tip panela iz liste
- Korisnik bira broj panela (slider, 1 do maksimuma)
- Korisnik bira inverter iz liste

**Šta se prikuplja:**
- Tip panela (snaga, dimenzije, efikasnost, cena)
- Broj panela
- Inverter (snaga, efikasnost, cena)

**Funkcionalnosti:**
- Automatski izračun maksimalnog broja panela koji staje na krov (razmak 5 cm)
- Automatska preporuka invertora (DC/AC odnos 1.2-1.5:1)
- Vizuelizacija panela na mapi

---

## **KORAK 5: Rezultati i Finansijska Analiza**

**Šta se radi:**
- Korisnik pregleda rezultate
- Korisnik unosi cene struje (opciono)
- Korisnik podešava dodatne parametre (potrošnja, PDV)

**Šta se prikuplja:**
- Cena struje (Rp/kWh)
- Tarifa za uneto (Rp/kWh)
- Godišnja potrošnja (kWh) - opciono
- PDV (da/ne)

**Šta se prikazuje:**
- Veličina sistema, godišnja proizvodnja, uštede, period povraćaja
- Mesečna proizvodnja (bar chart)
- Finansijski detalji (investicija, povraćaj na 30 godina, neto profit)
- Uticaj na životnu sredinu (CO₂ smanjenje)
- Konfiguracija sistema

**Funkcionalnosti:**
- Automatska kalkulacija proizvodnje (meteorološki podaci)
- Finansijske kalkulacije (30 godina, degradacija 0.5% godišnje)
- PDF izveštaj
