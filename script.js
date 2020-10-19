$(document).ready(function () {
    // Page elements
    var inputEl = document.querySelector(".search-city");
    var searchEl = document.querySelector(".search-button");
    var clearEl = document.querySelector("#clear-history");
    var cityNameEl = document.querySelector("#city-name");
    var pictureEl = document.querySelector("#current-pic");
    var historyEl = document.querySelector("#history");
    var temperatureEl = document.querySelector("#temperature");
    var humidityEl = document.querySelector("#humidity");
    var windEl = document.querySelector("#wind");
    var uvEl = document.querySelector("#UV-index");
    // search history list
    var searchHistory = JSON.parse(window.localStorage.getItem("search")) || [];
    console.log(searchHistory);
    //  API key
    var APIKey = "9fdc5bc55f80a81fe029c792d50c8f7d";


    // function to get the weather with city name
    function getWeather(cityName) {
        //  URL link
        //queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            var currentDate = moment().format('dddd, MMMM Do');
            console.log(currentDate);
            $(cityNameEl).html(response.name + " (" + currentDate + " )");
            // get weather Icon and set it in the page
            var weatherIcon = response.weather[0].icon;
            $(pictureEl).attr("src", "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png")
            // get temperature
            $(temperatureEl).html("Current Temperature: " + kelvinToFahren(response.main.temp) + "°F");
            // get humidity
            $(humidityEl).html("Current Humidity: " + response.main.humidity + "%");
            // get wind speed
            $(windEl).html("Current Wind Speed: " + response.wind.speed + "MPH");
           
            // get UV- index
            // get langtitude and longtitude
            var lat = response.coord.lat;
            var lon = response.coord.lon;
            // we need a query that takes latitude and longitude
            var UVQueryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey;

            $.ajax({
                url: UVQueryURL,
                method: "GET"
            }).then(function (response) {
                var uvIndex = $("<span>");
                $(uvIndex).attr("class", "badge");
                $(uvIndex).html(response.current.uvi);
                $(uvEl).html("UV-Index: ");
                $(uvEl).append(uvIndex);
            });
        });
    };

    // convert the temperature from Kalvin into Fahrenheit
    function kelvinToFahren(k) {
        return Math.floor((k - 273.15) * 1.8 + 32);
    };

    // create a search History based on inputs from user
    // add search items in a list
    function createSearchHistory() {
        $(historyEl).html = "";
        for (var i = 0; i < searchHistory.length; i++) {
            //<input type="text" readonly class="form-control d-block">
            var historyItem = $("<input>");
            $(historyItem).attr("type", "text");
            $(historyItem).attr("class", "form-control d-block");
            $(historyItem).attr("value", searchHistory[i]);
            //console.log(searchHistory[i]);
            $(historyItem).on("click", function () {
                getWeather(searchHistory.value);
            });
        };
        $(historyEl).append(historyItem);
    };

    // Event listener to button search, 
    // adds every seach into the list and local storage
    $(searchEl).on("click", function () {
        var search = inputEl.value;
        getWeather(search);
        searchHistory.push(search);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        // call of the function
        createSearchHistory();
        inputEl.value = "";
    });

    // Event listener to clear button
    // clears search history
     $(clearEl).on("click", function () {
         searchHistory = [];
         $(historyEl).empty();
        // createSearchHistory();
     });

    // call of the function
    createSearchHistory();
    // Make sure the list doesn't exceeds length, 
    //so it gives the weather of the last searched element
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
    };
    // end 
});