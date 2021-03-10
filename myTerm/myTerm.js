// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-green; icon-glyph: magic;
const CACHE_KEY_LAST_UPDATED = 'last_updated';
const CACHE_KEY_LOCATION = 'location';
const DEFAULT_LOCATION = { latitude: 0, longitude: 0 };
 
// Font name and size
const FONT_NAME = 'Menlo';
const FONT_SIZE = 10;

// Colors
const COLORS = {
  bg0: '#29323c',
  bg1: '#1c1c1c',
  personalCalendar: '#5BD2F0',
  workCalendar: '#9D90FF',
  weather: '#FDFD97',
  location: '#FEB144',
  period: '#FF6663',
  deviceStats: '#7AE7B9',
};

// TODO: PLEASE SET THESE VALUES
const NAME = 'AdsLuqs';
const WEATHER_API_KEY = '91018fb22d9890c759d5976103700b8d';
const BLYNK_API_KEY = 'ztbiefZ3q7ToS4JnT6auO-I8-8GYy6tD';
const WORK_CALENDAR_NAME = 'TEC';
const PERSONAL_CALENDAR_NAME = 'Personal';
//const PERIOD_CALENDAR_NAME = 'Mexican Holidays';
//const PERIOD_EVENT_NAME = 'Holidays in Mexico';

/******************************************************************************
 * Initial Setups
 *****************************************************************************/

/**
 * Convenience function to add days to a Date.
 * 
 * @param {*} days The number of days to add
 */ 
Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

// Import and setup Cache
const Cache = importModule('Cache');
const cache = new Cache('terminalWidget');

// Fetch data and create widget
const data = await fetchData();
const widget = createWidget(data);

Script.setWidget(widget);
Script.complete();

/******************************************************************************
 * Main Functions (Widget and Data-Fetching)
 *****************************************************************************/

/**
 * Main widget function.
 * 
 * @param {} data The data for the widget to display
 */
function createWidget(data) {
  console.log(`Creating widget with data: ${JSON.stringify(data)}`);

  const widget = new ListWidget();
  const bgColor = new LinearGradient();
  bgColor.colors = [new Color(COLORS.bg0), new Color(COLORS.bg1)];
  bgColor.locations = [0.0, 1.0];
  widget.backgroundGradient = bgColor;
  widget.setPadding(10, 15, 15, 10);

  const stack = widget.addStack();
  stack.layoutVertically();
  stack.spacing = 4;
  stack.size = new Size(320, 0);

  // Line 0 - Last Login
  const timeFormatter = new DateFormatter();
  timeFormatter.locale = "en";
  timeFormatter.useNoDateStyle();
  timeFormatter.useShortTimeStyle();

  const lastLoginLine = stack.addText(`Last login: ${timeFormatter.string(new Date())} on ttys001`);
  lastLoginLine.textColor = Color.white();
  lastLoginLine.textOpacity = 0.7;
  lastLoginLine.font = new Font(FONT_NAME, FONT_SIZE);

  // Line 1 - Input
  const inputLine = stack.addText(`~${data.device.name}$ info`);
  inputLine.textColor = Color.white();
  inputLine.font = new Font(FONT_NAME, FONT_SIZE);

  const dateFormatter = new DateFormatter();
  //currentDate.locale = "en";
  dateFormatter.useNoTimeStyle();
  dateFormatter.useMediumDateStyle();

  //line 2 - Current Date
  const currentDateEventLIne = stack.addText(`📍 | ${data.weather.location}. Today is ${dateFormatter.string(new Date())}`);
  currentDateEventLIne.textColor = new Color(COLORS.workCalendar);
  currentDateEventLIne.font = new Font(FONT_NAME, FONT_SIZE);

  // Line 3 - Next Personal Calendar Event
  const nextPersonalCalendarEventLine = stack.addText(`🗓 | ${getCalendarEventTitle(data.nextPersonalEvent, false)}`);
  nextPersonalCalendarEventLine.textColor = new Color(COLORS.personalCalendar);
  nextPersonalCalendarEventLine.font = new Font(FONT_NAME, FONT_SIZE);

  // Line 4 - Weather
  const weatherLine = stack.addText(`${data.weather.icon} | ${data.weather.temperature}° (${data.weather.low}° - ${data.weather.high}°), ${data.weather.description}, feels like ${data.weather.feelsLike}°`);
  weatherLine.textColor = new Color(COLORS.weather);
  weatherLine.font = new Font(FONT_NAME, FONT_SIZE);
  
  /**  Line 5 - Location
  const locationLine = stack.addText(`📍 | ${data.weather.location}`);
  locationLine.textColor = new Color(COLORS.location);
  locationLine.font = new Font(FONT_NAME, FONT_SIZE);*/

  // Line 6 - Various Device Stats
  const deviceStatsLine = stack.addText(`📱 | ⚡︎ ${data.device.battery}%, ☀ ${data.device.brightness}%, v${data.device.sysver}`);
  deviceStatsLine.textColor = new Color(COLORS.location);
  //deviceStatsLine.textColor = Color.red();
  deviceStatsLine.font = new Font(FONT_NAME, FONT_SIZE);

  //line - Blynk data 
  const blynkLine = stack.addText(`🏠 | 🔋${data.blynkStatus.devBattery}  🌡 ${data.blynkStatus.temperature}ºC  💧${data.blynkStatus.humidity}%`)
  blynkLine.textColor = new Color(COLORS.deviceStats);
  blynkLine.font = new Font(FONT_NAME, FONT_SIZE);

  /** 
  const fmmm = FileManager.iCloud();
  const BM_PATH = fmmm.bookmarkedPath("Health");
  const health_data = fmmm.read(BM_PATH);
  let stepcount = health_data.toRawString();

  const stepcountLine = stack.addText(`Steps | ${stepcount}`);
  stepcountLine.textColor = new Color(COLORS.location);
  stepcountLine.font = new Font(FONT_NAME, FONT_SIZE);
  **/
  return widget;
}

/**
 * Fetch pieces of data for the widget.
 */
async function fetchData() {
  // Get the weather data
  const weather = await fetchWeather();

  // Get next work/personal calendar events
  const nextWorkEvent = await fetchNextCalendarEvent(WORK_CALENDAR_NAME);
  const nextPersonalEvent = await fetchNextCalendarEvent(PERSONAL_CALENDAR_NAME);

  // Get period data
  //const period = await fetchPeriodData();

  // Get last data update time (and set)
  const lastUpdated = await getLastUpdated();
  cache.write(CACHE_KEY_LAST_UPDATED, new Date().getTime());

  //Get last update from the Blynk's API
  const blynkStatus = await fetchBlynk(BLYNK_API_KEY);


  return {
    weather,
    nextWorkEvent,
    nextPersonalEvent,
    device: {
      battery: Math.round(Device.batteryLevel() * 100),
      brightness: Math.round(Device.screenBrightness() * 100),
      name : (Device.name()),
//       volume : Device.volume() * 100,
      sysver : Device.systemVersion()
    },
    lastUpdated,
    blynkStatus
  };
}

/******************************************************************************
 * Helper Functions
 *****************************************************************************/

//-------------------------------------
// Weather Helper Functions
//-------------------------------------

/**
 * Fetch the weather data from Open Weather Map
 */
async function fetchWeather() {
  let location = await cache.read(CACHE_KEY_LOCATION);
  if (!location) {
    try {
      Location.setAccuracyToThreeKilometers();
      location = await Location.current();
    } catch(error) {
      location = await cache.read(CACHE_KEY_LOCATION);
    }
  }
  if (!location) {
    location = DEFAULT_LOCATION;
  }
  const url = "https://api.openweathermap.org/data/2.5/onecall?lat=" + location.latitude + "&lon=" + location.longitude + "&exclude=minutely,hourly,alerts&units=metric&lang=en&appid=" + WEATHER_API_KEY;
  const address = await Location.reverseGeocode(location.latitude, location.longitude);
  const data = await fetchJson(`weather_${address[0].locality}`, url);

  const currentTime = new Date().getTime() / 1000;
  const isNight = currentTime >= data.current.sunset || currentTime <= data.current.sunrise

  return {
    location: `${address[0].postalAddress.city}, ${address[0].postalAddress.state}`,
    icon: getWeatherEmoji(data.current.weather[0].id, isNight),
    description: data.current.weather[0].main,
    temperature: Math.round(data.current.temp),
    wind: Math.round(data.current.wind_speed),
    high: Math.round(data.daily[0].temp.max),
    low: Math.round(data.daily[0].temp.min),
    feelsLike: Math.round(data.current.feels_like),
  }
}

/**
 * Given a weather code from Open Weather Map, determine the best emoji to show.
 * 
 * @param {*} code Weather code from Open Weather Map
 * @param {*} isNight Is `true` if it is after sunset and before sunrise
 */
function getWeatherEmoji(code, isNight) {
  if (code >= 200 && code < 300 || code == 960 || code == 961) {
    return "⛈"
  } else if ((code >= 300 && code < 600) || code == 701) {
    return "🌧"
  } else if (code >= 600 && code < 700) {
    return "❄️"
  } else if (code == 711) {
    return "🔥" 
  } else if (code == 800) {
    return isNight ? "🌕" : "☀️" 
  } else if (code == 801) {
    return isNight ? "☁️" : "🌤"  
  } else if (code == 802) {
    return isNight ? "☁️" : "⛅️"  
  } else if (code == 803) {
    return isNight ? "☁️" : "🌥" 
  } else if (code == 804) {
    return "☁️"  
  } else if (code == 900 || code == 962 || code == 781) {
    return "🌪" 
  } else if (code >= 700 && code < 800) {
    return "🌫" 
  } else if (code == 903) {
    return "🥶"  
  } else if (code == 904) {
    return "🥵" 
  } else if (code == 905 || code == 957) {
    return "💨" 
  } else if (code == 906 || code == 958 || code == 959) {
    return "🧊" 
  } else {
    return "❓" 
  }
}

//-------------------------------------
// Calendar Helper Functions
//-------------------------------------

/**
 * Fetch the next calendar event from the given calendar
 * 
 * @param {*} calendarName The calendar to get events from
 */
async function fetchNextCalendarEvent(calendarName) {
  const calendar = await Calendar.forEventsByTitle(calendarName);
  const events = await CalendarEvent.today([calendar]);
  const tomorrow = await CalendarEvent.tomorrow([calendar]);

  console.log(`Got ${events.length} events for ${calendarName}`);
  console.log(`Got ${tomorrow.length} events for ${calendarName} tomorrow`);

  const upcomingEvents = events.concat(tomorrow).filter(e => (new Date(e.endDate)).getTime() >= (new Date()).getTime());

  return upcomingEvents ? upcomingEvents[0] : null;
}

/**
 * Given a calendar event, return the display text with title and time.
 * 
 * @param {*} calendarEvent The calendar event
 * @param {*} isWorkEvent Is this a work event?
 */
function getCalendarEventTitle(calendarEvent, isWorkEvent) {
  if (!calendarEvent) {
    return `No upcoming ${isWorkEvent ? 'work ' : ''}events`;
  }

  const timeFormatter = new DateFormatter();
  timeFormatter.locale = 'en';
  timeFormatter.useNoDateStyle();
  timeFormatter.useShortTimeStyle();

  const eventTime = new Date(calendarEvent.startDate);

  return `[${timeFormatter.string(eventTime)}] ${calendarEvent.title}`;
}

//-------------------------------------
// Blynk  Helper Functions
//-------------------------------------
async function fetchBlynk(token){
  //const req = "http://blynk-cloud.com/ztbiefZ3q7ToS4JnT6auO-I8-8GYy6tD/project"
  const req = "http://blynk-cloud.com/" + token + "/project"
  const data = await new Request(req).loadJSON()

  return {
      device : data.devices[0].boardType,
      connectionType : data.devices[0].connectionType,
      temperature : data.widgets[0].value,
      humidity : data.widgets[1].value,
      devBattery : data.widgets[2].value,
      sceneStatus : data.widgets[3].value
  }
}

//-------------------------------------
// Misc. Helper Functions
//-------------------------------------

/**
 * Make a REST request and return the response
 * 
 * @param {*} key Cache key
 * @param {*} url URL to make the request to
 * @param {*} headers Headers for the request
 */
async function fetchJson(key, url, headers) {
  const cached = await cache.read(key, 5);
  if (cached) {
    return cached;
  }

  try {
    console.log(`Fetching url: ${url}`);
    const req = new Request(url);
    req.headers = headers;
    const resp = await req.loadJSON();
    cache.write(key, resp);
    return resp;
  } catch (error) {
    try {
      return cache.read(key, 5);
    } catch (error) {
      console.log(`Couldn't fetch ${url}`);
    }
  }
}

/**
 * Get the last updated timestamp from the Cache.
 */
async function getLastUpdated() {
  let cachedLastUpdated = await cache.read(CACHE_KEY_LAST_UPDATED);

  if (!cachedLastUpdated) {
    cachedLastUpdated = new Date().getTime();
    cache.write(CACHE_KEY_LAST_UPDATED, cachedLastUpdated);
  }

  return cachedLastUpdated;
}
