//import * as creds from './creds.js'

// const client = mqtt.connect(`wss://${creds.hostname}:8884/mqtt`, { 
//     clientId: creds.clientId + Date.now(), username: creds.username, password: creds.pwd })
import createClient from './coolClient.js'
let client
const isBuffer = obj => {
    return obj != null && obj.constructor != null &&
        typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

export default {
    data: () => ({
        hostName: '',
        config: '',
        devices: [],
        loading: true,
        error: '',
        connected: true
    }),
    async created() {
        console.log('config changed')
        client = await createClient('e4k')
        client.onMessageArrived = message => {
            const topic = message.destinationName
            console.log(topic)
            if (topic.startsWith('registry')) {
            const deviceId = topic.split('/')[1]
            const dix = this.devices.findIndex(d => d.deviceId === deviceId)
                const msg = JSON.parse(message.payloadString)
                // console.log(topic, msg)
                if (dix === -1) {
                    this.devices.push({ deviceId, status: msg.status, modelId: msg['model-id'], when: msg.when })
                } else {
                    this.devices[dix] = { deviceId, status: msg.status, modelId: msg['model-id'], when: msg.when }
                }
                this.devices.sort((a, b) => new Date(a.when) < new Date(b.when) ? 1 : -1)
            }
        }
        //client.subscribe('registry/+/status')
        client.subscribe('registry/#')
    },
    methods: {
       getDeviceUrl(d) {
            if (d.modelId.startsWith('dtmi')) {
                window.location.href = `device.html?id=${d.deviceId}&model-id=${d.modelId}`
            } else {
                window.location.href = `deviceProto.html?id=${d.deviceId}&model-id=${d.modelId}`
            }
        },
        removeDevice(did) {
            const topic = `registry/${did}/status`
            client.send(topic, '', 1, true )
            const dix = this.devices.findIndex(d => d.deviceId === did)
            this.devices.splice(dix, 1)
        },
        async onConfigChanged() {
            
        },
        disconnect() {
            const mqttCreds = JSON.parse(window.localStorage.getItem('mqttCreds'))
            mqttCreds.reconnect = false
            window.localStorage.setItem('mqttCreds', JSON.stringify(mqttCreds))
            this.connected = false
            client.end()
        },
        formatDate(d) {
            if (d === '0001-01-01T00:00:00Z') return ''
            return moment(d).fromNow()
        }
    }
}