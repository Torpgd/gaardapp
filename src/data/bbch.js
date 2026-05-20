/**
 * BBCH-guide for norske kornkulturer og åkerbønner.
 * Brukes til å vise forklaringskort når bruker klikker på vekststadier
 * som "Z30", "Z10–Z15" osv. i sprøyte-, gjødslings- og skogslogg.
 */

export const BBCH_GUIDE = {
  // ── Spiring og tidlig vekst ───────────────────────────────────────────────
  "Z0":  { navn:"Tørr frøspiring", kort:"Tørt frø — ennå ikke vannet opp.", tegn:["Frøet er tørt og har ikke begynt å spire"], kulturer:["hvete","bygg","havre","åkerbønner"] },
  "Z5":  { navn:"Frøspiring", kort:"Frøet begynner å spire under jorda.", tegn:["Frøet er svulmet opp", "Kimroten synlig"], kulturer:["hvete","bygg","havre","åkerbønner"] },
  "Z10": { navn:"Første blad gjennom jorda", kort:"Det første bladet bryter jordoverflaten.", tegn:["Sett det grønne spissen stikke opp av jorda", "Bladet er fortsatt rullet"], kulturer:["hvete","bygg","havre","åkerbønner"] },
  "Z11": { navn:"1. blad utviklet", kort:"Første blad er fullt utviklet og utfoldet.", tegn:["Ett blad synlig og flatt utfoldet", "Bladspissen er fri fra bladsliren"], kulturer:["hvete","bygg","havre"] },
  "Z12": { navn:"2. blad utviklet", kort:"Andre blad er fullt utviklet.", tegn:["To blad synlige og utfoldet", "Første blad er fullt grønt"], kulturer:["hvete","bygg","havre"] },
  "Z13": { navn:"3. blad utviklet", kort:"Tre blad er fullt utviklet.", tegn:["Tre blad synlige og utfoldet"], kulturer:["hvete","bygg","havre"] },
  "Z15": { navn:"5. blad utviklet", kort:"Fem blad er fullt utviklet.", tegn:["Tell bladene — fem blad er tydelig utfoldet", "Planten er ca. 10–15 cm høy"], kulturer:["hvete","bygg","havre"] },

  // ── Busking ───────────────────────────────────────────────────────────────
  "Z20": { navn:"Buskingstart", kort:"Første sideskudd begynner å vokse.", tegn:["Se ved stråbasis — et nytt skudd er synlig", "Planten begynner å greine seg"], kulturer:["hvete","bygg","havre"] },
  "Z21": { navn:"1 sideskudd", kort:"Første sideskudd fullt utviklet.", tegn:["1 sideskudd synlig i tillegg til hovedskuddet"], kulturer:["hvete","bygg","havre"] },
  "Z25": { navn:"Hovedbusking", kort:"5 sideskudd — full busking.", tegn:["5 sideskudd synlig", "Plantene er tette og brede", "Typisk tidspunkt for ugrassprøyting i korn"], kulturer:["hvete","bygg","havre"] },
  "Z29": { navn:"Avsluttet busking", kort:"Maksimalt antall skudd er nådd.", tegn:["Ingen nye skudd dannes", "Planten fokuserer nå på strekning"], kulturer:["hvete","bygg","havre"] },

  // ── Strekning ─────────────────────────────────────────────────────────────
  "Z30": { navn:"Stråleddstart (Z30)", kort:"Første stråledd er synlig/følbart.", tegn:["Bøy deg ned og klem forsiktig på stråbasis", "Du skal kjenne en liten kul (stråknutepunkt) 1–2 cm over jorda", "Stråknutepunktet er ikke løftet mer enn 1 cm ennå"], tips:"Dette er det viktigste tidspunktet for toppgjødsling og vekstregulering.", kulturer:["hvete","bygg","havre"] },
  "Z31": { navn:"1. stråledd synlig", kort:"Første ledd er 1 cm over jorda.", tegn:["Klem stråbasis — knutepunktet er tydelig hevt 1 cm", "Strået begynner å forlenge seg"], kulturer:["hvete","bygg","havre"] },
  "Z32": { navn:"2. stråledd synlig", kort:"Andre ledd er tydelig.", tegn:["To knutepunkt kan føles på strået", "Planten er ca. 20–30 cm høy"], tips:"Siste frist for vekstregulering (Moddus).", kulturer:["hvete","bygg","havre"] },
  "Z37": { navn:"Flaggblad synlig", kort:"Flaggbladet (øverste blad) er synlig men ikke utfoldet.", tegn:["Det øverste bladet er synlig i bladsliren", "Bladsliren er hevet — bladet stikker opp men er ikke flatt"], tips:"Viktig tidspunkt for soppsprøyting.", kulturer:["hvete","bygg","havre"] },
  "Z39": { navn:"Flaggblad utfoldet", kort:"Flaggbladet er fullt utfoldet.", tegn:["Øverste blad er flatt og horisontalt utfoldet", "Ligula (tungen) er synlig", "Akskanalen er ikke synlig ennå"], kulturer:["hvete","bygg","havre"] },

  // ── Skyting og blomstring ─────────────────────────────────────────────────
  "Z41": { navn:"Begynnende skyting", kort:"Akset begynner å skytte opp.", tegn:["Toppen av akset er synlig i flaggbladsliren", "Akset er ca. 10% skytt opp"], kulturer:["hvete","bygg","havre"] },
  "Z51": { navn:"Begynnende blomstring", kort:"Første blomster åpne.", tegn:["Gule pollensekker synlig på aksene", "Blomstringen starter fra midten av akset og sprer seg"], tips:"Unngå sprøyting — bier aktive. Fusarium-risiko ved fuktig vær.", kulturer:["hvete","bygg","havre"] },
  "Z65": { navn:"Full blomstring", kort:"Alle blomster åpne.", tegn:["Pollensekker på alle aksene", "Typisk ca. 1 uke etter skyting"], kulturer:["hvete","bygg","havre"] },

  // ── Kornfylling og modning ────────────────────────────────────────────────
  "Z71": { navn:"Tidlig kornfylling", kort:"Kornene begynner å fylles opp.", tegn:["Kornene er fortsatt myke og grønne", "Vanninnholdet er høyt (>70%)"], kulturer:["hvete","bygg","havre"] },
  "Z83": { navn:"Tidlig gulmodning", kort:"Stråene begynner å gulne.", tegn:["Stråene og aksene begynner å bli gule", "Bladene gulner fra bunden og oppover", "Kornene er harde"], kulturer:["hvete","bygg","havre"] },
  "Z87": { navn:"Fullmodning", kort:"Kornet er fullt modent.", tegn:["Alle strå og aks er gule/gylne", "Kornene er harde og vanskelig å knuse mellom fingrene", "Fuktighet typisk 14–18%"], tips:"Optimalt høstetidspunkt ved 14–16% fuktighet.", kulturer:["hvete","bygg","havre"] },

  // ── Åkerbønner ────────────────────────────────────────────────────────────
  "Å10": { navn:"Spiring åkerbønner", kort:"Frøbladet stikker opp av jorda.", tegn:["Se etter bøyde grønne spirer i jordoverflaten", "Frøbladet er fortsatt bøyd (krokstillingen)"], kulturer:["åkerbønner"] },
  "Å15": { navn:"3 blad åkerbønner", kort:"Tre sanne blad er utviklet.", tegn:["Tre sammensatte blad er tydelig utfoldet", "Planten er ca. 10 cm høy", "Riktig tidspunkt for ugrassprøyting (Select 240 EC, Fenix)"], kulturer:["åkerbønner"] },
  "Å51": { navn:"Begynnende blomstring", kort:"Første blomster åpner seg.", tegn:["Hvite blomster med sort flekk synlig i bladhjørnene", "Blomstring starter nedenfra på planten"], tips:"Risiko for sjokoladeflekk og storknollet råtesopp ved fuktig vær.", kulturer:["åkerbønner"] },
  "Å75": { navn:"Belgfylling", kort:"Belgene vokser og fylles.", tegn:["Grønne belger synlig — tydelig at bønnene vokser", "Belgene er ca. halvfulle"], kulturer:["åkerbønner"] },
  "Å87": { navn:"Modning åkerbønner", kort:"Belgene er svarte og modne.", tegn:["Belger er svarte/mørkebrune", "Planten er gulbrun og dør ned", "Bønnene raser lett ut ved risting"], tips:"Høst ved 14–16% fuktighet.", kulturer:["åkerbønner"] },
};

// Alle BBCH-referanser som kan forekomme i appen (for søk)
export const BBCH_ALIASES = {
  // Standard Z-referanser
  "Z10–Z15": ["Z10","Z15"],
  "Z12–Z21": ["Z12"],
  "Z12–Z31": ["Z12","Z32"],
  "Z12–Z32": ["Z12","Z32"],
  "Z13–Z32": ["Z13","Z32"],
  "Z13–Z39": ["Z13","Z39"],
  "Z21–Z32": ["Z21","Z32"],
  "Z30":     ["Z30"],
  "Z30–Z32": ["Z30","Z32"],
  "Z31":     ["Z31"],
  "Z32":     ["Z32"],
  "Z37":     ["Z37"],
  "Z37–Z49": ["Z37"],
  "Z37–Z55": ["Z37"],
  "Z37–Z65": ["Z37"],
  "Z51":     ["Z51"],
  "Z65":     ["Z65"],
  // Åkerbønner
  "Z10–Z13": ["Å10","Å15"],
  "blomstring": ["Å51","Z51"],
};
