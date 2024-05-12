//Load MediaPipe libraries when needed
const mpPoseButton = document.getElementById("startPoseDetectButton");
mpPoseButton.addEventListener("click", () => loadScript('mpPose.js',true));

const mpHandButton = document.getElementById("startHandLandmarks");
mpHandButton.addEventListener("click", () => loadScript('mpHand.js',true));

const mpFaceButton = document.getElementById("startFaceLandmarks");
mpFaceButton.addEventListener("click", () => loadScript('mpFace.js',true));

const mpSegmentButton = document.getElementById("startSegmentation");
mpSegmentButton.addEventListener("click", () => {
  loadScript('mpSegmentation.js',true)
  loadScript('rtc-segmentation.js',false)
},{once: true});

const mpTextButton = document.getElementById("startTextAnalysis");
mpTextButton.addEventListener("click", () => loadScript('mpSentiment.js',true));

function loadScript(script, module) {
  const scriptElem = document.createElement("script");
  scriptElem.src = `lib/${script}`;
  //scriptElem.async = script.async;
  if (module) {
    scriptElem.type = 'module';
  }
  scriptElem.onload = () => {
    console.log(`${script} Script loaded successfuly`);
  };
  scriptElem.onerror = () => {
    console.log(`${script} Error occurred while loading script`);
  };
  document.body.appendChild(scriptElem);
}
