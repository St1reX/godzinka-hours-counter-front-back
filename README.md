# Godzinka

Jednostronicowy kalkulator czasu zajęć. React + Vite, oficjalne otwarte komponenty Button i Toggle z [Untitled UI](https://github.com/untitleduico/react), React Aria, Tailwind CSS i ikony Untitled UI. Licencja komponentów: `LICENSE-UNTITLED-UI`.

## Uruchomienie

Wymagany Node.js 22.12+ lub 24+.

```sh
npm ci
```

Skopiuj `.env.example` do `.env`, ustaw np. `PORT=8080`, następnie:

```sh
npm run dev
```

Port jest wspólny dla serwera deweloperskiego i podglądu. Zmienna `PORT` ustawiona przez hosting ma pierwszeństwo przed `.env`. Zajęty port powoduje błąd, bez automatycznej zmiany numeru.

## Hosting statyczny

```sh
npm ci
npm run build
```

Opublikuj zawartość katalogu `dist/` na hostingu statycznym (np. nginx, Apache, Netlify lub Cloudflare Pages). W panelu ustaw komendę budowania `npm run build` i katalog publikacji `dist`. Aplikacja nie wymaga backendu ani bazy danych.

Na hostingu statycznym port konfiguruje serwer WWW lub dostawca hostingu; `.env` nie zmienia portu nginx/Apache.

## Własny serwer Node

```sh
npm run build
npm start
```

`npm start` korzysta z `PORT` w środowisku lub `.env` (domyślnie 3000), nasłuchuje na `0.0.0.0` i udostępnia pliki z `dist/`. HTTPS skonfiguruj przez reverse proxy lub panel hostingu. Do podglądu buildu służy `npm run preview`.

## Obliczenia i dane

- Czas wpisu to różnica między godziną zakończenia i rozpoczęcia. Godzina ma zawsze 60 minut.
- Czas zajęć, dnia i tygodnia jest wyświetlany w godzinach i minutach.
- Zakończenie musi być późniejsze niż rozpoczęcie w tym samym dniu. Błędne i niekompletne wpisy nie wchodzą do sum.
- Niezależne wpisy sumują się, również gdy nakładają się czasowo.
- Ukryta sobota nie wchodzi do podsumowania; jej wpisy zostają zachowane.
- Wpisy i ustawienia zapisują się lokalnie w przeglądarce. Nie są przesyłane na serwer ani synchronizowane między urządzeniami. Wyczyszczenie danych przeglądarki usuwa zapis.
- Podsumowanie można pobrać jako plik tekstowy UTF-8. „Zacznij nowy tydzień” usuwa wpisy po potwierdzeniu i zachowuje konfigurację.
