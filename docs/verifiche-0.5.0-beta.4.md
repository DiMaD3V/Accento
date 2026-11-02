# Verifiche Accento 0.5.0-beta.4

Verifica Windows del 2 novembre 2026, eseguita con `npm run bundle` e profili separati da quelli personali. I pacchetti e il manifest SHA-256 sono in `dist/releases/v0.5.0-beta.4/`.

| Controllo | Risultato |
| --- | --- |
| TypeScript e build Vite | Superati |
| Test browser | 19 scenari superati |
| Regressione visiva | 28 catture Windows a 1040×780 e 640×620, aggiornate per il design approvato e poi confrontate senza differenze |
| Accessibilità automatica | Nessuna violazione seria/critica nei percorsi verificati, inclusa la scelta della lingua |
| Rust | 53 test superati; `cargo fmt` e Clippy con `-D warnings` superati |
| WebView2 / IPC nativo | Avvio, lettura/salvataggio, 47 lingue, bozza, pausa, valute e posizione del popup superati |
| Cornice nativa | Finestra senza decorazioni, massimizza/ripristina, minimizza, chiusura con protezione della bozza e permanenza del motore verificati |
| Avvio automatico Windows | Ciclo enable/read/disable, comando quotato con spazi e disattivazione StartupApproved verificati in una chiave di registro dedicata, esterna alle chiavi di avvio |
| Avvio automatico da UI | Attivazione e disattivazione immediate tramite Rust, persistite nel profilo isolato; nessuna registrazione reale di login modificata |
| `--background` | Processo avviato da un percorso con spazi, senza finestre applicative visibili; la sonda rileva invece l’apertura normale delle impostazioni |
| Regressione delle vecchie impostazioni native | Collaudo UI e controlli superati, senza hook o digitazione sintetica |
| Distribuzione | Installer NSIS e ZIP portabile prodotti; archivio controllato, 47 guide, licenze e checksum verificati dallo script |

L’evidenza del WebView è in [desktop-test.json](evidenze/react-tauri/desktop-test.json); le schermate reali aggiornate sono in `docs/assets/`. La sonda distingue le finestre applicative dal target tecnico dell’event loop Tao: il suo handle di 16×16 pixel non indica impostazioni aperte.

Per macOS consultare i report Apple Silicon e Intel allegati alla release: il workflow costruisce l’app universale, controlla firma ad hoc e risorse ed esegue il collaudo WebView/IPC con input disabilitato. Lo stato di avvio automatico del collaudo resta isolato anche su Mac.

Non sono certificati un riavvio/accesso reale al sistema, la procedura completa dei permessi Mac, tutte le applicazioni/layout, l’installazione su macchina pulita, gli aggiornamenti da versioni precedenti, la disinstallazione e l’accessibilità completa. Le prove automatiche non hanno modificato l’avvio automatico dell’utente. Le traduzioni nuove sono bozze non revisionate da madrelingua. Restano i limiti della beta riportati nelle [note della release](releases/v0.5.0-beta.4.md).
