'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()

app.set('port', (process.env.PORT || 5000))

//Allows us to process the data
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//ROUTES
app.get('/', (req,res) => res.send("Hi I am a chatbot"))

let token = "EAAGLiq7JIqoBADKPuEK6fVFozEkbWtm1cmRnP2nRtzoRDTWoUKEZBZCJRks7BsCcAobvrBam6EVi3KPqDMRqeHVPZC8TAVzqb0QOJgBF1Ifx6JnIPo0M8Lj9wlY5EXYBPEVZBhH3lNOmUZBP6yypbR9ZBeCTSaLLZCAGZCIVM8m2rfr3qSwdmN8zheZBW8ABGYEEZD"

// Facebook
app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === "pass"){
        res.send(req.query['hub.challenge'])
    }
    res.send("Wrong token")
})

app.post('/webhook/', (req, res) => {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++){
        let event = messaging_events[i]
        let sender = event.sender.id
        if (event.message && event.message.text){
            let text = event.message.text
            //sendText(sender, "Text echo: " + text.substring(0, 100))
            decideMessage(sender, text)
        }
        if (event.postback){
            let text = JSON.stringify(event.postback)
            decideMessage(sender, text)
            continue
        }
    }
    res.sendStatus(200)
})

function decideMessage(sender, text1){
    let text = text1.toLowerCase()
    if(text.includes("pocetak")){
      sendText(sender, "Dobrodošli!!!!")
      sendButtonMessage(sender, "Što želite jesti?")
    }
    if(text.includes("summer")){
        sendImageMessage(sender)
    } else if (text.includes("winter")){
        carousel(sender)
    } /*else{
        sendText(sender, "Dobrodošli!")
        sendButtonMessage(sender, "Što želite jesti?")
    }*/
}

function sendText(sender, text){
    let messageData = {text: text}
    sendRequest(sender, messageData)
}

function sendButtonMessage(sender, text){
    let messageData = {
        "attachment":{
            "type":"template",
            "payload":{
              "template_type":"button",
              "text": text,
              "buttons":[
                {
                    "type":"postback",
                    "title":"Slana jela",
                    "payload":"winter"
                },
                {
                  "type":"postback",
                  "title":"Slatka jela",
                  "payload":"summer"
                }
              ]
            }
        }
    }
    sendRequest(sender, messageData)
}

function sendImageMessage(sender){
    let messageData = {
        "attachment":{
          "type":"image", 
          "payload":{
            "url":"https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/beautiful-tropical-sunset-scenery-two-sun-beds-royalty-free-image-1595368231.jpg", 
            "is_reusable":true
          }
        }
    }
    sendRequest(sender, messageData)
}

function carousel(sender){
    let messageData = {
        "attachment":{
          "type":"template",
          "payload":{
            "template_type":"generic",
            "elements":[
               {
                "title":"Ćevapi",
                "image_url":"https://cdn.agroklub.com/upload/images/text/thumb/travnicki-cevap-880x495.jpg",
                "subtitle":"Mala porcija. \n 4 KM",
                "default_action": {
                  "type": "web_url",
                  "url": "https://petersfancybrownhats.com/view?item=103",
                  "webview_height_ratio": "tall",
                },
                "buttons":[
                  {
                    "type":"web_url",
                    "url":"https://petersfancybrownhats.com",
                    "title":"Naruči!"
                  }
                ]      
              },
              {
                "title":"Pizza",
                "image_url":"https://previews.123rf.com/images/lsvslv/lsvslv1812/lsvslv181200213/114670761-italian-pizza-margherita-with-tomatoes-and-mozzarella-cheese-on-wooden-cutting-board-close-up.jpg",
                "subtitle":"Capricciosa (Miješana) \n 7 KM",
                "default_action": {
                  "type": "web_url",
                  "url": "https://wikipedia.org",
                  "webview_height_ratio": "tall",
                },
                "buttons":[
                  {
                    "type":"web_url",
                    "url":"https://en.wikipedia.org/wiki/Aruba",
                    "title":"Naruči!"
                  }             
                ]      
              }
            ]
          }
        }
      }
      sendRequest(sender, messageData)
}

function sendGenericMessage(sender){
    let messageData = { "attachment":{
        "type":"template",
        "payload":{
          "template_type":"generic",
          "elements":[
             {
              "title":"Winter",
              "image_url":"https://upload.wikimedia.org/wikipedia/commons/7/72/Snow_Scene_at_Shipka_Pass_1.JPG",
              "subtitle":"I love Winter!",
              /*"default_action": {
                "type": "web_url",
                "url": "https://petersfancybrownhats.com/view?item=103",
                "webview_height_ratio": "tall",
              },*/
              "buttons":[
                {
                  "type":"web_url",
                  "url":"https://en.wikipedia.org/wiki/Winter",
                  "title":"More about winter!"
                }              
              ]      
            }
          ]
        }
      }
    }
    sendRequest(sender, messageData)
}

function sendRequest(sender, messageData){
    request({
        url: "https://graph.facebook.com/v9.0/me/messages",
        qs: {access_token: token},
        method: "POST",
        json:{
            recipient: {id: sender},
            message: messageData
        }
    }, function(error, response, body){
        if(error){
            console.log("sending error")
        } else if(response.body.error){
            console.log("response body error")
        }
    })
}

app.listen(app.get('port'), function(){
    console.log("running: port")
})
