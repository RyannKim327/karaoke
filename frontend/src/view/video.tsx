import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import axios from 'axios'

export default function Video() {
  
  const { id } = useParams<{id: string}>()
  const [videos, setVideos] = useState([]);
  
  useEffect(() => {
    axios.get(`/../api?key=${id}`).then(res => {
      setVideos(res.data.response)
    }).catch(error => {
      alert(error)
    })
  }, []) 

  useEffect(() => {
    // Clear any existing player
    const playerContainer = document.getElementById("my-player");
    if (playerContainer) {
      playerContainer.innerHTML = "";
    }

    // Dynamically load the YouTube IFrame API script if not already loaded
    if (!document.querySelector("script[src='https://www.youtube.com/iframe_api']")) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }

    // Initialize the YouTube Player
    window.onYouTubeIframeAPIReady = () => {
      const player = new YT.Player("my-player", {
        videoId: videos[0], // First video in the list
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          mute: 1,
          enablejsapi: 1,
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
            }, 500)
          },
          onStateChange: (event: any) => {
            // alert(event.data)
            if (event.data === YT.PlayerState.ENDED) {
              // Add logic to load the next video or handle the end event
              axios.get(`/../api/remove?key=${id}`).then(res => {
                axios.get(`/../api?key=${id}`).then(res => {
                  setVideos(res.data.response)
                }).catch(error => {
                  alert(error)
                })
              }).catch(error => {
                alert(`Error: ${error}`)
              })
            }
          },
          onError: (event: any) => {
            alert("This song is cannot be played, the system will automatically skipped")
            axios.get(`/../api/remove?key=${id}`).then(res => {
              axios.get(`/../api?key=${id}`).then(res => {
                setVideos(res.data.response)
              }).catch(error => {
                alert(error)
              })
            }).catch(error => {
              alert(`Error: ${error}`)
            })

          }
        },
      })
    };
  }, [videos]);
  
  return (
    <div className="w-dvw h-dvh">
      {
        (videos.length <= 0) ? 
          <div>Please go to https://{import.meta.url.split("/")[2]}/search/{id}</div> :
          <div id="my-player" className="w-dvw h-dvh"></div>
      }
    </div>
  )
}
