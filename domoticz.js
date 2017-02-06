/**
 * topic where we will publish data into
 * %id% will be the id/uuid or the device
 * %topic% will be the dataName (see below)
 * 
 * you can omit the %id% safely if not needed (only one flowerpower) but %topic% is mandatory
 * 
 * exemple for pidome (you must replace with the groupid you choose) : 
 * 			"/hooks/devices/%id%/groupid/%topic%"; 
 */
//var TOPIC = "raw/devices/%id%/data/%topic%";
/**
 * URL adresse of the MQTT server
 */
//var BROKER_URL = "mqtt://127.0.0.1";

var HashMap = require('hashmap');
/**
 * Sometime you must use the id provided by another server/controller 
 * and not the uuid of your flowerpower
 * in that case you can add a matching key/value in this hashmap
 * ex idConvertion.set("a0143d0c980c", 18); // pidome provide you with an unique id
 * you can find your uuid/serialId in the flowerpower application
 * it's also shown in the console if you run the script !
 */
var idConvertion = new HashMap();
idConvertion.set("a0143d0c980c", 17);

/**
 * list of all dataName and their description
 */
// Version of the firmware
var FIRMWARE = "FIRMWARE";
// battery level in %
var BATTERY = "BATTERY";
// Sunlight in mol/m2/d (I don't know what does it mean).
var SUNLIGHT = "SUNLIGHT";
// Soil Electro conductovity
var SOIL_EC = "SOIL_EC";
// Soil Temperature in celcius
var SOIL_TEMP = "SOIL_TEMPERATURE";
// Air temperature in Celsius
var AIR_TEMP = "AIR_TEMPERATURE";
// Soil moisture (humidity) in %
var SOIL_MOISTURE = "SOIL_MOISTURE";
// same data but calibrated : I was not able to found information about this "calibrated" data vs raw data above.
var CAL_SOI_MOISTURE = "CALIBRATED_SOIL_MOISTURE";
var CAL_AIR_TEMP = "CALIBRATED_AIR_TEMPERATURE";
var CAL_SUNLIGHT = "CALIBRATED_SUNLIGHT";

var async = require('async');
var FlowerPower = require('flower-power');

//var mqtt    = require('mqtt');
//var client  = mqtt.connect(BROKER_URL);

//client.subscribe('presence');
//client.publish('presence', 'Hello mqtt');

var hasCalibratedData = false;
var uuid = "undefined";
/*
function publish (topic, payload) {
	if(idConvertion.has(uuid)) {
		id = idConvertion.get(uuid);
	}
	else {
		id = uuid;
	}
	fullTopic = TOPIC.replace("%id%", id).replace("%topic%", topic);
	console.log(fullTopic + ' ' + payload);
    client.publish(fullTopic, payload+'');
}
*/
FlowerPower.discover(function(flowerPower) {
  async.series([
    function(callback) {
    	// register exit function
      flowerPower.on('disconnect', function() {
        console.log('disconnected!');
        client.end();
        process.exit(0);
      });
      // connected to the flower power
      console.log('serial id of this flowerpower : ' + flowerPower.uuid);
      uuid = flowerPower.uuid;
      console.log('connectAndSetup');
      flowerPower.connectAndSetup(callback);
    },
//    function(callback) {
//      flowerPower.readSystemId(function(systemId) {
//        console.log('\tsystem id = ' + systemId);
//        callback();
//      });
//    },
    function(callback) {
	    flowerPower.readFirmwareRevision(function(firmwareRevision) {
	      console.log('\tfirmware revision = ' + firmwareRevision);
	
	      var version = firmwareRevision.split('_')[1].split('-')[1];
	
	      hasCalibratedData = (version >= '1.1.0');
	      publish(FIRMWARE, firmwareRevision);
	      callback();
	    });
	  },
    function(callback) {
      flowerPower.readBatteryLevel(function(batteryLevel) {
        console.log('battery level = ' + batteryLevel);
        publish(BATTERY, batteryLevel);
        callback();
      });
    },
    function(callback) {
      flowerPower.readSunlight(function(sunlight) {
        console.log('sunlight = ' + sunlight.toFixed(2) + ' mol/m2/d');
        publish(SUNLIGHT, sunlight.toFixed(2));
        callback();
      });
    },
    function(callback) {
      flowerPower.readSoilElectricalConductivity(function(soilElectricalConductivity) {
        console.log('soil electrical conductivity = ' + soilElectricalConductivity.toFixed(2));
        publish(SOIL_EC, soilElectricalConductivity);
        callback();
      });
    },
    function(callback) {
      flowerPower.readSoilTemperature(function(temperature) {
        console.log('soil temperature = ' + temperature.toFixed(2) + ' C');
        publish(SOIL_TEMP, temperature.toFixed(2));
        callback();
      });
    },
    function(callback) {
      flowerPower.readAirTemperature(function(temperature) {
        console.log('air temperature = ' + temperature.toFixed(2) + ' C');
        publish(AIR_TEMP, temperature.toFixed(2));
        callback();
      });
    },
    function(callback) {
      flowerPower.readSoilMoisture(function(soilMoisture) {
        console.log('soil moisture = ' + soilMoisture.toFixed(2) + '%');
        publish(SOIL_MOISTURE, soilMoisture.toFixed(2));
        callback();
      });
    },
    function(callback) {
      if (hasCalibratedData) {
        async.series([
          function(callback) {
            flowerPower.readCalibratedSoilMoisture(function(soilMoisture) {
              console.log('calibrated soil moisture = ' + soilMoisture.toFixed(2) + '%');
              publish(CAL_SOI_MOISTURE, soilMoisture.toFixed(2));
              callback();
            });
          },
          function(callback) {
            flowerPower.readCalibratedAirTemperature(function(temperature) {
              console.log('calibrated air temperature = ' + temperature.toFixed(2) + ' C');
              publish(CAL_AIR_TEMP, temperature.toFixed(2));
              callback();
            });
          },
          function(callback) {
            flowerPower.readCalibratedSunlight(function(sunlight) {
              console.log('calibrated sunlight = ' + sunlight.toFixed(2) + ' mol/m2/d');
              publish(CAL_SUNLIGHT, sunlight.toFixed(2));
              callback();
            });
          },
          function() {
            callback();
          }
        ]);
      } else {
        callback();
      }
    },
    function(callback) {
      console.log('disconnect');
      flowerPower.disconnect(callback);
    }
  ],
  function(err, results) {
  	if (err == null) {
  		console.log("no error");
  	}
  	else {
  		console.log("Erreur : " + err);
  	}
  });
});
