// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: magic;
async function fetchBlynk(token){
    //const req = "http://blynk-cloud.com/ztbiefZ3q7ToS4JnT6auO-I8-8GYy6tD/project"
    const req = "http://blynk-cloud.com/" + token + "/project"
    const data = await new Request(req).loadJSON()

    return {
        device : data.devices[0].boardType,
        connectionType : data.devices[0].connectionType,
        temperature : Math.round(data.widgets[0].value),
        humidity : data.widgets[1].value,
        devBattery : data.widgets[2].value,
        sceneStatus : data.widgets[3].value
    }
}
const token = "ztbiefZ3q7ToS4JnT6auO-I8-8GYy6tD"
const myData = await fetchBlynk(token)
console.log(myData.device+ " " + myData.connectionType)
console.log(`Temperature: ${myData.temperature} `)
console.log(`Humidity: ${myData.humidity} `)
console.log(`Battery: ${myData.devBattery} `)
console.log(`Scene: ${myData.sceneStatus} `)



  