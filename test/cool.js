const MQTT_COOL_URL = 'http://52.149.245.54:8080'
mqttcool.openSession(MQTT_COOL_URL, '', '', {

      onConnectionFailure: function(errorType, errorCode, errorMessage) {
        console.error('MQTT.Cool connection failure ' + errorType + errorMessage);
      },
      onConnectionSuccess: function(mqttCoolSession) {
        mqttClient = mqttCoolSession.createClient('tcp://azedge-dmqtt-frontend:1883', 'client1');
  
        mqttClient.connect({
          username: 'client1',
          password : 'password',
          onSuccess: function() {
            // Upon successful connection, subscribe to telemetry topics.
            mqttClient.subscribe('registry/+/status');
          },
  
          onFailure: function(response) {
            console.log(response.errorMessage + ' [code=' + response.errorCode +
              ']');
          }
        })

        mqttClient.onMessageArrived = m => {
            console.log(m)
        }
    }
})
