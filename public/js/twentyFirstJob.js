$(document).ready(function() {
    $('#job-button').click(function() {
      var selectedJob = $('#job-selector').val();
      // Perform the desired action based on the selected job, such as redirecting to the corresponding URL
      window.location.href = selectedJob;
    });
});
  
document.getElementById('uploadButton').addEventListener('click', function() {
    fetch('/api/upload-twentyFirst-job-csv', {
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
        const response = await fetch('/api/get-twentyFirst-job-data');
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
  
function updateVisualization(data, selectedCountry, selecteddecade) {
  filteredData = [];
  // Filter based on selected filters
  filteredData = data.filter((d) => {
      return (
      (selectedCountry === "All Countries" || d.country === selectedCountry) &&
      (selecteddecade === "All Decades" || d.decade === selecteddecade)
      );
  });
  
  // Calculate the total for the filtered data
  const aggregates = {};
  
  filteredData.forEach((d) => {
      const country = d.country;
      if (!aggregates[country]) {
      aggregates[country] = {
          country: d.country,
          decades: [],
          total: 0,
      };
      }
      aggregates[country].total += parseFloat(d.total);
      if (!aggregates[country].decades.includes(d.decade)) {
          aggregates[country].decades.push(d.decade);
      }
  });

  // Convert the aggregates object to an array
  filteredData = Object.values(aggregates);

// Calculate the maximum y-axis value from the filtered or aggregated dataset
var maxHomicidetotal = d3.max(filteredData, function (d) { return d.total; });

// Update the scales' domains with the filtered data
xScale.domain(filteredData.map(function (d) {
  return d.country;
}));
yScale.domain([0, maxHomicidetotal]);

    // Remove previous bars
    chart.selectAll(".bar").remove();
    // Remove previous axes
    chart.selectAll(".axis").remove();
  
    // Create the bars
    chart.selectAll(".bar")
      .data(filteredData, function (d) {
        return d.country;
      })
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function (d) {
        return xScale(d.country);
      })
      .attr("y", function (d) {
        return yScale(d.total);
      })
      .attr("width", xScale.bandwidth())
      .attr("height", function (d) {
        var barHeight = chartHeight - yScale(d.total);
        return barHeight >= 0 ? barHeight : 0;
      })
      .attr("fill", "#6A5ACD")
      .on("mouseover", function (event, d) {
        // Get the position and size of the current bar
        var xPos = parseFloat(d3.select(this).attr("x"));
        var yPos = parseFloat(d3.select(this).attr("y"));
        var barWidth = parseFloat(d3.select(this).attr("width"));
  
        // Show a tooltip with the value
        chart.append("text")
          .attr("class", "bar-value")
          .attr("x", xPos + barWidth / 2)
          .attr("y", yPos - 5) // Adjust the y position to display above the bar
          .attr("text-anchor", "middle")
          .text(d.total);
      })
      .on("mouseout", function () {
        // Remove the tooltip when the mouse leaves the bar
        chart.selectAll(".bar-value").remove();
      });
  
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
}
  
  // Get the country select element
  var countrySelect = document.getElementById("country-select");
  var decadeSelect = document.getElementById("decade-select");
  
  // Event listener for select change
  countrySelect.addEventListener("change", async function (event) {
    var selectedCountry = event.target.value;
    var selecteddecade = decadeSelect.value;
  
    // Fetch data from the server
    var data = await fetchData();
  
    // Update the visualization based on the selected country and decade
    updateVisualization(data, selectedCountry, selecteddecade);
  });
  
  // Event listener for select change
  decadeSelect.addEventListener("change", async function (event) {
    var selectedCountry = countrySelect.value;
    var selecteddecade = event.target.value;
  
    // Fetch data from the server
    var data = await fetchData();
  
    // Update the visualization based on the selected country and decade
    updateVisualization(data, selectedCountry, selecteddecade);
  });
  
  // Initial visualization with empty data and "all" selected
  updateVisualization([], "all", "all");
  
  // Fetch countries data and return a promise
  function fetchCountries() {
    return fetch('/api/get-countries-twentyFirst-job')
      .then(response => response.json())
      .then(countries => {
        console.log('Fetched Countries:', countries);
        return countries;
      })
      .catch(error => {
        console.error('Error fetching countries:', error);
        return [];
      });
  }
  
// Fetch decade data and return a promise
function fetchdecade() {
    return fetch('/api/get-decade-twentyFirst-job')
      .then(response => response.json())
      .then(decadeData => {
        console.log('Fetched decade Data:', decadeData);
        return decadeData;
      })
      .catch(error => {
        console.error('Error fetching decade data:', error);
        return [];
      });
  }
  
  // Initial population of the decade select dropdown
  async function initialize() {
    try {
      // Fetch countries data
      var countries = await fetchCountries();
  
      // Fetch decade data
      var decadeData = await fetchdecade();

      
        // Add "All" option to subRegion select dropdown
        countries.unshift("All Countries");

        // Add "All" option to subRegion select dropdown
        decadeData.unshift("All Decades");
  
      // Populate the country select dropdown
      populateSelect(countrySelect, countries);
  
      // Populate the decade select dropdown
      populateSelect(decadeSelect, decadeData);
  
      // Fetch data from the server
      var data = await fetchData();
  
      // Update the visualization with initial data and "all" selected
      updateVisualization(data, "all", "all");
      var selectedCountry = countrySelect.value;
      var selecteddecade = decadeSelect.value;
  
      updateVisualization(data, selectedCountry, selecteddecade);
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
  // Call the initialize function when the page loads
  window.addEventListener("load", initialize);