# Recognizer (Front-end)

## Idea: 
We wanted to create an app that will play a random song based on the user's current emotion: happiness, disgust, anger, neutral, sadness, surprise, or fear.
And a visualizer (collecting the audio frequency in real time) in the background as an added bonus.

## Solution: 
- MediaDevices API -- used to access the user's webcam.

- Face++ API -- used to detect the user's emotion based off a screenshot of the user's face.

- Taking that emotion response, grabbing the emotion name and finding the corresponding ID already created in our backend, we make a GET request to a custom 'http://localhost:3000/emotions/${id}/random_song' route that will pick out a sample in a list of songs that we have associated with each emotion. That response is then used to set the audio src (script.js line:238) that is pulling from the audio folder in the front-end (where the audio file actually lives). Audio plays, and a visualizer is drawn on canvas through the Web Audio API.


## How to use this app: 
A couple of easy steps-- 
1. Clone the backend: https://github.com/gg-1414/recognizer-backend
  - Run in terminal: rails db:migrate 
  - In recognizer-backend/db/seeds.rb, replace all Song seed data with your own audio files (just replace the name, artist, and id number of the emotion group you think it belongs in).
  E.g. Song.create(name: 'Sober', artist: 'Childish Gambino', emotion_id:1)
  - Run in terminal: rails db:seed
  - Run in terminal: rails s (to start the server on localhost:3000, make sure it's running in the background)
2. Clone this repo.
  - As you probably have noticed, the audio file is empty. Fill it with your audio files.
  - Make sure your audio files are in the format: 
    'Artist_Name-Song_Name.mp3'
    (E.g. 'Childish_Gambino-Sober.mp3')
  - Run in terminal: python python-cors-server.py (running on a local python server due to CORS issues).
  - Open 'localhost:8000' in your browser.
  
  HAVE FUN ! :)



### Resources: 

Face++ API 
https://www.faceplusplus.com/

Web Audio API 
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

