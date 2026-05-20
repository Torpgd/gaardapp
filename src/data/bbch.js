/**
 * BBCH-guide for norske kornkulturer og åkerbønner.
 */

export const BBCH_GUIDE = {
  // ── Spiring ───────────────────────────────────────────────────────────────
  "Z0":  { navn:"Tørr frøspiring", kort:"Tørt frø — ennå ikke vannet opp.", tegn:["Frøet er tørt og har ikke begynt å spire"] },
  "Z5":  { navn:"Frøspiring", kort:"Frøet begynner å spire under jorda.", tegn:["Frøet er svulmet opp","Kimroten synlig"] },
  "Z10": { navn:"Første blad gjennom jorda", kort:"Det første bladet bryter jordoverflaten.", tegn:["Grønn spiss stikker opp av jorda","Bladet er fortsatt rullet"] },
  "Z11": { navn:"1. blad utviklet", kort:"Første blad fullt utfoldet.", tegn:["Ett blad synlig og flatt utfoldet"] },
  "Z12": { navn:"2. blad utviklet", kort:"Andre blad fullt utviklet.", tegn:["To blad synlige og utfoldet"] },
  "Z13": { navn:"3. blad utviklet", kort:"Tre blad fullt utviklet.", tegn:["Tre blad synlige og utfoldet"] },
  "Z14": { navn:"4. blad utviklet", kort:"Fire blad fullt utviklet.", tegn:["Fire blad synlige og utfoldet"] },
  "Z15": { navn:"5. blad utviklet", kort:"Fem blad fullt utviklet.", tegn:["Tell bladene — fem blad tydelig utfoldet","Planten ca. 10–15 cm høy"] },
  "Z19": { navn:"9+ blad utviklet", kort:"Ni eller flere blad utviklet.", tegn:["Mange blad synlig","Busking nær forestående"] },

  // ── Busking ───────────────────────────────────────────────────────────────
  "Z20": { navn:"Buskingstart", kort:"Første sideskudd begynner å vokse.", tegn:["Se ved stråbasis — nytt skudd synlig","Planten begynner å greine seg"] },
  "Z21": { navn:"1 sideskudd", kort:"Første sideskudd fullt utviklet.", tegn:["1 sideskudd synlig i tillegg til hovedskuddet"] },
  "Z22": { navn:"2 sideskudd", kort:"To sideskudd fullt utviklet.", tegn:["2 sideskudd synlig"] },
  "Z23": { navn:"3 sideskudd", kort:"Tre sideskudd fullt utviklet.", tegn:["3 sideskudd synlig"] },
  "Z25": { navn:"5 sideskudd — full busking", kort:"Maksimal busking i gang.", tegn:["5 sideskudd synlig","Plantene tette og brede","Typisk tidspunkt for ugrassprøyting"] },
  "Z29": { navn:"Avsluttet busking", kort:"Maksimalt antall skudd nådd.", tegn:["Ingen nye skudd dannes","Planten fokuserer på strekning"] },

  // ── Strekning ─────────────────────────────────────────────────────────────
  "Z30": { navn:"Stråleddstart", kort:"Første stråledd er synlig/følbart.", tegn:["Bøy deg ned og klem forsiktig på stråbasis","Du skal kjenne en liten kul (stråknutepunkt) 1–2 cm over jorda","Knutepunktet ikke løftet mer enn 1 cm ennå"], tips:"Viktigste tidspunkt for toppgjødsling og vekstregulering." },
  "Z31": { navn:"1. stråledd synlig", kort:"Første ledd er 1 cm over jorda.", tegn:["Klem stråbasis — knutepunktet tydelig hevt 1 cm","Strået begynner å forlenge seg"] },
  "Z32": { navn:"2. stråledd synlig", kort:"Andre ledd er tydelig.", tegn:["To knutepunkt kan føles på strået","Planten ca. 20–30 cm høy"], tips:"Siste frist for vekstregulering (Moddus)." },
  "Z33": { navn:"3. stråledd synlig", kort:"Tredje ledd er synlig.", tegn:["Tre knutepunkt kan føles","Planten ca. 30–40 cm høy"] },
  "Z34": { navn:"4. stråledd synlig", kort:"Fjerde ledd synlig.", tegn:["Fire knutepunkt kan føles"] },
  "Z35": { navn:"5. stråledd synlig", kort:"Femte ledd synlig.", tegn:["Fem knutepunkt kan føles"] },
  "Z37": { navn:"Flaggblad synlig", kort:"Flaggbladet (øverste blad) er synlig men ikke utfoldet.", tegn:["Det øverste bladet synlig i bladsliren","Bladsliren hevet — bladet stikker opp men er ikke flatt"], tips:"Viktig tidspunkt for soppsprøyting." },
  "Z39": { navn:"Flaggblad utfoldet", kort:"Flaggbladet er fullt utfoldet.", tegn:["Øverste blad er flatt og horisontalt utfoldet","Ligula (tungen) er synlig","Akskanalen ikke synlig ennå"] },

  // ── Skyting ───────────────────────────────────────────────────────────────
  "Z41": { navn:"Begynnende skyting (10%)", kort:"Akset begynner å skytte opp.", tegn:["Toppen av akset synlig i flaggbladsliren","Akset ca. 10% skytt opp"] },
  "Z43": { navn:"Skyting 30%", kort:"30% av akset er skytt opp.", tegn:["Akset er tydelig synlig i sliren","Ca. 30% av aksene har skytt"] },
  "Z45": { navn:"Skyting 50%", kort:"Halvparten av akset skytt opp.", tegn:["Akset er ca. halvveis ut av sliren"] },
  "Z47": { navn:"Skyting 70%", kort:"70% av akset ute.", tegn:["Akset nesten fullt ute"] },
  "Z49": { navn:"Skyting fullført", kort:"Akset er fullt ute av sliren.", tegn:["Akset er helt ute","Ligula på flaggbladet synlig","Hele akset eksponert"] },

  // ── Blomstring ────────────────────────────────────────────────────────────
  "Z51": { navn:"Begynnende blomstring", kort:"Første blomster åpne.", tegn:["Gule pollensekker synlig på aksene","Blomstringen starter fra midten av akset"], tips:"Unngå sprøyting — bier aktive. Fusarium-risiko ved fuktig vær." },
  "Z55": { navn:"Blomstring 50%", kort:"Halvparten av blomstene er åpne.", tegn:["Pollensekker på de fleste aksene","Typisk 3–4 dager etter oppstart"] },
  "Z59": { navn:"Blomstring avsluttet", kort:"Blomstringen er over.", tegn:["Ingen nye pollensekker","Blomsterstøv ikke lenger synlig"] },
  "Z65": { navn:"Full blomstring avsluttet", kort:"Alle blomster åpnet og lukket.", tegn:["Pollensekker tørre og mørke","Tilsvarende ca. 1 uke etter skyting"] },

  // ── Kornfylling ───────────────────────────────────────────────────────────
  "Z71": { navn:"Tidlig kornfylling", kort:"Kornene begynner å fylles.", tegn:["Kornene myke og grønne","Vanninnhold >70%"] },
  "Z73": { navn:"Tidlig deigstadium", kort:"Kornene er grønne og deigaktige.", tegn:["Klem på et korn — det er mykt og deigaktig","Grønt innhold"] },
  "Z75": { navn:"Midtre deigstadium", kort:"Kornene er grønne-gule og deigaktige.", tegn:["Klem på et korn — tykt grønt innhold","Kornene begynner å gulne"] },
  "Z77": { navn:"Sen deigstadium", kort:"Kornene er gule og deigaktige.", tegn:["Kornene er gule","Innholdet fortsatt litt mykt"] },
  "Z83": { navn:"Tidlig gulmodning", kort:"Stråene begynner å gulne.", tegn:["Stråene og aksene begynner å bli gule","Bladene gulner fra bunden","Kornene er harde"] },
  "Z85": { navn:"Gulmodning", kort:"Planten er gulnet.", tegn:["Alt strå og aks er gult","Kornene harde"] },
  "Z87": { navn:"Fullmodning", kort:"Kornet er fullt modent.", tegn:["Alle strå og aks er gylne","Kornene harde og vanskelige å knuse","Fuktighet typisk 14–18%"], tips:"Optimalt høstetidspunkt ved 14–16% fuktighet." },
  "Z89": { navn:"Overmodning", kort:"Kornet er overmodent.", tegn:["Kornene meget harde","Aks begynner å falle","Risiko for dryssing"] },
  "Z92": { navn:"Etter høsting", kort:"Stubben etter høsting.", tegn:["Halmen er høstet","Stubben tilbake på åkeren"] },

  // ── Åkerbønner ────────────────────────────────────────────────────────────
  "Å10": { navn:"Spiring åkerbønner", kort:"Frøbladet stikker opp av jorda.", tegn:["Bøyde grønne spirer i jordoverflaten","Frøbladet fortsatt bøyd (krokstillingen)"] },
  "Å13": { navn:"1. sanne blad", kort:"Første sanne blad utviklet.", tegn:["Et sammensatt blad synlig og utfoldet"] },
  "Å15": { navn:"3 blad åkerbønner", kort:"Tre sanne blad er utviklet.", tegn:["Tre sammensatte blad tydelig utfoldet","Planten ca. 10 cm høy","Riktig tidspunkt for ugrassprøyting (Select 240 EC, Fenix)"] },
  "Å19": { navn:"9+ blad åkerbønner", kort:"Ni eller flere blad.", tegn:["Mange blad synlig","Planten ca. 30–40 cm høy"] },
  "Å51": { navn:"Begynnende blomstring", kort:"Første blomster åpner seg.", tegn:["Hvite blomster med sort flekk synlig i bladhjørnene","Blomstring starter nedenfra"], tips:"Risiko for sjokoladeflekk og storknollet råtesopp ved fuktig vær." },
  "Å55": { navn:"Full blomstring", kort:"Blomstring i full gang.", tegn:["Blomster på de fleste nodene","Planten vokser fortsatt"] },
  "Å65": { navn:"Blomstring avsluttet", kort:"Blomstringen er over.", tegn:["Ingen nye blomster","Tidlige belger synlig"] },
  "Å71": { navn:"Tidlig belgutvikling", kort:"Første belger dannes.", tegn:["Grønne belger 1–2 cm synlig","Planten er på sitt høyeste"] },
  "Å75": { navn:"Belgfylling", kort:"Belgene vokser og fylles.", tegn:["Grønne belger synlig — tydelig at bønnene vokser","Belgene ca. halvfulle"] },
  "Å83": { navn:"Tidlig modning", kort:"Belgene begynner å gulne.", tegn:["Nedre belger gulner","Planten gulner nedenfra"] },
  "Å87": { navn:"Modning åkerbønner", kort:"Belgene er svarte og modne.", tegn:["Belger svarte/mørkebrune","Planten gulbrun og dør ned","Bønnene raser lett ut ved risting"], tips:"Høst ved 14–16% fuktighet." },
};

// BBCH-stadier i rekkefølge — brukes av range-parser i BbchKort
export const BBCH_ORDER = [
  "Z0","Z5",
  "Z10","Z11","Z12","Z13","Z14","Z15","Z19",
  "Z20","Z21","Z22","Z23","Z25","Z29",
  "Z30","Z31","Z32","Z33","Z34","Z35","Z37","Z39",
  "Z41","Z43","Z45","Z47","Z49",
  "Z51","Z55","Z59","Z65",
  "Z71","Z73","Z75","Z77",
  "Z83","Z85","Z87","Z89","Z92",
  "Å10","Å13","Å15","Å19",
  "Å51","Å55","Å65",
  "Å71","Å75","Å83","Å87",
  "blomstring",
];
