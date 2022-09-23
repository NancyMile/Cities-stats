var weatherFormEl = document.querySelector('#weather-form');
var weatherCityButtonsEl = document.querySelector('#weatherCity-buttons');
var nameInputEl = document.querySelector('#cityname');
var populationInfo = document.querySelector('#population-info');
var repoContainerEl = document.querySelector('#weatherparams-container');
var repoSearchTerm = document.querySelector('#repo-search-term');
var mainday = document.querySelector('#today-weather');
var todayWeather = document.createElement('div');
const myKey = '3647b99d321bbf401a1d1e6e104ff888';
var weather = []; //array for local storage

var formSubmitHandler = function (event) {
  event.preventDefault();

  var cityname = nameInputEl.value.trim();

  if (cityname) {
    getCityWeather(cityname);
    document.getElementById("today-weather").innerHTML = "";
    repoContainerEl.textContent = '';
    nameInputEl.value = '';
  } else {
    alert('Please enter a city');
  }
};

var buttonClickHandler = function (event) {
  var language = event.target.getAttribute('data-language');

  if (language) {
    getFeaturedRepos(language);

    repoContainerEl.textContent = '';
  }
};

var getCityWeather = function (city) {
  var apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&only_current=true&exclude=hourly&appid=${myKey}&cnt=1`;
  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        console.log(response);
    } else {
        alert('Error: ' + response.statusText);
      }
        return response.json();
    })
        .then(function (data) {
          console.log(data);
          //if response was ok then  get the latitud and longitud for quering daily
          getDailyWeather(data);
          getCityInfo(data);
        })
    .catch(function (error) {
      alert('Unable to connect'+error);
    });
};

var getCityInfo = function(weatherResults){
  let lat = weatherResults.city.coord.lat;
  let lon = weatherResults.city.coord.lon;
  var apiUrlcity = `https://api.teleport.org/api/locations/${lat},${lon}/?embed=location%3Anearest-cities%2Flocation%3Anearest-city`;
    //nearrest city
    fetch(apiUrlcity).then(function (response) {
      if (response.ok){
          response.json().then(function (data) {
            let ver =JSON.stringify(data);
            console.log("data___ "+JSON.stringify(data));
            console.log("data keys 1 "+Object.keys(data));//good one  _embedded,_links,coordinates
            console.log("DATA keys 2 "+Object.keys(data._embedded));//location:nearest-cities,location:nearest-urban-areas
            console.log("DATA keys 3 "+Object.keys(data._embedded['location:nearest-urban-areas']));
            console.log("string "+JSON.stringify(data._embedded['location:nearest-urban-areas']));
            //getin urban areas
            let urban = JSON.stringify(data._embedded['location:nearest-urban-areas']);// take just the part related to ubran area
            //convert urban to object again
            let urban2 = JSON.parse(urban);
            console.log("DATA keys 4 "+ Object.keys(urban2[0]));//_links,distance_km
            console.log("DATA keys 5 "+ Object.keys(urban2[0]['_links']['location:nearest-urban-area']));//href, name
            //getiing the urban area link (to get more information about the place) and name 
            let urbanAreaName = urban2[0]['_links']['location:nearest-urban-area'].name;
            console.log("DATA keys 6 "+ urbanAreaName);//San Francisco Bay Area !!!!
            //create a slug
            let slug = urbanAreaName.replace(/\W+/g, '-').toLowerCase();
            //population information
            let nearestCity = JSON.stringify(data._embedded['location:nearest-cities']);
            //convert nearestCity to object again
            let nearestCity2 = JSON.parse(nearestCity);
            let cityFullName = nearestCity2[0]['_embedded']['location:nearest-city'].full_name;
            let populationCity = nearestCity2[0]['_embedded']['location:nearest-city'].population;
            let distanceCity = nearestCity2[0].distance_km;
            let citylat = data.coordinates['latlon'].latitude;
            let citylon = data.coordinates['latlon'].longitude;

            populationInfo.innerHTML =`<section class="weather-card">
            <h2 class="card-title"><strong>Area and population</h2>
            <ul class="list-group">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span class="badge badge-primary badge-pill">${cityFullName}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
              Population:
                <span class="badge badge-primary badge-pill">${populationCity}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
              Nearest City Distance:
                <span class="badge badge-primary badge-pill">${distanceCity} km</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
              Latitud:
                <span class="badge badge-primary badge-pill">${citylat}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
              Longitud:
                <span class="badge badge-primary badge-pill">${citylon}</span>
              </li>
            </ul>`;
            //Get image
            var apiUrlcityPhoto = `https://api.teleport.org/api/urban_areas/slug:${slug}/images/`;
  
            fetch(apiUrlcityPhoto).then(function (response) {
              if (response.ok){
                  response.json().then(function (data) {
                  console.log(data);
                  console.log("PHOTO keys 1 "+Object.keys(data.photos[0]));//attribution ,image
                  console.log("PHOTO keys 2 "+Object.keys(data.photos[0]['image'])); //mobile,web
                  let photo = data.photos[0]['image'].web;
                  //image of the selected city
                  document.getElementById("city-image").src = photo;
                  //salary stats
                  let salary = `https://teleport.org/cities/${slug}/widget/salaries/?currency=USD`;
                  //set the scr for the iframe
                  document.getElementById("salaries").src = salary;
                });
              } else {
                  alert('Error: ' + response.statusText);
              }
          });


          /////WEDGET
          //document.querySelector(".salaries").setAttribute("data-url", "https://teleport.org/cities/"+`${slug}`+"/widget/salaries/?currency=USD");
          //document.getElementById("salaries").innerHTML+=`  <script async class="teleport-widget-script" data-url="https://teleport.org/cities/${{slug}}/widget/salaries/?currency=USD" data-max-width="770" data-height="727" src="https://teleport.org/assets/firefly/widget-snippet.min.js"></script>`;
          //clear before display again
          //document.getElementById("city-image").innerHTML = "";
          //displayWeather(dataCity,weatherResults.city.name);
      });
      } else {
          alert('Error: ' + response.statusText);
      }
  });
};


var getDailyWeather = function (weatherResults) {
    let lat = weatherResults.city.coord.lat;
    let lon = weatherResults.city.coord.lon;
    var apiUrlDaily = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=hourly&appid=${myKey}`;
    //var apiUrlcity = `https://api.teleport.org/api/locations/${lat},${lon}/?embed=location%3Anearest-cities%2Flocation%3Anearest-city`;
    //https://api.teleport.org/api/urban_areas/slug:san-francisco-bay-area/images/

    fetch(apiUrlDaily).then(function (response) {
        if (response.ok){
            response.json().then(function (data) {
            console.log(data);
            //clear before display again
            document.getElementById("weatherparams-container").innerHTML = "";
            document.getElementById("today-weather").innerHTML = "";
  
            displayWeather(data,weatherResults.city.name,);
        });
        } else {
            alert('Error: ' + response.statusText);
        }
    });
};

var displayWeather = function (weatherParams, searchTerm) {
    repoSearchTerm.textContent = searchTerm.toLowerCase();

    localStorage.setItem("weather", JSON.stringify(weather));
    // Add new city to weather array
    //check if the city is already in the array if so dont add it again
    //note adding in lowercase to made easy tosearch later
    if((weather.length >= 0) || (! weather.indexOf(searchTerm.toLowerCase()))){
      weather.push(searchTerm.toLowerCase());
    }
    
    // Store updated todos in localStorage, re-render the list
    storedWeather();
    renderWeather();
    
    // in roder to display five day forecast may have to reduce three out of eight days
    //for (var i = 0; i < weatherParams.daily.length-2; i++) {
      let currentDay = weatherParams.daily[0];
        // Parse the Unix timestamp and convert into any date format.
        var weatherDate = moment.unix(currentDay.dt).format("MM/DD/YYYY");
        var uvi = currentDay.uvi;
        //for each day create a card elemets  with the weather conditions
        var weatherCard = document.createElement('section');
        weatherCard.classList = "flex-row weather-card";
        weatherCard.innerHTML = weatherCard.innerHTML =
        `<section class="weather-card" id="day0">
            <header>${weatherDate}</header>
            <img src="http://openweathermap.org/img/wn/${currentDay.weather[0].icon}@4x.png" alt="${currentDay.weather[0].description}" />
            <p>Temp: ${currentDay.temp.day} F</p>
            <p>Wind: ${currentDay.wind_speed} MPH</p>
            <p>Humidity: ${currentDay.humidity}%</p>`;

            // 
            // Low exposure (green): 1-2
            // Moderate exposure (yellow): 3-5
            // High exposure (orange): 6-7
            // Very high exposure (red): 8-10
            // Extreme exposure (violet): 11+
            // 
            if(uvi < 2){
                //green
                weatherCard.innerHTML = weatherCard.innerHTML + `<p>UV Index: <span class="uvi-low">${currentDay.uvi}</span></p>
                </section>`;
            }else if(uvi > 2 && uvi < 7 ){
                //yellow
                weatherCard.innerHTML = weatherCard.innerHTML +  `<p> UV Index:<span class="uvi-moderate"> ${currentDay.uvi}</span></p>
                </section>`;
            }else{
                //red
                weatherCard.innerHTML = weatherCard.innerHTML + `<p> UV Index: <span class="uvi-high">${currentDay.uvi}</span></p>
                </section>`;
            }
        
         //if(i==0){
        //   document.getElementById("today-weather").innerHTML = "";
        //     //append today weather to the repcontainer
        //     todayWeather.classList = "today-weather";
        //     //todayWeather.setAttribute("id","weather-per-day");
        ////     repoContainerEl.appendChild(todayWeather);
        //mainday.appendChild('#day0');
         //}else{
           // repoContainerEl.appendChild(weatherCard);
       // }
    
  //}//for
  repoContainerEl.appendChild(weatherCard);
};

// This function is being called below and will run when the page loads.
function init() {
   // Get stored weather from localStorage
    var storedWeather = JSON.parse(localStorage.getItem("weather"));
  
    // If weather were retrieved from localStorage, update the weather array to it
    if (storedWeather !== null) {
      weather = storedWeather;
    }
    // This is a helper function that will render weather to the DOM
  renderWeather();
}
  
// The following function renders items in a WeatherCity list as <li> elements
function renderWeather() {
    // Clear todoList element and update todoCountSpan
    weatherCityButtonsEl.innerHTML = "";
    //todoCountSpan.textContent = weather.length;
    
    // Render a new button for last viewed
      let lastViewed = weather.length-1;
      var WeatherCity = weather[lastViewed];
      var weatherCityButton = document.createElement("button");
      weatherCityButton.textContent = WeatherCity;
      weatherCityButton.setAttribute("data-index", lastViewed);
      weatherCityButton.setAttribute("id", weather[lastViewed]);
      weatherCityButton.setAttribute("class", "btn");
      //weatherCityButton.appendChild(button);
      weatherCityButtonsEl.appendChild(weatherCityButton);
  }

function storedWeather() {
    // Stringify and set key in localStorage to weather array
    localStorage.setItem("weather", JSON.stringify(weather));
}

weatherFormEl.addEventListener('submit', formSubmitHandler);
weatherCityButtonsEl.addEventListener('click', buttonClickHandler);

// Add click event to weather button element
weatherCityButtonsEl.addEventListener("click", function(event) {
    var element = event.target;
    // Checks if element is a button
    if (element.matches("button") === true) {
      // Get its data-index value and remove the todo element from the list
      var index = element.parentElement.getAttribute("data-index");
      //call the function get city weather with the city name  to get the data again.
      getCityWeather(element.id);

      // Store updated todos in localStorage, re-render the list
      storedWeather();
      renderWeather();
    }
});

// Calls init to retrieve data and render it to the page on load
init()

//locations searching by lat and lon
////https://api.teleport.org/api/locations/-33.8679,151.2073 
