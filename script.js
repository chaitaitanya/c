// Weather Application Script

// --- API Keys and Base URLs ---
const apiKey = "9e6a15cda1f94d2f9f294103251103";
// const baseUrl = "http://api.weatherapi.com/v1/current.json";
// const sunUrl = "http://api.weatherapi.com/v1/astronomy.json";


let baseUrl = "https://api.weatherapi.com/v1/current.json";
let sunUrl = "https://api.weatherapi.com/v1/astronomy.json";


// --- DOM Elements ---
let locationInput = document.getElementById("location");
const searchButton = document.getElementById("btn");
const locationDisplay = document.getElementById("location1");
const feelsLike = document.getElementById("feels-like");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const wind = document.getElementById("wind");
const humidity = document.getElementById("humidity");
const dewPoint = document.getElementById("dew-point");
const pressure = document.getElementById("pressure");
const uvIndex = document.getElementById("uv-index");
const visibility = document.getElementById("visibility");
const moonPhase = document.getElementById("moon");
let locationName = document.getElementById("location-name");

// --- Weather Data Fetching Function ---
async function fetchWeather(location) {
    const url = `${baseUrl}?key=${apiKey}&q=${location}&aqi=yes`;
    try {
        const astronomyUrl = await fetch(`${sunUrl}?key=${apiKey}&q=${location}&aqi=yes`);
        const sunData = await astronomyUrl.json();

        const response = await fetch(url);
        const data = await response.json();

        locationDisplay.textContent = `${data.location.name}, ${data.location.country}`;
        feelsLike.textContent = `Feels Like: ${data.current.feelslike_c}°C`;
        wind.textContent = `${data.current.wind_kph} km/h`;
        humidity.textContent = `${data.current.humidity}%`;
        dewPoint.textContent = `${data.current.dewpoint_c}`;
        pressure.textContent = `${data.current.pressure_mb} mb`;
        visibility.textContent = `${data.current.vis_km} km`;
        uvIndex.textContent = data.current.uv;
        sunrise.textContent = `${sunData.astronomy.astro.sunrise}`;
        sunset.textContent = `${sunData.astronomy.astro.sunset}`;
        moonPhase.textContent = `${sunData.astronomy.astro.moon_phase}`;
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

// --- Hourly Weather Data Fetching Function ---
const weatherCodeDescriptions = {
    0: { day: ["./img/2682848_day_forecast_sun_sunny_weather_icon.png", "sunny"], night: ["./img/5729385_moon_night_weather_climate_crescent_icon.png", "clear"] },
    1: { day: ["./img/03-s.png", "Mostly sunny"], night: ["./img/35-s.png", "Mostly clear"] },
    2: { day: ["./img/4102326_cloud_sun_sunny_weather_icon.png", "Partly Cloudy"], night: ["./img/5729393_cloudy_moon_night_cloud_weather_icon.png", "Partly Cloudy"] },
    3: { day: ["./img/4102315_cloud_weather_icon.png", "Mostly Cloudy"], night: ["./img/5729384_forecast_moon_night_raining_weather_icon.png", "Mostly Cloudy"] },
    60: { day: ["./img/4102320_cloud_heavy rain_rain_weather_icon.png", "Rain"], night: ["./img/3859135_climate_cloud_forecast_heavy_rain_icon.png", "Rain"] },
    40: ["./img/snowing_3628484.png", "Snowing"],
    50: ["./img/drizzle_7865992.png", "Drizzle"],
};

async function fetchWeatherData(locationInput) {
    try {
        const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationInput)}&format=json&limit=1`;
        const urlfetch = await fetch(apiUrl);
        const apidata = await urlfetch.json();

        const LAT = apidata[0].lat;
        const LON = apidata[0].lon;

        const BASE_URL = "https://api.open-meteo.com/v1/forecast";
        const response = await fetch(`${BASE_URL}?latitude=${LAT}&longitude=${LON}&hourly=temperature_2m,weather_code&timezone=auto`);
        const data = await response.json();

        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const currentHourISO = `${year}-${month}-${day}T${hours}:00`;

        const hourlyTimes = data.hourly.time;
        const hourlyTemps = data.hourly.temperature_2m;
        const hourlyContainer = document.querySelector(".hourly-data");
        hourlyContainer.innerHTML = "";
        locationName.textContent = apidata[0].display_name;

        let currentHourIndex = hourlyTimes.indexOf(currentHourISO);

        if (currentHourIndex === -1) {
            console.error("Current hour not found in weather data.");
            return;
        }

        const endHourIndex = Math.min(currentHourIndex + 4, hourlyTimes.length - 1);

        for (let i = currentHourIndex; i <= endHourIndex; i++) {
            const parsedTime = new Date(hourlyTimes[i]);
            const hour = String(parsedTime.getHours()).padStart(2, '0');
            const formattedHour = `${hour}:00`;
            const temp = hourlyTemps[i];
            let condition = data.hourly.weather_code[i];

            let imgSrc = '';
            let weathername = '';

            if (condition >= 60) {
                imgSrc = (hour >= 6 && hour <= 18) ? weatherCodeDescriptions[60].day[0] : weatherCodeDescriptions[60].night[0];
                weathername = (hour >= 6 && hour <= 18) ? weatherCodeDescriptions[60].day[1] : weatherCodeDescriptions[60].night[1];
            } else if (condition >= 50) {
                imgSrc = weatherCodeDescriptions[50][0];
                weathername = weatherCodeDescriptions[50][1];
            } else if (condition >= 40) {
                imgSrc = weatherCodeDescriptions[40][0];
                weathername = weatherCodeDescriptions[40][1];
            } else {
                imgSrc = (hour >= 6 && hour <= 18) ? weatherCodeDescriptions[condition].day[0] : weatherCodeDescriptions[condition].night[0];
                weathername = (hour >= 6 && hour <= 18) ? weatherCodeDescriptions[condition].day[1] : weatherCodeDescriptions[condition].night[1];
            }

            const hourRow = document.createElement("div");
            hourRow.classList.add("hour-row");
            hourRow.innerHTML = `
                <div class="hour"><span class="span-inside">${String(parsedTime.toString().split(" ", 3))}</span><br>${formattedHour}</div>
                <div class="temperature">${temp}°C</div>
                <div class="condition"><img src="${imgSrc}" alt="Weather condition">${weathername}</div>
            `;
            hourlyContainer.appendChild(hourRow);
        }
    } catch (error) {
        locationName.textContent = `${locationInput} is not valid`;
        console.error("Error fetching weather data:", error);
        document.querySelector(".hourly-data").innerHTML = "<div>Failed to fetch weather data.</div>";
    }
}

//--------Air quality section------------------------

let aqi = document.getElementById("air-aqi");
let airname = document.getElementById("air-name");
let info = document.getElementById("qulity-info")
let placeName = document.getElementById("place-location");

const API_URL = 'https://api.waqi.info/feed/';
const API_KEY = '629539bb4b78b1604d43bdc506e2eabb1b626727';

function getData(location) {
    fetch(`${API_URL}${location}/?token=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            console.log("air",data);
            if (data.status === 'ok') {
                const myString = `${data.data.city.name}`;
                const words = myString.trim().split(" ");
                let lastWord = words.length > 0 ? words[words.length - 1] : null;

                placeName.textContent = `${location}, ${lastWord}`
                let category = getAQICategory(data.data.aqi);
                let categoryInfo = generateAdvice(category);
                aqi.textContent = `AQI : ${data.data.aqi}`;
                airname.textContent = `${category}`
                info.textContent = `${categoryInfo}`

                document.getElementById("comp").textContent = `All Component`;
                document.getElementById("PM2.5").innerHTML = `AQI : ${data.data.iaqi.pm25.v} <span>PM2.5(Particular Matter less than 2.5 microns)</span><br><span> ${getAQICategory(data.data.iaqi.pm25.v)}</span>`;
                document.getElementById("PM10").innerHTML = `AQI : ${data.data.iaqi.pm10.v} <span>PM10(Particular Matter less than 10 microns)</span><br><span> ${getAQICategory(data.data.iaqi.pm10.v)}</span>`;
                document.getElementById("co").innerHTML = `AQI : ${data.data.iaqi.co.v} <span>co(Carbon Monoxide)</span><br><span> ${getAQICategory(data.data.iaqi.co.v)}</span>`;
                document.getElementById("o3").innerHTML = `AQI : ${data.data.iaqi.o3.v} <span>PM2.5(Ozone)</span><br><span> ${getAQICategory(data.data.iaqi.o3.v)}</span>`;
                document.getElementById("no2").innerHTML = `AQI : ${data.data.iaqi.no2.v} <span>PM2.5(Nitrogen Dioxide)</span><br><span> ${getAQICategory(data.data.iaqi.no2.v)}</span>`;
                document.getElementById("so2").innerHTML = `AQI : ${data.data.iaqi.so2.v} <span>PM2.5(Sulphar Dioxide)</span><br><span> ${getAQICategory(data.data.iaqi.so2.v)}</span>`;
            } else {
                // Default values if API call fails or location not found
                placeName.textContent = "Location not available";
                aqi.textContent = "AQI : N/A";
                airname.textContent = "N/A";
                info.textContent = "Air quality data not available.";

                document.getElementById("comp").textContent = `All Component`;
                document.getElementById("PM2.5").innerHTML = `AQI : N/A <span>PM2.5(Particular Matter less than 2.5 microns)</span><br><span> N/A</span>`;
                document.getElementById("PM10").innerHTML = `AQI : N/A <span>PM10(Particular Matter less than 10 microns)</span><br><span> N/A</span>`;
                document.getElementById("co").innerHTML = `AQI : N/A <span>co(Carbon Monoxide)</span><br><span> N/A</span>`;
                document.getElementById("o3").innerHTML = `AQI : N/A <span>PM2.5(Ozone)</span><br><span> N/A</span>`;
                document.getElementById("no2").innerHTML = `AQI : N/A <span>PM2.5(Nitrogen Dioxide)</span><br><span> N/A</span>`;
                document.getElementById("so2").innerHTML = `AQI : N/A <span>PM2.5(Sulphar Dioxide)</span><br><span> N/A</span>`;
            }
        }).catch((err) => {
            console.error(err);
            // Default values if API call fails or location not found
            placeName.textContent = "Location not available";
            aqi.textContent = "AQI : N/A";
            airname.textContent = "N/A";
            info.textContent = "Air quality data not available.";

            document.getElementById("comp").textContent = `All Component`;
            document.getElementById("PM2.5").innerHTML = `AQI : N/A <span>PM2.5(Particular Matter less than 2.5 microns)</span><br><span> N/A</span>`;
            document.getElementById("PM10").innerHTML = `AQI : N/A <span>PM10(Particular Matter less than 10 microns)</span><br><span> N/A</span>`;
            document.getElementById("co").innerHTML = `AQI : N/A <span>co(Carbon Monoxide)</span><br><span> N/A</span>`;
            document.getElementById("o3").innerHTML = `AQI : N/A <span>PM2.5(Ozone)</span><br><span> N/A</span>`;
            document.getElementById("no2").innerHTML = `AQI : N/A <span>PM2.5(Nitrogen Dioxide)</span><br><span> N/A</span>`;
            document.getElementById("so2").innerHTML = `AQI : N/A <span>PM2.5(Sulphar Dioxide)</span><br><span> N/A</span>`;
        })
}

function getAQICategory(aqi) {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
}

function generateAdvice(category) {
    switch (category) {
        case 'Good': return 'Air quality is great. Enjoy your day outdoors! This level of air quality poses little to no risk to health. You can freely engage in outdoor activities like exercise, picnics, or sports.';
        case 'Moderate': return 'Air is acceptable. If sensitive, reduce outdoor time. Individuals who are unusually sensitive to air pollution may experience mild health effects. Consider shorter outdoor activities.';
        case 'Unhealthy for Sensitive Groups': return 'Avoid strenuous outdoor activities. Children, elderly people, and those with heart or lung conditions should minimize outdoor exposure. Wearing a mask or using air purifiers can help reduce risk.';
        case 'Unhealthy': return 'Limit time outdoors, especially physical activity. People may experience significant health effects, especially those in sensitive groups. Avoid prolonged exposure and close windows to reduce indoor pollution.';
        case 'Very Unhealthy': return 'Stay indoors, use air purifiers if possible. This level indicates serious health effects across the population. Outdoor activities should be avoided altogether, and masks should be considered for necessary outings.';
        case 'Hazardous': return 'Stay indoors and avoid all physical activities outside. This is the worst air quality category, posing health risks for everyone. Use HEPA air purifiers indoors, monitor local AQI updates, and seek shelter in safe spaces.';
        default: return 'No specific advice available. Stay informed by monitoring real-time AQI data for your area.';
    }
}

// --- Map Radar Function ---
let radarMap = document.getElementById('radar-map');

async function fun(place) {
    try {
        const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&limit=1`;
        const urlfetch = await fetch(apiUrl);
        const apidata = await urlfetch.json();

        if (apidata.length === 0) {
            alert('Location not found. Please enter a valid location.');
            return;
        }

        const LAT = apidata[0].lat;
        const LON = apidata[0].lon;

        radarMap.src = `https://embed.windy.com/embed2.html?lat=${LAT}&lon=${LON}&zoom=5&level=surface&overlay=rain&menu=&message=&marker=&calendar=&pressure=&type=map&location=coordinates&detail=&detailLat=&detailLon=&metricWind=default&metricTemp=default&radarRange=-1`;
    } catch (error) {
        console.error('Error fetching location data:', error);
        alert('Error fetching location data. Please try again.');
    }
}

// --- Event Listeners and Initial Load ---
function globalSearch(location) {
    fetchWeather(location);
    fetchWeatherData(location);
    fun(location);
    getData(location);
}

// Function to get stored location or default location
function getInitialLocation() {
    const storedLocation = localStorage.getItem("lastSearchLocation");
    // if (storedLocation) {
    //     return storedLocation;
    // } else {
        return "New Delhi,India"; // Default location
    // }
}

// Initial global search with stored or default location
const initialLocation = getInitialLocation();
globalSearch(initialLocation);

searchButton.addEventListener("click", () => {
    const location = locationInput.value.trim();
    if (location) {
        globalSearch(location);
        localStorage.setItem("lastSearchLocation", location); // Store the searched location
    } else {
        alert("Please enter a location.");
    }
});
