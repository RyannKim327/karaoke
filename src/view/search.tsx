import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import {  useState } from "react";

export default function Search() {
  const [q, setQ] = useState("")
  // console.log(import.meta.env.VITE_YOUTUBE_TOKEN)  
  const search_video = async (token?: string) => {
    console.log(q)
    if(q){
      const { data } = await axios.get(
        `https://www.googleapis.com/youtube/search?key=${import.meta.env.VITE_YOUTUBE_TOKEN}&part=snippet&q=${q??""}&pageToken=${token??""}`,
      );
      console.log(data)
    }else{
      alert("Error")
    }
  };
  return (
    <div className="flex flex-col bg-slate-500 w-full h-full">
      <span className="flex flex-row align-center bg-transparent border-[1px] border-black border-solid ">
        <input
          onChange={(event) => {
            setQ(event.target.value)
          }}
          type="text"
          id="search-input"
          className="bg-transparent"
        />
        <FontAwesomeIcon onClick={() => {
          search_video()
        }} icon={faMagnifyingGlass} />
      </span>
      <div id="videos"></div>
    </div>
  );
}
