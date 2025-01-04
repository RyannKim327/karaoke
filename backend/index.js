const cors = require("cors")
const express = require("express")
const fs = require("fs")

const app = express()

app.use(cors())

app.get("/api", (req, res) => {
  const data = req.query
  if(data.key){
    const json = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const keys = Object.keys(json);
    if (!keys.includes(data.key)) {
      json[data.key] = []
    }
    // TODO: ID existed
    if (data.video) {
      const yt_1 = /youtube.com\/watch\?v=([a-zA-Z0-9\-_]{11})/i;
      const yt_2 = /youtu.be\/([a-zA-Z0-9\-_]{11})/i;
      let video = data.video;
      if (yt_1.test(video)) {
        video = video.match(yt_1)[1];
      } else if (yt_2.test(video)) {
        video = video.match(yt_2)[1];
      }else{
        done = true
      }
      if (video) {
        json[data.key].push(video);
      }
      fs.writeFileSync("db.json", JSON.stringify(json, null, 2));
      res.send(JSON.stringify({
        "status": 200,
        "response": "Successfully Added to the list"
      }))
    }else{
      res.send(JSON.stringify({
        "status": 200,
        "response": json[data.key]
      }))
    }
  }
  res.send(JSON.stringify({
    "status": 302,
    "response": "Key not found"
  }))
})

app.get("/api/remove", (req, res) => {
  const data = req.query
  if(data.key){
    const json = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const keys = Object.keys(json);
    json[data.key].shift()
    // TODO: ID existed
    fs.writeFileSync("db.json", JSON.stringify(json, null, 2));
    res.send(JSON.stringify({
      "status": 200,
      "response": "Successfully removed to the list"
    }))
  }
  res.send(JSON.stringify({
    "status": 302,
    "response": "Key not found"
  }))

})

app.listen(3000, () => {
  if(!fs.existsSync(`${__dirname}/db.json`)){
    fs.writeFileSync("db.json", JSON.stringify({}, null, 2), "utf-8")
  }
  console.log("Starting")
})
