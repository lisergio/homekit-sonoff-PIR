var EstadoSonoff1estado = 0.0;
// MQTT Setup
var mqtt = require('mqtt');
console.log("Connecting to MQTT broker...");
var mqtt = require('mqtt');
var options = {
  port: 1883,
  host: '192.168.0.56',
  clientId: 'Sonoff1estadoPIR'
};
var client = mqtt.connect(options);
console.log("Sonoff1estadoPIR Connected to MQTT broker");
client.subscribe('Sonoff1estadoPIR');
client.on('message', function(topic, message) {
  console.log(parseFloat(message));
  EstadoSonoff1estadoPIR = parseFloat(message);
});
var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

// here's a fake hardware device that we'll expose to HomeKit
var SONOFF1ESTADOPIR = {
  powerOn: false,
  setPowerOn: function(on) { 
    console.log("Turning the Sonoff1estadoPIR %s!", on ? "on" : "off");
    if (on) {
      client.publish('Sonoff1estadoPIR', 'on');
      SONOFF1ESTADOPIR.powerOn = on;
   	}
    else {
	    client.publish('Sonoff1estadoPIR','off');
      SONOFF1ESTADOPIR.powerOn = false;
   };

  },
  identify: function() {
    console.log("Identify the light!");
  }
}

// Generate a consistent UUID for our light Accessory that will remain the same even when
// restarting our server. We use the `uuid.generate` helper function to create a deterministic
// UUID based on an arbitrary "namespace" and the word "Sonoff1estadoPIR".
var lightUUID = uuid.generate('hap-nodejs:accessories:Sonoff1estadoPIR');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake light.
var light = exports.accessory = new Accessory('Sonoff1estadoPIR', lightUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
light.username = "CB:1B:0C:AA:AA:00";
light.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
light
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Lisergio")
  .setCharacteristic(Characteristic.Model, "Sonoff1PIR")
  .setCharacteristic(Characteristic.SerialNumber, "00001");

// listen for the "identify" event for this Accessory
light.on('identify', function(paired, callback) {
  SONOFF1ESTADOPIR.identify();
  callback(); // success
});

// Add the actual Lightbulb Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
light
  .addService(Service.Lightbulb, "Sonoff1estadoPIR") // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    SONOFF1ESTADOPIR.setPowerOn(value);
    callback(); // Our fake Light is synchronous - this value has been successfully set
  });
  
// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
light
  .getService(Service.Lightbulb)
  .getCharacteristic(Characteristic.On)
  .on('get', function(callback) {
    
    // this event is emitted when you ask Siri directly whether your light is on or not. you might query
    // the light hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.
    var err = null; // in case there were any problems
    
    if (SONOFF1ESTADOPIR.powerOn) {
      console.log("Are we on? Yes.");
      callback(err, true);
    }
    else {
      console.log("Are we on? No.");
      callback(err, false);
    }

  });

client.on('message', function(topic, message) {
    console.log(String(message));
    if(String(message) == "SwitchedOn"){
        SONOFF1ESTADOPIR.powerOn = 1;
        client.publish('Sonoff1estadoPIR', 'on');
        console.log("value is on");
    }else if(String(message) == "SwitchedOff"){
        SONOFF1ESTADOPIR.powerOn = false;
        client.publish('Sonoff1estadoPIR', 'off');
        console.log("value is off");
    }
});

