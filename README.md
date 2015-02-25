# flowerpower-mqtt
small node.js script to read directly (not using cloud api) Parrot Flower power sensor data using bluetooth and inject them in an mqtt broker

This script use 3 node.js library that need to be installed :
- The flower power reading lib : https://github.com/sandeepmistry/node-flower-power
- The mqtt lib : https://github.com/mqttjs/MQTT.js
- an hashmap lib : https://github.com/flesler/hashmap

All the hard work was done by those creators, I just simply connect every thing together :)

This script is intend to read Parrot flower power data and inject them in an mqtt broker. It was test on beaglebone black using debian, but must work on any linux including raspberry pi. I did test the result in pidome, but there is no reason it could no work with any smart home controller.

I'm using cron to execute the script at defined interval

I did test with only one flower power device, but the script must work with any device in range. Take a look at the begining of the script for configuration

TODO :
- add a properties file for configuration
- better documentation and tutorial to install it on a beaglebone/raspberry pi computer
