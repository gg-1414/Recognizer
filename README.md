# recognizer-fe

Using the Face++ API, our Mod 3 final project takes a webcam screenshot of the user, 
displays the emotion detected by the API, and plays a song based on that emotion. 
(Also displays a visualizer in the background using the Web Audio API)


Rails Backend: 
https://github.com/gg-1414/recognizer-backend

*** We uploaded our own song files into an audio folder, and ran the application on a python local server due to CORS issues.

Run in your terminal: 'python python-cors-server.py'
Then open in your browser: 'localhost8000' 

Also, make sure your audio files are in the format: 
'Artist_Name-Song_Name.mp3'
(Ex: 'Childish_Gambino-Sober.mp3')

And create a song instance in the seed file:
'Song.create(name: 'Name Of Song', artist: 'Artist Name', emotion_id: (look at emotion instances to find id))'
(Ex: 'Song.create(name: 'Sober', artist: 'Childish Gambino', emotion_id:1)')

And don't forget to 'rails db:migrate && rails db:seed' in terminal!

##################################################

Resources: 

Face++ API 
https://www.faceplusplus.com/

Web Audio API 
https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

