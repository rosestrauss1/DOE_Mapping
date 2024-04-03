document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([43.4929, -112.0401], 5);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create marker cluster group
    var markers = L.markerClusterGroup({
        // Customize the cluster marker icon based on the number of markers it contains
        iconCreateFunction: function(cluster) {
            var childCount = cluster.getChildCount();
            var size = 40;

            if (childCount < 10) {
                size = 40;
            } else if (childCount < 100) {
                size = 50;
            } else if (childCount < 1000) {
                size = 60;
            } else {
                size = 70;
            }

            return L.divIcon({
                html: '<div style="width:' + size + 'px;height:' + size + 'px;line-height:' + size + 'px;text-align:center;background-color:rgba(255, 0, 0, 0.5);border-radius:50%;color:white;font-weight:bold;">' + childCount + '</div>',
                className: 'marker-cluster',
                iconSize: L.point(size, size)
            });
        }
    });

    // Fetch GeoJSON data and process it with Leaflet's built-in functionality
    fetch('projects.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJson(data, {
                onEachFeature: function(feature, layer) {
                    var popupContent = `
                        <div>
                            <h3>${feature.properties['Project Name']}</h3>
                            <p>${feature.properties.City}, ${feature.properties.State}</p>
                            <p>Funding Amount: $${feature.properties['Funding Amount'].toLocaleString()}</p>
                            <button onclick="showInfoCard(event, '${feature.properties['Project Name']}', '${feature.properties.City}', '${feature.properties.State}', '${feature.properties['Funding Amount']}')">Learn More</button>
                        </div>
                    `;
                    layer.bindPopup(popupContent);
                    markers.addLayer(layer);
                }
            });
            // Add marker cluster group to map after all markers are added
            map.addLayer(markers);
        });

    // Function to show information card
    window.showInfoCard = function(e, projectName, city, state, fundingAmount) {
        e.preventDefault(); // Prevent default action (for anchor tags, if used)
        map.closePopup(); // Close any open Leaflet pop-up
        
        document.getElementById('projectTitle').innerText = projectName;
        document.getElementById('projectDetails').innerHTML = `Location: ${city}, ${state}<br>Funding Amount: $${Number(fundingAmount).toLocaleString()}`;
        
        // Display the information card and the overlay
        document.getElementById('infoCard').style.display = 'block';
        overlay.style.display = 'block';
    };

    // Function to hide information card
    window.hideCard = function() {
        document.getElementById('infoCard').style.display = 'none';
        overlay.style.display = 'none';
    };

    // Enhancing overlay click to hide the info card and overlay
    overlay.addEventListener('click', function() {
        hideCard();
    });

    // Preventing clicks on the info card from hiding it (stops event propagation)
    document.getElementById('infoCard').addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Autocomplete for project search
    $("#projectSearch").autocomplete({
        source: function(request, response) {
            // Fetch data and filter based on search term
            fetch('projects.geojson')
                .then(response => response.json())
                .then(data => {
                    const results = data.features.filter(feature => {
                        const projectName = feature.properties['Project Name'].toLowerCase();
                        const term = request.term.toLowerCase();
                        return projectName.includes(term);
                    }).map(feature => ({
                        label: feature.properties['Project Name'],
                        value: feature.properties['Project Name']
                    }));
                    response(results);
                });
        },
        minLength: 2, // Minimum characters before triggering autocomplete
        select: function(event, ui) {
            // Handle selection
            // For now, let's just log the selected project
            console.log("Selected project:", ui.item.value);
        }
    });

    // Autocomplete for city search
    $("#citySearch").autocomplete({
        source: function(request, response) {
            // Fetch data and filter based on search term
            fetch('projects.geojson')
                .then(response => response.json())
                .then(data => {
                    const results = data.features.filter(feature => {
                        const city = feature.properties.City.toLowerCase();
                        const term = request.term.toLowerCase();
                        return city.includes(term);
                    }).map(feature => ({
                        label: feature.properties.City,
                        value: feature.properties.City
                    }));
                    response(results);
                });
        },
        minLength: 2, // Minimum characters before triggering autocomplete
        select: function(event, ui) {
            // Handle selection
            // For now, let's just log the selected city
            console.log("Selected city:", ui.item.value);
        }
    });

    // Autocomplete for state search
    $("#stateSearch").autocomplete({
        source: function(request, response) {
            // Fetch data and filter based on search term
            fetch('projects.geojson')
                .then(response => response.json())
                .then(data => {
                    const results = data.features.filter(feature => {
                        const state = feature.properties.State.toLowerCase();
                        const term = request.term.toLowerCase();
                        return state.includes(term);
                    }).map(feature => ({
                        label: feature.properties.State,
                        value: feature.properties.State
                    }));
                    response(results);
                });
        },
        minLength: 2, // Minimum characters before triggering autocomplete
        select: function(event, ui) {
            // Handle selection
            // For now, let's just log the selected state
            console.log("Selected state:", ui.item.value);
        }
    });
});
