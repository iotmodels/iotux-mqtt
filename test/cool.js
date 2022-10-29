import createClient from '../coolClient.js'

window.onload = async () => {
	const colors = ['red', 'blue', 'green', 'orange', 'lightgreen', 'lightblue', 'silver', 'black', 'grey']
	const rndColor = () => colors[Math.floor(Math.random() * colors.length)]
	const el = document.getElementById('chart')
	const dataManagedMemory = [] 
	const dataWorkingSet = []
	let startTime = Date.now();
	const chart = new TimeChart(el, {
			series: [
					{data: dataManagedMemory, name: 'temperature', color: rndColor()},
					{data: dataWorkingSet, name: 'workingSet', color: rndColor()}
			],
			baseTime: startTime,
			lineWidth: 5
			//baseTime: startTime
	});
	let numPoints = 0
	
	const client = await createClient('e4k')
	client.subscribe('device/#')
	client.onMessageArrived = m => {
		console.log(m.destinationName, m.payloadString)
		const now = Date.now() - startTime
		const topic = m.destinationName
		if (topic.indexOf('telemetry') > 0) {
			const dataObj = JSON.parse(m.payloadString)
			if (topic.endsWith('workingSet')) dataWorkingSet.push({x: now, y: parseFloat(dataObj.workingSet)})
			if (topic.endsWith('managedMemory')) dataManagedMemory.push({x:now, y: parseFloat(dataObj.managedMemory)})
		}
		chart.update()
	}
}

