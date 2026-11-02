# Dati linguistici

Il registro `languages.json` è condiviso da selettore, set, Rust e documentazione: 47 voci nazionali/varianti scritte, più precisamente definite in `docs/copertura-europa.md`.

- `cldr48.json`: snapshot attribuito e fissato dei repertori CLDR 48. Montenegrino e latino hanno integrazioni dichiarate nelle fonti. Non contiene automaticamente tutti i repertori ausiliari nell'output del popup.
- `characters.json`: repertori, digrammi e associazioni ai tasti. I candidati sono stringhe Unicode, non scalari singoli. I tasti latini sono associazioni pratiche, non una traslitterazione normativa.
- La sincronizzazione UI genera `ui/src/character-sets.json` dai repertori effettivi: solo le lingue con caratteri aggiuntivi compaiono nei set, mentre tutte le 47 voci restano disponibili per l’interfaccia. L’inglese è l’unico repertorio attualmente vuoto.
- `currencies.json`: catalogo Valute, indipendente dalle lingue. Le associazioni generano `CURRENCY_MAPS` in Rust e sono usate direttamente dalla UI e dalle guide; i simboli selezionati seguono le varianti linguistiche e non cambiano con Shift/Caps Lock. `selected_currencies` conserva i singoli simboli (inizialmente solo `€`); `currency_symbols` accende o spegne il gruppo senza cancellarne la selezione. I file precedenti senza la selezione usano solo `€`, rispettando l’eventuale disattivazione del gruppo.
- `messages.json`: testi espliciti per ciascuna voce, incluse le guide e le etichette dei set speciali. Nessun fallback inglese per lingue dichiarate supportate.
- `translation-status.json`: provenienza e stato della revisione. Le nuove traduzioni sono bozze automatiche/assistente, non revisionate da madrelingua. `overrides.json` registra correzioni terminologiche esplicite.
- `LICENSE-UNICODE.txt`: licenza dei dati Unicode/CLDR.

La build normale è offline: verifica i dizionari, genera la copia UI e le guide, senza contattare servizi esterni. `scripts/import-europe.py` e `scripts/translate-europe.py` sono strumenti di manutenzione eseguiti esplicitamente: il secondo invia esclusivamente i testi generici del prodotto al servizio pubblico di traduzione Google, mai preferenze o dati personali. Conserva i sei dizionari UI già presenti e usa bozze esplicite per Nynorsk e romancio; le varianti scritte della stessa lingua sono derivate e registrate separatamente.

Per rigenerare il codice Rust: `python -X utf8 scripts/generate-language-catalog.py`, poi `cargo fmt --all`. Per rigenerare le guide: `node scripts/generate-language-docs.mjs`. Le modifiche ai testi originari in `i18n.rs` devono essere riconciliate nei dizionari: la build si ferma quando divergono.
