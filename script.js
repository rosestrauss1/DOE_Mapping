document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([43.4929, -112.0401], 5);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Assuming the overlay is added directly in HTML, so we don't need to create it dynamically
    var overlay = document.getElementById('overlay');

    function loadProjectLocations() {
        fetch('projects.geojson') // Make sure this path is correct
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
                    }
                }).addTo(map);
            });
    }

    window.showInfoCard = function(e, projectName, city, state, fundingAmount) {
        e.preventDefault(); // Prevent default action (for anchor tags, if used)
        map.closePopup(); // Close any open Leaflet pop-up
        
        document.getElementById('projectTitle').innerText = projectName;
        document.getElementById('projectDetails').innerHTML = `Location: ${city}, ${state}<br>Funding Amount: $${Number(fundingAmount).toLocaleString()}`;
        
        // Display the information card and the overlay
        document.getElementById('infoCard').style.display = 'block';
        overlay.style.display = 'block';
    };

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

    // Load project locations
    loadProjectLocations();

    // Autocomplete for project search
    $("#projectSearch").autocomplete({
        source: function(request, response) {
            // Fetch data and filter based on search term
            fetch('projects.geojson')
                .then(response => response.json())
                .then(data => {
                    const results = data.features.filter(feature => {
                        const projectName = feature.properties['Project Name'].toLowerCase();
                        const city = feature.properties.City.toLowerCase();
                        const state = feature.properties.State.toLowerCase();
                        const term = request.term.toLowerCase();
                        return projectName.includes(term) || city.includes(term) || state.includes(term);
                    }).map(feature => ({
                        label: feature.properties['Project Name'] + ' - ' + feature.properties.City + ', ' + feature.properties.State,
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
});
