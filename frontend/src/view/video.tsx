import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import axios from 'axios'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

function score(_score: number){
  if(_score <= 0){
    return "Wag ka nang uulit"
  }else if(_score > 0 && _score <= 25){
    return "Yan na un?"
  }else if(_score > 25 && _score <= 50){
    return "Konting practice pa, pero di mo ko matatalo"
  }else if(_score > 50 && _score <= 75){
    return "Kunyareng magaling, hindi naman"
  }else{
    return "Naks naka-chamba"
  }
}

export default function Video() {
  
  const { id } = useParams<{id: string}>()
  const [videos, setVideos] = useState([]);
  let player = useRef<YT.Player>()
  const [title, setTitle] = useState("")
  const [score_, setScore] = useState()
  const [entitle, setEntitle] = useState("")
  const [end, isEnd] = useState(false)
  const url = "http://localhost:3000"
  
  useEffect(() => {
    // const x = setInterval(() => {
      axios.get(`${url}/api?key=${id}`).then(res => {
        setVideos(res.data.response[0])
        // alert("Error " + JSON.stringify(res.data.response, null, 2))
        if (!document.querySelector("script[src='https://www.youtube.com/iframe_api']")) {
          const script = document.createElement("script");
          script.src = "https://www.youtube.com/iframe_api";
          document.body.appendChild(script);
        }
      }).catch(error => {
        alert(error)
      })
    // }, 1000)
    // return () => clearInterval(x)
  }, [])

  useEffect(() => {
  
  // Dynamically load the YouTube IFrame API script if not already loaded
  const player_ = () => {
    
    // Clear any existing player
    // const playerContainer = document.getElementById("my-player");
    // if (playerContainer) {
    //   playerContainer.innerHTML = "";
    // }
    console.log(videos)
    isEnd(false)
    // Initialize the YouTube Player
    window.onYouTubeIframeAPIReady = () => {
      player = new YT.Player("my-player", {
        videoId: videos.video, // First video in the list
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          mute: 1,
          enablejsapi: 1,
          // showinfo: 0,
          modestbranding: 0,
          playsinline: 1
        },

        events: {
          onReady: (event: any) => {
            // alert("ready")
            // event.target.play()
            player.playVideo()
            setTimeout(() => {
              player.unMute()
              setTitle(videos.title)
            }, 500)
          },
          onStateChange: (event: any) => {
            // alert(event.data)
            if (event.data === YT.PlayerState.ENDED) {
              // Add logic to load the next video or handle the end event
              let x = Math.floor(Math.random() * 50)
              const round = () => {
                isEnd(true)
                const random = Math.floor(Math.random() * 201) - 100
                setScore(random)
                setTimeout(() => {
                  if(x > 0){
                    x--
                    round()
                  }else{
                    setEntitle(score(random))
                    setTimeout(() => {
                    axios.get(`${url}/api/remove?key=${id}`).then(res => {
                      axios.get(`${url}/api?key=${id}`).then(res => {
                        setVideos(res.data.response[0])
                        setTimeout(() => {
                          player_()
                        },5000)
                      }).catch(error => {
                        alert(error)
                      })
                    }).catch(error => {
                      alert(`Error: ${error}`)
                    })
                    }, 5000)
                  }
                }, 25)
              }
              round()
            }
          },
          onError: (event: any) => {
            alert("This song is cannot be played, the system will automatically skipped")
            axios.get(`${url}/api/remove?key=${id}`).then(res => {
              axios.get(`${url}/api?key=${id}`).then(res => {
                setVideos(res.data.response[0])
              }).catch(error => {
                alert(error)
              })
            }).catch(error => {
              alert(`Error: ${error}`)
            })
          }
        }
      })
    };
  }
    player_()
  }, [videos])  

  return (
    <div className="w-dvw h-dvh bg-black">
      {
        (!videos) ? 
          <div className="flex flex-col bg-white justify-center items-center w-dvw h-dvh">
            <h1 className="text-2xl font-bold text-center">Please go to <u className="text-red-600">https://{import.meta.url.split("/")[2]}/search/{id}</u> into your client.<br />Or scan the QR Code below:</h1>
            <img className="p-2 border-2 border-solid border-black m-2" src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://${import.meta.url.split("/")[2]}/search/${id}`} />
          </div> :
          <div className="w-dvw h-dvh relative">
            <span id="my-player" className="w-dvw h-dvh"></span>
            <div className="flex gap-1 items-center backdrop-blur z-10 absolute top-3 left-3 bg-[rgba(0,0,0,0.2)] p-3 text-white">
              <FontAwesomeIcon className="text-3xl text-white hover:text-red-600" title="Stop music" icon={faClose} onClick={() => {
                if(confirm("Are you sure you want to stop the song")){
                  // player.stopVideo()
                  axios.get(`${url}/api/remove?key=${id}`).then(res => {
                    if(res.data.status === 200){
                      alert(id)
                      axios.get(`${url}/api?key=${id}`).then(res => {
                        setVideos(res.data.response[0])
                        alert("Refreshed")
                      }).catch(error => {
                        alert("E " + error)
                      })
                    }
                  }).catch(error => {
                    alert(`Error: ${error}`)
                  })
                }
              }} />
              <span>{title}</span>
            </div>
            <div className={`${(end) ? "flex flex-col" : "hidden"} justify-center items-center absolute h-dvh z-20 top-0 left-0 right-0 bottom-0 w-dvw bg-[rgba(0,0,0,0.5)]`}>
              <h1 className="text-white text-7xl">{score_}</h1>
              <h3 className="text-white text-3xl">{entitle}</h3>
            </div>
          </div>
      }
    </div>
  )
}
