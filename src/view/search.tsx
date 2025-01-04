import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useState } from "react";
import { useParams } from "react-router";

export default function Search() {
  const { id } = useParams<{id: string}>()

  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  
  const search_video = async (token?: string) => {
    if (q) {
      let _q = q;
      if (!_q.endsWith("karaoke") && !_q.endsWith("minus one")) {
        _q += " karaoke";
      }
      const { data } = await axios.get(
        `https://www.googleapis.com/youtube/v3/search?key=${import.meta.env.VITE_YOUTUBE_TOKEN}&part=snippet&q=${_q ?? ""}&pageToken=${token ?? ""}`,
      );
      setItems(data.items);
    } else {
      alert("Error");
    }
  };

  const sendToDB = (videoid: string) => {
    axios.get(`/../api?key=${id}&video=${videoid}`).then(res => {
      alert(res.data.response)
    }).catch(e => {
      alert(e)
    })
  }
  
  return (
    <div className="flex flex-col bg-white w-full h-full items-center p-2">
      <span className="flex flex-row items-center bg-transparent border-[1px] border-black border-solid box-border rounded pl-2 pr-2">
        <input
          onChange={(event) => {
            setQ(event.target.value);
          }}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key == "Enter") {
              search_video();
            }
          }}
          type="text"
          id="search-input"
          className="bg-transparent box-border outline-none"
        />
        <FontAwesomeIcon
          onClick={() => {
            search_video();
          }}
          icon={faMagnifyingGlass}
        />
      </span>
      <div className="flex flex-col p-2 box-border scroll-m-1 overflow-y-scroll h-full">
        {items.map((video) => {
          return (
            <div
              onClick={() => {
                if(video?.id){
                  sendToDB(video?.id?.videoId)
                }else{
                  alert("This video is not available")
                }
              }}
              className="flex flex-row items-center select-none p-2 shadow-gray-900 shadow-md m-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-500 hover:text-white transition ease"
            >
              <img
                className="aspect-video"
                src={video?.snippet?.thumbnails.default.url}
              />
              <div className="flex flex-col pl-4">
                <p>Title: {video?.snippet?.title ?? ""}</p>
                <p>Uploaded by: {video?.snippet?.channelTitle ?? ""}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
