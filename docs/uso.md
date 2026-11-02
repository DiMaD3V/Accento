# Usare Accento

> Il sorgente comprende ora backend Windows, Linux X11 e macOS. Questa guida descrive in dettaglio Windows; per installazione, permessi, percorsi e verifiche degli altri sistemi consulta [la guida cross-platform](cross-platform.md). Wayland nativo non è supportato e il collaudo completo macOS richiede ancora un Mac. I pacchetti Windows locali precedenti al porting restano solo Windows.

Accento 0.5.0-beta.4 comprende Windows 11 x64 e una beta universale macOS Intel / Apple Silicon. Questa guida descrive Windows; per installazione, permessi e prove Mac consulta [la checklist del tester](distribution/TEST-MACOS.it.txt). Inserisce accenti con tasti Glass indipendenti su fondo trasparente, lasciando il focus nel programma in cui scrivi. Su Windows le impostazioni React/Tauri richiedono Microsoft Edge WebView2 Runtime; su macOS usano la WebView di sistema. Le risorse sono incorporate e funzionano offline; non servono PowerToys o .NET.

## Avvio

Esegui l’installer per l’utente corrente, oppure estrai l’intero ZIP portabile e apri `Accento.exe`. L’installer può scaricare WebView2 se manca; il portabile richiede un runtime già installato. Compare la finestra delle impostazioni e viene aggiunta un'icona nell'area di notifica. Chiudere le impostazioni lascia attivo Accento; dal menu dell'icona puoi scegliere Pausa, Riprendi, Impostazioni ed Esci. Un secondo avvio riapre le impostazioni dell'istanza già presente.

Se stai usando anche Quick Accent o un'altra utility con lo stesso gesto, mettila in pausa durante la prova per evitare sovrapposizioni.

## Avvio automatico in background

In **Generale → Avvio automatico** abilita la checkbox per avviare Accento in background all’accesso al computer, senza aprire le impostazioni. La scelta si applica subito, è disattivata inizialmente e non viene annullata da Annulla modifiche. Per riaprire le impostazioni usa l’icona nell’area di notifica; per fermare il programma scegli Esci. Disabilitare la checkbox rimuove l’avvio automatico.

Su Windows la registrazione riguarda soltanto l’utente corrente e non richiede amministratore. Lo stato riflette anche la disattivazione da Gestione attività. Su macOS viene usato un LaunchAgent dell’utente. Per il portabile, conserva Accento nel percorso scelto; prima di spostarlo o cancellarlo, disabilita l’avvio automatico e riabilitalo dalla nuova copia se necessario.

## Inserire un accento

1. Premi `e` e tienila premuta.
2. Premi Spazio e rilascialo, continuando a tenere premuta `e`.
3. Quando appare la barra, `è` è già selezionata. Usa Destra o Spazio per scorrere `é` e `€`. Sinistra dalla prima scelta passa all'ultima; la navigazione torna all'altro estremo della lista.
4. Rilascia `e` per inserire la variante.

Per una maiuscola, inizia con Shift e la lettera, oppure con Caps Lock. Esc chiude la barra conservando la lettera originale. Il rilascio dopo l'apertura conferma la variante selezionata, anche senza navigare. Se termini prima dell'apertura, Accento restituisce lo Spazio della digitazione ordinaria.

La prima pressione di Spazio apre la barra con il primo candidato già selezionato. Il rilascio del solo Spazio non conferma né avanza. Per navigare con Spazio occorre rilasciarlo e premerlo di nuovo. Le ripetizioni automatiche non scorrono la lista. Un cambio di finestra o campo, un click, una rotellina o una scorciatoia incompatibile annulla il gesto.

## Valute

In **Generale → Caratteri disponibili → Set speciali → Valute** scegli i singoli simboli monetari, indipendentemente dalle lingue. Inizialmente è selezionato solo `€`. La checkbox accanto a **Set speciali** seleziona tutte le valute; quando tutte sono selezionate, un altro click le disattiva. Un trattino indica una selezione parziale. Puoi anche scegliere i simboli uno per volta. **Salva modifiche** applica la scelta e **Annulla modifiche** ripristina quella salvata. Mantieni almeno una lingua attiva.

Con italiano e Valute attivi, `e` + Spazio offre `è`, `é`, `€`: gli accenti mantengono il loro ordine e i simboli vengono aggiunti in fondo, senza duplicati. Per inserire rapidamente `€`, apri la barra su `e`, premi Sinistra una volta e rilascia `e`. Con altre lingue attive la lista può contenere ulteriori varianti. Shift e Caps Lock non modificano i simboli monetari.

Il dettaglio **Valute · Varianti** mostra tutte le associazioni nelle impostazioni. Per esempio: `e` → `€`, `s` → `$` e `₪`, `l` → `£`, `y` → `¥`, `c` → `¢` e `₡`, `p` → `£`, `₽`, `₱`, `r` → `₹`, `₽`, `៛`, `﷼`. Le [guide localizzate](copertura-europa.md) includono la tabella completa, generata dallo stesso catalogo `localization/currencies.json` usato dal motore.

## Preferenze

In Generale, il pannello **Caratteri disponibili** si espande e si chiude dalla sua intestazione. La checkbox a sinistra di **Lingue** seleziona tutti i repertori linguistici; togliendola rimane la prima lingua attiva, come richiesto dal catalogo. La checkbox accanto a **Set speciali** agisce solo sulle valute. I due gruppi sono indipendenti; un trattino segnala una selezione parziale. La card non contiene ricerca né un comando Seleziona tutto complessivo. La ricerca rimane nel menu della lingua dell’interfaccia.

Le impostazioni hanno due pagine: **Generale** e **BlackList**. In Generale trovi ritardo, lingua dell’interfaccia e **Posizione del pop-up**, seguiti dal pannello Caratteri disponibili per attivare i 46 repertori che aggiungono caratteri. L’inglese non ha caratteri aggiuntivi e non compare tra i set; rimane tra le 47 lingue dell’interfaccia, indipendenti dai caratteri attivi. Il tema delle impostazioni è sempre scuro.

**Posizione del pop-up** permette di scegliere **In alto** (predefinito) o **In basso**. Il pop-up rimane centrato orizzontalmente nell’area utile dello schermo e rispetta la scala del monitor. Anche questa scelta usa **Salva modifiche** e **Annulla modifiche**.

**Annulla modifiche** ripristina l’ultima configurazione salvata. Chiudere con una bozza aperta richiede una scelta; senza modifiche la finestra web viene liberata.

Premi **Salva modifiche** per applicare e conservare la bozza. La lingua dell’interfaccia cambia subito nelle impostazioni; il salvataggio applica la configurazione al selettore e conserva le scelte. L’interruttore nella navigazione spegne o riaccende subito Accento: non richiede Salva, conserva la bozza e lascia accessibili le impostazioni. Alla successiva apertura del programma Accento riparte attivo.

Il ritardo si scrive nel campo. Tab attraversa i controlli; Invio e Spazio attivano i pulsanti. Il selettore lingua supporta ricerca, frecce, Invio ed Esc. Nel formato compatto le due pagine diventano tab superiori. Ritardo e lingua restano affiancati finché lo spazio lo consente, poi si dispongono in verticale. Scorre solo il contenuto quando supera lo spazio disponibile; navigazione e Salva restano visibili. La rotella non cambia temi, lingue o valori.

| Preferenza | Comportamento |
| --- | --- |
| Ritardo | Da 100 a 1500 ms, inizialmente 300 ms dal primo Spazio |
| Caratteri disponibili | 46 repertori con caratteri aggiuntivi; almeno uno attivo. Ricerca per nome o codice; [elenco completo](copertura-europa.md) |
| Posizione del pop-up | Centrato in alto (predefinito) o in basso nell’area utile dello schermo |
| Aspetto | Sempre scuro, senza selettore; Liquid Glass resta lo stile del popup |
| Lingua dell’interfaccia | Stesse 47 voci della matrice, indipendenti dai set; nuove traduzioni in bozza, non revisionate da madrelingua |
| BlackList | Un nome eseguibile per elemento, per esempio `notepad.exe`; Aggiungi o Invio inserisce la riga, × la rimuove. Duplicati, percorsi e nomi separati da virgole non sono accettati |

La BlackList usa il nome esatto del processo, ignorando maiuscole e minuscole. Aggiunta e rimozione diventano effettive con Salva modifiche. Liquid Glass usa sfocatura e rifrazione del piccolo rettangolo sottostante, campionato all’apertura e tenuto solo in memoria. Le impostazioni di contrasto elevato e trasparenza di Windows possono richiedere superfici opache per la leggibilità; non esiste più una checkbox del materiale in Accento.

Il catalogo comprende i repertori principali Unicode CLDR 48 e integrazioni dichiarate, con ordine stabile e senza duplicati. Supporta anche digrammi e sequenze con segni combinanti; non tronca le maiuscole composte. Non è una mappa completa di tutti i caratteri delle lingue. L'italiano include `à`, `è`, `é`, `ì`, `ò`, `ó`, `ù`; gli altri set aggiungono per esempio `ç`, `ñ`, `ü`, `ß` e le maiuscole pertinenti.

Le preferenze sono in `%LOCALAPPDATA%\Accento\settings.json`. Un file non valido rimane conservato finché non salvi una nuova configurazione. Accento non registra frasi, cronologia dei tasti o contenuti dei campi. Non usa servizi di rete.

## Requisiti e limiti della prima versione

L'ambiente iniziale è Windows 11 x64, build 22621 o successiva. L'eseguibile è stato provato sulla build 26300; la build minima non ha ancora una verifica dedicata. Il materiale è un adattamento Windows con composizione alpha per pixel, non l'effetto Apple. La rifrazione usa lo sfondo campionato all'apertura, senza aggiornamenti continui del campione durante il gesto. Quando Windows richiede superfici opache non viene campionato lo sfondo.

Sono riconosciute le famiglie di layout Windows delle lingue nazionali nel registro, comprese quelle non latine. Il motore usa la lettera tradotta da Windows e conserva l’identità del tasto fino al rilascio. Le associazioni da tasti latini permettono anche l’accesso agli altri alfabeti. La verifica manuale di ogni layout fisico resta distinta dai test del catalogo. Per tasti morti e combinazioni incompatibili l'attivazione viene evitata; non si dichiara supporto generale per IME, desktop remoto o composizioni complesse.

La sostituzione usa Backspace seguito da input Unicode nello stesso batch. Il collaudo automatico riguarda campi Edit Windows creati appositamente; Word, browser e terminali richiedono prove specifiche. Un cambio di testo o cursore non osservabile può ancora influire sulla sostituzione. Le applicazioni elevate possono rifiutare l'inserimento da un processo normale. Accento non richiede privilegi amministrativi.

Il riconoscimento dei campi password è limitato ai controlli Edit che espongono lo stile protetto; non copre tutti i campi dei browser. Il selettore espone un nome accessibile con candidati e scelta e invia notifiche UI Automation quando un client ascolta. La verifica completa con Narrator rimane da eseguire.

La beta Windows include un installer per l’utente corrente e uno ZIP portabile. Non include aggiornamenti automatici, firma digitale, supporto ARM64 o pressione prolungata senza Spazio. I backend Linux X11 e macOS sono nel sorgente; stato delle prove e istruzioni sono nella guida cross-platform.

## Comandi facoltativi

`Accento.exe --ui-test` conserva il collaudo di regressione delle vecchie impostazioni native e del ridisegno nella sola finestra di prova, senza hook o digitazione sintetica e senza salvare preferenze personali.

`Accento.exe --background` avvia direttamente nell'area di notifica. `Accento.exe --self-test` apre una finestra di collaudo, invia sequenze sintetiche soltanto per la prova e termina; durante il collaudo lascia libera la tastiera. Il rapporto `accento-self-test.txt` e le catture della sola interfaccia di prova sono salvati accanto all'eseguibile.

Per rimuovere la versione installata, scegli Esci e usa Impostazioni Windows → App. Per rimuovere la versione portabile, scegli Esci e cancella la cartella estratta. Puoi conservare o rimuovere separatamente la cartella delle preferenze.

## Europa e guide localizzate

[Copertura concordata e guide per ogni lingua](copertura-europa.md). L’albanese standard comprende ç/Ç, ë/Ë e nove digrammi: questi ultimi sono ora disponibili anche come candidati completi, oltre alla normale digitazione. Le lingue esclusivamente regionali sono fuori dal perimetro concordato.
