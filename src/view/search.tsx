import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";

export default function Search() {
  const search_video = async (video: string, token?: string) => {
    const { data } = await axios.get(
      `https://www.googleapis.com/youtube/search?key=${process.env["YOUTUBE_TOKEN"]}&part=snippet&q=${video}&pageToken=${token}`,
    );
  };
  return (
    <div className="flex flex-col bg-black">
      <div>
        <span className="flex flex-row bg-[transparent]">
          <input type="text" id="search-input" />
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </span>
      </div>
    </div>
  );
}
