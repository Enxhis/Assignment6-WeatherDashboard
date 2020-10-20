$(document).ready(function () {
    // Page elements
    var inputEl = document.querySelector(".search-city");
    var searchEl = document.querySelector(".search-button");
    var clearEl = document.querySelector("#clear-history");
    var historyEl = document.querySelector("#history");
    // search history list
    var searchHistory = JSON.parse(window.localStorage.getItem("search")) || [];
    console.log(searchHistory);
    //  API key
    var APIKey = "9fdc5bc55f80a81fe029c792d50c8f7d";
    
    // if 
    if(searchHistory.length === 0){
        $("#current").hide();
        $("#forecast").hide();
    }
    

    // function to get current weather given the city name
    function getWeather(cityName) {
        //  URL link
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + APIKey;
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            $("#current").empty();
            // create the html elements for the current weather forecast
            // <!-- <div class="row"> <div class="col-12 m-3"><div class="row"><div class="col-12 forecast-city"> 
            var row = $("<div>").addClass("class = 'row' ");
            var cols = $("<div>").addClass("class = 'col-12 m-3'");
            var titleRow = $("<div>").addClass("class = 'row'");
            var titleCol = $("<div>").addClass("class = 'col forecast-city' ");

            // append these elements in the same row
            $(row).append(cols, titleRow, titleCol);
            // append elements in the page
            $("#current").append(row);

            // current date using moment.js
            var currentDate = moment().format('dddd, MMMM Do');
            //console.log(currentDate);

            // create html element for the name of the city and date
            var cityNameEl = $("<h3>").addClass("class='mt-3'");
            $(cityNameEl).html(response.name + " (" + currentDate + " )");
            // append element in the tittle element
            $(titleCol).append(cityNameEl);

            // get weather Icon and set it in the page
            var weatherIcon = response.weather[0].icon;
            // img html element
            var pictureEl = $("<img>");
            $(pictureEl).attr("src", "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png")
            $(pictureEl).attr("alt", "weather icon");
            $(cityNameEl).append(pictureEl);

            // get temperature
            var tempDiv = $("<div>").addClass("class = 'row'");
            var temperatureEl = $("<div>").addClass("class = 'col-12'");
            $(temperatureEl).html("Current Temperature: " + kelvinToFahren(response.main.temp) + "°F");
            $(tempDiv).append(temperatureEl);

            // get humidity
            var humidDiv = $("<div>").addClass("class = 'row'");
            var humidityEl = $("<div>").addClass("class = 'col-12'");
            $(humidityEl).html("Current Humidity: " + response.main.humidity + "%");
            $(humidDiv).append(humidityEl);

            // get wind speed
            var windDiv = $("<div>").addClass("class = 'row'");
            var windEl = $("<div>").addClass("class = 'col-12'");
            $(windEl).html("Current Wind Speed: " + response.wind.speed + "MPH");
            $(windDiv).append(windEl);
            
            // get UV- index
            // get langitude and longitude
            var lat = response.coord.lat;
            var lon = response.coord.lon;
            // query url that takes latitude and longitude
            var UVQueryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&appid=" + APIKey;

            $.ajax({
                url: UVQueryURL,
                method: "GET"
            }).then(function (response) {
                // create a span element
                var uvDiv = $("<div>").addClass("class = 'row'");
                var uvEl = $("<div>").addClass("class = 'col-12'");
                $(uvDiv).append(uvEl);
                var uvIndex = $("<span>");
                // add attributes to the element created
                $(uvIndex).attr("class", "badge");
                // get the UV-index value
                var UVvalue = response.current.uvi;
                // set uv-value to the html element
                $(uvIndex).html(UVvalue);

                // change color depending on uv index value
                if (UVvalue < 3) {
                    // add class to the span
                    uvIndex.addClass("btn-success");
                }
                else if (UVvalue < 7) {
                    uvIndex.addClass("btn-warning");
                }
                else {
                    uvIndex.addClass("btn-danger");
                }
                // add elements to the page
                $(uvEl).html("UV-Index: ");
                $(uvEl).append(uvIndex);
                $(cols).append(tempDiv, humidDiv, windDiv, uvDiv);
                $("#current").append(cols);
            });
        });
    };

    // create 5 days weather forecast function
    function fiveDaysForecast(cityName) {
        // query url for the 5 days forecast
        var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=" + APIKey;

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            // overwrite any existing content with title and empty row
            $("#five-days").html("<h3 class='mt-3'>5-Day Forecast</h3>").append("<div class='row'>");
            // loop over all forecasts (by 3-hour increments)
            for (var i = 0; i < response.list.length; i++) {
                // only take forecasts of that match 15:00
                if (response.list[i].dt_txt.indexOf("15:00:00") !== -1) {
                    // create html elements for a bootstrap card
                    var col = $("<div>").addClass("col-sm-2 ml-1 mt-1");
                    // create cards for each day forecast
                    var card = $("<div>").addClass("card text-white bg-color");
                    var body = $("<div>").addClass("card-body p-1");
                    // add title with the date
                    var title = $("<h5>").addClass("card-title").text(new Date(response.list[i].dt_txt).toLocaleDateString());
                    // add icon weather
                    var img = $("<img>").attr("src", "http://openweathermap.org/img/w/" + response.list[i].weather[0].icon + ".png");
                    // add temperature
                    var p1 = $("<p>").addClass("card-text").text("Temp: " + kelvinToFahren(response.list[i].main.temp_max) + " °F");
                    // add humidity
                    var p2 = $("<p>").addClass("card-text").text("Humidity: " + response.list[i].main.humidity + "%");

                    // append elements in the page
                    col.append(card.append(body.append(title, img, p1, p2)));
                    $("#five-days .row").append(col);
                }
            }
        });
    }

    // convert the temperature from Kelvin into Fahrenheit function
    function kelvinToFahren(k) {
        return Math.floor((k - 273.15) * 1.8 + 32);
    };

    // create a search History based on inputs from user function
    // add search items in a list
    function createSearchHistory() {
        $(historyEl).html = "";
        for (var i = 0; i < searchHistory.length; i++) {
            // create input element and give attributes to it
            //<input type="text" readonly class="form-control d-block">
            var historyItem = $("<input>");
            $(historyItem).attr("type", "text");
            $(historyItem).attr("class", "form-control d-block");
            $(historyItem).attr("value", searchHistory[i]);
            //console.log(searchHistory[i]);
            $(historyItem).on("click", function () {
                var data = $(historyItem).val().trim();
                getWeather(data);
                fiveDaysForecast(data);
            });
        }
        // append to the page 
        $(historyEl).append(historyItem);    
    }

    // Event listener to button search, 
    // adds every seach into the list and local storage
    $(searchEl).on("click", function () {
        var search = $(inputEl).val();
        $("#current").show();
        $("#forecast").show();
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
    //$("#current").show();
    // If the list is not empty it loads in the page the last element searched
    //so it gives the weather of the last searched element
    if (searchHistory.length > 0) {
        getWeather(searchHistory[searchHistory.length - 1]);
        fiveDaysForecast(searchHistory[searchHistory.length - 1])
    }
    // end 
});
