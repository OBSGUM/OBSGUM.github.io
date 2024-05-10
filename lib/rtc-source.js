console.log("Document Loaded");

let peerConnections = [];
let offer, answer;

//RTC settings
const targetIDinput = document.getElementById("pcName");
targetIDinput.addEventListener("change", setRTCid);
setRTCid();
async function setRTCid() {
  rtcID = document.getElementById("pcName").value;
}

//start webRTC
const rtcButton = document.getElementById("rtcButton");
rtcButton.addEventListener("click", sendWSSdetails);


async function sendWSSdetails() {
  const event_name = `ws-details-for-client-${rtcID}`;
  console.log("event_name",event_name, wssDetails);
  await obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: event_name,
      event_data: { wssDetails },
    },
  })
  
  // setTimeout(() => {
  //   console.log("this is the first message");
  //   init();
  // }, 1000)
  init();
  console.log('wss connection complete')
  //init();
  // obs.on("CustomEvent", function (event) {
    //   console.log("wss response", event);
    //   if (event.event_name === `client-connected-${rtcID}`) {
      //     console.log("webRTC target connected to webSocket successfully");
      //   }
      // });
    }
    async function init() {
      console.log("init started", rtcType);
      
      let i = 0;
      const numberOfPeerConnections = document.getElementById("pcNumber").value;
      
      console.log(numberOfPeerConnections);
      while (i < numberOfPeerConnections) {
        peerConnections[i] = new RTCPeerConnection();
        i++
      }
      
      //add video track to host
      
      if (rtcType.includes("Video")) {
        localStream.getTracks().forEach((track) => {
          i=0
          while(i<numberOfPeerConnections){
            peerConnections[i].addTrack(track, localStream);
            i++
          }
        });
      }
      
      //add audio track to host
      if (rtcType.includes("Audio")) {
        localAudioStream.getTracks().forEach((track) => {
          i=0
          while(i<numberOfPeerConnections){
            peerConnections[i].addTrack(track, localAudioStream);
            i++
          }
        });
      }
      
      //create webRTC connection offers
      i=0
      while(i<numberOfPeerConnections){
        await createOffer(i);
        i++;  
      }
    }
    
    //createOffer
    async function createOffer(i) {
      peerConnections[i].onicecandidate = async (event) => {
        //Event that fires off when a new offer ICE candidate is created
        if (event.candidate) {
          console.log("create offer", offer);
          console.log(`messageName rtc-offer-${rtcID}_${i}`);
          
          const offerMessage = JSON.stringify(peerConnections[i].localDescription);
          await obs.call("CallVendorRequest", {
            vendorName: "obs-browser",
            requestType: "emit_event",
            requestData: {
              event_name: `rtc-offer-${rtcID}_${i}`,
              event_data: { offerMessage },
            },
          });
        }
      };
      
      const offer = await peerConnections[i].createOffer();
      await peerConnections[i].setLocalDescription(offer);
      
      //listen for answer message
      await obs.on("CustomEvent", async function (event) {
        console.log("rtc answer", event);
        if (event.event_name === `rtc-answer-${rtcID}_${i}`) {
          let answer = JSON.parse(event.event_data.answerMessage);
          if (!peerConnections[i].currentRemoteDescription) {
            await peerConnections[i].setRemoteDescription(answer);
            await rtcConnectionComplete(i);
          }
        }
      });
    }
    
    async function rtcConnectionComplete(i) {
      const msg = "rtc connected";
      await obs.call("CallVendorRequest", {
        vendorName: "obs-browser",
        requestType: "emit_event",
        requestData: {
          event_name: `rtc-connected-${rtcID}_${i}`,
          event_data: { msg },
        },
      });
      console.log("rtc connected sent");
    }
    
    // //refresh webRTC target browsers
    // const refreshRTCbutton = document.getElementById("refreshRTCbutton");
    // refreshRTCbutton.addEventListener("click", refreshOBSbrowsers);
    
    // //send websocket details to the webRTC sources
    
    // //targets are connected to the webSocket server
    
    // async function refreshOBSbrowsers(){
      
    //   let SceneItems = await obs.call("GetSceneItemList", {
    //     sceneName: "rtc_target",
    //   });
      
    //   SceneItems = SceneItems.sceneItems;
    //   console.log(SceneItems)
    //   const browsers = await SceneItems.filter(async (item) => {
    //     console.log("item",item)
    //     if (item.inputKind == "browser_source") {
    //       await obs.call("PressInputPropertiesButton", {
    //         inputUuid: item.sourceUuid,
    //         propertyName: "refreshnocache",
    //       });
    //     }
    //   });
    //   console.log('browser refresh complete')
    //   sendWSSdetails()
    // }