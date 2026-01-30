import { LegalPageLayout } from "@/components/layout/LegalPageLayout";

export const metadata = {
  title: "Privacy Policy | 24FIT",
  description: "Informativa sulla privacy e trattamento dei dati personali di 24FIT",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <div className="mb-6">
        <h2 className="text-base font-semibold mb-2 text-gray-900">1. Introduzione</h2>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          Si tratta di un'informativa che è resa anche ai sensi dell'art. 13 del d.lg. n. 196/2003 – Codice in materia
          di protezione dei dati personali a coloro che interagiscono con i servizi web di 24FIT SRL per la protezione
          dei dati personali, accessibili dall'indirizzo: https://www.24fit.it/ corrispondente alla pagina iniziale del
          sito dell'azienda 24FIT SRL.
        </p>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          L'informativa è resa solo per il sito di https://www.24fit.it/ e non anche per altri siti web eventualmente
          consultati dall'utente tramite link.
        </p>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          L'informativa si ispira anche alla Raccomandazione n. 2/2001 che le autorità europee per la protezione dei
          dati personali, riunite nel Gruppo istituito dall'art. 29 della direttiva n. 95/46/CE, hanno adottato il
          17 maggio 2001 per individuare alcuni requisiti minimi per la raccolta di dati personali on-line, e, in
          particolare, le modalità, i tempi e la natura delle informazioni che i titolari del trattamento devono
          fornire agli utenti quando questi si collegano a pagine web, indipendentemente dagli scopi del collegamento.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-base font-semibold mb-2 text-gray-900">2. Titolare del Trattamento</h2>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          A seguito della consultazione di questo sito possono essere trattati dati relativi a persone identificate
          o identificabili.
        </p>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          Il "titolare" del loro trattamento è 24FIT SRL per la protezione dei dati personali, che ha sede in
          Viale Salvador Allende, 1, 46034 Borgo Virgilio MN.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-base font-semibold mb-2 text-gray-900">3. Responsabile del Trattamento</h2>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          La società 24FIT SRL responsabile del trattamento ai sensi dell'articolo 29 del Codice in materia di
          protezione dei dati personali, in quanto incaricata della manutenzione della parte tecnologica del sito.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-base font-semibold mb-2 text-gray-900">4. Luogo del Trattamento</h2>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          I trattamenti connessi ai servizi web di questo sito sono conservati presso il data center di 24FIT SRL,
          posto su Server SiteGround e sono curati solo da personale dell'Ufficio incaricato del trattamento. In caso
          di necessità, i dati connessi al servizio newsletter possono essere trattati dal personale della società
          che cura la manutenzione della parte tecnologica del sito, Easy & Co SRL (responsabile del trattamento ai
          sensi dell'articolo 29 del Codice in materia di protezione dei dati personali), presso la sede della società
          medesima.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-base font-semibold mb-2 text-gray-900">5. Tipi di dati Trattati</h2>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          I sistemi informatici e le procedure software preposte al funzionamento di questo sito web acquisiscono,
          nel corso del loro normale esercizio, alcuni dati personali la cui trasmissione è implicita nell'uso dei
          protocolli di comunicazione di Internet.
        </p>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          Si tratta di informazioni che non sono raccolte per essere associate a interessati identificati, ma che per
          loro stessa natura potrebbero, attraverso elaborazioni ed associazioni con dati detenuti da terzi, permettere
          di identificare gli utenti.
        </p>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          In questa categoria di dati rientrano gli indirizzi IP o i nomi a dominio dei computer utilizzati dagli utenti
          che si connettono al sito, gli indirizzi in notazione URI (Uniform Resource Identifier) delle risorse richieste,
          l'orario della richiesta, il metodo utilizzato nel sottoporre la richiesta al server, la dimensione del file
          ottenuto in risposta, il codice numerico indicante lo stato della risposta data dal server (buon fine, errore,
          ecc.) ed altri parametri relativi al sistema operativo e all'ambiente informatico dell'utente.
        </p>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          Questi dati vengono utilizzati al solo fine di ricavare informazioni statistiche anonime sull'uso del sito e
          per controllarne il corretto funzionamento e vengono cancellati immediatamente dopo l'elaborazione. I dati
          potrebbero essere utilizzati per l'accertamento di responsabilità in caso di ipotetici reati informatici ai
          danni del sito.
        </p>
        <h3 className="text-sm font-semibold mb-2 text-gray-800 mt-4">Dati forniti volontariamente dall'utente</h3>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          L'invio facoltativo, esplicito e volontario di posta elettronica agli indirizzi indicati su questo sito
          comporta la successiva acquisizione dell'indirizzo del mittente, necessario per rispondere alle richieste,
          nonché degli eventuali altri dati personali inseriti nella missiva.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-base font-semibold mb-2 text-gray-900">6. Cookies</h2>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          Nessun dato personale degli utenti viene in proposito acquisito dal sito.
        </p>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          Non viene fatto uso di cookies per la trasmissione di informazioni di carattere personale.
        </p>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          L'uso di c.d. cookies di sessione (che non vengono memorizzati in modo persistente sul computer dell'utente
          e svaniscono con la chiusura del browser) è strettamente limitato alla trasmissione di identificativi di
          sessione (costituiti da numeri casuali generati dal server) necessari per consentire l'esplorazione sicura
          ed efficiente del sito.
        </p>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          I c.d. cookies di sessione utilizzati in questo sito evitano il ricorso ad altre tecniche informatiche
          potenzialmente pregiudizievoli per la riservatezza della navigazione degli utenti e non consentono
          l'acquisizione di dati personali identificativi dell'utente.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-base font-semibold mb-2 text-gray-900">7. Facoltà del conferimento dei Dati</h2>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          A parte quanto specificato per i dati di navigazione, l'utente è libero di fornire i dati personali nei
          form di contatto o per l'invio di newsletter, di materiale informativo o di altre comunicazioni.
        </p>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          Il loro mancato conferimento può comportare l'impossibilità di ottenere quanto richiesto.
        </p>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          Per completezza va ricordato che in alcuni casi (non oggetto dell'ordinaria gestione di questo sito)
          l'Autorità può richiedere notizie e informazioni ai sensi dell'articolo 157 del Codice in materia di
          protezione dei dati personali, ai fini del controllo sul trattamento dei dati personali. In questi casi
          la risposta è obbligatoria a pena di sanzione amministrativa.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-base font-semibold mb-2 text-gray-900">8. Modalità del Trattamento</h2>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          I dati personali sono trattati con strumenti automatizzati per il tempo strettamente necessario a conseguire
          gli scopi per cui sono stati raccolti.
        </p>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          Specifiche misure di sicurezza sono osservate per prevenire la perdita dei dati, usi illeciti o non corretti
          ed accessi non autorizzati.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-base font-semibold mb-2 text-gray-900">9. Diritti degli Interessati</h2>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          I soggetti cui si riferiscono i dati personali hanno il diritto in qualunque momento di ottenere la conferma
          dell'esistenza o meno dei medesimi dati e di conoscerne il contenuto e l'origine, verificarne l'esattezza o
          chiederne l'integrazione o l'aggiornamento, oppure la rettificazione (articolo 7 del Codice in materia di
          protezione dei dati personali).
        </p>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          Ai sensi del medesimo articolo si ha il diritto di chiedere la cancellazione, la trasformazione in forma
          anonima o il blocco dei dati trattati in violazione di legge, nonché di opporsi in ogni caso, per motivi
          legittimi, al loro trattamento.
        </p>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          Le richieste vanno inviate via e-mail, all'indirizzo: <strong>info@24fit.it</strong>
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-base font-semibold mb-2 text-gray-900">10. P3P</h2>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          La presente informativa sulla privacy è consultabile in forma automatica dai più recenti browser che
          implementano lo standard P3P ("Platform for Privacy Preferences Project") proposto dal World Wide Web
          Consortium (www.w3c.org).
        </p>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          Ogni sforzo verrà fatto per rendere il più possibile interoperabili le funzionalità di questo sito con i
          meccanismi di controllo automatico della privacy disponibili in alcuni prodotti utilizzati dagli utenti.
        </p>
        <p className="text-gray-700 mb-3 font-medium leading-relaxed">
          Considerando che lo stato di perfezionamento dei meccanismi automatici di controllo non li rende attualmente
          esenti da errori e disfunzioni, si precisa che il presente documento, costituisce la "Privacy Policy" di
          questo sito che sarà soggetta ad aggiornamenti.
        </p>
      </div>

      <div className="bg-[var(--brand)] p-6 rounded-xl">
        <h3 className="text-lg font-black mb-2 text-white">Contatti</h3>
        <p className="text-white font-medium">
          Per qualsiasi domanda relativa al trattamento dei dati personali:<br />
          <strong>Email:</strong> info@24fit.it<br />
          <strong>PEC:</strong> 24fit@pec.it
        </p>
      </div>
    </LegalPageLayout>
  );
}
