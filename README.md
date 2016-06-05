# Twitchly.co - Twitch Chat Monitor

![Twitchly](http://content.screencast.com/users/shtefcs/folders/Jing/media/c89c2090-ef2f-49d6-aa40-e6399169b056/2016-06-02_1505.png)

**Twitchly** is side project of Vanila Team which monitor twhich chat channels and provide some stats.

Main idea for this project was to get idea how fast twitch chat is, or whats most popular word.

As being on Twitch Chat last 5 years 24/7, I (Stefan Smiljkovic), wanted to extract some interesting stats from twitch chat.

With 100+ milion monthly unqiue users, Twitch can be great platform to analyze and experiment.

---

## Demo
To see current demo in action go to http://twitchly.co

## Features
- Total message counting from the start of the app
- Average chat speed (messages/second)
- Most typed word
- Top speaker (user who write most)
- Top 10 channels sorted by chat speed m/s
- Saving data in MongoDB
- Display data over selected time period
- Can't remember others, but will soon

## Install
* First, you need the latest Node.js (LTS or mainstream) with NPM.
* Clone the repository.
* Run ```npm install```.
* Copy ```config.default.json``` to ```config.json``` or open ```config.json``` if it already exist.
* Edit the configuration file according to your needs :
    * Events channel is an array defining which channels are classified as events and are hosted on differents servers.
    * ```serve-port``` define the public http port.
    * ```socketio-port``` define the ```Socket.io``` listening port (usually same as ```serve-port```)
    * ```url``` define on which url your app will be reachable.
    * ```twitch username``` is your username on twitch
    * ```twitch oauth-password" is your token. You can get yours at [http://www.twitchapps.com/tmi/](http://www.twitchapps.com/tmi/).
    * ```debug-mode" let you show more info into the console.
* Then you may be able to run the app with ```node main.js```.
