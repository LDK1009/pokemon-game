import {BrowserRouter, Route, Router, Routes } from "react-router-dom";
import ImageRevealGame from "./ImageRevealGame";
import Rank from "./Rank";
import Main from "./Main";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/game" element={<ImageRevealGame />} />
        <Route path="/rank" element={<Rank />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
