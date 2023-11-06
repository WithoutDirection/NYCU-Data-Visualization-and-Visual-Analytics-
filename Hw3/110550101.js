const attributes = ['Length','Diameter','Height','Whole weight','Shucked weight','Viscera weight','Shell weight','Rings'];
const header = ['Sex','Length','Diameter','Height','Whole weight','Shucked weight','Viscera weight','Shell weight','Rings'];
var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
var sex = 'M';

const csvURL = 'http://vis.lab.djosix.com:2023/data/abalone.data';

function plot(){
    select_data(sex);
}

function select_data(sex) {
  

  fetch(csvURL)
  .then(response => response.text())  
  .then(csvData => {
    
    const rows = csvData.split('\n');

    // Parse the CSV data into an array of objects
    const parsedData = rows.map(row => {
      const values = row.split(',');
      const rowData = {};
      header.forEach((label, index) => {
        rowData[label] = values[index];
      });
      return rowData;
    });

    console.log('Parsed CSV data:');
    console.log(parsedData);


    const filteredData = parsedData.filter(d => d.Sex === sex);

        const scatterData = [];
        for (let i = 0; i < attributes.length; i++) {
            for (let j = 0; j < attributes.length; j++) {
                scatterData.push({
                    xAttribute: attributes[i],
                    yAttribute: attributes[j],
                    points: filteredData.map(d => ({
                    x: +d[attributes[i]],
                    y: +d[attributes[j]]
                    }))
                });
            }
        }
   

        const num = attributes.length;
        const corr_matrix  = [];

        for (let i = 0; i < num; i++) {
          const row = [];
          for (let j = 0; j < num; j++) {
            const correlation = calculateCorrelation(scatterData[i * num + j].points); // i: x; j: y
            row.push(correlation);
          }
          corr_matrix.push(row);
        }
      console.log(corr_matrix);
      
      plotCorrelogram(corr_matrix);


  })
  .catch(error => console.error('Error fetching CSV:', error));
}

function calculateCorrelation(points) {
  const n = points.length;
  const sumX = points.reduce((acc, point) => acc + point.x, 0);
  const sumY = points.reduce((acc, point) => acc + point.y, 0);
  const sumXSquare = points.reduce((acc, point) => acc + point.x * point.x, 0);
  const sumYSquare = points.reduce((acc, point) => acc + point.y * point.y, 0);
  const sumXY = points.reduce((acc, point) => acc + point.x * point.y, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXSquare - sumX * sumX) * (n * sumYSquare - sumY * sumY));

  return denominator !== 0 ? numerator / denominator : 0; 
}


  function update(new_sex) {
    sex = new_sex;
    if(new_sex === 'F'){
      document.getElementById('title').textContent = 'Class for current correlogram: Female';
    }
    else if(new_sex === 'M'){
      document.getElementById('title').textContent = 'Class for current correlogram: Male';
    }
    else{
      document.getElementById('title').textContent = 'Class for current correlogram: Infant';
    }
    
    plot();
  }

plot();




// Fetch the CSV file







  

function plotCorrelogram(rows) {

  d3.select("#correlogram").selectAll("svg").remove();
  var svg = d3.select("#correlogram")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  var data = [];
  for(let i = 0; i < attributes.length; i++){
    for(let j = 0; j < attributes.length; j++){
      data.push({
          x:attributes[i],
          y:attributes[j],
          value:rows[i][j]
        }
      );
    }
  }


    if(sex === 'M') color_range = ["#fff", "#000080"];
    else if(sex === 'F') color_range = ["#fff", "#8F5232"];
    else color_range = ["#fff", "#428F2B"];


  var color = d3.scaleLinear()
    .domain([0,  1])
    .range(color_range);


  var size = d3.scaleSqrt()
    .domain([0, 1])
    .range([0, 8]);

  var x = d3.scalePoint()
    .range([0, width])
    .domain(attributes)

  
  var y = d3.scalePoint()
    .range([0, height])
    .domain(attributes)

    var cor = svg.selectAll(".cor")
    .data(data)
    .enter()
    .append("g")
      .attr("class", "cor")
      .attr("transform", function(d) {
        return "translate(" + x(d.x) + "," + y(d.y) + ")";
      });

  
  cor
    .filter(function(d){
      var ypos = attributes.indexOf(d.y);
      var xpos = attributes.indexOf(d.x);
      return xpos <= ypos;
    })
    .append("text")
      .attr("x",function(d){
        if(d.x === d.y) return -20;
        else return -10;
      })
      .attr("y", 5)
      .text(function(d) {
        if (d.x === d.y) {
          return d.x;
        } else {
          return d.value.toFixed(2);
        }
      })
      .style("font-size", 12)
      .style("text-align", "left")
      .style("fill", function(d){
        if (d.x === d.y) {
          return "#000";
        } else {
          return color(d.value);
        }
      });

  cor
    .filter(function(d){
      var ypos = attributes.indexOf(d.y);
      var xpos = attributes.indexOf(d.x);
      return xpos > ypos;
    })
    .append("circle")
      .attr("r", function(d){ return size(Math.abs(d.value)) * 1.5 })
      .style("fill", function(d){
        if (d.x === d.y) {
          return "#000";
        } else {
          return color(d.value);
        }
      })
      .style("opacity", 1)


}