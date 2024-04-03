document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([43.4929, -112.0401], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var markers = L.markerClusterGroup();
    var geojsonData;

    fetch('projects.geojson')
    .then(response => response.json())
    .then(data => {
        geojsonData = data; // Assuming this has city and state data as well

        data.features.forEach(feature => {
            var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]);
            var popupContent = `
                <div>
                    <h3>${feature.properties['Project Name']}</h3>
                    <p>${feature.properties.City}, ${feature.properties.State}</p>
                    <p>Funding Amount: $${feature.properties['Funding Amount'].toLocaleString()}</p>
                    <button onclick="showInfoCard(event, '${feature.properties['Project Name']}', '${feature.properties.City}', '${feature.properties.State}', '${feature.properties['Funding Amount']}')">Learn More</button>
                </div>
            `;
            marker.bindPopup(popupContent);
            markers.addLayer(marker);
        });

        map.addLayer(markers);
    });

    // Implement search for city
    $("#citySearch").autocomplete({
        source: function(request, response) {
            const results = geojsonData.features.filter(feature => {
                const cityName = feature.properties.City.toLowerCase();
                return cityName.includes(request.term.toLowerCase());
            }).map(feature => ({
                label: feature.properties.City + ', ' + feature.properties.State,
                value: feature.properties.City
            }));
            response(results);
        },
        select: function(event, ui) {
            // This needs city boundary data to work as intended
        }
    });

    // Implement search for state
    $("#stateSearch").autocomplete({
        source: function(request, response) {
            const results = geojsonData.features.filter(feature => {
                const stateName = feature.properties.State.toLowerCase();
                return stateName.includes(request.term.toLowerCase());
            }).map(feature => ({
                label: feature.properties.State,
                value: feature.properties.State
            }));
            response(results);
        },
        select: function(event, ui) {
            // This needs state boundary data to work as intended
        }
    });

    // Existing project search implementation...

    // Functions to show/hide info card...
});

// Show and hide card functions remain unchanged

