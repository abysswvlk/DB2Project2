$(document).ready(function() {
    $('#job-button').click(function() {
      var selectedJob = $('#job-selector').val();
      // Perform the desired action based on the selected job, such as redirecting to the corresponding URL
      window.location.href = selectedJob;
    });
});
  
document.getElementById('uploadButton').addEventListener('click', function() {
    fetch('/api/upload-eleventh-job-csv', {
      method: 'POST'
    })
    .then(function(response) {
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Data updated',
          text: 'The data was updated successfully!',
        }).then(function() {
          location.reload(); 
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error updating data: '
        });
      }
    })
    .catch(function(error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error updating  data: '
      });
    });
});

$(document).ready(function() {
    $('#job-button').click(function() {
      var selectedJob = $('#job-selector').val();
      // Perform the desired action based on the selected job, such as redirecting to the corresponding URL
      window.location.href = selectedJob;
    });
});  

// Add an event listener for the "load" event
window.addEventListener("load", async function () {
    await initialize();
});

// D3.js code
// Fetch data from the server
async function fetchData() {
    try {
        const response = await fetch('/api/get-eleventh-job-data');
        const data = await response.json();
        console.log('Fetched Data:', data); // Log the fetched data
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// Set up the SVG dimensions and margins
var svgWidth = 1900;
var svgHeight = 500;
var margin = { top: 130, right: 100, bottom: 120, left: 100 };
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Create the SVG element
var svg = d3.select("#chart")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Create a group within the SVG and apply margins
var chart = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Set up the scales
var xScale = d3.scaleBand()
    .range([0, chartWidth])
    .padding(0.1);

var yScale = d3.scaleLinear()
    .range([chartHeight, 0]);

function updateVisualization(data, selectedfirstYear, selectedcountry, selectedlastYear) {
    var filteredData;

    if (selectedfirstYear === "All First Years" && selectedcountry === "All Countries" && selectedlastYear === "All Last Years") {
        // Calculate the total, firstYear, and lastYear for all firstYears and countries
        var aggregates = {};
    
        data.forEach(function (d) {
            var country = d.country;
            if (!aggregates[country]) {
                aggregates[country] = {
                    country: d.country,
                    total: 0,
                    count: 0,
                    min: Infinity,
                    max: -Infinity
                };
            }
            aggregates[country].total += d.difference;
            aggregates[country].count++;
            aggregates[country].min = Math.min(aggregates[country].min, d.firstYear);
            aggregates[country].max = Math.max(aggregates[country].max, d.lastYear);
        });
    
        // Calculate the difference for each country
        Object.values(aggregates).forEach(function (countryData) {
            countryData.difference = Math.trunc(countryData.total / countryData.count);
        });
    
        // Convert the aggregates object to an array
        filteredData = Object.values(aggregates);
    } else {
        // Filter based on selected firstYear and country
        filteredData = data.filter(function (d) {
            return (selectedfirstYear === "All First Years" || d.firstDate === selectedfirstYear) &&
                (selectedcountry === "All Countries" || d.country === selectedcountry) &&
                (selectedlastYear === "All Last Years" || d.lastDate === selectedlastYear);
        });
    
        // Calculate the total, firstYear, and lastYear for the filtered data
        var aggregates = {};
    
        filteredData.forEach(function (d) {
            var country = d.country;
            if (!aggregates[country]) {
                aggregates[country] = {
                    country: d.country,
                    total: 0,
                    count: 0,
                    min: Infinity,
                    max: -Infinity
                };
            }
            aggregates[country].total += d.difference;
            aggregates[country].count++;
            aggregates[country].min = Math.min(aggregates[country].min, d.firstYear);
            aggregates[country].max = Math.max(aggregates[country].max, d.lastYear);
        });
    
        // Calculate the difference for each country
        Object.values(aggregates).forEach(function (countryData) {
            countryData.difference = Math.trunc(countryData.total / countryData.count);
        });
    
        // Convert the aggregates object to an array
        filteredData = Object.values(aggregates);
    }
    
    // Calculate the lastYear y-axis value from the filtered dataset
    var maxHomicideValue = d3.max(filteredData, function (d) {
        return d.max;
    });

    // Update the scales' domains
    xScale.domain(filteredData.map(function (d) {
        return d.country;
    }));
    yScale.domain([0, maxHomicideValue]);

    // Remove previous bars and axes
    chart.selectAll(".bar-group").remove();
    chart.selectAll(".axis").remove();

    // Create the bar groups
    var barGroups = chart.selectAll(".bar-group")
        .data(filteredData, function (d) {
            return d.country;
        }) // Use country as the data key
        .enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", function (d) {
            return "translate(" + (xScale(d.country) - xScale.bandwidth() / 6) + ",0)";
        });        

    // Create the bars within each bar group
    var bars = barGroups.selectAll(".bar")
        .data(function (d) {
            var avg = d.total / d.count;
            return [
                { category: "firstYear", value: d.min },
                { category: "lastYear", value: d.max },
                { category: "difference", value: avg }
            ];
        })
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d, i) {
            return (i * xScale.bandwidth() / 3) + (xScale.bandwidth() / 7   );
        })        
        .attr("y", function (d) {
            return yScale(d.value);
        })
        .attr("width", xScale.bandwidth() / 3)
        .attr("height", function (d) {
            return chartHeight - yScale(d.value);
        })
        .attr("fill", function (d) {
            // Assign different colors to different categories
            if (d.category === "firstYear") {
                return "#008080";
            } else if (d.category === "lastYear") {
                return "#800020";
            } else if (d.category === "difference") {
                return "#556B2F";
            }
        })
        .on("mouseover", function (event, d) {
            // Get the position and size of the current bar
            var bar = d3.select(this);
            var barGroup = bar.node().parentNode;
            var barGroupTransform = d3.select(barGroup).attr("transform");
            var xPos = parseFloat(bar.attr("x")) + xScale.bandwidth() / 6;
            var yPos = parseFloat(bar.attr("y")) - 10;
        
            // Adjust the position based on the bar group's translation
            if (barGroupTransform) {
                var translationValues = barGroupTransform.split("(")[1].split(")")[0].split(",");
                var tx = parseFloat(translationValues[0]);
                var ty = parseFloat(translationValues[1]);
                xPos += tx;
                yPos += ty;
            }
        
            // Show a tooltip with the value
            var tooltip = chart.append("text")
                .attr("class", "bar-value")
                .attr("x", xPos)
                .attr("y", yPos)
                .attr("text-anchor", "middle")
                .text(d.value); // Display the value
        
            // Store the tooltip reference in the bar's data
            d.tooltip = tooltip;
        }).on("mouseout", function (event, d) {
            // Remove the tooltip when the mouse leaves the bar
            d3.select(this).attr("opacity", 1); // Reset bar opacity
            d.tooltip.remove();
        });        

    // Remove the previous tooltips when updating the visualization
    chart.selectAll(".bar-value").remove();

    // Add the y-axis
    chart.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(yScale));

    // Add the x-axis
    chart.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + chartHeight + ")")
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-45)")
    .attr("dx", "-0.8em")
    .attr("dy", "0.15em")
    .style("font-size", "8px")
    .text(function (d) { return d; });  


    // Update the selected firstYear and country in the UI
    d3.select("#selected-firstYear").text(selectedfirstYear);
    d3.select("#selected-country").text(selectedcountry);
}    

// Get the firstYear select and country select elements
var firstYearSelect = document.getElementById("firstYear-select");
var lastYearSelect = document.getElementById("lastYear-select");
var countrieselect = document.getElementById("country-select");

// Event listener for select change
firstYearSelect.addEventListener("change", async function (event) {
    var selectedfirstYear = event.target.value;
    var selectedlastYear = lastYearSelect.value;
    var selectedcountry = countrieselect.value;

    // Fetch data from the server
    var data = await fetchData();

    // Update the visualization based on the selected firstYear and country
    updateVisualization(data, selectedfirstYear, selectedcountry, selectedlastYear);
});

// Event listener for select change
lastYearSelect.addEventListener("change", async function (event) {
    var selectedfirstYear = firstYearSelect.value;
    var selectedlastYear = event.target.value;
    var selectedcountry = countrieselect.value;

    // Fetch data from the server
    var data = await fetchData();

    // Update the visualization based on the selected firstYear and country
    updateVisualization(data, selectedfirstYear, selectedcountry, selectedlastYear);
});

// Event listener for select change
countrieselect.addEventListener("change", async function (event) {
    var selectedfirstYear = firstYearSelect.value;
    var selectedlastYear = lastYearSelect.value;
    var selectedcountry = event.target.value;

    // Fetch data from the server
    var data = await fetchData();

    // Update the visualization based on the selected firstYear and country
    updateVisualization(data, selectedfirstYear, selectedcountry, selectedlastYear);
});

// Fetch firstYears data and return a promise
function fetchfirstYears() {
    return fetch('/api/get-firstYears-eleventh-job')
        .then(response => response.json())
        .then(firstYears => {
            console.log('Fetched firstYears:', firstYears);
            return firstYears;
        })
        .catch(error => {
            console.error('Error fetching firstYears:', error);
            return [];
        });
}

// Fetch lastYears data and return a promise
function fetchlastYears() {
    return fetch('/api/get-lastYears-eleventh-job')
        .then(response => response.json())
        .then(lastYears => {
            console.log('Fetched lastYears:', lastYears);
            return lastYears;
        })
        .catch(error => {
            console.error('Error fetching lastYears:', error);
            return [];
        });
}

// Fetch countries data and return a promise
function fetchcountries() {
    return fetch('/api/get-countries-eleventh-job')
      .then(response => response.json())
      .then(countries => {
        // Remove duplicate countries
        const uniquecountries = Array.from(new Set(countries));
        console.log('Fetched countries:', uniquecountries);
        return uniquecountries;
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
        return [];
      });
}  

// Initial population of the firstYear select and country select dropdowns
async function initialize() {
    try {
        // Fetch firstYears and countries data
        var firstYears = await fetchfirstYears();
        var lastYears = await fetchlastYears();
        var countries = await fetchcountries();

        // Add "All" option to country select dropdown
        countries.unshift("All Countries");

        // Add "All" option to country select dropdown
        firstYears.unshift("All First Years");

        // Add "All" option to country select dropdown
        lastYears.unshift("All Last Years");

        // Populate the firstYear select dropdown
        populateSelect(firstYearSelect, firstYears);

        // Populate the lastYear select dropdown
        populateSelect(lastYearSelect, lastYears);

        // Populate the country select dropdown
        populateSelect(countrieselect, countries);

        // Fetch data from the server
        var data = await fetchData();

        // Update the visualization with initial data and selected options
        var selectedfirstYear = firstYearSelect.value;
        var selectedlastYear = lastYearSelect.value;
        var selectedcountry = countrieselect.value;
        updateVisualization(data, selectedfirstYear, selectedcountry, selectedlastYear);
    } catch (error) {
        console.error('Error initializing:', error);
    }
}

// Function to populate a select dropdown
function populateSelect(selectElement, options) {
    selectElement.innerHTML = "";

    options.forEach(function (option) {
        var optionElement = document.createElement("option");
        optionElement.value = option;
        optionElement.text = option;
        selectElement.appendChild(optionElement);
    });
}