# Harta interactivă a României

## Ce construiesc
- Înlocuiesc spațiul rezervat de pe pagina națională cu o hartă geografică reală a celor 41 de județe și București.
- Păstrez structura, stilul și paginile existente; modific doar ecranul național și piesele reutilizabile necesare hărții.
- Actualizez titlul la „Evaluarea Națională 2026” și subtitlul la „Situația rezultatelor la nivel național”.

## Interacțiuni
- Fiecare județ poate fi selectat cu mouse-ul sau tastatura.
- La trecerea peste județ apare o casetă cu media EN, numărul de școli și absolvenți.
- La selectare, utilizatorul ajunge la pagina județului existentă.
- Județele fără date în setul demonstrativ rămân vizibile într-o culoare neutră și afișează clar „Date indisponibile”.

## Date și culori
- Folosesc granițe județene reale, stocate local în proiect, cu atribuirea sursei/licenței.
- Corelez denumirile geografice cu denumirile din setul existent, inclusiv diacriticele și București.
- Media județeană și cea națională rămân calculate ponderat după numărul de absolvenți.
- Culorile roșu, galben și verde provin exclusiv din funcția de risc deja existentă, fără valori stabilite manual pe județe.

## Aspect și verificare
- Harta va fi elementul dominant al paginii, cu contururi clare, legendă lizibilă și stări distincte pentru focalizare și selecție.
- Verific afișarea și navigarea pe ecran mare și mobil, plus starea aplicației după modificări.

## Detalii tehnice
- Randare SVG locală, fără apeluri externe la utilizare și fără serviciu de hărți cu plată.
- Geometria va fi proiectată într-un cadru stabil, redimensionabil, cu etichete unde spațiul permite și descrieri accesibile pentru fiecare județ.
