document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([43.4929, -112.0401], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    var markers = L.markerClusterGroup();

    var geojsonData;

    // Fetch GeoJSON data
    fetch('projects.geojson')
        .then(response => response.json())
        .then(data => {
            geojsonData = data; // Store the GeoJSON data for later use

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

    // Function to show information card
    window.showInfoCard = function(e, projectName, city, state, fundingAmount) {
        e.preventDefault();
        map.closePopup();
        
        document.getElementById('projectTitle').innerText = projectName;
        document.getElementById('projectDetails').innerHTML = `Location: ${city}, ${state}<br>Funding Amount: $${Number(fundingAmount).toLocaleString()}`;
        
        document.getElementById('infoCard').style.display = 'block';
        document.getElementById('overlay').style.display = 'block';
    };

    // Function to hide information card
    window.hideCard = function() {
        document.getElementById('infoCard').style.display = 'none';
        document.getElementById('overlay').style.display = 'none';
    };

    document.getElementById('overlay').addEventListener('click', function() {
        hideCard();
    });

    document.getElementById('infoCard').addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Implement the search functionality
    $("#projectSearch").autocomplete({
        source: function(request, response) {
            const results = geojsonData.features.filter(feature => {
                const projectName = feature.properties['Project Name'].toLowerCase();
                const term = request.term.toLowerCase();
                return projectName.includes(term);
            }).map(feature => ({
                label: feature.properties['Project Name'] + ' - ' + feature.properties.City + ', ' + feature.properties.State,
                value: feature.properties['Project Name']
            }));
            response(results);
        },
        minLength: 2,
        select: function(event, ui) {
            const selectedFeature = geojsonData.features.find(feature => feature.properties['Project Name'] === ui.item.value);
            if(selectedFeature) {
                map.flyTo([selectedFeature.geometry.coordinates[1], selectedFeature.geometry.coordinates[0]], 14);
            }
        }
    });
});
