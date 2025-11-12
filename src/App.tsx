import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import CrudDashboard from "./crud-dashboard/CrudDashboard.tsx";
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <CrudDashboard />
    </>
  );
}

export default App;
