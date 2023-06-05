document.getElementById('uploadButton').addEventListener('click', function() {
    fetch('/api/upload-thirtieth-job-csv', {
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
  window.addEventListener("load", async function() {
      // Fetch data from the server
      var data = await fetchData();
    
      // Update the visualization with the initial data and "all" selected
      updateVisualization(data, "all");
  });
  
  // D3.js code
  // Fetch data from the server
  async function fetchData() {
    try {
        const response = await fetch('/api/get-thirtieth-job-data');
        const data = await response.json();
        console.log('Fetched Data:', data); // Log the fetched data
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
  }
  
  // Set up the SVG dimensions and margins
  var svgWidth = 600;
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
  
    function updateVisualization(data, selecteddecade) {
      var populations = data;
    
      var filteredData;
      if (selecteddecade === "all") {
        // Show all decades
        filteredData = populations;
      } else {
        // Filter based on selected decade
        filteredData = populations.filter(function (d) {
          return d.decade === selecteddecade;
        });
      }
    
      // Calculate the maximum y-axis value from the filtered data
      var maxpopulationAverage = d3.max(filteredData, function (d) {
        return d.average;
      });
    
      // Update the scales' domains with the filtered data
      xScale.domain(filteredData.map(function (d) {
        return d.decade;
      }));
      yScale.domain([0, maxpopulationAverage]);
    
      // Remove previous bars
      chart.selectAll(".bar").remove();
      // Remove previous axes
      chart.selectAll(".axis").remove();
    
      // Create the bars
      chart.selectAll(".bar")
        .data(filteredData, function (d) {
          return d.decade;
        })
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
          return xScale(d.decade);
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
      .style("font-size", "8px") // Adjust the font size for the x-axis labels
      .text(function (d) { return d; });  
    }
    
  
  // Get the decade select element
  var decadeSelect = document.getElementById("decade-select");
  
  // Event listener for select change
  decadeSelect.addEventListener("change", async function (event) {
    var selecteddecade = event.target.value;
  
    // Fetch data from the server
    var data = await fetchData();
  
    // Update the visualization based on the selected decade
    updateVisualization(data, selecteddecade);
  });
  
  // Initial visualization with empty data and "all" selected
  updateVisualization([], "all");
  
  // Function to populate the decade select dropdown
  function populatedecadeSelect(decades) {
    var decadeSelect = document.getElementById("decade-select");
  
    // Clear existing options
    decadeSelect.innerHTML = "";
  
    // Add the "All decades" option
    var allOption = document.createElement("option");
    allOption.value = "all";
    allOption.text = "All Decades";
    decadeSelect.appendChild(allOption);
  
    // Add the dynamically generated options
    decades.forEach(function (decade) {
        var option = document.createElement("option");
        option.value = decade;
        option.text = decade;
        decadeSelect.appendChild(option);
    });
  }
  
  // Event listener for select change
  decadeSelect.addEventListener("change", async function (event) {
    var selecteddecade = event.target.value;
  
    // Fetch data from the server
    var data = await fetchData();
  
    // Update the visualization based on the selected decade
    updateVisualization(data, selecteddecade);
  });
  
  // Fetch decades data and return a promise
  function fetchdecades() {
    return fetch('/api/get-decades-thirtieth-job')
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
  
  // Initial population of the decade select dropdown
  async function initialize() {
    try {
      // Fetch decades data
      var decades = await fetchdecades();
      
      // Populate the decade select dropdown
      populatedecadeSelect(decades);
  
      // Fetch data from the server
      var data = await fetchData();
  
      // Update the visualization with initial data and "all" selected
      updateVisualization(data, "all");
    } catch (error) {
      console.error('Error initializing:', error);
    }
  }
  
  // Call the initialize function when the page loads
  window.addEventListener("load", initialize);