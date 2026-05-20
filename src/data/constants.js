// ─── WORKERS (mock — erstattes av Supabase) ───────────────────────────────────
export const MW = [
  {id:"1",name:"Jon",color:"#a8d878",birthdate:"1978-05-14",wage:177.80,paid_minutes:0,is_admin:true,pin:"1234"},
  {id:"2",name:"Anne",color:"#78c8f0",birthdate:"1980-03-22",wage:177.80,paid_minutes:0,is_admin:true,pin:"2345"},
  {id:"3",name:"Christian",color:"#f0c878",birthdate:"2013-04-23",wage:120.00,paid_minutes:0,is_admin:false,pin:"3456"},
  {id:"4",name:"Håkon",color:"#f09878",birthdate:"2010-01-08",wage:147.40,paid_minutes:0,is_admin:false,pin:"4567"},
];

export const ME = [
  {id:"e1",worker_id:"1",date:"2026-05-02",category:"Såing",start_time:"07:00",end_time:"14:00",duration_minutes:420,description:"Sådde hvete Betong skifte 16+18",wage_at_date:177.80},
];

export const WC = ["Jordarbeiding","Såing","Sprøyting","Høsting","Skogsarbeid","Vedlikehold/reparasjon","Transport","Graving/anlegg","Administrasjon","Annet"];

// Aldersbasert lønnsstige (Overenskomst jordbruks- og gartnerinæringene 2024–2026)
export const AS = [{a:0,b:15,s:null},{a:16,b:17,s:147.40},{a:18,b:99,s:177.80}];

// ─── JORD ─────────────────────────────────────────────────────────────────────
export const SOIL = {
  skifte1:{ph:6.4,pal:"C1",kal:2,mg:9},skifte3:{ph:6.2,pal:"C2",kal:2,mg:8},
  skifte5:{ph:6.5,pal:"C1",kal:3,mg:10},skifte6:{ph:6.3,pal:"C2",kal:2,mg:9},
  skifte9:{ph:6.6,pal:"C1",kal:3,mg:11},skifte10:{ph:6.4,pal:"C1",kal:2,mg:8},
  skifte13:{ph:6.7,pal:"C2",kal:3,mg:10},skifte14:{ph:6.5,pal:"C1",kal:2,mg:9},
  skifte16:{ph:6.8,pal:"C2",kal:3,mg:11},skifte18:{ph:6.9,pal:"C2",kal:3,mg:10},
  skifte20:{ph:6.3,pal:"C1",kal:2,mg:8},
};

export const FIELDS = [
  {id:"skifte1",name:"Skifte 1",area:14.2,soil:"Siltig finsand"},
  {id:"skifte3",name:"Skifte 3",area:8.4,soil:"Siltig finsand"},
  {id:"skifte5",name:"Skifte 5",area:9.1,soil:"Siltig finsand"},
  {id:"skifte6",name:"Skifte 6",area:11.3,soil:"Siltig finsand"},
  {id:"skifte9",name:"Skifte 9",area:10.8,soil:"Siltig finsand"},
  {id:"skifte10",name:"Skifte 10",area:9.6,soil:"Siltig finsand"},
  {id:"skifte13",name:"Skifte 13",area:8.2,soil:"Siltig finsand"},
  {id:"skifte14",name:"Skifte 14",area:12.1,soil:"Siltig finsand"},
  {id:"skifte16",name:"Skifte 16",area:16.0,soil:"Lettleire"},
  {id:"skifte18",name:"Skifte 18",area:18.0,soil:"Lettleire"},
  {id:"skifte20",name:"Skifte 20",area:20.3,soil:"Siltig finsand"},
];

// ─── SPRØYTEMIDLER ────────────────────────────────────────────────────────────
export const PESTICIDES_DB = [
  // Ugrasmidler korn
  {name:"Atlantis OD",type:"Ugras",crop:["hvete","bygg","rug"],dose:"100-125 ml/daa",target:["Floghavre","Markrapp","Tunrapp","Spillkorn","Vassarve","Knereverumpe"],info:"Systemisk, tas opp gjennom blad og røtter. Brukes Z21–Z32."},
  {name:"Hussar OD",type:"Ugras",crop:["hvete","bygg"],dose:"50-75 ml/daa",target:["Floghavre","Markrapp","Balderbrå","Kløver","Meldestokk"],info:"Systemisk. Brukes Z12–Z32. Ikke til havre."},
  {name:"Broadway",type:"Ugras",crop:["hvete","bygg"],dose:"180 g/daa",target:["Floghavre","Grasugras","Balderbrå","Stemorsblomst","Knereverumpe"],info:"Kombinasjonsprodukt. God effekt på grasugras og tofrøblada."},
  {name:"Ariane S",type:"Ugras",crop:["hvete","bygg","havre"],dose:"200-300 ml/daa",target:["Balderbrå","Korsknapp","Pengeurt","Stemorsblomst","Åkervindel","Åkertistel","Åkerdylle"],info:"Hormonfri. Bredt spekter tofrøblada. Brukes Z13–Z39."},
  {name:"MCPA 750",type:"Ugras",crop:["hvete","bygg","havre","rug"],dose:"100-200 ml/daa",target:["Balderbrå","Åkertistel","Åkerdylle","Meldestokk","Linbendel"],info:"Hormonmiddel. Brukes Z13–Z30. Ikke i tørkestress."},
  {name:"Primus",type:"Ugras",crop:["hvete","bygg","havre"],dose:"15-20 ml/daa",target:["Balderbrå","Stemorsblomst","Tunbalderbrå","Åkervindel","Korsknapp","Pengeurt"],info:"Svært effektivt mot balderbrå. Brukes Z13–Z32."},
  {name:"Harmony Plus 50 T",type:"Ugras",crop:["hvete","bygg"],dose:"3-5 g/daa",target:["Balderbrå","Vassarve","Stemorsblomst","Linbendel"],info:"Lavdose sulfonylurea. Brukes Z12–Z31."},
  {name:"Oxitril",type:"Ugras",crop:["hvete","bygg","havre"],dose:"150-200 ml/daa",target:["Balderbrå","Pengeurt","Åkersennep","Korsknapp"],info:"Kontaktmiddel. Rask virkning."},
  {name:"Gratil 75 WG",type:"Ugras",crop:["hvete","bygg"],dose:"3-5 g/daa",target:["Balderbrå","Stemorsblomst","Åkervindel","Meldestokk"],info:"Systemisk sulfonylurea."},
  {name:"Express 50 T",type:"Ugras",crop:["hvete","bygg","rug"],dose:"1-2 g/daa",target:["Balderbrå","Åkervindel","Åkersennep"],info:"Lavdose sulfonylurea."},
  {name:"Starane XL",type:"Ugras",crop:["hvete","bygg","havre","rug"],dose:"75-100 ml/daa",target:["Åkertistel","Åkerdylle","Åkervindel","Balderbrå","Korsknapp"],info:"Fluroksypyr+florasulam. Bredt spekter. Brukes Z13–Z39."},
  {name:"Tomahawk 180 EC",type:"Ugras",crop:["hvete","bygg","havre"],dose:"100-150 ml/daa",target:["Floghavre","Markrapp","Spillkorn","Grasugras"],info:"Fenoksaprop. Mot grasugras. Brukes Z12–Z31."},
  {name:"Puma Extra",type:"Ugras",crop:["hvete","bygg"],dose:"75-100 ml/daa",target:["Floghavre","Markrapp","Spillkorn"],info:"Fenoxaprop-p-etyl. Mot grasugras. Brukes Z13–Z32."},
  {name:"Attribut",type:"Ugras",crop:["hvete","bygg","rug"],dose:"3-5 g/daa",target:["Floghavre","Markrapp","Balderbrå","Vassarve"],info:"Propoxykarbazon. Systemisk. Brukes Z21–Z32."},
  // Ugrasmidler åkerbønner/erter
  {name:"Select 240 EC",type:"Ugras",crop:["åkerbønner","erter","raps"],dose:"50-75 ml/daa",target:["Floghavre","Markrapp","Hønsehirse","Spillkorn","Grasugras"],info:"Mot grasugras i bredbladete vekster. Brukes Z10–Z15."},
  {name:"Basagran SG",type:"Ugras",crop:["åkerbønner","erter","soya"],dose:"150-200 g/daa",target:["Meldestokk","Balderbrå","Vassarve","Pengeurt","Svinmelde"],info:"Kontaktmiddel. Brukes tidlig etter spiring."},
  {name:"Fenix",type:"Ugras",crop:["åkerbønner","erter"],dose:"120-150 ml/daa",target:["Hønsehirse","Meldestokk","Vassarve","Tunbalderbrå"],info:"Jord- og bladmiddel. Brukes rett etter såing eller tidlig etter spiring."},
  {name:"Boxer",type:"Ugras",crop:["åkerbønner","potet"],dose:"200-250 ml/daa",target:["Hønsehirse","Tunrapp","Knereverumpe","Meldestokk"],info:"Jordmiddel. Brukes etter såing, før spiring."},
  {name:"Lentagran WP",type:"Ugras",crop:["åkerbønner","erter"],dose:"150-175 g/daa",target:["Balderbrå","Meldestokk","Åkersennep","Pengeurt"],info:"Kontaktmiddel. Brukes Z10–Z13."},
  {name:"Centium 36 CS",type:"Ugras",crop:["åkerbønner","potet","raps"],dose:"15-20 ml/daa",target:["Hønsehirse","Meldestokk","Balderbrå","Tunrapp"],info:"Jordmiddel. Brukes etter såing."},
  {name:"Galera",type:"Ugras",crop:["raps","erter"],dose:"15-20 ml/daa",target:["Balderbrå","Åkertistel","Åkerdylle","Meldestokk"],info:"Mot tofrøblada i raps og erter. Z12–Z35."},
  // Soppmidler
  {name:"Proline 250 EC",type:"Sopp",crop:["hvete","bygg","rug","havre"],dose:"40-60 ml/daa",target:["Hveteaksprikk","Hvetebladprikk / Septoria","Gulrust","Brunrust","Mjøldogg","Fusarium / Aks-fusarium","Stråknekker"],info:"Triazol. Forebyggende og kurativ. Brukes Z37–Z65."},
  {name:"Comet Pro",type:"Sopp",crop:["hvete","bygg","rug","åkerbønner"],dose:"75-100 ml/daa",target:["Hveteaksprikk","Brunrust","Mjøldogg","Nettflekk / Byggbrunflekk","Storknollet råtesopp","Sjokoladeflekk"],info:"Strobilurin. God forebyggende effekt."},
  {name:"Delaro 325 SC",type:"Sopp",crop:["hvete","bygg","raps","åkerbønner"],dose:"60-80 ml/daa",target:["Hveteaksprikk","Hvetebladprikk / Septoria","Gulrust","Brunrust","Mjøldogg","Nettflekk / Byggbrunflekk","Storknollet råtesopp","Sjokoladeflekk","Rust (åkerbønner)"],info:"Kombinasjon triazol+strobilurin. Bredt spekter."},
  {name:"Stereo 312.5 EC",type:"Sopp",crop:["hvete","bygg","havre"],dose:"75-100 ml/daa",target:["Mjøldogg","Brunrust","Nettflekk / Byggbrunflekk","Kronrust"],info:"Triazol+morfolin. God mot mjøldogg og rust."},
  {name:"Amistar Opti",type:"Sopp",crop:["hvete","bygg"],dose:"100 ml/daa",target:["Hveteaksprikk","Brunrust","Mjøldogg","Nettflekk / Byggbrunflekk"],info:"Strobilurin+klorothalonil."},
  {name:"Aviator Xpro EC 225",type:"Sopp",crop:["hvete","bygg","rug"],dose:"60-75 ml/daa",target:["Hveteaksprikk","Hvetebladprikk / Septoria","Gulrust","Brunrust","Mjøldogg","Fusarium / Aks-fusarium"],info:"SDHI+triazol. Inkluderer Fusarium-effekt."},
  {name:"Pronto Plus",type:"Sopp",crop:["hvete","bygg","havre"],dose:"75-100 ml/daa",target:["Mjøldogg","Brunrust","Nettflekk / Byggbrunflekk"],info:"Triazol+strobilurin."},
  {name:"Bumper 25 EC",type:"Sopp",crop:["hvete","bygg","havre","rug"],dose:"50-75 ml/daa",target:["Mjøldogg","Gulrust","Brunrust","Nettflekk / Byggbrunflekk","Kronrust"],info:"Triazol. Bred effekt på rustsopper."},
  {name:"Propulse SE 250",type:"Sopp",crop:["hvete","bygg","rug","havre"],dose:"50-80 ml/daa",target:["Hveteaksprikk","Hvetebladprikk / Septoria","Fusarium / Aks-fusarium","Brunrust","Nettflekk / Byggbrunflekk"],info:"SDHI+triazol. Sterk Fusarium-effekt."},
  {name:"Elatus Era",type:"Sopp",crop:["hvete","bygg"],dose:"60-80 ml/daa",target:["Hveteaksprikk","Hvetebladprikk / Septoria","Gulrust","Brunrust","Mjøldogg"],info:"SDHI+triazol. Bredt spekter, lang varighet."},
  {name:"Revystar XL",type:"Sopp",crop:["hvete","bygg","rug"],dose:"75-100 ml/daa",target:["Hveteaksprikk","Hvetebladprikk / Septoria","Gulrust","Brunrust","Fusarium / Aks-fusarium"],info:"SDHI+triazol. Ny generasjon."},
  {name:"Ascra Xpro",type:"Sopp",crop:["hvete","bygg","rug"],dose:"60-80 ml/daa",target:["Hveteaksprikk","Hvetebladprikk / Septoria","Gulrust","Brunrust","Mjøldogg"],info:"SDHI+triazol. Kombinasjon for hvete og bygg."},
  {name:"Cantus",type:"Sopp",crop:["raps","åkerbønner"],dose:"25-30 g/daa",target:["Storknollet råtesopp","Grå skimmel"],info:"SDHI. God mot sclerotinia. Påføres ved blomstring."},
  {name:"Switch",type:"Sopp",crop:["åkerbønner","erter"],dose:"50-75 g/daa",target:["Grå skimmel","Sjokoladeflekk","Storknollet råtesopp","Ertegråskimmel"],info:"Cyprodinil+fludioxonil. Bredspektret mot botrytis."},
  // Vekstregulering
  {name:"Moddus M",type:"Vekstregulering",crop:["hvete","bygg","havre","rug"],dose:"40-60 ml/daa",target:["Legde"],info:"Trineksapak-etyl. Forkorter strå. Brukes Z30–Z32."},
  {name:"Cerone 480",type:"Vekstregulering",crop:["hvete","bygg","havre"],dose:"30-50 ml/daa",target:["Legde"],info:"Etefon. Forkorter strå og styrker strånoden."},
  {name:"Terpal",type:"Vekstregulering",crop:["hvete","bygg","rug"],dose:"100-200 ml/daa",target:["Legde"],info:"Mepiquat+etefon. Kombinasjonsmiddel."},
  // Insektmidler
  {name:"Karate 5 CS",type:"Insekt",crop:["hvete","bygg","havre","åkerbønner"],dose:"15-30 ml/daa",target:["Bladlus","Trips","Kornsnutebille","Åkerbønnevikler"],info:"Pyretroid. Kontaktvirkende. Unngå i blomstring."},
  {name:"Pirimor G",type:"Insekt",crop:["hvete","bygg","åkerbønner","erter"],dose:"25-50 g/daa",target:["Bladlus","Erteblomsterlus","Åkerbønneblodlus"],info:"Systemisk mot bladlus. Skadesomhetsterskel: 50 lus/strå."},
  {name:"Fastac 50",type:"Insekt",crop:["hvete","bygg","havre","raps"],dose:"10-20 ml/daa",target:["Bladlus","Trips","Jordloppe"],info:"Alfa-cypermetrin. Pyretroid. Kontaktvirkende."},
  {name:"Mavrik 2F",type:"Insekt",crop:["hvete","bygg","havre","åkerbønner"],dose:"15-20 ml/daa",target:["Bladlus","Trips","Kornsnutebille"],info:"Tau-fluvalinat. Skåner nyttedyr bedre enn andre pyretroider."},
];

// ─── UGRAS ────────────────────────────────────────────────────────────────────
export const WEEDS_DB = [
  {id:"floghavre",name:"Floghavre",latin:"Avena fatua",type:"Grasugras",crops:["hvete","bygg","havre"],risk:"Høy",remedy:["Atlantis OD","Hussar OD","Broadway","Select 240 EC"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Avena_fatua.jpg/300px-Avena_fatua.jpg"},
  {id:"honsehirse",name:"Hønsehirse",latin:"Echinochloa crus-galli",type:"Grasugras",crops:["åkerbønner","mais","potet"],risk:"Høy (etter langvarig korn)",remedy:["Select 240 EC","Fenix","Boxer","Centium 36 CS"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Echinochloa_crus-galli_003.JPG/300px-Echinochloa_crus-galli_003.JPG"},
  {id:"markrapp",name:"Markrapp",latin:"Poa trivialis",type:"Grasugras",crops:["hvete","bygg"],risk:"Middels",remedy:["Atlantis OD","Hussar OD"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Poa_trivialis_kz.jpg/300px-Poa_trivialis_kz.jpg"},
  {id:"tunrapp",name:"Tunrapp",latin:"Poa annua",type:"Grasugras",crops:["hvete","bygg","åkerbønner"],risk:"Middels",remedy:["Atlantis OD","Fenix","Boxer"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Poa_annua_kz01.jpg/300px-Poa_annua_kz01.jpg"},
  {id:"balderbra",name:"Balderbrå",latin:"Matricaria inodora",type:"Tofrøblada",crops:["hvete","bygg","havre","åkerbønner"],risk:"Høy",remedy:["Primus","Ariane S","MCPA 750","Basagran SG","Lentagran WP"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Matricaria_recutita_2.jpg/300px-Matricaria_recutita_2.jpg"},
  {id:"meldestokk",name:"Meldestokk",latin:"Chenopodium album",type:"Tofrøblada",crops:["hvete","bygg","åkerbønner"],risk:"Høy",remedy:["MCPA 750","Basagran SG","Fenix","Centium 36 CS"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Chenopodium_album_kz01.jpg/300px-Chenopodium_album_kz01.jpg"},
  {id:"vassarve",name:"Vassarve",latin:"Stellaria media",type:"Tofrøblada",crops:["hvete","bygg","åkerbønner"],risk:"Middels",remedy:["Harmony Plus 50 T","Primus","Basagran SG"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Stellaria_media_kz1.jpg/300px-Stellaria_media_kz1.jpg"},
  {id:"akervindel",name:"Åkervindel",latin:"Convolvulus arvensis",type:"Tofrøblada",crops:["hvete","bygg"],risk:"Middels",remedy:["Ariane S","MCPA 750","Gratil 75 WG"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Convolvulus_arvensis_kz01.jpg/300px-Convolvulus_arvensis_kz01.jpg"},
  {id:"akertistel",name:"Åkertistel",latin:"Cirsium arvense",type:"Tofrøblada",crops:["hvete","bygg","havre"],risk:"Høy",remedy:["MCPA 750","Ariane S"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Cirsium_arvense_kz01.jpg/300px-Cirsium_arvense_kz01.jpg"},
  {id:"akerdylle",name:"Åkerdylle",latin:"Sonchus arvensis",type:"Tofrøblada",crops:["hvete","bygg"],risk:"Middels",remedy:["MCPA 750","Ariane S"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Sonchus_arvensis_kz01.jpg/300px-Sonchus_arvensis_kz01.jpg"},
  {id:"stemorsblomst",name:"Stemorsblomst",latin:"Viola arvensis",type:"Tofrøblada",crops:["hvete","bygg"],risk:"Lav",remedy:["Primus","Express 50 T","Harmony Plus 50 T"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Viola_arvensis_kz1.jpg/300px-Viola_arvensis_kz1.jpg"},
  {id:"pengeurt",name:"Pengeurt",latin:"Thlaspi arvense",type:"Tofrøblada",crops:["hvete","bygg","åkerbønner"],risk:"Lav",remedy:["Ariane S","Oxitril","Lentagran WP"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Thlaspi_arvense_kz01.jpg/300px-Thlaspi_arvense_kz01.jpg"},
  {id:"knereverumpe",name:"Knereverumpe",latin:"Alopecurus geniculatus",type:"Grasugras",crops:["hvete","bygg"],risk:"Middels",remedy:["Atlantis OD","Broadway"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Alopecurus_geniculatus_kz01.jpg/300px-Alopecurus_geniculatus_kz01.jpg"},
  {id:"linbendel",name:"Linbendel",latin:"Spergula arvensis",type:"Tofrøblada",crops:["havre","hvete"],risk:"Lav",remedy:["Harmony Plus 50 T","Express 50 T"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Spergula_arvensis_kz01.jpg/300px-Spergula_arvensis_kz01.jpg"},
  {id:"spillkorn",name:"Spillkorn",latin:"Cerealia spp.",type:"Grasugras",crops:["hvete","bygg","åkerbønner"],risk:"Middels",remedy:["Select 240 EC","Atlantis OD","Hussar OD"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Avena_fatua.jpg/300px-Avena_fatua.jpg"},
];

// ─── SOPP/SJUKDOM ─────────────────────────────────────────────────────────────
export const DISEASES_DB = [
  {id:"hveteaksprikk",name:"Hveteaksprikk",latin:"Parastagonospora nodorum",crops:["hvete"],risk:"Høy",symptoms:"Brune flekker med gul sone, starter på nedre blad, spres oppover. Angriper aks sent.",season:"Z31–Z75",remedy:["Proline 250 EC","Delaro 325 SC","Aviator Xpro EC 225","Comet Pro"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Septoria_nodorum_on_wheat.jpg/300px-Septoria_nodorum_on_wheat.jpg"},
  {id:"hvetebladprikk",name:"Hvetebladprikk / Septoria",latin:"Zymoseptoria tritici",crops:["hvete"],risk:"Høy",symptoms:"Gulbrune rektangulære flekker med svarte prikker (pyknider). Sterkest på nedre blad tidlig.",season:"Z21–Z65",remedy:["Proline 250 EC","Delaro 325 SC","Aviator Xpro EC 225"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Septoria_tritici_on_wheat_1.jpg/300px-Septoria_tritici_on_wheat_1.jpg"},
  {id:"gulrust",name:"Gulrust",latin:"Puccinia striiformis",crops:["hvete","bygg"],risk:"Høy",symptoms:"Gule striper av pustler langs bladnerven. Epidemisk ved kjølig fuktig vær om våren.",season:"Z30–Z60",remedy:["Proline 250 EC","Delaro 325 SC","Bumper 25 EC"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Puccinia_striiformis_-_Gelbrost.jpg/300px-Puccinia_striiformis_-_Gelbrost.jpg"},
  {id:"brunrust",name:"Brunrust",latin:"Puccinia triticina",crops:["hvete"],risk:"Middels",symptoms:"Oransjegule runde pustler spredt utover bladflaten. Vanlig, men kommer sent.",season:"Z37–Z75",remedy:["Proline 250 EC","Comet Pro","Bumper 25 EC","Stereo 312.5 EC"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Leaf_rust_Puccinia_triticina_1.jpg/300px-Leaf_rust_Puccinia_triticina_1.jpg"},
  {id:"mjoldogg",name:"Mjøldogg",latin:"Blumeria graminis",crops:["hvete","bygg","havre"],risk:"Middels",symptoms:"Hvite melaktige flekker og belegg på blad og strå. Særlig ved tett bestand og varmt vær.",season:"Z12–Z65",remedy:["Stereo 312.5 EC","Pronto Plus","Bumper 25 EC"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Powdery_mildew_on_wheat.jpg/300px-Powdery_mildew_on_wheat.jpg"},
  {id:"fusarium",name:"Fusarium / Aks-fusarium",latin:"Fusarium spp.",crops:["hvete","bygg","havre"],risk:"Høy",symptoms:"Rosa/rødlig misfarging av aks. Skrumpent korn. Risiko for DON-mykotoksiner.",season:"Z61–Z75",remedy:["Aviator Xpro EC 225","Proline 250 EC","Delaro 325 SC"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Fusarium_head_blight_on_wheat.jpg/300px-Fusarium_head_blight_on_wheat.jpg"},
  {id:"stråknekker",name:"Stråknekker",latin:"Pseudocercosporella herpotrichoides",crops:["hvete","bygg"],risk:"Middels",symptoms:"Bleike flekker ved stråbasis. Kan gi legde mot modning.",season:"Z25–Z45",remedy:["Proline 250 EC"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Septoria_tritici_on_wheat_1.jpg/300px-Septoria_tritici_on_wheat_1.jpg"},
  {id:"rotdreper",name:"Rotdreper",latin:"Gaeumannomyces graminis",crops:["hvete","bygg"],risk:"Middels (ensidig dyrking)",symptoms:"Svarte røtter, hvitaks. Flekker med gulmodnet korn i åkeren.",season:"Hele sesongen",remedy:["Vekstskifte (ingen kjemisk løsning)"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Fusarium_head_blight_on_wheat.jpg/300px-Fusarium_head_blight_on_wheat.jpg"},
  {id:"skjeggsopp",name:"Nettflekk / Byggbrunflekk",latin:"Pyrenophora teres",crops:["bygg"],risk:"Høy",symptoms:"Brune nettformede flekker med gul kantsone. Kan gi tidlig bladtørke og betydelig avlingstap.",season:"Z21–Z55",remedy:["Stereo 312.5 EC","Proline 250 EC","Bumper 25 EC","Delaro 325 SC"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Net_blotch_2007.jpg/300px-Net_blotch_2007.jpg"},
  {id:"stripesyke",name:"Stripesjuke",latin:"Pyrenophora graminea",crops:["bygg"],risk:"Middels",symptoms:"Gule/lyse striper langs bladnervene fra tidlig stadium. Frøbåren.",season:"Z11–Z39",remedy:["Beis såkorn — ingen bladbehandling"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Net_blotch_2007.jpg/300px-Net_blotch_2007.jpg"},
  {id:"byggruststengel",name:"Svartrust / Stengelrust",latin:"Puccinia graminis",crops:["bygg","hvete"],risk:"Lav (sjelden i Norge)",symptoms:"Svarte avlange pustler på strå og bladslirer.",season:"Z45–Z70",remedy:["Bumper 25 EC","Proline 250 EC"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Puccinia_striiformis_-_Gelbrost.jpg/300px-Puccinia_striiformis_-_Gelbrost.jpg"},
  {id:"havrekrone",name:"Kronrust",latin:"Puccinia coronata",crops:["havre"],risk:"Høy",symptoms:"Oransje-gule pustler på bladoverside med mørke pustler på undersiden. Vanlig i havre.",season:"Z37–Z65",remedy:["Bumper 25 EC","Proline 250 EC","Stereo 312.5 EC"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Leaf_rust_Puccinia_triticina_1.jpg/300px-Leaf_rust_Puccinia_triticina_1.jpg"},
  {id:"havresmitt",name:"Meldug havre",latin:"Blumeria graminis f. sp. avenae",crops:["havre"],risk:"Lav",symptoms:"Hvitt melaktig belegg på blad. Sjeldnere enn i hvete/bygg.",season:"Z12–Z55",remedy:["Stereo 312.5 EC","Bumper 25 EC"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Powdery_mildew_on_wheat.jpg/300px-Powdery_mildew_on_wheat.jpg"},
  {id:"storknollet_råtesopp",name:"Storknollet råtesopp",latin:"Sclerotinia sclerotiorum",crops:["åkerbønner","erter"],risk:"Høy",symptoms:"Vannaktig råte på stengler. Hvitt mycel og svarte sklerotier. Fuktig vær.",season:"blomstring",remedy:["Comet Pro","Delaro 325 SC"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Sclerotinia_stem_rot_canola.jpg/300px-Sclerotinia_stem_rot_canola.jpg"},
  {id:"gra_skimmel",name:"Grå skimmel",latin:"Botrytis cinerea",crops:["åkerbønner","erter"],risk:"Middels",symptoms:"Gråbrun råte med gråt soppdekke. Tett bestand og fuktig vær.",season:"Z65–Z85",remedy:["Comet Pro","Delaro 325 SC"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Botrytis_cinerea_on_Pinot_gris.jpg/300px-Botrytis_cinerea_on_Pinot_gris.jpg"},
  {id:"sjokoladflekk",name:"Sjokoladeflekk",latin:"Botrytis fabae",crops:["åkerbønner"],risk:"Høy",symptoms:"Rødbrune flekker på blad og stengler. Fuktig vær etter blomstring.",season:"Z30–Z75",remedy:["Comet Pro","Delaro 325 SC","Proline 250 EC"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Botrytis_cinerea_on_Pinot_gris.jpg/300px-Botrytis_cinerea_on_Pinot_gris.jpg"},
  {id:"rust_bonner",name:"Rust (åkerbønner)",latin:"Uromyces viciae-fabae",crops:["åkerbønner"],risk:"Middels",symptoms:"Rødbrune pustler på under- og overside av blad. Sent i sesongen.",season:"Z51–Z75",remedy:["Delaro 325 SC","Bumper 25 EC"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Leaf_rust_Puccinia_triticina_1.jpg/300px-Leaf_rust_Puccinia_triticina_1.jpg"},
  {id:"bonnemosaikk",name:"Bønnemosaikk (virus)",latin:"Bean yellow mosaic virus",crops:["åkerbønner","erter"],risk:"Lav",symptoms:"Mosaikkmønster og misfarging av blad. Spres med bladlus.",season:"Z15–Z55",remedy:["Kontroller bladlus (Pirimor G) — ingen direktebehandling"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Sclerotinia_stem_rot_canola.jpg/300px-Sclerotinia_stem_rot_canola.jpg"},
  {id:"erterotråte",name:"Rotråte / Pythium",latin:"Pythium spp.",crops:["erter"],risk:"Middels",symptoms:"Brunfarging av rothalsen. Dårlig oppspiring og planteavgang.",season:"Spiring–Z15",remedy:["Vekstskifte og drenering — ingen godkjent kjemisk middel"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Sclerotinia_stem_rot_canola.jpg/300px-Sclerotinia_stem_rot_canola.jpg"},
  {id:"ertegråskimmel",name:"Ertegråskimmel",latin:"Botrytis cinerea",crops:["erter"],risk:"Middels",symptoms:"Gråbrun råte på stengler og belger. Fuktig vær.",season:"blomstring",remedy:["Comet Pro","Delaro 325 SC"],img:"https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Botrytis_cinerea_on_Pinot_gris.jpg/300px-Botrytis_cinerea_on_Pinot_gris.jpg"},
];

// ─── NIBIO-LENKER ─────────────────────────────────────────────────────────────
export const WEED_NIBIO = {
  floghavre:{url:"https://www.plantevernleksikonet.no/l/oppslag/274/"},
  honsehirse:{url:"https://www.plantevernleksikonet.no/l/oppslag/208/"},
  markrapp:{url:"https://www.plantevernleksikonet.no/l/oppslag/236/"},
  tunrapp:{url:"https://www.plantevernleksikonet.no/l/oppslag/386/"},
  balderbra:{url:"https://www.plantevernleksikonet.no/l/oppslag/293/"},
  meldestokk:{url:"https://www.plantevernleksikonet.no/l/oppslag/273/"},
  vassarve:{url:"https://www.plantevernleksikonet.no/l/oppslag/271/"},
  akervindel:{url:"https://www.plantevernleksikonet.no/l/oppslag/287/"},
  akertistel:{url:"https://www.plantevernleksikonet.no/l/oppslag/253/"},
  akerdylle:{url:"https://www.plantevernleksikonet.no/l/oppslag/228/"},
  stemorsblomst:{url:"https://www.plantevernleksikonet.no/l/oppslag/362/"},
  pengeurt:{url:"https://www.plantevernleksikonet.no/l/oppslag/221/"},
  knereverumpe:{url:"https://www.plantevernleksikonet.no/l/oppslag/210/"},
  linbendel:{url:"https://www.plantevernleksikonet.no/l/oppslag/1332/"},
  spillkorn:{url:"https://www.plantevernleksikonet.no/l/oppslag/274/"},
};

export const DISEASE_NIBIO = {
  hveteaksprikk:{url:"https://www.plantevernleksikonet.no/l/oppslag/617/"},
  hvetebladprikk:{url:"https://www.plantevernleksikonet.no/l/oppslag/618/"},
  gulrust:{url:"https://www.plantevernleksikonet.no/l/oppslag/1235/"},
  brunrust:{url:"https://www.plantevernleksikonet.no/l/oppslag/1237/"},
  mjoldogg:{url:"https://www.plantevernleksikonet.no/l/oppslag/529/"},
  fusarium:{url:"https://www.plantevernleksikonet.no/l/oppslag/1239/"},
  stråknekker:{url:"https://www.plantevernleksikonet.no/l/oppslag/469/"},
  rotdreper:{url:"https://www.plantevernleksikonet.no/l/oppslag/1261/"},
  skjeggsopp:{url:"https://www.plantevernleksikonet.no/l/oppslag/319/"},
  stripesyke:{url:"https://www.plantevernleksikonet.no/l/oppslag/526/"},
  byggruststengel:{url:"https://www.plantevernleksikonet.no/l/oppslag/1381/"},
  havrekrone:{url:"https://www.plantevernleksikonet.no/l/oppslag/1381/"},
  havresmitt:{url:"https://www.plantevernleksikonet.no/l/oppslag/529/"},
  storknollet_råtesopp:{url:"https://www.plantevernleksikonet.no/l/oppslag/473/"},
  gra_skimmel:{url:"https://www.plantevernleksikonet.no/l/oppslag/466/"},
  sjokoladflekk:{url:"https://www.plantevernleksikonet.no/l/oppslag/2036/"},
  rust_bonner:{url:"https://www.plantevernleksikonet.no/l/oppslag/1381/"},
  bonnemosaikk:{url:"https://www.plantevernleksikonet.no/l/oppslag/1381/"},
  erterotråte:{url:"https://www.plantevernleksikonet.no/l/oppslag/473/"},
  ertegråskimmel:{url:"https://www.plantevernleksikonet.no/l/oppslag/466/"},
};

// ─── SÅKORN ───────────────────────────────────────────────────────────────────
export const SEED_DB = {
  "Betong vårhvete":{tkv:43,spirepct:97,anbDaa:350,unit:"frø/m²",kgPerDaa:null},
  "Stella åkerbønner":{tkv:490,spirepct:96,anbDaa:35,unit:"frø/m²",kgPerDaa:null},
  "Bjarne bygg":{tkv:42,spirepct:97,anbDaa:400,unit:"frø/m²",kgPerDaa:null},
  "Brage bygg":{tkv:40,spirepct:97,anbDaa:400,unit:"frø/m²",kgPerDaa:null},
  "Odal havre":{tkv:38,spirepct:97,anbDaa:400,unit:"frø/m²",kgPerDaa:null},
  "Belinda havre":{tkv:36,spirepct:97,anbDaa:400,unit:"frø/m²",kgPerDaa:null},
  "Annet":{tkv:null,spirepct:null,anbDaa:null,unit:"frø/m²",kgPerDaa:null},
};

// ─── GJØDSEL ─────────────────────────────────────────────────────────────────
export const FERTILIZER_DB = {
  "Yara Fullgjødsel 22-3-10":{N:22,P:3,K:10,S:3.5,pris_ca:6.5},
  "Opti-NS 27-0-0":{N:27,P:0,K:0,S:4,pris_ca:5.8},
  "Opti-KAS 27-0-0":{N:27,P:0,K:0,S:0,pris_ca:5.5},
  "Kalksalpeter 15.5-0-0":{N:15.5,P:0,K:0,S:0,pris_ca:5.2},
  "Fullgjødsel 18-3-15":{N:18,P:3,K:15,S:2.5,pris_ca:6.2},
  "Fullgjødsel 20-4-11":{N:20,P:4,K:11,S:3,pris_ca:6.4},
  "NK 22-0-12":{N:22,P:0,K:12,S:3,pris_ca:6.0},
  "Kieseritt 27":{N:0,P:0,K:0,S:22,Mg:17,pris_ca:3.5},
};

// ─── BYGNINGER ────────────────────────────────────────────────────────────────
export const BUILDINGS = [
  {id:"laan",name:"Låve",icon:"🏚️",desc:"Hovedlåve med kornlager og maskinrom"},
  {id:"garasje",name:"Garasje",icon:"🏠",desc:"Traktorgarasje og redskapslagring"},
  {id:"driftsbygg",name:"Driftsbygning",icon:"🏗️",desc:"Generell driftsbygning"},
  {id:"bolighus",name:"Bolighus",icon:"🏡",desc:"Boligbygg Brødenveien 181"},
  {id:"uteareal",name:"Uteareal",icon:"🌿",desc:"Rør, kabler, vei og utvendige installasjoner"},
];

// ─── MASKINER ─────────────────────────────────────────────────────────────────
export const INIT_MACHINES = [
  {id:"valtra",name:"Valtra N122D",year:2012,type:"Traktor",icon:"🚜",color:"#78c8f0",info:"Primærtraktor. 122 hk, 4WD, 2012-modell.",
   service:[{id:"s1",interval:"Hvert 500. driftstimer",task:"Motorolje og filter",spec:"Valtra 10W-40",last:null},{id:"s2",interval:"Hvert 1000. time",task:"Hydraulikkolje",spec:"Valtra hydraulikkolje",last:null},{id:"s3",interval:"Hvert 1000. time",task:"Girakseolje",spec:"Per spesifikasjon",last:null},{id:"s4",interval:"Annethvert år",task:"Kjølevæske",spec:"Byttes helt",last:null},{id:"s5",interval:"Hvert 250. time",task:"Luftfilter",spec:"Inspiser, skift ved behov",last:null},{id:"s6",interval:"Hvert 500. time",task:"Bremser",spec:"Sjekk slitasje",last:null}],
   tips:[{id:"t1",text:"Start alltid kald motor på tomgang 2-3 min vinterstid",files:[]},{id:"t2",text:"Kontroller oljenivå ved kaldt motor hver morgen i sesongen",files:[]},{id:"t3",text:"Sjekk dektrykk: front 1,6 bar (Continental 480/65R28), bak 1,4 bar (BKT 600/65R38)",files:[]},{id:"t4",text:"Rengjør luftfilter i støvete forhold etter hver arbeidsdag",files:[]},{id:"t5",text:"Bruk alltid Valtra-godkjent hydraulikkolje for å unngå garantiproblemer",files:[]}]},
  {id:"claas",name:"Claas Celtis 446",year:2007,type:"Traktor",icon:"🚜",color:"#f0c878",info:"Sekundærtraktor. 86 hk, 4WD, 2007-modell.",
   service:[{id:"s1",interval:"Hvert 500. time",task:"Motorolje og filter",spec:"Se oljespesifikasjon",last:null},{id:"s2",interval:"Hvert 250. time",task:"Luftfilter",spec:"Inspiser/skift",last:null},{id:"s3",interval:"Annethvert år",task:"Kjølevæske",spec:"Byttes helt",last:null},{id:"s4",interval:"Hvert 1000. time",task:"Girakseolje",spec:"Per spesifikasjon",last:null}],
   tips:[{id:"t1",text:"Eldre maskin — sjekk hydraulikkslanger jevnlig for sprekker",files:[]},{id:"t2",text:"Kontroller alle lys og varslingsutstyr månedlig",files:[]},{id:"t3",text:"2007-modell — vær oppmerksom på alder på gummideler",files:[]}]},
  {id:"komatsu",name:"Komatsu PC78",year:2007,type:"Gravemaskin",icon:"🏗️",color:"#f09878",info:"Hjulgående minigraver. 7,8 tonn, 2007-modell.",
   service:[{id:"s1",interval:"Hvert 250. time",task:"Motorolje",spec:"Per spesifikasjon",last:null},{id:"s2",interval:"Hvert 1000. time",task:"Hydraulikkolje",spec:"Per spesifikasjon",last:null},{id:"s3",interval:"Hvert 50. time",task:"Grease bom/arm",spec:"Alle smøreniplinger",last:null}],
   tips:[{id:"t1",text:"Grease alle smøreniplinger før hver arbeidsdag",files:[]},{id:"t2",text:"Sjekk hydraulikkvæskenivå daglig",files:[]},{id:"t3",text:"Parker alltid med bom i lav stilling",files:[]}]},
  {id:"plog",name:"Kvernland Mod E",year:null,type:"Redskap",icon:"⚙️",color:"#a8d878",info:"3-skjærs vendeplog, 4m. Hydraulisk vendemekanisme.",
   service:[{id:"s1",interval:"Hvert år før sesong",task:"Smør alle ledd og fjærer",spec:"Universalfett",last:null},{id:"s2",interval:"Ved behov",task:"Skift plogskjær",spec:"Kontroller slitasje",last:null}],
   tips:[{id:"t1",text:"Plogdybde Brødenveien: 20-22 cm (siltig finsand)",files:[]},{id:"t2",text:"Vend alltid plog i gang-enden, ikke under kjøring",files:[]}]},
  {id:"rapid",name:"Väderstad Rapid 3,5m",year:null,type:"Redskap",icon:"⚙️",color:"#a8d878",info:"Kombinert direktesåmaskin, 3,5m.",
   service:[{id:"s1",interval:"Etter hver sesong",task:"Rengjøring",spec:"Grundig innvendig og utvendig",last:null},{id:"s2",interval:"Hvert år",task:"Kontroller såtinder",spec:"Slitasje, skift ved behov",last:null}],
   tips:[{id:"t1",text:"Hvete Betong 2026: 23 kg/daa ved 350 spiredyktige frø/m²",files:[]},{id:"t2",text:"Gjødsel Yara 22-3-10: 52 kg/daa i gjødselhopper",files:[]},{id:"t3",text:"Kaliber alltid på ny ved frøbytte — ulike frø har ulik tusenkornvekt",files:[]}]},
];

// ─── BLANDINGSKOMPATIBILITET ──────────────────────────────────────────────────
// O = kan blandes, X = skal ikke blandes, ? = sjekk etiketten
export const COMPAT = {
  "Atlantis OD":       {"Hussar OD":"X","Broadway":"X","Ariane S":"O","MCPA 750":"O","Primus":"O","Moddus M":"O","Proline 250 EC":"O","Comet Pro":"O","Delaro 325 SC":"O","Stereo 312.5 EC":"O","Aviator Xpro EC 225":"O"},
  "Hussar OD":         {"Atlantis OD":"X","Broadway":"X","MCPA 750":"O","Primus":"O","Moddus M":"O","Proline 250 EC":"O","Comet Pro":"O","Delaro 325 SC":"O"},
  "Broadway":          {"Atlantis OD":"X","Hussar OD":"X","MCPA 750":"X","Ariane S":"?","Moddus M":"O","Proline 250 EC":"O"},
  "Ariane S":          {"Atlantis OD":"O","Broadway":"?","MCPA 750":"?","Primus":"?","Moddus M":"O","Proline 250 EC":"O","Comet Pro":"O"},
  "MCPA 750":          {"Atlantis OD":"O","Broadway":"X","Ariane S":"?","Primus":"?","Moddus M":"O","Proline 250 EC":"O"},
  "Primus":            {"Atlantis OD":"O","MCPA 750":"?","Ariane S":"?","Moddus M":"O","Proline 250 EC":"O","Comet Pro":"O","Delaro 325 SC":"O"},
  "Select 240 EC":     {"Basagran SG":"X","Fenix":"O","Proline 250 EC":"?"},
  "Basagran SG":       {"Select 240 EC":"X","Fenix":"X","Boxer":"X","Lentagran WP":"O","Centium 36 CS":"O"},
  "Fenix":             {"Basagran SG":"X","Select 240 EC":"O","Boxer":"?","Centium 36 CS":"?"},
  "Boxer":             {"Basagran SG":"X","Fenix":"?","Centium 36 CS":"?"},
  "Proline 250 EC":    {"Comet Pro":"O","Delaro 325 SC":"?","Stereo 312.5 EC":"?","Aviator Xpro EC 225":"?","Moddus M":"O","Karate 5 CS":"O","Pirimor G":"O"},
  "Comet Pro":         {"Proline 250 EC":"O","Delaro 325 SC":"?","Stereo 312.5 EC":"?","Moddus M":"O","Karate 5 CS":"O"},
  "Delaro 325 SC":     {"Proline 250 EC":"?","Comet Pro":"?","Moddus M":"O","Karate 5 CS":"O"},
  "Aviator Xpro EC 225":{"Proline 250 EC":"?","Moddus M":"O","Karate 5 CS":"O"},
  "Moddus M":          {"Atlantis OD":"O","Hussar OD":"O","MCPA 750":"O","Primus":"O","Proline 250 EC":"O","Comet Pro":"O","Delaro 325 SC":"O","Karate 5 CS":"O","Pirimor G":"O","Cerone 480":"X"},
  "Cerone 480":        {"Moddus M":"X"},
  "Karate 5 CS":       {"Proline 250 EC":"O","Comet Pro":"O","Delaro 325 SC":"O","Moddus M":"O","Pirimor G":"?"},
  "Pirimor G":         {"Proline 250 EC":"O","Moddus M":"O","Karate 5 CS":"?"},
};

// ─── FASTE VERDIER ────────────────────────────────────────────────────────────
export const today = new Date().toISOString().slice(0,10);
