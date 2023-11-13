const header = ['buying','maint','doors','persons','lug_boot','safety','class'];
const margin = {top: 10, right: 50, bottom: 10, left: 10},
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;




fetch('http://vis.lab.djosix.com:2023/data/car.data')
  .then(response => response.text())  
  .then(csvData => {
      console.log(csvData);
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
      parsedData.pop();
      console.log(parsedData);
      draw(parsedData);
      

});

function draw(data) {
  
  let  layer = [[], [], [], [], [], [], []];
  for(let i = 0; i < data.length; i++) {
    for(let j = 0; j < 7; j++) {
      if(!layer[j].includes(`${header[j]}_${data[i][header[j]]}`) && data[i][header[j]] != '' && data[i][header[j]] != undefined) {
        layer[j].push(`${header[j]}_${data[i][header[j]]}`);
      }
    }
  } 
  console.log(layer);

  
  
  let graph = {"nodes" : [], "links" : []};
  for(let i = 0; i < 7; i++) {
    for(let j = 0; j < layer[i].length; j++) {
      graph.nodes.push({name: layer[i][j]});
    }
  }
  for(let i = 0; i < 6; i++) {
    console.log("for " + layer[i] + " & " + layer[i + 1]);
    

    for(let j = 0; j < layer[i].length; j++) {
      for(let k = 0; k < layer[i + 1].length; k++) {
          let count = 0;
          for(let l = 0; l < data.length; l++) {
              if(`${header[i]}_${data[l][header[i]]}` == layer[i][j] && `${header[i + 1]}_${data[l][header[i + 1]]}` == layer[i + 1][k]) {
                  count++;
              }
          }
          if(count != 0) {
              graph.links.push({source: layer[i][j], target: layer[i + 1][k], value: count});
          }
      }
  }
    
  }
  console.log(graph);

  var svg = d3.select("#sankey-diagram")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  svg.append("rect")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.bottom + margin.top)
    .attr("x", margin.left)
    .attr("y", margin.top)
    .style("fill", "#EAEAEA")
    .style("border-radius", 100);

  const sankeyDiagram = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const layerColors = ['#1f78b4', '#33a02c', '#e31a1c', '#ff7f00', '#6a3d9a', '#b15928', '#a6cee3'];
  const colorScale = d3.scaleOrdinal(layerColors);

  
  


  

  var sankey = d3.sankey()
    .nodeWidth(20)
    .nodePadding(20)
    .size([width, height])
    .nodeId(d=>d.name);
    
    
  const {nodes, links} = sankey({
    nodes: graph.nodes,
    links: graph.links  
  });
  console.log(nodes);
  console.log(links);
  

  const link = sankeyDiagram.append("g")
    .attr("fill", "none")
    .attr("stroke-opacity", 0.6)
    .selectAll("path")
    .data(links)
    .enter().append("path")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke-width", d => d.width)
    .style("stroke", function(d) { return d.color = (colorScale(d.source.layer)); })
    .sort(function(a, b) { return b.dy - a.dy; })
    .on("mouseover", function(d) {
      d3.select(this).style("stroke-opacity", 0.8);
      d3.select(this).append("title")
        .text(function(d) { return "the amount of \"" + d.source.name + "\" → \"" + d.target.name + "\": " + d.value; })
        .style("fill", "black")
        .style("font-size", 10)
        .style("font-family", "sans-serif")
        .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .style("alignment-baseline", "middle");
    })
    .on("mouseout", function(d) {
      d3.select(this).style("stroke-opacity", 0.6);
    });
  

  const node = sankeyDiagram.append("g")
    .selectAll(".node")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node")
    .call(d3.drag()
      .on("start", dragstart)
      .on("drag", dragged)
      .on("end", dragend)
      )
    .classed("draggable", true);
    


  node.append("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", sankey.nodeWidth())
    .attr("rx", 1)
    .attr("ry", 1)
    .style("fill", d => colorScale(d.layer))
    .style("stroke", "black")
    .style("stroke-width", 1);
    


  node.append("text")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("x", d => d.x0 - 4)
    .attr("y", d => d.y1 + 10)
    .attr("text-anchor", "start")
    .text(d => d.name);
  
    function dragstart(event, d) {
      d3.select(this).raise();
  }
  function dragged(event, d) {
    
      d.x0 += event.dx;
      d.x1 += event.dx;
      d.y0 += event.dy;
      d.y1 += event.dy;
      let x_range = d.x1 - d.x0;
      let y_range = d.y1 - d.y0;
      
      if (d.x0 < 0) { // Left bound
          d.x0 = 0;
          d.x1 = d.x0 + x_range;
      }
      if (d.x1 > width) { // Right Bound
          d.x1 = width;
          d.x0 = d.x1 - x_range;
      }
      if (d.y0 < 0) { // Ceiling
          d.y0 = 0;
          d.y1 = d.y0 + y_range;
      }
      if (d.y1 > height) { // Floor
          d.y1 = height;
          d.y0 = d.y1 - y_range;
      }

      // Move node and label simultanuously while dragging either a node or its label
      d3.select(this).attr("transform", `translate(${event.dx},${event.dy})`);
      d3.select(this).select("rect")
          .attr("x", d.x0)
          .attr("y", d.y0);
      d3.select(this).select("text")
          .attr("x", d.x0 - 4)
          .attr("y", d.y1 +10);

      // Update the position
      sankey.update({ nodes, links });

      // Redraw links
      sankeyDiagram.selectAll("path")
          .data(links)
          .attr("d", d3.sankeyLinkHorizontal());
  }

  function dragend(event, d) {
      d3.select(this).classed("active", false);
  }
  
}
