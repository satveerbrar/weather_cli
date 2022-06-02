const fs = require('fs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;
const axios = require('axios').default;
require('dotenv').config();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const GEOCODING_API_TOKEN = process.env.GEOCODING_API_TOKEN;
const date = new Date();

let location, units, unit_name;
let wholeCommand='Command requested by user\n';

const tempInfo = [];

const validateArguments = () => {
    if (argv._[0]) {
        location = argv._[0];
        wholeCommand += `node ${argv.$0} ${location}`;
        if (argv.c) {
            units = "metric";
            unit_name = 'C'
            wholeCommand += ` -c`
        }else if (argv.f) {
            units = "imperial";
            unit_name = 'F'
            wholeCommand += ` -f`
        }
        else {
            units = "metric"
            unit_name = 'C'
        }
        wholeCommand += ` at ${date}`
        writeFile(wholeCommand)
        return true
    }
    else {
        console.log("You need to add location in command\nFOR EXAMPLE node app.js <location-name>")
    }
}

// Get request on Geocoding API and its returning array of all possible results based location specify by user in query
// We are passing that array to parseResult function to parse the information
const getCoordinates = async () => {
    await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${GEOCODING_API_TOKEN}&autocomplete=false&fuzzyMatch=false&types=place`)
        .then(res => res.data)
        .then(data => data.features)
        .then(data => parseResult(data))
        .catch(err => console.log(`Weather Api down\n${error}`))
}

// We are extracting place_name and coordinated and saving it to tempInfo array
const parseResult = (data) => {
    for (place of data) {
        if (place.place_type.length == 1) {
            tempInfo.push({place_name:place.place_name, coord:{lon: place.geometry.coordinates[0], lat: place.geometry.coordinates[1]}})   
        }
    }
}

// Create and return all possible endpoints based on requested location.
// For example if someone wants to look for london city temp without specific country code then Geocoding API returning all possible coordinates.
// WE are creating all possible endpoints based on that and will use that run concurrent requests in getTempInfo function
const createEndpoints = () => {
    const endpoints =[]
    for (place of tempInfo) {
        endpoints.push(`https://api.openweathermap.org/data/2.5/weather?lat=${place.coord.lat}&lon=${place.coord.lon}&units=${units}&appid=${WEATHER_API_KEY}`)
    }
    return endpoints;
}

// Run concurrent API request on all possible endpoints and send data to addTempInfo array
const getTempInfo = async () => {
    if (validateArguments()) {
        await getCoordinates();
        const endpoints = createEndpoints();
        await Promise.all(endpoints.map(endpoint => axios.get(endpoint)))
            .then(response => addTempInfo(response))
            .catch(error => console.log(`Weather Api down\n${error}`))
    }
}

//Add more values(weather values from Weather API) in our existing tempInfo array
const addTempInfo = (response) => {
    for (let i = 0; i < response.length; i++){
        const { data } = response[i];
        tempInfo[i]['temp'] = data.main.temp;
        tempInfo[i]['temp_min'] = data.main.temp_min
        tempInfo[i]['temp_max'] = data.main.temp_max
        tempInfo[i]['description'] = data.weather[0].description
    }
}

const writeFile = (value) => {
    fs.appendFile('weather.txt', `${value}\n\n`, (err) => {
        return err
    })
}

const displayTempCli = async () => {
    await getTempInfo();
    let writeFileResponse;
    for (place of tempInfo) {
        const summary = `Current temperature in ${place.place_name} is ${place.temp}${unit_name}\nConditions are currently ${place.description}\nYou can expect max temp ${place.temp_max}${unit_name} and min temp ${place.temp_min}${unit_name}`;
        console.log(`\n${summary}`)
        writeFileResponse = writeFile(summary);
    }
    if (writeFileResponse == null) {
        console.log("\nWeather was added to your weather tracking file, weather.txt")
    }
    else {
        console.log(`Error: Appending to file was not succesfull ${writeFileResponse}`)
    }
}


displayTempCli();