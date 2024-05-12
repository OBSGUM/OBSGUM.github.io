//variable to indicate if MediaPipe Text Analysis is running. 
var sentimentAnalysisIsRunning = false; 

//Set Audio and Video Elements 
const speechRecognitionButton = document.getElementById("startSpeechRecognition");
speechRecognitionButton.addEventListener("click", startSpeechRecognition);


async function startSpeechRecognition() {

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent
var recognition = new SpeechRecognition();


recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

recognition.start();

recognition.onresult = async function(event) {
  const rI = event.resultIndex;
  var result = event.results[rI][0].transcript;

  //if the mediaPipe Text Analysis is turned on, then send the result 
  if(sentimentAnalysisIsRunning ===true){
    document.getElementById("speechRecognition").innerHTML = result;
    text.push(result);
    //console.log(event.inputSettings.text);
    await processText();
  }else{
    //if the mediaPipe Text Analysis isn't running, display the results on screen only. 
    document.getElementById("speechRecognition").innerHTML = result;
  }

  //console.log(event);
  //send results to OBS Browser Source
  obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: "speechRecognition",
      event_data: { result },
    },
  });

  //

  //send results to Advanced Scene Switcher
  //  const AdvancedSceneSwitcherMessage = JSON.stringify(dataArray)
  //   obs.call("CallVendorRequest", {
  //     vendorName: "AdvancedSceneSwitcher",
  //     requestType: "AdvancedSceneSwitcherMessage",
  //     requestData: {
  //       "message": result,
  //     },
  //   });
}

  recognition.onspeechend = function() {
    recognition.stop();
  }
  
  recognition.onnomatch = function(event) {
    diagnostic.textContent = "I didn't recognise that color.";
  }
  
  recognition.onerror = function(event) {
    diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
  }
  
}