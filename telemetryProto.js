const gbid = id => document.getElementById(id)

let mqttCreds = JSON.parse(window.localStorage.getItem('mqttCreds'))
let client
let deviceId
let modelId

let Telemetries
const start = async () => {

    const qs =  new URLSearchParams(window.location.search)
    deviceId = qs.get('id')
    modelId  = qs.get('modelId')
   

    const root = await protobuf.load(modelId)
    Telemetries = root.lookupType('Telemetries')
    
    const el = document.getElementById('chart')
    const dataPoints = new Map()
    const series = []
    Object.keys(Telemetries.fields).forEach( t => {
        dataPoints[t] = []
        series.push({ name: t, data: dataPoints[t]})
    })

    let startTime = Date.now();
    const chart = new TimeChart(el, {
        series: series,
        lineWidth: 5
        //baseTime: startTime
    });

 
   
    client = mqtt.connect(`${mqttCreds.useTls ? 'wss' : 'ws'}://${mqttCreds.hostName}:${mqttCreds.port}/mqtt`, {
                clientId: mqttCreds.clientId + 1, username: mqttCreds.userName, password: mqttCreds.password })
                client.on('connect', () => {
                    client.subscribe(`device/${deviceId}/tel`)
                })
                
    let i =0
    client.on('message', (topic, message) => {
        console.log(topic)
        const segments = topic.split('/')
        const what = segments[2]
        if (what === 'tel') {
            const tel = Telemetries.decode(message)
            Object.keys(Telemetries.fields).forEach(t => {
                if (tel[t]) {
                    dataPoints[t].push({x: i++, y: tel[t]})
                }
            })
            Object.keys(dataPoints).forEach(k => {               
                if (dataPoints[k].length > 100) {
                    dataPoints[k].shift()
               }
            })
            chart.update()
        }
    })
}
window.onload = start
