// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: magic;

//Collection of Colors used in the widget style
const COLORS = {
    blynk : '#2edbad',
    bg1 : '#29323c',
    bg2 : '#1c1c1c'
}

const token = args.widgetParameter    //Pass the API token through the WidgetParameter
const myData = await fetchBlynk(token)
let widget = await createWidget(myData)
//config.widgetFamily = config.widgetFamily || 'medium'

if (!config.runsInWidget){
    switch(config.widgetFamily){
        case 'small' : await widget.presentSmall(); break;
        case 'medium' : await widget.presentMedium(); break;
        case 'large' : await widget.presentLarge(); break;
    }
}else{
    //Display the widget
    Script.setWidget(widget)
    Script.complete()
}

/******************************************************************************
 * Functions (Widget and Data-Fetching)
 *****************************************************************************/

/**
 * Create widget function.
 * 
 * @param {} data The data for the widget to display
 */

async function createWidget(data){
    let widgetSize = config.widgetFamily    //Retrieves the size of the widget
    if(widgetSize == 'medium'){
        const widget = new ListWidget()
        widget.setPadding(10,10,10,10)
        const bgColor = new LinearGradient()
        bgColor.colors = [new Color(COLORS.bg1), new Color(COLORS.bg2)]
        bgColor.locations = [0.0, 1.0]
        widget.backgroundGradient = bgColor;
            
        const timeFormatter = new DateFormatter();
        timeFormatter.locale = "en";
        timeFormatter.useNoDateStyle();
        timeFormatter.useShortTimeStyle();

        let titleRow = widget.addStack() //create a row for the title info
        titleRow.centerAlignContent()
        const title = titleRow.addText("Blynk")
        title.font = Font.boldSystemFont(24)
        title.textColor = new Color(COLORS.blynk)
        titleRow.addSpacer()
            
        const dateLine = titleRow.addText(`${timeFormatter.string(new Date())}`);
        dateLine.font = Font.boldSystemFont(10)
        dateLine.textColor = Color.white();
        dateLine.textOpacity = 0.7;
            
        widget.addSpacer(8)

        let row = widget.addStack() //Create a row of columns

        batteryColumn = row.addStack()
        batteryColumn.layoutVertically()
        batteryColumn.centerAlignContent()

        const batteryLine = batteryColumn.addText(`${data.devBattery}%`)
        batteryLine.font = Font.regularSystemFont(33)
        batteryLine.textColor = Color.white()

        const batteryLabel = batteryColumn.addText(`Battery`)
        batteryLabel.font = Font.lightSystemFont(12)
        batteryLabel.textColor = Color.white()

        row.addSpacer()

        //Create temperatue column & set its properties
        tempColumn = row.addStack()
        tempColumn.layoutVertically()
        tempColumn.centerAlignContent()

        const tempLine = tempColumn.addText(`${data.temperature}ºC`)
        tempLine.font = Font.regularSystemFont(33)
            tempLine.textColor = Color.white()

        const tempLabel = tempColumn.addText(`Temperature`)
        tempLabel.font = Font.lightSystemFont(12)
        tempLabel.textColor = Color.white()

        row.addSpacer()    
    //      Create humidity column & set its properties
        humColumn = row.addStack()
        humColumn.layoutVertically()
        humColumn.centerAlignContent()

        const humLine = humColumn.addText(`${data.humidity}%`)
        humLine.font = Font.regularSystemFont(33)
        humLine.textColor = Color.white()

        const humLabel = humColumn.addText(`     Humidity`)
        humLabel.font = Font.lightSystemFont(12)
        humLabel.textColor = Color.white()
        humLabel.leftAlignText()
            
        widget.addSpacer(15)
            
        const deviceLine = widget.addText(`${data.device} on ${data.connectionType} at home`)
        deviceLine.font = Font.mediumSystemFont(12)
        deviceLine.textColor = Color.white()
            
        return widget    
    }else if(widgetSize == 'small'){
        const widget = new ListWidget()
        const bgColor = new LinearGradient()
        bgColor.colors = [new Color(COLORS.bg1), new Color(COLORS.bg2)]
        bgColor.locations = [0.0, 1.0]
        widget.backgroundGradient = bgColor;

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
        return widget
    }else{
        console.log('Widget size not supported')
    }
}

/**
 * This function is used to fetch the current data from the Blynk's API
 * need a token which is de API key from the web app
 * @param {*} token 
 * @returns an object composed by all relevant data from the device in Blynk's App
 */
async function fetchBlynk(token){
    try{
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
    catch(err){
        console.log("Request fail")
    }
   
    
}
