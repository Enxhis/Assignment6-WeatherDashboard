$(document).ready(function () {
    // Page elements
    var forecastEl = document.querySelector("#forecast-data");
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
                var UVvalue = response.current.uvi;
                $(uvIndex).html(UVvalue);

                // change color depending on uv index value
                if (UVvalue < 3) {
                    uvIndex.addClass("btn-success");
                }
                else if (UVvalue < 7) {
                    uvIndex.addClass("btn-warning");
                }
                else {
                    uvIndex.addClass("btn-danger");
                }
                $(uvEl).html("UV-Index: ");
                $(uvEl).append(uvIndex);
            });
        });
    };

    // create 5 days weather forecast
    function fiveDaysForecast(cityName) {
        var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=" + APIKey;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            // overwrite any existing content with title and empty row
            $("#five-days").html("<h3 class='mt-3'>5-Day Forecast:</h3>").append("<div class='row'>");
            //var forecast5 = $("<div>").addClass("")
            // loop over all forecasts (by 3-hour increments)
            for (var i = 0; i < response.list.length; i++) {
                // only look at forecasts around 3:00pm
                if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                    // create html elements for a bootstrap card
                    // col-12 m-3    col-md-2 ml-3 mb-3
                    var col = $("<div>").addClass("col-md-2 ml-3 mb-3");
                    var card = $("<div>").addClass("card text-white bg-color");
                    var body = $("<div>").addClass("card-body p-2");

                    var title = $("<h5>").addClass("card-title").text(new Date(response.list[i].dt_txt).toLocaleDateString());

                    var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png");

                    var p1 = $("<p>").addClass("card-text").text("Temp: " + response.list[i].main.temp_max + " °F");
                    var p2 = $("<p>").addClass("card-text").text("Humidity: " + response.list[i].main.humidity + "%");

                    // merge together and put on page
                    col.append(card.append(body.append(title, img, p1, p2)));
                    $("#five-days .row").append(col);
                }
            }
        })
    }

    // convert the temperature from Kelvin into Fahrenheit
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
                fiveDaysForecast(searchHistory.value)
            });
        };
        $(historyEl).append(historyItem);
    };

    // Event listener to button search, 
    // adds every seach into the list and local storage
    $(searchEl).on("click", function () {
        var search = $(inputEl).val();
        getWeather(search);
        fiveDaysForecast(search)
        searchHistory.push(search);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        // call of the function
        createSearchHistory();
        // empty the search field
        inputEl.value = "";
    });

    // Event listener to clear button
    // clears search history
    $(clearEl).on("click", function () {
        searchHistory = [];
        $(historyEl).empty();
        // $(forecastEl).empty();
         createSearchHistory();
    });

    // call of the function so when the page loads 
    // to present the last searched city forecast
    createSearchHistory();
    // If the list is not empty it loads in the page the last element searched
    //so it gives the weather of the last searched element
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
        fiveDaysForecast(searchHistory[searchHistory.length - 1])
    };
    // end 
});
