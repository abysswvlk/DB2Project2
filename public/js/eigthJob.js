$(document).ready(function() {
    $('#job-button').click(function() {
      var selectedJob = $('#job-selector').val();
      // Perform the desired action based on the selected job, such as redirecting to the corresponding URL
      window.location.href = selectedJob;
    });
});
  
document.getElementById('uploadButton').addEventListener('click', function() {
    fetch('/api/upload-eighth-job-csv', {
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
        const response = await fetch('/api/get-eighth-job-data');
        const data = await response.json();
        console.log('Fetched Data:', data); // Log the fetched data
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// Set up the SVG dimensions and margins
var svgWidth = 800;
var svgHeight = 400;
var margin = { top: 140, right: 120, bottom: 120, left: 50 };
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

function updateVisualization(data, selecteddecade, selectedsubRegion, selectedSex) {
    var filteredData;

    if (selecteddecade === "All decades" && selectedsubRegion === "All SubRegions" && selectedSex == "All Sexes") {
        // Calculate the total, minimum, and maximum for all decades and subRegions
        var aggregates = {};
    
        data.forEach(function (d) {
            var subRegion = d.subRegion;
            if (!aggregates[subRegion]) {
                aggregates[subRegion] = {
                    subRegion: d.subRegion,
                    total: 0,
                    count: 0,
                    min: Infinity,
                    max: -Infinity
                };
            }
            aggregates[subRegion].total += d.average;
            aggregates[subRegion].count++;
            aggregates[subRegion].min = Math.min(aggregates[subRegion].min, d.minimum);
            aggregates[subRegion].max = Math.max(aggregates[subRegion].max, d.maximum);
        });
    
        // Calculate the average for each subRegion
        Object.values(aggregates).forEach(function (subRegionData) {
            subRegionData.average = Math.trunc(subRegionData.total / subRegionData.count);
        });
    
        // Convert the aggregates object to an array
        filteredData = Object.values(aggregates);
    } else {
        // Filter based on selected decade and subRegion
        filteredData = data.filter(function (d) {
            return (selecteddecade === "All decades" || d.decade === parseInt(selecteddecade)) &&
                (selectedsubRegion === "All SubRegions" || d.subRegion === selectedsubRegion) &&
                (selectedSex === "All Sexes" || d.sex === selectedSex);
        });
    
        // Calculate the total, minimum, and maximum for the filtered data
        var aggregates = {};
    
        filteredData.forEach(function (d) {
            var subRegion = d.subRegion;
            if (!aggregates[subRegion]) {
                aggregates[subRegion] = {
                    subRegion: d.subRegion,
                    total: 0,
                    count: 0,
                    sex: d.sex,
                    min: Infinity,
                    max: -Infinity
                };
            }
            aggregates[subRegion].total += d.average;
            aggregates[subRegion].count++;
            aggregates[subRegion].min = Math.min(aggregates[subRegion].min, d.minimum);
            aggregates[subRegion].max = Math.max(aggregates[subRegion].max, d.maximum);
        });
    
        // Calculate the average for each subRegion
        Object.values(aggregates).forEach(function (subRegionData) {
            subRegionData.average = Math.trunc(subRegionData.total / subRegionData.count);
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
        return d.subRegion;
    }));

    yScale.domain([0, maxHomicideValue]);

    // Remove previous bars and axes
    chart.selectAll(".bar-group").remove();
    chart.selectAll(".axis").remove();

    // Create the bar groups
    var barGroups = chart.selectAll(".bar-group")
        .data(filteredData, function (d) {
            return d.subRegion;
        }) // Use subRegion as the data key
        .enter()
        .append("g")
        .attr("class", "bar-group")
        .attr("transform", function (d) {
            return "translate(" + (xScale(d.subRegion) - xScale.bandwidth() / 6) + ",0)";
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
        .attr("transform", "rotate(-44)")
        .attr("dx", "-0.8em") // Adjust the x-axis label position
        .attr("dy", "0.15em") // Adjust the y-axis label position
        .style("font-size", "8px");

    // Update the selected decade and subRegion in the UI
    d3.select("#selected-decade").text(selecteddecade);
    d3.select("#selected-subRegion").text(selectedsubRegion);
}    

// Get the decade select and subRegion select elements
var decadeSelect = document.getElementById("decade-select");
var subRegionSelect = document.getElementById("subRegion-select");
var sexSelect = document.getElementById("sex-select");

// Event listener for select change
decadeSelect.addEventListener("change", async function (event) {
    var selecteddecade = event.target.value;
    var selectedsubRegion = subRegionSelect.value;
    var selectedSex = sexSelect.value;

    // Fetch data from the server
    var data = await fetchData();

    // Update the visualization based on the selected decade and subRegion
    updateVisualization(data, selecteddecade, selectedsubRegion, selectedSex);
});

// Event listener for select change
subRegionSelect.addEventListener("change", async function (event) {
    var selecteddecade = decadeSelect.value;
    var selectedsubRegion = event.target.value;
    var selectedSex = sexSelect.value;

    // Fetch data from the server
    var data = await fetchData();

    // Update the visualization based on the selected decade and subRegion
    updateVisualization(data, selecteddecade, selectedsubRegion, selectedSex);
});

sexSelect.addEventListener("change", async function (event) {
    var selecteddecade = decadeSelect.value;
    var selectedsubRegion = subRegionSelect.value;
    var selectedSex = event.target.value; // Assign the selected sex value correctly

    // Fetch data from the server
    var data = await fetchData();

    // Update the visualization based on the selected decade, subRegion, and sex
    updateVisualization(data, selecteddecade, selectedsubRegion, selectedSex);
});

// Fetch decades data and return a promise
function fetchdecades() {
    return fetch('/api/get-decades-eighth-job')
        .then(response => response.json())
        .then(decades => {
            console.log('Fetched decades:', decades);
            return decades;
        })
        .catch(error => {
            console.error('Error fetching decades:', error);
            return [];
        });
}

// Fetch sexes data and return a promise
function fetchSexes() {
    return fetch('/api/get-sex-eighth-job')
        .then(response => response.json())
        .then(sexes => {
            console.log('Fetched Sexes:', sexes);
            return sexes;
        })
        .catch(error => {
            console.error('Error fetching sexes:', error);
            return [];
        });
}


// Fetch subRegions data and return a promise
function fetchsubRegions() {
    return fetch('/api/get-subRegions-eighth-job')
      .then(response => response.json())
      .then(subRegions => {
        // Remove duplicate subRegions
        const uniquesubRegions = Array.from(new Set(subRegions));
        console.log('Fetched subRegions:', uniquesubRegions);
        return uniquesubRegions;
      })
      .catch(error => {
        console.error('Error fetching subRegions:', error);
        return [];
      });
}  

// Initial population of the decade select and subRegion select dropdowns
async function initialize() {
    try {
        // Fetch decades and subRegions data
        var decades = await fetchdecades();
        var subRegions = await fetchsubRegions();
        var sexes = await fetchSexes();

        // Add "All" option to subRegion select dropdown
        subRegions.unshift("All SubRegions");

        // Add "All" option to subRegion select dropdown
        decades.unshift("All decades");

        // Add "All" option to subRegion select dropdown
        sexes.unshift("All Sexes");

        // Populate the decade select dropdown
        populateSelect(decadeSelect, decades);

        // Populate the subRegion select dropdown
        populateSelect(subRegionSelect, subRegions);

        // Populate the subRegion select dropdown
        populateSelect(sexSelect, sexes);

        // Fetch data from the server
        var data = await fetchData();

        // Update the visualization with initial data and selected options
        var selecteddecade = decadeSelect.value;
        var selectedsubRegion = subRegionSelect.value;
        var selectedSex = sexSelect.value;

        updateVisualization(data, selecteddecade, selectedsubRegion, selectedSex);
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