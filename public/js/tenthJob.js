$(document).ready(function() {
    $('#job-button').click(function() {
      var selectedJob = $('#job-selector').val();
      // Perform the desired action based on the selected job, such as redirecting to the corresponding URL
      window.location.href = selectedJob;
    });
});
  
document.getElementById('uploadButton').addEventListener('click', function() {
    fetch('/api/upload-tenth-job-csv', {
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
        const response = await fetch('/api/get-tenth-job-data');
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
var margin = { top: 130, right: 20, bottom: 120, left: 50 };
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

function updateVisualization(data, selectedcause, selectedcountry) {
    var filteredData;

    if (selectedcause === "All Causes" && selectedcountry === "All Countries") {
        // Calculate the total, minimum, and maximum for all causes and countries
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
            aggregates[country].total += d.average;
            aggregates[country].count++;
            aggregates[country].min = Math.min(aggregates[country].min, d.minimum);
            aggregates[country].max = Math.max(aggregates[country].max, d.maximum);
        });
    
        // Calculate the average for each country
        Object.values(aggregates).forEach(function (countryData) {
            countryData.average = Math.trunc(countryData.total / countryData.count);
        });
    
        // Convert the aggregates object to an array
        filteredData = Object.values(aggregates);
    } else {
        // Filter based on selected cause and country
        filteredData = data.filter(function (d) {
            return (selectedcause === "All Causes" || d.cause === selectedcause) &&
                (selectedcountry === "All Countries" || d.country === selectedcountry);
        });
    
        // Calculate the total, minimum, and maximum for the filtered data
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
            aggregates[country].total += d.average;
            aggregates[country].count++;
            aggregates[country].min = Math.min(aggregates[country].min, d.minimum);
            aggregates[country].max = Math.max(aggregates[country].max, d.maximum);
        });
    
        // Calculate the average for each country
        Object.values(aggregates).forEach(function (countryData) {
            countryData.average = Math.trunc(countryData.total / countryData.count);
        });
    
        // Convert the aggregates object to an array
        filteredData = Object.values(aggregates);
    }
    
    // Calculate the maximum y-axis value from the filtered dataset
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
                { category: "Minimum", value: d.min },
                { category: "Maximum", value: d.max },
                { category: "Average", value: avg }
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
            if (d.category === "Minimum") {
                return "#008080";
            } else if (d.category === "Maximum") {
                return "#800020";
            } else if (d.category === "Average") {
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

    // Update the selected cause and country in the UI
    d3.select("#selected-cause").text(selectedcause);
    d3.select("#selected-country").text(selectedcountry);
}    

// Get the cause select and country select elements
var causeSelect = document.getElementById("cause-select");
var countrieselect = document.getElementById("country-select");

// Event listener for select change
causeSelect.addEventListener("change", async function (event) {
    var selectedcause = event.target.value;
    var selectedcountry = countrieselect.value;

    // Fetch data from the server
    var data = await fetchData();

    // Update the visualization based on the selected cause and country
    updateVisualization(data, selectedcause, selectedcountry);
});

// Event listener for select change
countrieselect.addEventListener("change", async function (event) {
    var selectedcause = causeSelect.value;
    var selectedcountry = event.target.value;

    // Fetch data from the server
    var data = await fetchData();

    // Update the visualization based on the selected cause and country
    updateVisualization(data, selectedcause, selectedcountry);
});

// Fetch causes data and return a promise
function fetchcauses() {
    return fetch('/api/get-causes-tenth-job')
        .then(response => response.json())
        .then(causes => {
            console.log('Fetched causes:', causes);
            return causes;
        })
        .catch(error => {
            console.error('Error fetching causes:', error);
            return [];
        });
}

// Fetch countries data and return a promise
function fetchcountries() {
    return fetch('/api/get-countries-tenth-job')
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

// Initial population of the cause select and country select dropdowns
async function initialize() {
    try {
        // Fetch causes and countries data
        var causes = await fetchcauses();
        var countries = await fetchcountries();

        // Add "All" option to country select dropdown
        countries.unshift("All Countries");

        // Add "All" option to country select dropdown
        causes.unshift("All Causes");

        // Populate the cause select dropdown
        populateSelect(causeSelect, causes);

        // Populate the country select dropdown
        populateSelect(countrieselect, countries);

        // Fetch data from the server
        var data = await fetchData();

        // Update the visualization with initial data and selected options
        var selectedcause = causeSelect.value;
        var selectedcountry = countrieselect.value;
        updateVisualization(data, selectedcause, selectedcountry);
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