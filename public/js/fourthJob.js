$(document).ready(function() {
    $('#job-button').click(function() {
      var selectedJob = $('#job-selector').val();
      // Perform the desired action based on the selected job, such as redirecting to the corresponding URL
      window.location.href = selectedJob;
    });
});
  
document.getElementById('uploadButton').addEventListener('click', function() {
    fetch('/api/upload-fourth-job-csv', {
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
        const response = await fetch('/api/get-fourth-job-data');
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
  
function updateVisualization(data, selectedCountry, selectedSex) {
  filteredData = [];
  // Filter based on selected filters
  filteredData = data.filter((d) => {
      return (
      (selectedCountry === "All Countries" || d.country === selectedCountry) &&
      (selectedSex === "All Sexes" || d.sex === selectedSex)
      );
  });
  
  // Calculate the average for the filtered data
  const aggregates = {};
  
  filteredData.forEach((d) => {
      const country = d.country;
      if (!aggregates[country]) {
      aggregates[country] = {
          country: d.country,
          sexes: [],
          average: 0,
      };
      }
      aggregates[country].average += d.average;
      if (!aggregates[country].sexes.includes(d.sex)) {
          aggregates[country].sexes.push(d.sex);
      }
  });

  // Convert the aggregates object to an array
  filteredData = Object.values(aggregates);

// Calculate the maximum y-axis value from the filtered or aggregated dataset
var maxHomicideAverage = d3.max(filteredData, function (d) { return d.average; });

// Update the scales' domains with the filtered data
xScale.domain(filteredData.map(function (d) {
  return d.country;
}));
yScale.domain([0, maxHomicideAverage]);

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
      return yScale(d.average);
    })
    .attr("width", xScale.bandwidth())
    .attr("height", function (d) {
      var barHeight = chartHeight - yScale(d.average);
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
        .text(d.average);
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
  var sexSelect = document.getElementById("sex-select");
  
  // Event listener for select change
  countrySelect.addEventListener("change", async function (event) {
    var selectedCountry = event.target.value;
    var selectedSex = sexSelect.value;
  
    // Fetch data from the server
    var data = await fetchData();
  
    // Update the visualization based on the selected country and sex
    updateVisualization(data, selectedCountry, selectedSex);
  });
  
  // Event listener for select change
  sexSelect.addEventListener("change", async function (event) {
    var selectedCountry = countrySelect.value;
    var selectedSex = event.target.value;
  
    // Fetch data from the server
    var data = await fetchData();
  
    // Update the visualization based on the selected country and sex
    updateVisualization(data, selectedCountry, selectedSex);
  });
  
  // Initial visualization with empty data and "all" selected
  updateVisualization([], "all", "all");
  
  // Fetch countries data and return a promise
  function fetchCountries() {
    return fetch('/api/get-countries-fourth-job')
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
  
// Fetch sex data and return a promise
function fetchSex() {
    return fetch('/api/get-sex-fourth-job')
      .then(response => response.json())
      .then(sexData => {
        console.log('Fetched Sex Data:', sexData);
        return sexData;
      })
      .catch(error => {
        console.error('Error fetching sex data:', error);
        return [];
      });
  }
  
  // Initial population of the sex select dropdown
  async function initialize() {
    try {
      // Fetch countries data
      var countries = await fetchCountries();
  
      // Fetch sex data
      var sexData = await fetchSex();

      
        // Add "All" option to subRegion select dropdown
        countries.unshift("All Countries");

        // Add "All" option to subRegion select dropdown
        sexData.unshift("All Sexes");
  
      // Populate the country select dropdown
      populateSelect(countrySelect, countries);
  
      // Populate the sex select dropdown
      populateSelect(sexSelect, sexData);
  
      // Fetch data from the server
      var data = await fetchData();
  
      // Update the visualization with initial data and "all" selected
      updateVisualization(data, "all", "all");
      var selectedCountry = countrySelect.value;
      var selectedSex = sexSelect.value;
  
      updateVisualization(data, selectedCountry, selectedSex);
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