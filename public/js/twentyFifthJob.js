$(document).ready(function() {
    $('#job-button').click(function() {
      var selectedJob = $('#job-selector').val();
      // Perform the desired action based on the selected job, such as redirecting to the corresponding URL
      window.location.href = selectedJob;
    });
});
  
document.getElementById('uploadButton').addEventListener('click', function() {
    fetch('/api/upload-twentyFifth-job-csv', {
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
        const response = await fetch('/api/get-twentyFifth-job-data');
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
var margin = { top: 200, right: 100, bottom: 90, left: 120 };
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
  
function updateVisualization(data, selectedregion, selectedyear) {
  filteredData = [];
  // Filter based on selected filters
  filteredData = data.filter((d) => {
      return (
      (selectedregion === "All Regions" || d.region === selectedregion) &&
      (selectedyear === "All Years" || d.year === selectedyear)
      );
  });
  
  // Calculate the total for the filtered data
  const aggregates = {};
  
  filteredData.forEach((d) => {
      const region = d.region;
      if (!aggregates[region]) {
      aggregates[region] = {
          region: d.region,
          years: [],
          total: 0,
      };
      }
      aggregates[region].total += parseFloat(d.total);
      if (!aggregates[region].years.includes(d.year)) {
          aggregates[region].years.push(d.year);
      }
  });

  // Convert the aggregates object to an array
  filteredData = Object.values(aggregates);

// Calculate the maximum y-axis value from the filtered or aggregated dataset
var maxHomicidetotal = d3.max(filteredData, function (d) { return d.total; });

// Update the scales' domains with the filtered data
xScale.domain(filteredData.map(function (d) {
  return d.region;
}));
yScale.domain([0, maxHomicidetotal]);

// Remove previous bars
chart.selectAll(".bar").remove();
// Remove previous axes
chart.selectAll(".axis").remove();

// Create the bars
chart.selectAll(".bar")
    .data(filteredData, function(d) { return d.region; })
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function (d) { return xScale(d.region); })
    .attr("y", function (d) { return yScale(d.total); })
    .attr("width", xScale.bandwidth())
    .attr("fill", "#6A5ACD")
    .attr("height", function (d) { return chartHeight - yScale(d.total); })
    .on("mouseover", function (event, d) {
        // Get the position and size of the current bar
        var xPos = parseFloat(d3.select(this).attr("x"));
        var yPos = parseFloat(d3.select(this).attr("y"));
        var barWidth = parseFloat(d3.select(this).attr("width"));
        var barHeight = parseFloat(d3.select(this).attr("height"));

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

    // Remove previous axes
    chart.selectAll("g.axis").remove();

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
    .style("font-size", "8px") // Adjust the font size for the x-axis labels
    .text(function (d) { return d; });  
}
  
  // Get the region select element
  var regionSelect = document.getElementById("region-select");
  var yearSelect = document.getElementById("year-select");
  
  // Event listener for select change
  regionSelect.addEventListener("change", async function (event) {
    var selectedregion = event.target.value;
    var selectedyear = yearSelect.value;
  
    // Fetch data from the server
    var data = await fetchData();
  
    // Update the visualization based on the selected region and year
    updateVisualization(data, selectedregion, selectedyear);
  });
  
  // Event listener for select change
  yearSelect.addEventListener("change", async function (event) {
    var selectedregion = regionSelect.value;
    var selectedyear = event.target.value;
  
    // Fetch data from the server
    var data = await fetchData();
  
    // Update the visualization based on the selected region and year
    updateVisualization(data, selectedregion, selectedyear);
  });
  
  // Initial visualization with empty data and "all" selected
  updateVisualization([], "all", "all");
  
  // Fetch regions data and return a promise
  function fetchregions() {
    return fetch('/api/get-regions-twentyFifth-job')
      .then(response => response.json())
      .then(regions => {
        console.log('Fetched regions:', regions);
        return regions;
      })
      .catch(error => {
        console.error('Error fetching regions:', error);
        return [];
      });
  }
  
// Fetch year data and return a promise
function fetchyear() {
    return fetch('/api/get-year-twentyFifth-job')
      .then(response => response.json())
      .then(yearData => {
        console.log('Fetched year Data:', yearData);
        return yearData;
      })
      .catch(error => {
        console.error('Error fetching year data:', error);
        return [];
      });
  }
  
  // Initial population of the year select dropdown
  async function initialize() {
    try {
      // Fetch regions data
      var regions = await fetchregions();
  
      // Fetch year data
      var yearData = await fetchyear();

      
        // Add "All" option to subRegion select dropdown
        regions.unshift("All Regions");

        // Add "All" option to subRegion select dropdown
        yearData.unshift("All Years");
  
      // Populate the region select dropdown
      populateSelect(regionSelect, regions);
  
      // Populate the year select dropdown
      populateSelect(yearSelect, yearData);
  
      // Fetch data from the server
      var data = await fetchData();
  
      // Update the visualization with initial data and "all" selected
      updateVisualization(data, "all", "all");
      var selectedregion = regionSelect.value;
      var selectedyear = yearSelect.value;
  
      updateVisualization(data, selectedregion, selectedyear);
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