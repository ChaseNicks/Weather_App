var ApiKey = "8724e249228e27a44c8714de9db00395";

function resetWeatherCards() {

    for (var i = 0; i < 5; i++) {
        $(`#card${i + 1}`).text("");
    }

}

async function loadWeather(cityName) {

    resetWeatherCards();
    var forecast = await fetchWeatherData(cityName);

    $(`.Temp`).text(`Temp: ${forecast.current.temp} F`);
    $(`.Wind`).text(`Wind: ${forecast.current.wind_speed} MPH`);
    $(`.Humidity`).text(`Humidity: ${forecast.current.humidity} %`);
    $(`#UvIndex`).text(`UV Index: ${forecast.current.uvi}`);

    UvIndexColor(forecast.current.uvi);

    for (var i = 0; i < 5; i++) {

        var forecastedWeatherDateEl = $(`#card${i + 1}`);
        var date = new Date(forecast.daily[i + 1].dt * 1000);
        var dateStringEl = $(`<h5/>`).text(`(${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()})`);

        var iconEl = $(`<i class="bi bi-sun"></i>`);
        iconEl.addClass("my-3");

        var dateTempEl = $(`<p/>`).text(`Temp: ${forecast.daily[i + 1].temp.day} F`)
        var dateWindEl = $(`<p/>`).text(`Wind: ${forecast.daily[i + 1].wind_speed} MPH`)
        var dateHumidityEl = $(`<p/>`).text(`Humidity: ${forecast.daily[i + 1].humidity} %`)

        forecastedWeatherDateEl.append(dateStringEl);
        forecastedWeatherDateEl.append(iconEl);
        forecastedWeatherDateEl.append(dateTempEl);
        forecastedWeatherDateEl.append(dateWindEl);
        forecastedWeatherDateEl.append(dateHumidityEl);

    }

    pullRecentSearchs();
}

function saveSearchTerm(searchTerm) {

    var prevTerms = JSON.parse(localStorage.getItem("searches"));
    prevTerms.unshift(searchTerm);
    localStorage.setItem("searches", JSON.stringify(prevTerms));
}

function searchForum() {

    $(`#submitBtn`).on("click", () => {
        saveSearchTerm($(`#search`).val());
        loadWeather($(`#search`).val());
    });

    $(`#search`).keypress((event) => {

        if (event.which == 10) {
            saveSearchTerm($(`#search`).val());
            loadWeather($(`#search`).val());
        }

    })
}

function UvIndexColor(UvIndex) {

    $(`#UvIndex`).removeClass();
    $(`#UvIndex`).addClass("p-1 border rounded rounded-4");
    
    if (UvIndex < 3) {
        $(`#UvIndex`).addClass("bg-success");
    } else if (UvIndex >= 3 || UvIndex < 7) {
        $(`#UvIndex`).addClass("bg-warning")
    } else {
        $(`#UvIndex`).addClass("bg-failure")
    }
    
}

async function fetchWeatherData (city) {
    var citySearch = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${ApiKey}&units=imperial`;

    var searchReturn = await fetch(citySearch)
        .then(response => response.json())
        .then(data => {
            return data;
        });
    var latitudeLongitude = {
        latitude: searchReturn.coord.lat,
        longitude: searchReturn.coord.lon
    }
    var latLongcall = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitudeLongitude.latitude}&lon=${latitudeLongitude.longitude}&appid=${ApiKey}&units=imperial`

    var latLongFetch = await fetch(latLongcall)
        .then(response => response.json())
        .then(data => {
            return data;
        })

    var date = new Date(latLongFetch.current.dt * 1000);
    var dateString = `(${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()})`;
    $('#city-header').text(`${searchReturn.name} ${dateString}`);

    return latLongFetch;
}

function loadLastSearchedCity() {

    var recentTerms = getSearchHistory()
    var mostRecentSearch = recentTerms[0];
    loadWeather(mostRecentSearch);

}

function getSearchHistory() {

    var searchHistory = JSON.parse(localStorage.getItem("searches"));
    if (!searchHistory) {

        searchHistory = ["Chicago"];
        localStorage.setItem("searches", JSON.stringify(searchHistory));
        return searchHistory;
    } else {
        return searchHistory;
    }
}

function pullRecentSearchs() {

    var searchHistory = getSearchHistory();
    $(`#quick-access-links`).text("");

    for (var i = 0; i < 10; i++) {

        if (searchHistory[i]) {
            searchButtonEl = $("<button></button>").text(searchHistory[i]);
            searchButtonEl.attr("id", searchHistory[i]);
            searchButtonEl.addClass("favorites");
            
            searchButtonEl.on("click", (event) => {
                saveSearchTerm(event.target.id);
                loadWeather(event.target.id);
            });
            $(`#quick-access-links`).append(searchButtonEl);

        }
    }
}

function runApp() {
    pullRecentSearchs();
    loadLastSearchedCity();
    searchForum();

}
runApp();