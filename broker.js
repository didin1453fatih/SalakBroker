
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