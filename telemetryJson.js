import createClient from './coolClient.js'
const gbid = id => document.getElementById(id)

const repoBaseUrl = 'https://iotmodels.github.io/dmr/' // 'https://devicemodels.azure.com'
const dtmiToPath = function (dtmi) {
    return `${dtmi.toLowerCase().replace(/:/g, '/').replace(';', '-')}.json`
}

const colors = ['red', 'blue', 'green', 'orange', 'lightgreen', 'lightblue', 'silver', 'black', 'grey']
const rndColor = () => colors[Math.floor(Math.random() * colors.length)]

let mqttCreds = JSON.parse(window.localStorage.getItem('mqttCreds'))
let client
let deviceId
let modelId

let Telemetries

const start = async () => {

    const qs =  new URLSearchParams(window.location.search)
    deviceId = qs.get('id')
    modelId  = qs.get('modelId')
   
    const modelpath = `${repoBaseUrl}${dtmiToPath(modelId)}`
    const model = await (await window.fetch(modelpath)).json()

    Telemetries = model.contents.filter(c => c['@type'].includes('Telemetry'))
    
    const el = document.getElementById('chart')
    const dataPoints = new Map()
    const series = []
    Telemetries.map(t => t.name).forEach( t => {
        dataPoints[t] = []
        series.push({ name: t, data: dataPoints[t], color: rndColor()})
    })

    let startTime = Date.now();
    const chart = new TimeChart(el, {
        series: series,
        lineWidth: 5,
        baseTime: startTime
    });

 
   
    // client = mqtt.connect(`${mqttCreds.useTls ? 'wss' : 'ws'}://${mqttCreds.hostName}:${mqttCreds.port}/mqtt`, {
    //             clientId: mqttCreds.clientId + 1, username: mqttCreds.userName, password: mqttCreds.password })
    //             client.on('connect', () => {
    //                 client.subscribe(`device/${deviceId}/telemetry/#`)
    //             })
    client = await createClient('e4k')
    client.subscribe(`device/${deviceId}/telemetry/#`)
    client.onMessageArrived = message => {
        //console.log(topic)
        const topic = message.destinationName
        const segments = topic.split('/')
        const what = segments[2]
        if (what === 'telemetry') {
            let now = Date.now() - startTime
            const tel = JSON.parse(message.payloadString)
            Telemetries.map(t => t.name).forEach(t => {
                if (tel[t]) {
                    dataPoints[t].push({x: now, y: tel[t]})
                }
            })
            Object.keys(dataPoints).forEach(k => {               
                if (dataPoints[k].length > 100) {
                    dataPoints[k].shift()
               }
            })
            chart.update()
        }
    }
}
window.onload = start
