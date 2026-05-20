import { Avatar } from "./Shared";
import { S } from "../lib/utils";

export default function Dashboard({ user, nav, logout }) {
  const menu = [
    { id:"timer",     label:"Timeregistrering",    icon:"⏱️",  color:"#a8d878", desc:"Registrer arbeidstimer og lønn" },
    { id:"maskiner",  label:"Maskiner & utstyr",    icon:"🚜",  color:"#78c8f0", desc:"Servicelogg, tips og vedlikehold" },
    { id:"jordbruk",  label:"Jordbruk",             icon:"🌱",  color:"#f0c878", desc:"Skifter, sålogg og gjødsling" },
    { id:"skog",      label:"Skog",                 icon:"🌲",  color:"#a8d878", desc:"Hogst, planting og vedproduksjon" },
    { id:"bygninger", label:"Bygninger",             icon:"🏚️", color:"#f09878", desc:"Vedlikeholdslogg for bygg" },
    { id:"vaer",      label:"Vær & Vekstsesong",    icon:"🌤️", color:"#78c8f0", desc:"Prognoser, vekststatus og ukentlige rapporter" },
  ];

  return (
    <div style={S.wrap}>
      <div style={{ background:"linear-gradient(135deg,#1a2e16,#0a1208)", padding:"28px 16px 24px", textAlign:"center", borderBottom:"1px solid #2d4a26" }}>
        <div style={{ fontFamily:"'Dancing Script',cursive", fontSize:46, color:"#a8d878", lineHeight:1 }}>Torp Gårdsrift</div>
        <div style={{ fontSize:11, color:"#5a7a4a", letterSpacing:3, textTransform:"uppercase", marginTop:5 }}>Brødenveien 181 · Halden</div>
        <div style={{ marginTop:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <Avatar w={user} size={24}/>
          <span style={{ fontSize:13, color:"#7a9e6a" }}>Innlogget som {user.name}</span>
          <button onClick={logout} style={{ background:"none", border:"none", color:"#3a5a30", cursor:"pointer", fontSize:11 }}>Logg ut</button>
        </div>
      </div>

      <div style={{ maxWidth:820, margin:"0 auto", padding:"20px 16px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
          {menu.map(item => (
            <button key={item.id} onClick={() => nav(item.id)}
              style={{ background:"#152012", border:"1px solid #2d4a26", borderRadius:12, padding:"20px 16px", cursor:"pointer", textAlign:"left", transition:"all 0.15s", display:"flex", flexDirection:"column", gap:6 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.background = "#1a2e16"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#2d4a26"; e.currentTarget.style.background = "#152012"; }}>
              <div style={{ fontSize:28 }}>{item.icon}</div>
              <div style={{ fontSize:14, color:item.color, fontWeight:"bold" }}>{item.label}</div>
              <div style={{ fontSize:11, color:"#5a7a4a", lineHeight:1.4 }}>{item.desc}</div>
            </button>
          ))}
        </div>

        <div style={{ background:"#0f1a0d", border:"1px solid #1a2e16", borderRadius:8, padding:"12px 14px" }}>
          <div style={{ fontSize:10, color:"#3a5a30", letterSpacing:2, textTransform:"uppercase", marginBottom:8 }}>Sesong 2026</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {[
              { l:"Åkerbønner", v:"92 daa",  s:"Stella · Skifte 1–14" },
              { l:"Hvete Betong", v:"46 daa", s:"Betong · Skifte 16–20" },
              { l:"Totalt",     v:"138 daa", s:"+ 250 daa skog" },
            ].map(x => (
              <div key={x.l} style={{ textAlign:"center" }}>
                <div style={{ fontSize:9, color:"#4a6a38", letterSpacing:2, textTransform:"uppercase", marginBottom:3 }}>{x.l}</div>
                <div style={{ fontSize:15, color:"#a8d878", fontWeight:"bold" }}>{x.v}</div>
                <div style={{ fontSize:9, color:"#3a5a30", marginTop:2 }}>{x.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
