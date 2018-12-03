document.addEventListener('DOMContentLoaded', () => {

  'use strict';
  const capture = document.querySelector("#capture")
  const webcam =  document.querySelector('#webcam')
  const loader = document.querySelector('#loader')

  //// APPEND WEBCAM ///////////////////////////////////////
  function createForm() {
    let form = document.createElement('form')
    form.id = "initial-form"

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
    form.append(video, inputDiv)

    webcam.append(form)
  }
  //// END OF APPEND WEBCAM ///////////////////////////////////////

  //// START WEBCAM ///////////////////////////////////////////
  // Generates a still frame image from the stream in the <video>, then appends the image to the <body>

  function startWebcam() {
    // use MediaDevices API
    // docs: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    if (navigator.mediaDevices) {
      const video = document.querySelector('video')
      const form = document.getElementById('initial-form')
      // access the web cam
      navigator.mediaDevices.getUserMedia({video: true})
      // permission granted:
      .then(function(stream) {
        video.src = window.URL.createObjectURL(stream);
        form.addEventListener('submit', takeSnapshot);
      })
      // permission denied:
      .catch(function(error) {
        document.body.textContent = 'Could not access the camera. Error: ' + error.name;
      });
    }
  }
  //// END OF START WEBCAM ////////////////////////////////////////

  //// START SNAPSHOT EVENT ///////////////////////////////////////////
  function takeSnapshot(event) {
    event.preventDefault()

    const video = document.querySelector('video')
    const form = document.getElementById('initial-form')
    const capture = document.getElementById('capture')
    const instructions = document.getElementById('instructions')
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
    instructions.hidden = true
    loader.style.display = "block"

    setTimeout(function(){
      loader.style.display = "none"
      capture.style.display = "block"
      capture.appendChild(img);
    }, 3000);
    getEmotion(img.src, event)
  }
  //// END OF SNAPSHOT EVENT ///////////////////////////////////////////

  //// FACE APP //////////////////////////////////////////
  function getEmotion(img, event){
    const API_URL = 'https://api-us.faceplusplus.com/facepp/v3/detect'
    const API_KEY = "ZZgFGHAfwlZbaeG29jcG3JDaw3Nw4oS7"
    const API_SECRET = "UX5x4BxXjM7XBDUwB1TEZv9IxZ7asT_J"

     $.ajax({
       type: 'POST',
       url: API_URL,
       data: {
         api_key: API_KEY,
         api_secret: API_SECRET,
         // enctype: ‘multipart/form-data’,
         // return_attributes: "age,gender,smiling,skinstatus,emotion,ethnicity,beauty",
         return_attributes: "emotion",
         image_base64: img
       }
     })
     .then(res => grabEmotion(res, event))
  }
  //// END of FACE APP /////////////////////////////////////


  //// FETCH / POST DATA ////////////////////////////////
  function grabEmotion(data, event){
    let emotionData = data.faces[0].attributes.emotion
    let emotionValue = 0.0
    let emotion = ""

    for (let mood in emotionData) {
      if (emotionData[mood] > emotionValue){
        emotionValue = emotionData[mood]
        emotion = mood
      }
    }

    postUser(emotion, event)
  }

  function postUser(emotion, event){
    let data = {
      "username": event.target[0].value,
      "emotions": [
        {"mood": emotion}
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
  }
  //// END POST /////////////////////////////////////////////

  function userStat(userData) {
    console.log(userData)
    setTimeout(function(){
      const image = document.querySelector('#capture img')

      image.style.opacity = "0.8"
      let imageOpacity = 8

      let interval = setInterval(function(){
        image.style.opacity -= 0.03
        imageOpacity -= 0.5
        if (imageOpacity === 0){
          clearInterval(interval)
          image.style.width = "140px"
          image.style.position = "absolute"
          image.style.top = "10px"
          image.style.left = "21px"
          image.style.opacity = "0.7"
          // image.style.borderRight = "thin solid #fff"
          // image.style.borderLeft = "thin solid #fff"
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

      h2.classList.add("typewriter")

      captureDiv.append(h2)

      typeWriter(text, 0)
      getSong(userData.emotions[userData.emotions.length-1])

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

  function getSong(obj) {
    let id =  obj.id
    let expression = obj.mood
    let specificEmotion = `http://localhost:3000/emotions/${id}/random_song`
    fetch(specificEmotion, {
      method: "GET",
      mode: "cors",
      credentials: "same-origin",
    })
    .then(response => response.json())
    .then(data => appendCanvas(data))
  }

  function deslugify(slug) {
    return slug.split("_").join(" ")
  }

  //// APPEND VISUALIZER ///////////////////////////////////
  function appendCanvas(data) {
    const song = document.getElementById('song-details')
    song.innerText = `${deslugify(data.name)} - ${deslugify(data.artist)}`
    song.style.display = "inline"

    let audio = document.querySelector('audio')
    audio.crossOrigin = "anonymous";
    debugger
    audio.src =  `http://localhost:8000/audio/${data.name}-${data.artist}.mp3`

    audio.style.display = "block"
    // console.log('AUDIO.SRC(BLOB?): ', audio.src)
    // console.log('TYPEOF_AUDIO.SRC(BLOB?): ', typeof audio.src)

    const context = new AudioContext();
    let src = context.createMediaElementSource(audio);
    // console.log('MEDIA_ELEMENT_SRC: ', src);
    const analyser = context.createAnalyser();
    const canvasDiv = document.getElementById('canvas-container')
    const canvas = document.getElementById("visualizer");

    canvasDiv.hidden = false
    const ctx = canvas.getContext("2d");

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 32768;
    const bufferLength = analyser.frequencyBinCount;
    console.log('BUFFER-LENGTH: ', bufferLength);

    const dataArray = new Uint8Array(bufferLength);
    console.log('DATA-ARRAY: ', dataArray)

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    console.log('WIDTH: ', WIDTH, 'HEIGHT: ', HEIGHT)

    const barWidth = (WIDTH / bufferLength) * 35.5;
    console.log('BARWIDTH: ', barWidth)
    let barHeight;
    let x = 0;

    function renderFrame() {
      requestAnimationFrame(renderFrame); // takes callback to invoke before rendering

      x = 0;

      analyser.getByteFrequencyData(dataArray); // copies current frequency data into an Unit8Array passed into it

      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      let r, g, b;

      for (let i = 0; i < WIDTH; i++) {
        barHeight = ((dataArray[i] / 1.9));

        if (dataArray[i] > 200){
          r = 0
          g = 50 * (i/bufferLength) + 160;
          b = 255
        } else if (dataArray[i] > 180){
          r = barHeight + (5000 * (i/bufferLength)) + 10
          g = 50 * (i/bufferLength) + 40
          b = 250
        } else if (dataArray[i] > 100){
          r = barHeight + (500 * (i/bufferLength))
          r = 0
          g = 50 * (i/bufferLength) + 130;
          b = 255
        } else if (dataArray[i] > 160){
          r = barHeight + ((i/bufferLength))
          g = 50 * (i/bufferLength) + 70
          b = 255
        } else if (dataArray[i] > 130){
          r = barHeight + ((i/bufferLength))
          g = 50 * (i/bufferLength) + 80
          b = 255
        } else if (dataArray[i] < 90){
          r = barHeight + (50 * (i/bufferLength))
          g = 50 * (i/bufferLength) + 100
          b = 255
        } else if (dataArray[i] < 60){
          r = barHeight + ((i/bufferLength))
          g = 50 * (i/bufferLength) + 30
          b = 255
        }
        // else {
        //   r = barHeight + (100 * (i/bufferLength));
        //   g = 50 * (i/bufferLength);
        //   b = 250;
        // }

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, (HEIGHT - barHeight), barWidth, barHeight);
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
