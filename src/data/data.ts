import { existsSync, readFileSync, writeFileSync } from "fs";

interface process_props {
  id: string;
  video?: string;
  name?: string;
}

export default function Process(props: process_props) {
  const data = JSON.parse(readFileSync("data.json", "utf-8"));
  const keys = Object.keys(data);
  if (keys.includes(props.id)) {
    // TODO: ID existed
    if (props.video) {
      const yt_1 = /youtube.com\/watch\?v=([a-zA-Z0-9\-_]{11})/i;
      const yt_2 = /youtu.be\/([a-zA-Z0-9\-_]{11})/i;
      let video = props.video;
      let done = false;
      if (yt_1.test(video)) {
        video = video.match(yt_1)[1];
        done = true;
      } else if (yt_2.test(video)) {
        video = video.match(yt_2)[1];
        done = true;
      }
      if (done && video) {
        data[props.id].push(video);
      }
    }
  } else {
    data[props.id] = [];
  }
  writeFileSync("data.json", JSON.stringify(data, null, 2));
  return "Donw";
}
