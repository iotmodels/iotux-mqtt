const MQTT_COOL_URL = 'http://localhost:8080'
const createClient = async alias => {
	return new Promise((resolve, reject) => {
		mqttcool.openSession(MQTT_COOL_URL, '', '', {
			onConnectionFailure: (errorType, errorCode, errorMessage) => console.error('MQTT.Cool connection failure ' + errorType, errorCode, errorMessage),
			onConnectionSuccess: mqttCoolSession => {
				const mqttClient = mqttCoolSession.createClient(alias);
				mqttClient.connect({
					onSuccess: () => resolve(mqttClient),
					onFailure: response => reject(response)
				})
			}
		})
	})
}

export default createClient