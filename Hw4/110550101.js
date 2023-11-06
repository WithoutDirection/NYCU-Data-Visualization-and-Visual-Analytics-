
let Data;

Data = d3.csv('http://vis.lab.djosix.com:2023/data/iris.csv').then(data => {
  // Convert string values to numbers
  data.forEach(d => {
    d['sepal length'] = +d['sepal length'];
    d['sepal width'] = +d['sepal width'];
    d['petal length'] = +d['petal length'];
    d['petal width'] = +d['petal width'];
  });
  data.pop();
  Data = data
  const chart = createScatterPlot(Data);
  const scatterPlotContainer = document.getElementById('scatter-plot');
  scatterPlotContainer.appendChild(chart);

}).catch(error => console.error('Error loading CSV:', error));



function createScatterPlot(data) {
    const width = 800;
    const height = width;
    const padding = 25  ;
    const columns = data.columns.filter(d => typeof data[0][d] === "number");
    const size = (width - (columns.length + 1) * padding) / columns.length + padding;
    
    const x = columns.map(c => d3.scaleLinear()
        .domain(d3.extent(data, d => d[c]))
        .rangeRound([padding / 2, size - padding / 2]));
    
    const y = x.map(x => x.copy().range([size - padding / 2, padding / 2]));
  
    const color = d3.scaleOrdinal()
        .domain(data.map(d => d.species))
        .range(d3.schemeCategory10);
  
    const axisx = d3.axisBottom()
        .ticks(6)
        .tickSize(size * columns.length);
    
    const xAxis = g => g.selectAll("g").data(x).join("g")
        .attr("transform", (d, i) => `translate(${i * size},0)`)
        .each(function(d) { return d3.select(this).call(axisx.scale(d)); })
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"));
  
    const axisy = d3.axisLeft()
        .ticks(6)
        .tickSize(-size * columns.length);
    
    const yAxis = g => g.selectAll("g").data(y).join("g")
        .attr("transform", (d, i) => `translate(0,${i * size})`)
        .each(function(d) { return d3.select(this).call(axisy.scale(d)); })
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").attr("stroke", "#ddd"));
    
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-padding, 0, width, height]);
  
    svg.append("style")
        .text(`circle.hidden { fill: #000; fill-opacity: 1; r: 1px; }`);
  
    svg.append("g")
        .call(xAxis);
  
    svg.append("g")
        .call(yAxis);
  
    const cell = svg.append("g")
      .selectAll("g")
      .data(d3.cross(d3.range(columns.length), d3.range(columns.length)))
      .join("g")
        .attr("transform", ([i, j]) => `translate(${i * size},${j * size})`);
  
    cell.append("rect")
        .attr("fill", "none")
        .attr("stroke", "#aaa")
        .attr("x", padding / 2 + 0.5)
        .attr("y", padding / 2 + 0.5)
        .attr("width", size - padding)
        .attr("height", size - padding);
  
    cell.each(function([i, j]) {
      d3.select(this).selectAll("circle")
        .data(data.filter(d => !isNaN(d[columns[i]]) && !isNaN(d[columns[j]])))
        .join("circle")
          .attr("cx", d => x[i](d[columns[i]]))
          .attr("cy", d => y[j](d[columns[j]]));
    });
  
    const circle = cell.selectAll("circle")
        .attr("r", 3.5)
        .attr("fill-opacity", 0.7)
        .attr("fill", d => color(d.class));
    

    cell.call(brush, circle, svg, {padding, size, x, y, columns},data);
    svg.append("g")
        .style("font", "bold 10px sans-serif")
        .style("pointer-events", "none")
      .selectAll("text")
      .data(columns)
      .join("text")
        .attr("transform", (d, i) => `translate(${i * size},${i * size})`)
        .attr("x", padding)
        .attr("y", padding)
        .attr("dy", ".71em")
        .text(d => d);
  
    return Object.assign(svg.node(), {scales: {color}});
  }


  function brush(cell, circle, svg, {padding, size, x, y, columns},data) {
    const brush = d3.brush()
        .extent([[padding / 2, padding / 2], [size - padding / 2, size - padding / 2]])
        .on("start", brushstarted)
        .on("brush", brushed)
        .on("end", brushended);
  
    cell.call(brush);
  
    let brushCell;
  
    
    function brushstarted() {
      if (brushCell !== this) {
        d3.select(brushCell).call(brush.move, null);
        brushCell = this;
      }
    }
  
    
    function brushed({selection}, [i, j]) {
      
      let selected = [];
      if (selection) {
        const [[x0, y0], [x1, y1]] = selection; 
        circle.classed("hidden",
          d => x0 > x[i](d[columns[i]])
            || x1 < x[i](d[columns[i]])
            || y0 > y[j](d[columns[j]])
            || y1 < y[j](d[columns[j]]));
        selected = data.filter(
          d => x0 < x[i](d[columns[i]])
            && x1 > x[i](d[columns[i]])
            && y0 < y[j](d[columns[j]])
            && y1 > y[j](d[columns[j]]));
      }
      const properties = ['sepal length','sepal width','petal length','petal width'];
      const infoDiv = document.getElementById('selected-properties');
      infoDiv.innerHTML = '';  
      const minValues = Array(4).fill(99999);
      const maxValues = Array(4).fill(-1);
      const minClasses = Array(4).fill('');
      const maxClasses = Array(4).fill('');
      for (const selectedData of selected) {
        for (let i = 0; i < 4; i++) {
          if (selectedData[properties[i]] > maxValues[i]) {
            maxValues[i] = selectedData[properties[i]];
            maxClasses[i] = selectedData['class'];
          }
          if (selectedData[properties[i]] < minValues[i]) {
            minValues[i] = selectedData[properties[i]];
            minClasses[i] = selectedData['class'];
          }
        }
      }
      for(var i = 0; i < 4; i++){
        if(maxValues[0] === -1) {
            infoDiv.innerHTML = '';
            break;
        }
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const hr = document.createElement('hr');
        li1.textContent = `min ${properties[i]}: ${minValues[i]}cm from class ${minClasses[i]}`;
        li2.textContent = `max ${properties[i]}: ${maxValues[i]}cm from class ${maxClasses[i]}`;
        infoDiv.appendChild(li1);
        infoDiv.appendChild(li2);
        infoDiv.appendChild(hr);
      }
      
      svg.property("value", selected).dispatch("input");
    }
  
    function brushended({selection}) {
      if (selection) return;
      svg.property("value", []).dispatch("input");
      circle.classed("hidden", false);
    }
  }

