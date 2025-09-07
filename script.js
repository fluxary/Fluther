const apiKey = "e791188273b1fd1e4f3fded400ff6ae6";
const cities = ["Çanakkale", "İstanbul", "Ankara", "İzmir", "Bursa", "Eskişehir"];

async function getWeatherData(city) {
    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=tr`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) throw new Error("Hava durumu verisi alınamadı.");
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Hata:", error);
        return null;
    }
}

function createWeatherCard(data) {
    if (!data) return null;
    
    const card = document.createElement('div');
    card.className = 'weather-container1';
    
    const cityName = data.name;
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    
    card.innerHTML = `
        <h2 class="weather-city">${cityName}</h2>
        <p class="weather-temp">${temp}°C</p>
        <p class="weather-desc">${description}</p>
        <img class="weather-icon" src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="weather icon">
    `;
    
    return card;
}

async function loadAllWeather() {
    const grid = document.getElementById('weather-grid');
    
    for (const city of cities) {
        const data = await getWeatherData(city);
        const card = createWeatherCard(data);
        if (card) grid.appendChild(card);
    }
}

loadAllWeather();