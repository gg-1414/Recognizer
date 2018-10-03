
document.addEventListener('DOMContentLoaded', () => {

  'use strict';
  const capture = document.querySelector("#capture")
  const webcam =  document.querySelector('#webcam')
  const loader = document.querySelector('#loader')

  //// APPEND WEBCAM ///////////////////////////////////////
  function createForm() {
    let form = document.createElement('form')
    form.id = "initial_form"

    let inputDiv = document.createElement('div')
    inputDiv.id = "input"

    let userName = document.createElement('input')
    userName.setAttribute("type", "text")
    userName.setAttribute("name", "text")
    userName.setAttribute("placeholder", "Name")
    userName.id = "username"

    let submit = document.createElement('input')
    submit.setAttribute("type", "submit")
    submit.setAttribute("value", "")

    let video = document.createElement('video')
    video.autoplay = true

    inputDiv.append(userName, submit)
    form.append(inputDiv, video)

    webcam.append(form)
  }

  //// START WEBCAM ///////////////////////////////////////////
   // generates a still frame image from the stream in the <video> appends the image to the <body>

  function startWebcam() {
    // use MediaDevices API
    // docs: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    if (navigator.mediaDevices) {
      const video = document.querySelector('video')
      const form = document.getElementById('initial_form')
      // access the web cam
      navigator.mediaDevices.getUserMedia({video: true})
      // permission granted:
      .then(function(stream) {
        video.src = window.URL.createObjectURL(stream);
        video.style.boxShadow = "0 0 11px rgb(0, 255, 137)"
        video.style.border = "2px solid rgb(0, 220, 255)"
        form.addEventListener('submit', takeSnapshot);
      })
      // permission denied:
      .catch(function(error) {
        document.body.textContent = 'Could not access the camera. Error: ' + error.name;
      });
    }
  }
  //// END WEBCAM ////////////////////////////////////////

  function takeSnapshot(event) {
    event.preventDefault()
    const video = document.querySelector('video')
    const form = document.getElementById('initial_form')
    const capture = document.getElementById('capture')
    let pictureCanvas;

    let img = document.querySelector('img') || document.createElement('img')
    let width = video.offsetWidth
    let height = video.offsetHeight

    // create image canvas
    pictureCanvas = pictureCanvas || document.createElement('canvas');
    pictureCanvas.width = width;
    pictureCanvas.height = height;

    let context = pictureCanvas.getContext('2d');
    context.drawImage(video, 0, 0, width, height);

    img.src = pictureCanvas.toDataURL('image/png');
    console.log(img.src)
    form.hidden = true
    loader.style.display = "block"

    setTimeout(function(){
      loader.style.display = "none"
      capture.appendChild(img);
    }, 3000);

    getEmotion(img.src, event)
  }

  //// FACE APP //////////////////////////////////////////
  function getEmotion(img, event){
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
         // return_attributes: "age,gender,smiling,skinstatus,emotion,ethnicity,beauty",
         return_attributes: "emotion",
         image_base64: img
       }
     })
     .then(r => grabEmotion(r, event))
     // .then(console.log)
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
  //// END FACE APP /////////////////////////////////////


  //// FETCH / POST DATA ////////////////////////////////
  function grabEmotion(data, event){
    // debugger
    let emotionData = data.faces[0].attributes.emotion
    let value = 0.0
    let key = ""

    for (let mood in emotionData) {
      if (emotionData[mood] > value){
        value = emotionData[mood]
        key = mood
      }
    }

    postUser(key, value, event)
  }

  function postUser(key, value, event){
    let data = {
      "username": event.target[0].value,
      "emotions": [
        {"mood": key}
      ]
    }

    fetch('http://localhost:3000/users/', {
      method: "POST",
      mode: "cors",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }).then(r => r.json())
    .then(data => userStat(data))
    // .then(console.log)
    // => {id: 6, username: "Person", emotions: Array(1)}
    //   => emotions[0]:
    //       id: 4
    //       mood: "neutral"
  }
  //// END POST /////////////////////////////////////////////

  function userStat(userData) {

    setTimeout(function(){
      const image = document.querySelector('#capture img')
      // debugger
      image.style.opacity = "0.8"
      let imageOpacity = 8

      let interval = setInterval(function(){
        // debugger
        image.style.opacity -= 0.1
        imageOpacity -= 2
        if (imageOpacity === 0){
          clearInterval(interval)
          image.style.width = "150px"
          image.style.borderRadius = "15px"
          image.style.position = "absolute"
          image.style.top = "10px"
          image.style.left = "21px"
          image.style.opacity = "0.8"
        }
      }, 300)
    }, 4000)
    appendUserStats(userData)
  }

  function appendUserStats(userData) {
    const captureDiv = document.getElementById('capture')

    setTimeout(function(){
      let h2 = document.createElement('h2')
      h2.innerText = `${userData.username} : ${userData.emotions[userData.emotions.length-1].mood}`
      h2.style.color = "rgb(0, 250, 255)"
      h2.style.position = "absolute"
      h2.style.top = "50px"
      h2.style.left = "200px"
      h2.classList.add("typewriter")


      captureDiv.append(h2)
    }, 7000)

  }


  //// APPEND VISUALIZER ///////////////////////////////////
  function appendCanvas() {

  }



  createForm()
  startWebcam()
})
