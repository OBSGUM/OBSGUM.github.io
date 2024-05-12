// Settings
var cur_data, canvasElement, now, delta;
var frameRate = 1;
var sentimentMessage = {text:"", negativeScore:"", positiveScore:""}

//Set the global variable initialized in SpeechRecoginition.js
sentimentAnalysisIsRunning = true;

// Get the required elements
const input = document.getElementById("input");
const output = document.getElementById("output");
const submit = document.getElementById("submit");
const defaultTextButton = document.getElementById("populate-text");
const demosSection = document.getElementById("demos");

// This Global Variable is also used in SpeechRecognition.js  
const text = [];

document.body.prepend(canvasElement);

import {
  TextClassifier,
  FilesetResolver,
} from "../mediaPipe_Tasks/tasks-text/text_bundle.mjs";

let textClassifier;
// Create the TextClassifier object upon page load
const createTextClassifier = async () => {
  const text = await FilesetResolver.forTextTasks(
    "mediapipe_Tasks/tasks-text/wasm/"
  );
  textClassifier = await TextClassifier.createFromOptions(text, {
    baseOptions: {
      modelAssetPath: `mediaPipe_Models/bert_classifier.tflite`,
      delegate: "GPU",
    },
    maxResults: 5,
  });

  // Show demo section now model is ready to use.
  demosSection.classList.remove("invisible");
};
createTextClassifier();

document.getElementById("speechRecognition").addEventListener("change", () =>{

})


//listen for localVocal text change events
obs.on("InputSettingsChanged", async function (event) {
  if (event.inputName === "LocalVocal-Text") {
  //console.log(event);

  if(event.inputSettings.text.length > 0){
      text.push(event.inputSettings.text);
      //console.log(event.inputSettings.text);
      await processText();
    }
  }
});

// Add a button click listener that classifies text on click
async function processText() {
  input.innerText = text.shift();
  output.innerText = "Classifying...";
  //await sleep(5);
  if(input.value.length > 0){
  const result = textClassifier.classify(input.value);
  await displayClassificationResult(result);
  sentimentMessage.text = input.value
  sentimentMessage[`${result.classifications[0].categories[0].categoryName}Score`] = result.classifications[0].categories[0].score
  sentimentMessage[`${result.classifications[0].categories[1].categoryName}Score`] = result.classifications[0].categories[1].score
  
  //console.log("message", sentimentMessage)
  sendBrowserWebSocket(sentimentMessage);
  
  //sendAdvSSWebSocket(result);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sendBrowserWebSocket(result) {
  //send results to OBS Browser Source
  obs.call("CallVendorRequest", {
    vendorName: "obs-browser",
    requestType: "emit_event",
    requestData: {
      event_name: "sentimentResult",
      event_data: { result },
    },
  });
}

function sendAdvSSWebSocket(result) {
  //send results to Advanced Scene Switcher
  const AdvancedSceneSwitcherMessage = JSON.stringify(result);
  obs.call("CallVendorRequest", {
    vendorName: "AdvancedSceneSwitcher",
    requestType: "AdvancedSceneSwitcherMessage",
    requestData: {
      message: "hi",
    },
  });
}

// Iterate through the sentiment categories in the TextClassifierResult object, then display them in #output
async function displayClassificationResult(result) {
  if (result.classifications[0].categories.length > 0) {
    output.innerText = "";
  } else {
    output.innerText = "Result is empty";
  }
  const categories = [];
  // Single-head model.
  for (const category of result.classifications[0].categories) {
    const categoryDiv = document.createElement("div");
    categoryDiv.innerText = `${category.categoryName}: ${category.score.toFixed(
      2
    )}`;
    // highlight the likely category
    if (category.score.toFixed(2) > 0.5) {
      categoryDiv.style.color = "#12b5cb";
    }
    output.appendChild(categoryDiv);
  }
}

//Send results to OBS browser