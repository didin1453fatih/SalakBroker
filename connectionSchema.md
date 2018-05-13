#Connection Schema

  control --- broker --- node
  ----------------------------
  command
  [control]--- qos0, retain false ---> [broker]  qos0, retain false ---> [node]
  
  <message>
  target
  source
  typeMessage (command / respond)
  id [id command same with id respond]
  data
  
  
  
  
  respond 1 
  [control] <--- qos1, retain true <--- [broker]
  target
  source
  typeMessage [respond] (command / respond)
  meesageId [id command same with id respond]
  payload
  
  
  respond  2
  [broker] <--- qos1, retain true <--- [node]
  target
  source
  typeMessage [respond] (command / respond)
  meesageId [id command same with id respond]
  payload
  
  
  if message outgoing is from broker or node, it must use  qos1 for guarantee delivery status.
  if message outgoing from control or broker it must use qos 0 with respond message with qos 0 too it message received.
  
  
  publish topic === clientId === username
  
      control Id
           value
  
       event Id
           value
  
  
  Model communication is 
  control, respond
  control, respond, respond 1, respond 2, respond n
  control
  
  event, respond
  event, respond, respond 1, respond 2, respond n
  event
  
  
  addressing subscribe methode for control :
  /deviceId/c/controlId --> always use Qos 0 with respond QoS 1 + retain
  
  
  addressing subscribe methode for event respond :
  /deviceId/e/eventId --> always use QoS 1 with retain 
  
  
  will --> describe last error connection
  
  example control lamp in control id 0 and value on with logic 1:
 ----------------------------
       [Control]
 ----------------------------
  /esp8266/c/0
  
  Payload :
  {
  "f"  : "phone1",
  "id" : "aaba",
  "val": "1"
  }
  
 ----------------------------
       [RESPOND]
 ----------------------------
  /phone1/c/0
  
  Payload :
  {
  "f"  : "esp8266",
  "id" : "aabb",
  "res": "proses"
  }
  
 ----------------------------
       [RESPOND]
 ----------------------------
  /phone1/c/0
  
  Payload :
  {
  "f"  : "esp8266",
  "id" : "aabc",
  "res": "nyala berhasil"
  }
  
  
 ----------------------------
       [EVENT]
 ----------------------------
  addressing publish methode for event:
  /brod/e/0
  {
  "f"   : "esp8266",
  "id"  : "asd",
  "val" : "900"
  }
  
 ----------------------------
       [RESPOND]
 ----------------------------
  /esp8266/e/0
  {
  "f"  : "brod",
  "id" : "ase",
  "res": "1"
  }
  
  addressing publish methode for control respond:
  /deviceId/c/controlId
  ---> 
  
---------------- UP is deprecated ----------------------
0.0.1

#One way data flow salak device
This is consept from vueJS and modern frontEnd framework to make code smothe, sexy and readable.
In every salak device will be 2 action, control and just event.


#Control and Event
What is about control ?
Contol is data come in to node device and it must give respond to controlling source.
Control is flow data from broker to node device and give respond to broker.

What is about event ?
Event is just flow data from node device to broker not to phone1 if phone is subscribe too, it will receive it.

<!-- Income is data from broker to salak device and outcome is data from salak device to broker. -->


#Rooting an topic
For first, every salak device connected device must subscribe request for every topic related with manifest description.
1. Control
   /deviceId/c/controlId
2. Event
   /deviceId/e/eventId




#Manifest Description (Device Id is esp8266)
Manifest description is a text JSON who save in every SalakDevice. This have function to describe behavior and what can i controtl to this salak device.
This is stucture of salak ManifestDescription.

{
      "project_name": "Select LED",
      "description": "description of this device",
      "version":1
      "controls":[
            {
                  "id":0,
                  "type": "state",
                  "description":"",
                  "states":[
                        {
                            "name": "red",
                            "id": 0,
                            "description": "to select red LED"
                        },
                        {
                            "name": "gree",
                            "id": 1,
                            "description": "to select green LED"
                        },
                        {
                            "name": "blue",
                            "id": 2,
                            "description": "to select blue LED"
                        }
                  ],
                  "return": [
                        {
                            "name": "error LED",
                            "id": 0,
                            "description": "LED can't change"
                        },
                        {
                            "name": "Success change LED",
                            "id": 1,
                            "description": "success"
                        }
                    ]
            }
      ],
      "events":[
            {
                  "name":"termometer",
                  "id":0,
                  "description":"description",
                  "data_type":"float"
            }
      ]
}



#What is relation with topic ?
1. this device just subcribe all controls (Income data)
a. /esp8266/c/0








  
  
  Example
  1. Control from phone to node with error sending data success
  2. Data receive in Broker and data sent to node device
  
  Possibility of Control 
  
        phone            broker              esp8266
  1     sent             forwarded           receive 
  2     sent             rto forwarded       not receive             
  3     sent             rto forwarded       received             
  4     sent             error forward       not receive
  5     error send       error forward       not receive         
  
  ----------------------------Figure  1 -------------------------------
  Control sent from phone to broker and then success to forward to node
  Hand shake :
  
     Phone1                                        Broker                                  esp8266    
     [Salak request] QoS0 noRetain-->              <--[Salak ACK] QoS1 Retain              <--[Salak ACK] QoS1 Retain           
     /esp8266/c/0                                  /phone1/c/i/0                           /phone1/c/i/0                         
     {                                             {                                       {
      "from"  : "phone1",                           "from" : "broker",                      "from" : "esp8266",     
      "id"    : "aaba",                             "id"   : "aaba"                         "id"   : "aaba"
      "value" : 1                                  }                                       }
     }                                                                                    
  
                                                                                           <--[Salak Respond] QoS1 Retain
                                                                                           /phone1/c/0                         
                                                                                           {
                                                                                             "from"  : "phone1",
                                                                                             "id"    : "aaba",
                                                                                             "value" :  20 
                                                                                           }
       
  
  ----------------------------Figure  2 -------------------------------
  Control sent from phone to broker and then can't to forward to node and node realy not receive it
  Hand shake :
  
     Phone1                                        Broker                                  esp8266    
     [Salak request] QoS0 noRetain-->              <--[Salak ACK] QoS1 Retain              
     /esp8266/c/0                                  /phone1/c/i/0                           
     {                                             {                                       
      "from"  : "phone1",                           "from"   : "broker",                   
      "id"    : "aaba",                             "id"     : "aaba"                      
      "value" : 1                                   "status" : "received"                  
     }                                             }                                       
   
  
                                                   <--[Salak respond] QoS 1                                        
                                                   /phone1/c/i/0                             
                                                   {                                        
                                                    "from"   : "broker",                    
                                                    "id"     : "aaba"                       
                                                    "status" : "rto"                        
                                                   }                                        
       
  
  
   
  ----------------------------Figure  3 -------------------------------
  Control sent from phone to broker and then rto to farward to node but node receive it
  Hand shake :
  
     Phone1                                        Broker                                  esp8266    
     [Salak request] QoS0 noRetain-->              <--[Salak ACK] QoS1 Retain              
     /esp8266/c/0                                  /phone1/c/i/0                           
     {                                             {                                       
      "from"  : "phone1",                           "from"   : "broker",                   
      "id"    : "aaba",                             "id"     : "aaba"                      
      "value" : 1                                   "status" : "received"                  
     }                                             }                                       
   
  
                                                   <--[Salak respond] QoS 1                                        
                                                   /phone1/c/i/0                             
                                                   {                                        
                                                    "from"   : "broker",                    
                                                    "id"     : "aaba"                       
                                                    "status" : "rto"                        
                                                   }                                        
       
                                                                                           <--[Salak ACK] QoS1 Retain           
                                                                                           /phone1/c/i/0                         
                                                                                           {
                                                                                            "from"   : "broker",
                                                                                            "id"     : "aaba"
                                                                                            "status" : "received"
                                                                                           }
  
  
                                                                                           <--[Salak Respond] QoS1 Retain
                                                                                           /phone1/c/0                         
                                                                                           {
                                                                                             "from"  : "phone1",
                                                                                             "id"    : "aaba",
                                                                                             "value" :  20 
                                                                                           }
       
  
  
  
  ----------------------------Figure  4 -------------------------------
  Control sent from phone to broker and then node offline
  Hand shake :
  
     Phone1                                        Broker                                  esp8266    
     [Salak request] QoS0 noRetain-->              <--[Salak ACK] QoS1 Retain              
     /esp8266/c/0                                  /phone1/c/i/0                           
     {                                             {                                       
      "from"  : "phone1",                           "from"   : "broker",                   
      "id"    : "aaba",                             "id"     : "aaba"                      
      "value" : 1                                   "status" : "received"                  
     }                                             }                                       
   
  
                                                   <--[Salak respond] QoS 1                                        
                                                   /phone1/c/i/0                             
                                                   {                                        
                                                    "from"   : "broker",                    
                                                    "id"     : "aaba"                       
                                                    "status" : "offline"                        
                                                   }                                        
       
  
  
 