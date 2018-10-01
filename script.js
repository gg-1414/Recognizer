document.addEventListener('DOMContentLoaded', () => {

  /////////////////////////////// WEBCAM ///////////////////////////////////////////
  'use strict';
  const video = document.querySelector('video')
  let webcamCanvas;

   // generates a still frame image from the stream in the <video> appends the image to the <body>
  function takeSnapshot() {
    let img = document.querySelector('img') || document.createElement('img')
    let width = video.offsetWidth
    let height = video.offsetHeight

    webcamCanvas = webcamCanvas || document.createElement('canvas');
    webcamCanvas.width = width;
    webcamCanvas.height = height;

    let context = webcamCanvas.getContext('2d');
    context.drawImage(video, 0, 0, width, height);

    img.src = webcamCanvas.toDataURL('image/png');
    // console.log(img.src)
    document.body.appendChild(img);

    getEmotion(img.src)
  }

  // use MediaDevices API
  // docs: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  if (navigator.mediaDevices) {
    // access the web cam
    navigator.mediaDevices.getUserMedia({video: true})
    // permission granted:
    .then(function(stream) {
      video.src = window.URL.createObjectURL(stream);
      video.addEventListener('click', takeSnapshot);
    })
    // permission denied:
    .catch(function(error) {
      document.body.textContent = 'Could not access the camera. Error: ' + error.name;
    });
  }
  ///////////////////////////////// END WEBCAM ////////////////////////////////////////


  ///////////////////////////////// FACE APP //////////////////////////////////////////
  function getEmotion(img){
    const API_URL = 'https://api-us.faceplusplus.com/facepp/v3/detect'
    const API_KEY = "ZZgFGHAfwlZbaeG29jcG3JDaw3Nw4oS7"
    const API_SECRET = "UX5x4BxXjM7XBDUwB1TEZv9IxZ7asT_J"
    const form = document.querySelector('#test_form')

     $.ajax({
       type: 'POST',
       url: API_URL,
       data: {
         api_key: API_KEY,
         api_secret: API_SECRET,
         // enctype: ‘multipart/form-data’,
         // return_attributes: “gender”,
         return_attributes: "age,gender,smiling,skinstatus,emotion,ethnicity,beauty",
         image_base64: img
       }
     }).then(console.log)
     // res.faces[0].attributes.emotion
     // => emotion: {
     //      anger: 0.71
     //      disgust: 0.008
     //      fear: 0.002
     //      happiness: 99.233
     //      neutral: 0.041
     //      sadness: 0.002
     //      surprise
     //    }
  }
  /////////////////////////////////// END FACE APP /////////////////////////////////////



})








//
