var Movimiento = 0.0;

// MQTT Setup
var mqtt = require('mqtt');
console.log("Connecting to MQTT broker...");
var mqtt = require('mqtt');
var options = {
  port: 1883,
  host: '192.168.0.56',
  clientId: 'Sonoff1Movimiento'
};
var client = mqtt.connect(options);
console.log("Sonoff1Movimiento Connected to MQTT broker");
client.subscribe('Sonoff1Movimiento');
client.on('message', function(topic, message) {
  console.log(parseFloat(message));
  Movimiento = parseFloat(message);
});

var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;



// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:Sonoff1Movimiento');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('Sensor PIR Sonoff', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "09:5D:9C:9F:8E:FA";
sensor.pincode = "031-45-154";

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.MotionSensor, "PIR-Sensor")
  .getCharacteristic(Characteristic.MotionDetected)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, Movimiento);
  });

setInterval(function() {
  
  
  // update the characteristic value so interested iOS devices can get notified
  sensor
    .getService(Service.MotionSensor)
    .setCharacteristic(Characteristic.MotionDetected,Movimiento);
  
}, 5000);
