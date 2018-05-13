/**
 * control --- broker --- node
 * ----------------------------
 * command
 * [control]--- qos0, retain false ---> [broker]  qos0, retain false ---> [node]
 * 
 * <message>
 * target
 * source
 * typeMessage (command / respond)
 * id [id command same with id respond]
 * data
 * 
 * 
 * 
 * 
 * respond 1 
 * [control] <--- qos1, retain true <--- [broker]
 * target
 * source
 * typeMessage [respond] (command / respond)
 * meesageId [id command same with id respond]
 * payload
 * 
 * 
 * respond  2
 * [broker] <--- qos1, retain true <--- [node]
 * target
 * source
 * typeMessage [respond] (command / respond)
 * meesageId [id command same with id respond]
 * payload
 * 
 * 
 * if message outgoing is from broker or node, it must use  qos1 for guarantee delivery status.
 * if message outgoing from control or broker it must use qos 0 with respond message with qos 0 too it message received.
 * 
 * 
 * publish topic === clientId === username
 * 
*      control Id
 *          value
 * 
 *      event Id
 *          value
 * 
 * 
 * Model communication is 
 * control, respond
 * control, respond, respond 1, respond 2, respond n
 * control
 * 
 * event, respond
 * event, respond, respond 1, respond 2, respond n
 * event
 * 
 * 
 * addressing subscribe methode for control :
 * /deviceId/c/controlId --> always use Qos 0 with respond QoS 1 + retain
 * 
 * 
 * addressing subscribe methode for event respond :
 * /deviceId/e/eventId --> always use QoS 1 with retain 
 * 
 * 
 * will --> describe last error connection
 * 
 * example control lamp in control id 0 and value on with logic 1:
 *----------------------------
 *      [Control]
 *----------------------------
 * /esp8266/c/0
 * 
 * Payload :
 * {
 * "f"  : "phone1",
 * "id" : "aaba",
 * "val": "1"
 * }
 * 
 *----------------------------
 *      [RESPOND]
 *----------------------------
 * /phone1/c/0
 * 
 * Payload :
 * {
 * "f"  : "esp8266",
 * "id" : "aabb",
 * "res": "proses"
 * }
 * 
 *----------------------------
 *      [RESPOND]
 *----------------------------
 * /phone1/c/0
 * 
 * Payload :
 * {
 * "f"  : "esp8266",
 * "id" : "aabc",
 * "res": "nyala berhasil"
 * }
 * 
 * 
 *----------------------------
 *      [EVENT]
 *----------------------------
 * addressing publish methode for event:
 * /brod/e/0
 * {
 * "f"   : "esp8266",
 * "id"  : "asd",
 * "val" : "900"
 * }
 * 
 *----------------------------
 *      [RESPOND]
 *----------------------------
 * /esp8266/e/0
 * {
 * "f"  : "brod",
 * "id" : "ase",
 * "res": "1"
 * }
 * 
 * addressing publish methode for control respond:
 * /deviceId/c/controlId
 * ---> 
 * 
 * 
 * 
 * Example
 * 1. Control from phone to node with error sending data success
 * 2. Data receive in Broker and data sent to node device
 * 
 * Possibility of Control 
 * 
 *       phone            broker              esp8266
 * 1     sent             forwarded           receive 
 * 2     sent             rto forwarded       not receive             
 * 3     sent             rto forwarded       received             
 * 4     sent             error forward       not receive
 * 5     error send       error forward       not receive         
 * 
 * ----------------------------Figure  1 -------------------------------
 * Control sent from phone to broker and then success to forward to node
 * Hand shake :
 * 
 *    Phone1                                        Broker                                  esp8266    
 *    [Salak request] QoS0 noRetain-->              <--[Salak ACK] QoS1 Retain              <--[Salak ACK] QoS1 Retain           
 *    /esp8266/c/0                                  /phone1/c/i/0                           /phone1/c/i/0                         
 *    {                                             {                                       {
 *     "f" : "phone1",                               "f" : "broker",                         "f" : "esp8266",                     
 *     "i" : "aaba",                                 "i" : "aaba"                            "i" : "aaba"
 *     "v" : 1                                      }                                       }
 *    }                                                                                    
 * 
 *                                                                                          <--[Salak Respond] QoS1 Retain
 *                                                                                          /phone1/c/0                         
 *                                                                                          {
 *                                                                                            "f" : "phone1",
 *                                                                                            "i" : "aaba",
 *                                                                                            "v" :  20 
 *                                                                                          }
 *      
 * 
 * ----------------------------Figure  2 -------------------------------
 * Control sent from phone to broker and then can't to forward to node and node realy not receive it
 * Hand shake :
 * 
 *    Phone1                                        Broker                                  esp8266    
 *    [Salak request] QoS0 noRetain-->              <--[Salak ACK] QoS1 Retain              
 *    /esp8266/c/0                                  /phone1/c/i/0                           
 *    {                                             {                                       
 *     "from"  : "phone1",                           "from"   : "broker",                   
 *     "id"    : "aaba",                             "id"     : "aaba"                      
 *     "value" : 1                                   "status" : "received"                  
 *    }                                             }                                       
 *  
 * 
 *                                                  <--[Salak respond] QoS 1                                        
 *                                                  /phone1/c/i/0                             
 *                                                  {                                        
 *                                                   "from"   : "broker",                    
 *                                                   "id"     : "aaba"                       
 *                                                   "status" : "rto"                        
 *                                                  }                                        
 *      
 * 
 * 
  * 
 * ----------------------------Figure  3 -------------------------------
 * Control sent from phone to broker and then rto to farward to node but node receive it
 * Hand shake :
 * 
 *    Phone1                                        Broker                                  esp8266    
 *    [Salak request] QoS0 noRetain-->              <--[Salak ACK] QoS1 Retain              
 *    /esp8266/c/0                                  /phone1/c/i/0                           
 *    {                                             {                                       
 *     "from"  : "phone1",                           "from"   : "broker",                   
 *     "id"    : "aaba",                             "id"     : "aaba"                      
 *     "value" : 1                                   "status" : "received"                  
 *    }                                             }                                       
 *  
 * 
 *                                                  <--[Salak respond] QoS 1                                        
 *                                                  /phone1/c/i/0                             
 *                                                  {                                        
 *                                                   "from"   : "broker",                    
 *                                                   "id"     : "aaba"                       
 *                                                   "status" : "rto"                        
 *                                                  }                                        
 *      
 *                                                                                          <--[Salak ACK] QoS1 Retain           
 *                                                                                          /phone1/c/i/0                         
 *                                                                                          {
 *                                                                                           "from"   : "broker",
 *                                                                                           "id"     : "aaba"
 *                                                                                           "status" : "received"
 *                                                                                          }
 * 
 * 
 *                                                                                          <--[Salak Respond] QoS1 Retain
 *                                                                                          /phone1/c/0                         
 *                                                                                          {
 *                                                                                            "from"  : "phone1",
 *                                                                                            "id"    : "aaba",
 *                                                                                            "value" :  20 
 *                                                                                          }
 *      
 * 
 * 
 * 
 * ----------------------------Figure  4 -------------------------------
 * Control sent from phone to broker and then node offline
 * Hand shake :
 * 
 *    Phone1                                        Broker                                  esp8266    
 *    [Salak request] QoS0 noRetain-->              <--[Salak ACK] QoS1 Retain              
 *    /esp8266/c/0                                  /phone1/c/i/0                           
 *    {                                             {                                       
 *     "from"  : "phone1",                           "from"   : "broker",                   
 *     "id"    : "aaba",                             "id"     : "aaba"                      
 *     "value" : 1                                   "status" : "received"                  
 *    }                                             }                                       
 *  
 * 
 *                                                  <--[Salak respond] QoS 1                                        
 *                                                  /phone1/c/i/0                             
 *                                                  {                                        
 *                                                   "from"   : "broker",                    
 *                                                   "id"     : "aaba"                       
 *                                                   "status" : "offline"                        
 *                                                  }                                        
 *      
 * 
 * 
 */


let dataPublihs = {}

let rtoToControlDevice = {
    target: 'esp',
    source: 'js',
    type: 'command',
    id: 'qwer',
    data: 'on'
}


var mosca = require('mosca');


var settings = {
    //   port: 1883
    interfaces: [{
        type: "mqtt",
        port: 3000
    },
    {
        type: "http",
        port: 9000,
        bundle: true
    }
    ]
};

var server = new mosca.Server(settings);

server.on('clientConnected', function (client) {
    console.log('Client connected \t|', client.id);
});




server.on('ready', setup);

function setup() {
    console.log('Mosca server is up and running\r\n');
    server.authenticate = authenticate;
    server.authorizePublish = authorizePublish;
    server.authorizeSubscribe = authorizeSubscribe;
}

// Accepts the connection if the username and password are valid
var authenticate = function (client, username, password, callback) {
    // var authorized = (username === 'alice' && password.toString() === 'secret');
    // if (authorized) client.user = username;
    client.user = username;
    console.log('Authentic \t\t|username ', username, ' pass ', password.toString(), ' client ', client.id);
    callback(null, true);
}




// In this case the client authorized as alice can publish to /users/alice taking
// the username from the topic and verifing it is the same of the authorized user
var authorizePublish = function (client, topic, payload, callback) {

    var targetID = topic.split('/')[1]
    var sourceId = payload.from
    var meesageId = payload.id
    farwardPackage(targetID, sourceId, meesageId, cb => {
        console.log(cb)
    })
    // console.log(JSON.stringify(client))
    // callback(null, client.user == topic.split('/')[1]);
    // console.log('Authorize publish\t|topic ', topic, ' user ', client.user, 'clinetId ', client.id, ' payload ', payload.toString());

    // console.log(JSON.stringify(payload))
    // server.publish()
    // console.log('---------------------------',JSON.stringify(payload))
    console.log('-------------------', JSON.stringify(payload.toString().toString()))


    callback(null, true);
}

// In this case the client authorized as alice can subscribe to /users/alice taking
// the username from the topic and verifing it is the same of the authorized user
var authorizeSubscribe = function (client, topic, callback) {
    console.log('Authorize subscribe\t\t|topic ', topic, ' client user ', client.user);
    callback(null, true);
}


server.on('clientDisconnected', function (client) {
    console.log('Client Disconnected     := ', client.id);
});


//

server.on('delivered', function (packet, client) {
    // console.log("delivered :=", packet);
});

server.on("error", function (err) {
    console.log(err);
});

server.on('published', function (packet) {
    // dataPublihs[packet.id]
    // console.log("Published :=",JSON.stringify(packet.payload.toString()) );
    // if (packet.topic == 'presence') {
    // var stringBuf = packet.payload.toString('utf-8');
    // console.log(packet.topic, '---------------------+++++++++++', packet.payload.toString())
    // if (packet.topic === 'esp') {
    //     var obj = JSON.parse(packet.payload.toString());
    //     console.log(obj);
    // }

    // }
});

// server.on('clientDisconnected', function (client) {
//     console.log('Client Disconnected     := ', client.id);
// });
function farwardPackage(targetID, sourceId, messageId, cb) {
    // if()
    console.log('clients ID   \t:', server.clients[targetID])
    if (server.clients[targetID] === undefined) {
        cb(false)
    } else {
        dataPublihs[sourceId + '_' + messageId] = {
            messageId: messageId,
            date: new Date(),
            gotAck: false
        }
        setTimeout(function () {
            if (dataPublihs[messageId].gotAck === false) {
                delete dataPublihs[messageId]
                cb(true)
            } else {
                delete dataPublihs[messageId]
                cb(false)
            }
        }, 3000);
    }

}