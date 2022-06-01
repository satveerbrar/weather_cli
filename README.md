# weather_cli
This is CLI based tool. It displays the current temp info based on the location provided in the command

EXAMPLE OUTPUT
```
$ node app.js bucharest -f

Current temperature in București, Bucharest, Romania is 68.27F
Conditions are currently clear sky
You can expect max temp 70.83F and min temp 62.64F

Weather was added to your weather tracking file, weather.txt
$
```

*Calling the app with the argument `-f` give result in fahrenheit and `-c` give result in celsius.
Default value will also be return in celsius(without any argument)

# Setup

- Clone this respositery
- Run Following commands from root directory
```
$npm install
```
- Create .env file in root directory
- Add both API keys using given variable names
```
WEATHER_API_KEY = *******
GEOCODING_API_TOKEN = *******
```
# RUN APP
```
$ node app.js <loaction_name>
OR
$ node app.js <location_name> -f
OR
$ node app.js <location_name> -c
```
