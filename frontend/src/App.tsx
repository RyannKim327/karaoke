import { Route, Routes } from "react-router-dom";
import Search from "./view/search";
import Video from "./view/video";
import { useEffect, useState } from "react";
import { Navigate } from "react-router";

export default function App() {
  const [id, setId] = useState()
  useEffect(() => {
    let x = ""
    const alpha = "abcdefghijklmnopqrstuvwxyz0123456789"
    for (let i = 0; i < 8; i++){
      const r = Math.floor(Math.random() * alpha.length)
      x += alpha[r]
    }
    setId(x)
  }, [])
  return (
    <div className="w-dvw h-dvh">
      <Routes>
        <Route path="/" element={<Navigate to={`/${id}`} />} />
        <Route path="/:id" element={<Video />} />
        <Route path="/search/:id" element={<Search />} />
      </Routes>
    </div>
  );
}
