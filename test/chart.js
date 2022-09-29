window.onload = () => {
    const colors = ['red', 'blue', 'green', 'orange', 'lightgreen', 'lightblue', 'silver', 'black', 'grey']
    const rndColor = () => colors[Math.floor(Math.random() * colors.length)]
    const el = document.getElementById('chart')
    const dataTemperature = [] 
    const dataWorkingSet = []
    let startTime = Date.now();
    const chart = new TimeChart(el, {
        series: [
            {data: dataTemperature, name: 'temperature', color: rndColor()},
            {data: dataWorkingSet, name: 'workingSet', color: rndColor()}
        ],
        baseTime: startTime,
        lineWidth: 5
        //baseTime: startTime
    });
    let numPoints = 0
    window.setInterval( () => {
        const now = Date.now() - startTime
        dataTemperature.push({x:now, y: Math.random()})
        dataWorkingSet.push({x:now, y: Math.random()})
        chart.update()
        numPoints++
        if (numPoints>10) {
            dataTemperature.shift()
            dataWorkingSet.shift()
        }

    }, 1000)
}