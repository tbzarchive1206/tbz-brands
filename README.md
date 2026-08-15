# TBZ x BRANDS

Samodzielne archiwum współprac THE BOYZ z markami, przeznaczone do publikacji jako GitHub Pages. Wygląd, układ, kolorystyka i fonty są zgodne z pozostałymi repozytoriami THE BOYZ FAN ARCHIVE.

## Funkcje

- każdy główny folder Google Drive jest osobną współpracą marki,
- nowe foldery główne automatycznie tworzą nowe karty,
- puste foldery pozostają widoczne i są gotowe na przyszłe pliki,
- wyszukiwanie według marki, członka zespołu lub nazwy pliku,
- filtrowanie współprac według członka zespołu,
- sortowanie alfabetyczne A–Z lub Z–A,
- galerie zdjęć, grafik i filmów,
- miniaturki filmów prowadzące do odtwarzacza Google Drive,
- automatyczne typograficzne miniaturki zastępcze, gdy obraz nie może się załadować,
- automatyczna synchronizacja dwa razy dziennie.

## Uruchomienie lokalne

Wymagany jest Node.js 22 oraz pnpm.

```bash
pnpm install
pnpm dev
```

Test i kompilacja:

```bash
pnpm test
```

## Publikacja na GitHub Pages

1. Utwórz puste repozytorium GitHub, np. `tbz-x-brands`.
2. Rozpakuj ZIP i w jego folderze wykonaj:

   ```bash
   git init -b main
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/TWOJ_LOGIN/tbz-x-brands.git
   git push -u origin main
   ```

3. Otwórz `Settings → Pages`.
4. W `Build and deployment` wybierz `Source → GitHub Actions`.
5. Workflow `Deploy GitHub Pages` opublikuje stronę.

## Automatyczna synchronizacja

1. Udostępnij główny folder jako `Każda osoba mająca link → Wyświetlający`.
2. W projekcie Google Cloud włącz `Google Drive API`.
3. Utwórz klucz API ograniczony do Google Drive API.
4. W repozytorium GitHub przejdź do `Settings → Secrets and variables → Actions`.
5. Dodaj sekret `GOOGLE_DRIVE_API_KEY`.
6. Uruchom `Actions → Sync TBZ x BRANDS → Run workflow`.

Synchronizacja działa codziennie o `05:17` i `17:17` UTC. Skanuje całe drzewo folderów rekurencyjnie.

## Źródło

- [Folder Google Drive](https://drive.google.com/drive/folders/1lzSaakScDylaLfsD9G3cHvtZQK6-IAJV)
