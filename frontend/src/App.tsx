import { BrowserRouter, Route, Routes } from "react-router-dom";
import Game from "./pages/Game.tsx";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/game/:id" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;