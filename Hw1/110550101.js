let xLabel = 'sepal length'; // default x
let yLabel = 'sepal width'; // default y
let Data;

const width = 800;
const height = 600;
const margin = { top: 20, right: 10, bottom: 50, left: 40 };

// Load the CSV data and create the initial scatter plot
d3.csv('http://vis.lab.djosix.com:2023/data/iris.csv').then(data => {
  // Convert string values to numbers
  data.forEach(d => {
    d['sepal length'] = +d['sepal length'];
    d['sepal width'] = +d['sepal width'];
    d['petal length'] = +d['petal length'];
    d['petal width'] = +d['petal width'];
  });
  data.pop();
  Data = data

  createScatterPlot(Data);
}).catch(error => console.error('Error loading CSV:', error));


function createScatterPlot(data) {
 

  const svg = d3.select('#scatter-plot')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const xScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[xLabel]), d3.max(data, d => d[xLabel])])
    .range([margin.left, width - margin.right - margin.left]);

  const yScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[yLabel]), d3.max(data, d => d[yLabel])])
    .range([height - margin.bottom - margin.top, margin.top]);

  // console.log(data);

  svg.selectAll('circle').remove();  
  svg.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('cx', d => xScale(d[xLabel]))
    .attr('cy', d => yScale(d[yLabel]))
    .attr('r', 5)
    .attr('fill', d=>{
      if(d['class'] === 'Iris-setosa') return 'red';
      if(d['class'] === 'Iris-versicolor') return 'green';
      if(d['class'] === 'Iris-virginica') return 'blue';
    });
  
    
  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.format('.1f')));

  svg.append('g')
    .attr('class', 'y-axis')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat(d3.format('.1f')));

  // Adding labels for axes
  svg.append('text')
    .attr('id', 'x-axis-label')
    .attr('x', width / 2)
    .attr('y', height - 10)
    .style('text-anchor', 'middle')
    .text(xLabel.replace(/_/g, ' ').toUpperCase());

  svg.append('text')
    .attr('id', 'y-axis-label')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', 10)
    .style('text-anchor', 'middle')
    .text(yLabel.replace(/_/g, ' ').toUpperCase());


    var legend = d3.select('#legend');

    legend.append("circle").attr("cx",30).attr("cy",30).attr("r", 10).style("fill", "red")
    legend.append("circle").attr("cx",30).attr("cy",60).attr("r", 10).style("fill", "green")
    legend.append("circle").attr("cx",30).attr("cy",90).attr("r", 10).style("fill", "blue")
    legend.append("text").attr("x", 50).attr("y", 35).text("Iris-setosa").style("font-size", "15px").attr("text-anchor", "start")
    legend.append("text").attr("x", 50).attr("y", 65).text("Iris-versicolor").style("font-size", "15px").attr("text-anchor", "start")
    legend.append("text").attr("x", 50).attr("y", 95).text("Iris-virginica").style("font-size", "15px").attr("text-anchor", "start")
}

// Function to update the plot based on selected x label
function updateXLabel(label) {
  xLabel = label;
  updatePlot(Data, xLabel, yLabel);
}

// Function to update the plot based on selected y label
function updateYLabel(label) {
  yLabel = label;
  updatePlot(Data, xLabel, yLabel);
}

// Function to update the plot
function updatePlot(data, xLabel, yLabel) {
  const svg = d3.select('#scatter-plot svg');

  const xScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[xLabel]), d3.max(data, d => d[xLabel])])
    .range([margin.left, width - margin.right - margin.left]);

  const yScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[yLabel]), d3.max(data, d => d[yLabel])])
    .range([height - margin.bottom - margin.top, margin.top]);

  svg.selectAll('.dot')
    .transition()
    .duration(500)
    .attr('cx', d => xScale(d[xLabel]))
    .attr('cy', d => yScale(d[yLabel]));

  svg.select('.x-axis')
    .transition()
    .duration(500)
    .call(d3.axisBottom(xScale).tickFormat(d3.format('.1f')));

  svg.select('.y-axis')
    .transition()
    .duration(500)
    .call(d3.axisLeft(yScale).tickFormat(d3.format('.1f')));

  svg.select('#x-axis-label')
    .text(xLabel.replace(/_/g, ' ').toUpperCase());

  svg.select('#y-axis-label')
    .text(yLabel.replace(/_/g, ' ').toUpperCase());
}