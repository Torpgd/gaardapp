import { useState, useEffect } from "react";
import Login      from "./src/components/Login";
import Dashboard  from "./src/components/Dashboard";
import Timer      from "./src/components/Timer";
import Maskiner   from "./src/components/Maskiner";
import Jordbruk   from "./src/components/Jordbruk";
import Skog       from "./src/components/Skog";
import Bygninger  from "./src/components/Bygninger";
import VærSesong  from "./src/components/VærSesong";
import { MW, ME } from "./src/data/constants";

export default function App() {
  const [workers, setWorkers]       = useState(MW);
  const [entries, setEntries]       = useState(ME);
  const [jordbrukRecs, setJordbrukRecs] = useState([]);
  const [user, setUser]             = useState(null);
  const [page, setPage]             = useState("dash");

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
  if (page === "maskiner")  return <Maskiner   user={user} back={back} logout={logout}/>;
  if (page === "jordbruk")  return <Jordbruk   user={user} back={back} logout={logout} onRecsChange={setJordbrukRecs}/>;
  if (page === "skog")      return <Skog       user={user} back={back} logout={logout}/>;
  if (page === "bygninger") return <Bygninger  user={user} back={back} logout={logout}/>;
  if (page === "vaer")      return <VærSesong  user={user} back={back} logout={logout} jordbrukRecs={jordbrukRecs}/>;

  return null;
}
