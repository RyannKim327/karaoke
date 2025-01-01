import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Search from "./view/search";

export default function App() {
  const [videos, setVideos] = useState();
  useEffect(() => {
    // const data = JSON.parse(readFileSync("data/data.json", "utf-8"));
    // setVideos(data);
    if (document.getElementById("my-player")) {
      document.getElementById("my-player").innerHTML = "";
    }
    const player = document.createElement("iframe");
    player.id = "iframe-player";

    document.getElementById("my-player")?.appendChild(player);
  }, []);
  return (
    <div className="w-dvw h-dvh">
      <Routes>
        <Route path="/" element={<div id="my-player"></div>} />
        <Route path="search" element={<Search />} />
      </Routes>
    </div>
  );
}
