import { useState, useEffect } from "react";
import Login      from "./src/components/Login";
import Dashboard  from "./src/components/Dashboard";
import Timer      from "./src/components/Timer";
import Maskiner   from "./src/components/Maskiner";
import Jordbruk   from "./src/components/Jordbruk";
import Skog       from "./src/components/Skog";
import Bygninger  from "./src/components/Bygninger";
import VærSesong  from "./src/components/VaerSesong";
import { MW, ME } from "./src/data/constants";
import { useLocalStorage } from "./src/lib/useLocalStorage";

export default function App() {
  // ── Alle tilstander persisteres til localStorage ───────────────────────
  const [workers, setWorkers]       = useLocalStorage("torp_v3_workers", MW);
  const [entries, setEntries]       = useLocalStorage("torp_v3_entries", ME);
  const [jordbrukRecs, setJordbrukRecs] = useLocalStorage("torp_v3_jordbruk", []);
  const [skogRecs, setSkogRecs]     = useLocalStorage("torp_v3_skog_recs", []);
  const [skogLager, setSkogLager]   = useLocalStorage("torp_v3_skog_lager", null);
  const [skogPriser, setSkogPriser] = useLocalStorage("torp_v3_skog_priser", null);
  const [skogVedLog, setSkogVedLog] = useLocalStorage("torp_v3_skog_vedlog", []);
  const [bygningerLogs, setBygningerLogs] = useLocalStorage("torp_v3_bygninger", null);
  const [maskinerData, setMaskinerData]   = useLocalStorage("torp_v3_maskiner", null);
  const [gjødselplan, setGjødselplan]     = useLocalStorage("torp_v3_gjodselplan", null);
  const [sprøyteplan, setSprøyteplan]     = useLocalStorage("torp_v3_sproyteplan", null);

  // ── Innlogget bruker — PIN huskes permanent per enhet ────────────────────
  const [user, setUser] = useState(() => {
    try {
      const s = localStorage.getItem("torp_v3_user");
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [page, setPage] = useState("dash");

  useEffect(() => {
    try {
      if (user) localStorage.setItem("torp_v3_user", JSON.stringify(user));
      else localStorage.removeItem("torp_v3_user");
    } catch {}
  }, [user]);

  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&display=swap";
    l.rel  = "stylesheet";
    document.head.appendChild(l);
  }, []);

  if (!user) return <Login workers={workers} onLogin={setUser}/>;

  const logout = () => { setUser(null); setPage("dash"); };
  const back   = () => setPage("dash");

  if (page === "dash")      return <Dashboard  user={user} nav={setPage} logout={logout}/>;
  if (page === "timer")     return <Timer      user={user} workers={workers} setWorkers={setWorkers} entries={entries} setEntries={setEntries} back={back} logout={logout}/>;
  if (page === "maskiner")  return <Maskiner   user={user} back={back} logout={logout} initData={maskinerData} onDataChange={setMaskinerData}/>;
  if (page === "jordbruk")  return <Jordbruk   user={user} back={back} logout={logout} initRecs={jordbrukRecs} onRecsChange={setJordbrukRecs} initGjødselplan={gjødselplan} onGjødselplanChange={setGjødselplan} initSprøyteplan={sprøyteplan} onSprøyteplanChange={setSprøyteplan}/>;
  if (page === "skog")      return <Skog       user={user} back={back} logout={logout} initRecs={skogRecs} onRecsChange={setSkogRecs} initLager={skogLager} onLagerChange={setSkogLager} initPriser={skogPriser} onPriserChange={setSkogPriser} initVedLog={skogVedLog} onVedLogChange={setSkogVedLog}/>;
  if (page === "bygninger") return <Bygninger  user={user} back={back} logout={logout} initLogs={bygningerLogs} onLogsChange={setBygningerLogs}/>;
  if (page === "vaer")      return <VærSesong  user={user} back={back} logout={logout} jordbrukRecs={jordbrukRecs}/>;

  return null;
}
