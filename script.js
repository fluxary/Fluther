const apiKey = "e791188273b1fd1e4f3fded400ff6ae6";
const cities = ["Çanakkale", "Eskişehir", "İstanbul", "Ankara", "İzmir", "Bursa"];
const card = document.getElementById('weathergrid');
const label1 = document.querySelector('.label1');

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

async function getForecastData(city) {
    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=tr`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) throw new Error("Tahmin verisi alınamadı.");
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Tahmin hatası:", error);
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
    card.addEventListener('click', function() {
        showCityDetails(data);
    });
    return card;
}

function createForecastItem(forecast) {
    const date = new Date(forecast.dt * 1000);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    const temp = Math.round(forecast.main.temp);
    const description = forecast.weather[0].description;
    const icon = forecast.weather[0].icon;
    
    const forecastItem = document.createElement('div');
    forecastItem.className = 'forecast-item';
    
    forecastItem.innerHTML = `
        <div class="forecast-time">${timeString}</div>
        <img class="forecast-icon" src="http://openweathermap.org/img/wn/${icon}.png" alt="weather icon">
        <div class="forecast-temp">${temp}°C</div>
        <div class="forecast-desc">${description}</div>
    `;
    
    return forecastItem;
}

function addDragScrolling(container) {
    let isDown = false;
    let startX;
    let scrollLeft;

    // Mouse events
    container.addEventListener('mousedown', (e) => {
        isDown = true;
        container.classList.add('dragging');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        e.preventDefault();
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
        container.classList.remove('dragging');
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
        container.classList.remove('dragging');
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 0.8;
        container.scrollLeft = scrollLeft - walk;
    });

    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        container.scrollLeft += e.deltaY * 10;
    });
    container.addEventListener('touchstart', (e) => {
        isDown = true;
        container.classList.add('dragging');
        const touch = e.touches[0];
        startX = touch.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    }, { passive: true });

    container.addEventListener('touchend', () => {
        isDown = false;
        container.classList.remove('dragging');
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        if (!isDown) return;
        const touch = e.touches[0];
        const x = touch.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.2; // Hassasiyeti azalttık
        container.scrollLeft = scrollLeft - walk;
    }, { passive: true });
}

async function showCityDetails(data) {
    const detailsContainer = document.getElementById('weather-details');
    const grid = document.getElementById('weathergrid');
    const allCards = document.querySelectorAll('.weather-container1');

    allCards.forEach(card => {
        card.style.animation = `fadeOut 0.3s ease forwards`;
    });

    setTimeout(async () => {
        grid.style.display = 'none';

        // Forecast verilerini al
        const forecastData = await getForecastData(data.name);
        let forecastHtml = '';
        
        if (forecastData && forecastData.list) {
            // İleri 24 saatlik verileri al (8 adet - 3 saatlik aralıklarla)
            const next24Hours = forecastData.list.slice(0, 8);
            
            const forecastItems = next24Hours.map(forecast => 
                createForecastItem(forecast)
            );
            
            forecastHtml = `
                <div class="forecast-section">
                    <h3 class="forecast-title">İleriki Saatlerdeki Hava Durumu</h3>
                    <div class="forecast-container" id="forecast-container">
                        ${forecastItems.map(item => item.outerHTML).join('')}
                    </div>
                </div>
            `;
        }

        detailsContainer.innerHTML = `
            <div class="weather-details-card">
                <h2 class="weather-city">${data.name}</h2>
                <p class="weather-temp">${Math.round(data.main.temp)}°C</p>
                <p class="weather-desc">${data.weather[0].description}</p>
                <img class="weather-icon" src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="weather icon">
                <div class="weather-additional-info">
                    <p>Nem Oranı: ${data.main.humidity}%</p>
                    <p>Rüzgar Hızı: ${data.wind.speed} m/s</p>
                    <p>Hissedilen Sıcaklık: ${Math.round(data.main.feels_like)}°C</p>
                </div>
                ${forecastHtml}
                <button class="cikis-button" id="back-button">Geri Dön</button>
            </div>
        `;
        
        detailsContainer.style.display = 'flex';
        const detailsCard = document.querySelector('.weather-details-card');
        detailsCard.style.animation = 'fadeIn 0.3s ease forwards';
        
        // Drag scrolling functionality'i forecast container'a ekle
        const forecastContainer = document.getElementById('forecast-container');
        if (forecastContainer) {
            addDragScrolling(forecastContainer);
        }
        
        document.getElementById('back-button').addEventListener('click', () => {
            detailsCard.style.animation = 'fadeOutAndDown 0.3s ease forwards';
            
            setTimeout(() => {
                detailsContainer.style.display = 'none';
                grid.style.display = 'grid';
                
                const newAllCards = document.querySelectorAll('.weather-container1');
                newAllCards.forEach((card, index) => {
                    card.style.animation = `fadeIn 0.3s ease ${index * 0.05}s forwards`;
                });
            }, 300);
        });

    }, 300);
}

async function loadAllWeather() {
    const grid = document.getElementById('weathergrid');
    
    const weatherPromises = cities.map(city => getWeatherData(city));
    const weatherData = await Promise.all(weatherPromises);
    
    weatherData.forEach((data, index) => {
        if (data) {
            const card = createWeatherCard(data);
            if (card) {
                grid.appendChild(card);
                setTimeout(() => {
                    card.classList.add('show');
                }, index * 50);
            }
        }
    });
}

label1.addEventListener('click', () => {
    const grid = document.getElementById('weathergrid');
    const detailsContainer = document.getElementById('weather-details');
    const detailsCard = document.querySelector('.weather-details-card');

    if (detailsCard) {
        detailsCard.style.animation = 'fadeOutAndDown 0.3s ease forwards';
        setTimeout(() => {
            detailsContainer.style.display = 'none';
            grid.style.display = 'grid';
            
            const newAllCards = document.querySelectorAll('.weather-container1');
            newAllCards.forEach((card, index) => {
                card.style.animation = `fadeIn 0.3s ease ${index * 0.05}s forwards`;
            });
        }, 300);
    }
});

loadAllWeather();