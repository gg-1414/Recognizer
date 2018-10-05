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
    // console.log(img.src)
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
    console.log(userData)
    setTimeout(function(){
      const image = document.querySelector('#capture img')
      // debugger
      image.style.opacity = "0.8"
      let imageOpacity = 8

      let interval = setInterval(function(){
        // debugger
        image.style.opacity -= 0.05
        imageOpacity -= 0.5
        if (imageOpacity === 0){
          clearInterval(interval)
          image.style.width = "150px"
          image.style.borderRadius = "15px"
          image.style.position = "absolute"
          image.style.top = "10px"
          image.style.left = "10px"
          image.style.margin = "19px"
          image.style.opacity = "0.9"
          image.style.borderRight = "thin solid #fff"
          image.style.borderLeft = "thin solid #fff"
        }
      }, 100)
    }, 3000)
    appendUserStats(userData)
  }

  function appendUserStats(userData) {
    const captureDiv = document.getElementById('capture')

    setTimeout(function(){
      let div = document.createElement('div')

      let h2 = document.createElement('h2')

      let text = `${userData.username} : ${userData.emotions[userData.emotions.length-1].mood}`
      h2.style.color = "rgb(0, 255, 236)"

      h2.style.position = "absolute"
      h2.style.top = "50px"
      h2.style.left = "200px"
      h2.classList.add("typewriter")

      captureDiv.append(h2)

      typeWriter(text, 0)
      getSongs(userData.emotions[userData.emotions.length-1])

    }, 7000)
  }

    function typeWriter(text, i) {
      const h2 = document.querySelector('h2')
      if (i < (text.length)) {
        h2.innerHTML = text.substring(0, i+1)

        setTimeout(function() {
          typeWriter(text, i + 1)
        }, 200);
      }
    }

  function getSongs(obj) {
    let id =  obj.id
    let expression = obj.mood
    let specificEmotion = `http://localhost:3000/emotions/${id}/random_song`
    fetch(specificEmotion, {
      method: "GET",
      mode: "cors",
      credentials: "same-origin",
    })
    .then(response => response.json())
    .then(data => musicalEmotion(data,expression))
  }

  function musicalEmotion(data,emotion) {
    switch (emotion) {
      case "anger":
        let anger = new Audio(audioPath(data));
        // anger.play();
        appendCanvas(data)
        break;
      case "surprise":
        let surprise = new Audio(audioPath(data));
        // surprise.play();
        appendCanvas(data)
        break;
      case "fear":
        let fear = new Audio(audioPath(data));
        // fear.play();
        appendCanvas(data)
        break;
      case "happiness":
        let happiness = new Audio(audioPath(data));
        // happiness.play();
        appendCanvas(data)
        break;
      case "neutral":
        let neutral = new Audio(audioPath(data));
        // neutral.play();
        appendCanvas(data)
        break;
      case "sadness":
        let sadness = new Audio(audioPath(data));
        // sadness.play();
        appendCanvas(data)
        break;
      case "disgust":
        let disgust = new Audio(audioPath(data));
        // disgust.play();
        appendCanvas(data)
        break;
      default:
        alert("Are you even Human!!")
      }
    }

    function audioPath(data) {
      return `./audio/${data.artist}-${data.name}.mp3`
    }


  //// APPEND VISUALIZER ///////////////////////////////////
  function appendCanvas(data) {
    let audio = document.querySelector('audio')
    audio.crossOrigin = "anonymous";
    audio.src =  `http://localhost:8000/audio/${data.artist}-${data.name}.mp3`
    // let file = new File([""], `./audio/${data.artist}-${data.name}.mp3`, {type: "audio/mp3"})
    // audio.src = URL.createObjectURL(file)

    // file://localhost/...
    // file:///...
     // file:///Users/ginalee/learn-co/recognizer/audio/Illenium-Its_All_On_You.mp3
    // audio.src = audio.src.slice(0,6) + "localhost" + audio.src.slice(6)
    // debugger

    // http://localhost:8000/Ekali-Unfaith.mp3
    // debugger

    // audio.src = audioFile.src

    // const file = document.getElementById('thefile')
    // file.baseURI = audioFile.src
    // debugger

    //
    // audio.load()
    // audio.play()
    // audio.src = audioFile.src
    // let xhr = new XMLHttpRequest();
    // xhr.open("GET", audio.src);
    // xhr.responseType = "blob";
    //
    // xhr.onload = function()
    // {
    //     let audioBlob = xhr.response;//xhr.response is now a blob object
    // }
    // debugger

    audio.style.display = "block"
    console.log('AUDIO.SRC(BLOB?): ', audio.src)
    console.log('TYPEOF_AUDIO.SRC(BLOB?): ', typeof audio.src)
    // => string

    const context = new AudioContext();
    // debugger
    let src = context.createMediaElementSource(audio);
    console.log('MEDIA_ELEMENT_SRC: ', src);
    const analyser = context.createAnalyser();
    const canvas = document.getElementById("visualizer");

    canvas.hidden = false
    const ctx = canvas.getContext("2d");

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 32768;
    const bufferLength = analyser.frequencyBinCount;
    console.log('BUFFER-LENGTH: ', bufferLength);

    const dataArray = new Uint8Array(bufferLength);
      // debugger
    console.log('DATA-ARRAY: ', dataArray)

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    const barWidth = (WIDTH / bufferLength) * 15.5;
    console.log('BARWIDTH: ', barWidth)
    let barHeight;
    let x = 0;

    function renderFrame() {
      requestAnimationFrame(renderFrame); // takes callback to invoke before rendering

      x = 0;

      analyser.getByteFrequencyData(dataArray); // copies current frequency data into an Unit8Array passed into it

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      let r, g, b;
      let y = 2.5

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 0.5);

        if (dataArray[i] > 200){
          r = 250
          g = 50 * (i/bufferLength) + 80;
          b = barHeight + (50 * (i/bufferLength)) + 100
        } else if (dataArray[i] > 180){
          r = barHeight + (5000 * (i/bufferLength)) + 10
          g = 50 * (i/bufferLength) + 40
          b = 250
        } else if (dataArray[i] > 100){
          r = barHeight + (500 * (i/bufferLength))
          g = 50 * (i/bufferLength) + 80
          b = 250
        } else if (dataArray[i] < 80){
          r = barHeight + (50 * (i/bufferLength)) - 40
          g = 50 * (i/bufferLength) - 60
          b = 250
        } else if (dataArray[i] < 70){
          r = barHeight + (30 * (i/bufferLength)) - 120
          g = 50 * (i/bufferLength) - 80
          b = 250
        } else {
          r = barHeight + (100 * (i/bufferLength));
          g = 50 * (i/bufferLength);
          b = 250;
        }

        ctx.fillStyle = `rgba(${r},${g},${b},1)`;
        ctx.fillRect(x, (HEIGHT - barHeight + 30), barWidth, barHeight);
        // (x, y, width(px), height(px))

        // x += barWidth + 1; // +1 to have them not directly next to one another
        x += 2
        // y += 0.01
      }
    }
    audio.play();
    renderFrame();
  }



  createForm()
  startWebcam()
})
