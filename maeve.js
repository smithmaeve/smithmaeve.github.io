//function used when someone is searching in places search bar. called from html
function SearchPlaces() {
	
	var input = document.getElementById("places_input");
	var filter = input.value.toUpperCase();
	
	for (i=0; i<places_array.length; i++) {
		var places_txt = places_array[i];
		
		if (places_txt.toUpperCase().indexOf(filter) > -1) {
			document.getElementById(places_array[i]).style.display = '';
			document.getElementById(places_array[i]+" label").style.display = '';
		} else {
			document.getElementById(places_array[i]).style.display = 'none';
			document.getElementById(places_array[i]+" label").style.display = 'none';
		} 
	}
	
}


//function is used when someone alters the select all button for places
function updatePlaces() {
	//two parts, if it is selected to have all tails or deselected 
	var checked_status = document.getElementById("checkbox-place").checked; 
	
	//if false means that it was unselected so need to turn off all other labels.
	
	if (checked_status == false) {
		for (i=0; i < places_array.length; i++) {
			var place = places_array[i];
			document.getElementById(place).checked = false;
		} 
	} else {
		for (i=0; i < places_array.length; i++) {
			var place = places_array[i];
			document.getElementById(place).checked = true;
		}
	}		
}


//function is used when someone clicks on a single place with select all on
function updateSelectAllPlaces() {
	var checked_status = document.getElementById("checkbox-place").checked;
	
	if (checked_status == true) {
		document.getElementById("checkbox-place").checked = false;
	} else {
		var counter = 0;
		for (var i=0; i < places_array.length; i++) { 
			var place = places_array[i];
			if (document.getElementById(place).checked == true) {
				counter++;
			}
		}
		
		if (counter == places_array.length) {
			document.getElementById("checkbox-place").checked = true;
		}
	}
}



function fetchData(url, checked_places) {
	fetch (url) 
		.then (function(response) {
			return response.json()
		})
		.then (function(data) {
			data_dict = data['features']
		})
		.then (function(data) {
			var number = Object.keys(data_dict).length ;
			var count = 0;
			var curr_array = [];

			for (var i=0; i < number; i++) {
				var place = data_dict[i]['properties']['place'];

				var index = place.indexOf(',');
				if (index > -1) {
					//this means that this substring is in place and we want to split string
					var place_split = place.split(', ');
					place = place_split[1];
					
				}

				place = place[0].toUpperCase() + place.slice(1); //make sure the first letter is uppercase

				if (place in checked_places) {
					//this means it is one of the ones we want to use to display

					var mag = data_dict[i]['properties']['mag'];
					var lat = data_dict[i]['geometry']['coordinates'][1];
					var lng = data_dict[i]['geometry']['coordinates'][0];

					var array = [Number(lat), Number(lng), Number(mag)];
					curr_array[count] = array;
					count++;
					
				}


			}

			var gradient_dict = {0: "darkBlue", .19: "blue", .29: "deepSkyBlue", .39:"cyan", .49: "lime", .59:"yellow", .69:"orange", .79:"red", .89:"#880808"};

			console.log(curr_array);
		
			heatLayer = new L.idwLayer(curr_array,{
				cellSize: 8,
				exp: 2,
				max: 10,
				gradient: gradient_dict
			}).addTo(map);
		
		})
		.catch(function(error) {
			console.log(error)
		})
}

function updateHeatMapFilters() {

	
	if (selectedDate == null) {
		selectedDate = document.getElementById('1-day').id;
	}
	var date = document.getElementById(selectedDate).value; //this is the ending of the url 
	
	var checked_places = {};//dictionary to store the places that we want to display because they have been checked

	//iterates through all the places that have been added to the dropdown
	for (i=0; i<places_array.length; i++) {
		var place = places_array[i]; //get the current place
		
		//if this place's checkbox has been selected, add it to the array of places that have been selected.
		if (document.getElementById(place).checked == true) {
			checked_places[place] = place;
		}
	}

	if (heatLayer) {
		map.removeLayer(heatLayer);
	}


	var url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/' + date + '.geojson';
	console.log(url);

	fetchData(url, checked_places);
	
	
}



//initalize map, setting location and zoom
var map = L.map('map', {
	center: [20,-40],
	zoom: 2.5,
	maxZoom: 7,
	zoomControl: false,
	closePopupOnClick: true,
});


//moves zoom control to bottom right of the map
L.control.zoom({
	position: 'bottomright'
}).addTo(map);
 
//update to open street maps
var base_map = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


var heat_array = [];
var heatLayer = null;
var heat = L.heatLayer (heat_array); //creates an empty heatmap layer in order to display in the control 


//should have toggle of the different layers
var overlayMaps = {
	"Heat Map": heat,
};


	
//idea from https://rowanhogan.github.io/Leaflet/examples/layers-control.html
var control_layers = L.control.layers(null, overlayMaps, {
	collapsed: false
}).addTo(map);


var legend = L.control({position: 'bottomleft' });
var date_range = L.control({position: 'bottomleft' });



date_range.onAdd = function(map) {
	
	var div = L.DomUtil.create('div', 'heatmap-date');
	
	div.innerHTML += "<h6 id='heatmap-date-range'>Select Date Range</h6>";
	div.innerHTML += "<input type='radio' id='1-hour' name='time' value='all_hour'>";
	div.innerHTML += "<label for='1-hour'>Past Hour</label><br>";
	div.innerHTML += "<input type='radio' id= '1-day' name='time' value='all_day' checked>";
	div.innerHTML += "<label for='1-day'>Past Day</label><br>";
	div.innerHTML += "<input type='radio' id= '7-days' name='time' value='all_week'>";
	div.innerHTML += "<label for='7-days'>Past 7 Days</label><br>";
	div.innerHTML += "<input type='radio' id = '30-days' name='time' value='all_month'>";
	div.innerHTML += "<label for='30-days'>Past 30 Days</label><br>";


	return div;
};

	
legend.onAdd = function(map) {
	var div = L.DomUtil.create('div', 'legend');
	div.innerHTML += "<h3>SNR Legend</h3>";
	div.innerHTML += '<i style="background: darkBlue"></i><span>0 - 1.9</span><br>';
	div.innerHTML += '<i style="background: blue"></i><span>2.0 - 2.9</span><br>';
	div.innerHTML += '<i style="background: deepSkyBlue"></i><span>3.0 - 3.9</span><br>';
	div.innerHTML += '<i style= "background: cyan"></i><span>4.0 - 4.9</span><br>';
	div.innerHTML += '<i style= "background: lime"></i><span> 5 - 5.9</span><br>';
	div.innerHTML += '<i style= "background: yellow"></i><span>6 - 6.9</span><br>'; 
	div.innerHTML += '<i style= "background: orange"></i><span>7 - 7.9</span><br>';  
	div.innerHTML += '<i style= "background: red"></i><span>8 - 8.9</span><br>'; 
	div.innerHTML += '<i style= "background: #880808"></i><span>9 - 9.9</span><br>'; 
		
	return div;
};

//listen for user to select all places
document.getElementById("checkbox-place").addEventListener("click", updatePlaces);

//listen for user to select places
document.getElementById("places_submit").addEventListener("click", updateHeatMapFilters);

var places_array = [];
var place_dict = {};

//gets the list of places from live earthquake data from the past 30 days
fetch ('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')
	.then(function(response) {
		return response.json()
	})
	.then(function(data) {
		data_dict = (data['features'])
	})
	.then (function(data) {
		length = Object.keys(data_dict).length ;
		var amount = 0;

		for (var i=0; i<length; i++) {
			var place = ((data_dict[i])['properties'])['place'];

			var index = place.indexOf(',');
			if (index > -1) {
				//this means that this substring is in place and we want to split string
				var place_split = place.split(', ');
				place = place_split[1];
				
			}
			place = place[0].toUpperCase() + place.slice(1); //make sure the first letter is uppercase

			if (!(place in place_dict)) {
				//we only want unique places
				
				places_array[amount] = place;
				place_dict[place] = place;
				amount++;
			}
					
		
		}
		places_array.sort(); //makes the places be alaphabetical
		console.log(places_array);
		

		for (var i=0; i< places_array.length; i++) {

			var place = places_array[i];
			
			var div = document.createElement("div");
			div.setAttribute('class', "checkbox");
			var input = document.createElement('input');
			input.setAttribute('type', "checkbox");
			input.setAttribute('name', "dropdown-group");
			input.setAttribute('class' ,"checkbox-custom-place");
			// input.setAttribute('checked', 'False');
			input.setAttribute('id', place);
			var label = document.createElement('label');
			label.setAttribute('for', place);
			label.setAttribute('class', "checkbox-custom-label");
			label.setAttribute('id', place+" label");
			label.textContent = place;
			div.appendChild(input);
			div.appendChild(label);
	
			document.getElementById('places-dropdown-content').appendChild(div);
			
		}
		
		
	})
	.then(function(data) {
		//listen for user to select single place
		document.getElementById('checkbox-place').checked = false;
		updatePlaces(); //want to start with all unchecked
			
		var checkbox_arr = document.getElementsByClassName("checkbox-custom-place");

		for (var f=0; f < checkbox_arr.length; f++) {
			checkbox_arr[f].addEventListener('click', updateSelectAllPlaces);
		}	
		
	})
	
	.catch(function(error) {
		console.log(error)
	})		

var previous_date = null;
function radioButton() {
		var ele = document.getElementsByName('time');
		if (selectedDate) {
			previous_date = document.getElementById(selectedDate).id;
		}

	
		for (var i=0; i< ele.length; i++) {
			if (ele[i].checked) {
				selectedDate = ele[i].id;
			}
		}
	
		updateHeatMapFilters();
	}
	

let selectedDate = null;

function displayPlaces() {
	

	//need to create something to store places  similar to dropdown for tails .
	document.getElementById('places-container').style.display = 'flex';
	
	//listen for user to select single tail
			
	var checkbox_arr = document.getElementsByClassName("checkbox-custom-place");

	for (var f=0; f < checkbox_arr.length; f++) {
		checkbox_arr[f].addEventListener('click', updateSelectAllPlaces);
	}	
		
	legend.addTo(map);
	date_range.addTo(map);

	if (selectedDate){
		document.getElementById(selectedDate).checked = true;
	} 
	 
	var ele = document.getElementsByName('time');

	for (var i=0; i< ele.length; i++) {
		document.getElementById(ele[i].id).addEventListener("click", radioButton);
	}
}

var check_heat;
$(".leaflet-control-layers-selector").on('click', function() {
	//get the selected option in the control layers
	check_heat = 0;

	map.eachLayer(function (layer) {
		
		if (layer == heat) {
			check_heat = 1;
			displayPlaces();
		}
		
	});
	
	if (check_heat == 0) {
		document.getElementById('places-container').style.display = 'none';
		map.removeControl(legend);
		map.removeControl(date_range);
		selectedDate = null;
		map.removeLayer(heatLayer);
	}
	
	
});



map.on('mousemove', function(e) {
	var lat = map.wrapLatLng(e.latlng).lat.toFixed(3);
	var lng = map.wrapLatLng(e.latlng).lng.toFixed(3);
	document.getElementById("coordinates").innerHTML = lat +", " + lng;
	
	
});