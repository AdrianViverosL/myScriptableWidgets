// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: magic;

//Collection of Colors used in the widget style
const COLORS = {
    blynk : '#2edbad',
    bg1 : '#29323c',
    bg2 : '#1c1c1c'
}

const token = "ztbiefZ3q7ToS4JnT6auO-I8-8GYy6tD"
const myData = await fetchBlynk(token)
let widget = await createWidget(myData)

if (!config.runsInWidget){
    await widget.presentSmall()
}

Script.setWidget(widget)
Script.complete()

/******************************************************************************
 * Main Functions (Widget and Data-Fetching)
 *****************************************************************************/

/**
 * Main widget function.
 * 
 * @param {} data The data for the widget to display
 */

async function createWidget(data){

    const widget = new ListWidget()
    const bgColor = new LinearGradient()
    bgColor.colors = [new Color(COLORS.bg1), new Color(COLORS.bg2)]
    bgColor.locations = [0.0, 1.0]
    widget.backgroundGradient = bgColor;
    //widget.addSpacer(5)


    const timeFormatter = new DateFormatter();
    timeFormatter.locale = "en";
    timeFormatter.useNoDateStyle();
    timeFormatter.useShortTimeStyle();

    const title = widget.addText("Blynk")
    title.font = Font.boldSystemFont(24)
    title.textColor = new Color(COLORS.blynk)
    widget.addSpacer(5)
    
    
    const dateLine = widget.addText(`${timeFormatter.string(new Date())}`);
    dateLine.font = Font.boldSystemFont(10)
    dateLine.textColor = Color.white();
    dateLine.textOpacity = 0.7;
    
    /*    
    const battLine = widget.addText(`Battery: ${data.devBattery}%`)
    battLine.font = Font.boldSystemFont(12)
    battLine.textColor = Color.white()
    */

    const tempLine = widget.addText(`${data.temperature}ºC`)
    tempLine.font = Font.regularSystemFont(33)
    tempLine.textColor = Color.white()

    const tempLabel = widget.addText(`Temperature`)
    tempLabel.font = Font.lightSystemFont(12)
    tempLabel.textColor = Color.white()

    widget.addSpacer(10)

    const deviceLine = widget.addText(`${data.device}`)
    deviceLine.font = Font.mediumSystemFont(12)
    deviceLine.textColor = Color.white()

    const connectionLine = widget.addText(`${data.connectionType} at home`)
    connectionLine.font = Font.mediumSystemFont(12)
    connectionLine.textColor = Color.white()
    /*
    const humLine = widget.addText(`Humidity: ${data.humidity}%`)
    humLine.font = Font.boldSystemFont(12)
    humLine.textColor = Color.white()
    */
    return widget
}




/**
 * This function is used to fetch the current data from the Blynk's API
 * need a token which is de API key from the web app
 * @param {*} token 
 * @returns an object composed by all relevant data from the device in Blynk's App
 */
async function fetchBlynk(token){
    //const req = "http://blynk-cloud.com/ztbiefZ3q7ToS4JnT6auO-I8-8GYy6tD/project"
    const req = "http://blynk-cloud.com/" + token + "/project"
    const data = await new Request(req).loadJSON()

    return {
        device : data.devices[0].boardType,
        connectionType : data.devices[0].connectionType,
        temperature : Math.round(data.widgets[0].value * 100) / 100,
        humidity : data.widgets[1].value,
        devBattery : data.widgets[2].value,
        sceneStatus : data.widgets[3].value
    }
}

/** 
const token = "ztbiefZ3q7ToS4JnT6auO-I8-8GYy6tD"
const myData = await fetchBlynk(token)
console.log(myData.device+ " " + myData.connectionType)
console.log(`Temperature: ${myData.temperature} `)
console.log(`Humidity: ${myData.humidity} `)
console.log(`Battery: ${myData.devBattery} `)
console.log(`Scene: ${myData.sceneStatus} `)

*/

  