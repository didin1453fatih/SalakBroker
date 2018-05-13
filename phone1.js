'use strict'

var mqtt = require('mqtt')

var clientId = 'phone1'

var host = 'mqtt://localhost:3000'

var options = {
  keepalive: 2,
  clientId: clientId,
  protocolId: 'MQTT',
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 1000,
  will: {
    topic: 'error',
    payload: 'Connection Closed abnormally..!',
    qos: 1,
    retain: false
  },
  username: 'phone1',
  password: 'pass',
  rejectUnauthorized: true
}




var client = mqtt.connect(host, options)

client.on('error', function (err) {
  console.log(err)
  client.end()
})

client.on('connect', function () {
  console.log('client connected:' + clientId)
})

client.subscribe('/phone1/c/0', { qos: 1 })



client.on('message', function (topic, message, packet) {
  console.log('Received Message:= ' + message.toString() + '\nOn topic:= ' + topic)
})

client.on('packetsend', function (a) {
  console.log('packetsend ', a)
})


client.on('close', function () {
  // mqtt.Store({ clean: true })
  client.queue = [];
  console.log(clientId + ' disconnected')
})




// var myVar = setInterval(myTimer, 5000);
let sendD = {
  from: 'phone1',
  id: 'asd',
  value: 10
}
// function myTimer() {
client.publish('/esp8266/c/0', JSON.stringify(sendD), { qos: 0, retain: false }, function (err) {
  console.log(err);
})
// }