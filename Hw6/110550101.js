const width = 1500;
const height = 750;
const margin = { top: 30, right: 40, bottom: 60, left: 40 };
const url = 'http://vis.lab.djosix.com:2023/data/ma_lga_12345.csv';


// section 1
// read data and process the data to the format I want when implementing the chart

d3.csv(url).then(data => {
    let tmp = [];
    const parseDate = d3.timeParse('%d/%m/%Y');
    for(let i = 0; i < data.length; i++) {
        tmp.push({
            date: parseDate(data[i].saledate),
            class: `${data[i].type}_${data[i].bedrooms}`,
            moving_average: +data[i].MA
        });
    }

    let aggregatedData = d3.rollups(tmp,
        v => d3.sum(v, leaf => parseInt(leaf.moving_average)),
        d => d.date,
        d => d.class);
    
    let transformedData = [];

    for(let i = 0; i < aggregatedData.length; i++) {
        let date = aggregatedData[i][0];
        let classes = aggregatedData[i][1];
        let row = { date };
        for(let j = 0; j < classes.length; j++) {
            let className = classes[j][0];
            let moving_average = classes[j][1];
            row[className] = (moving_average === NaN) ? 0 : moving_average;
        }
        transformedData.push(row);
    }

    transformedData.sort((a, b) => a.date - b.date);

    let input_data = [];
    for(let i = 0; i < transformedData.length; i++) {
        input_data.push({
            date: transformedData[i].date,
            house_2: (transformedData[i].house_2 == undefined) ? 0 : transformedData[i].house_2,
            house_3: (transformedData[i].house_3 == undefined) ? 0 : transformedData[i].house_3,
            house_4: (transformedData[i].house_4 == undefined) ? 0 : transformedData[i].house_4,
            house_5: (transformedData[i].house_5 == undefined) ? 0 : transformedData[i].house_5,
            unit_1: (transformedData[i].unit_1 == undefined) ? 0 : transformedData[i].unit_1,
            unit_2: (transformedData[i].unit_2 == undefined) ? 0 : transformedData[i].unit_2,
            unit_3: (transformedData[i].unit_3 == undefined) ? 0 : transformedData[i].unit_3,
        });
    }
    console.log(input_data);
    

    draw(input_data);
    
});

// section 2
// the details of crafting the chart
function draw(data) {
    

    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);


    // stage 2-1 use stack to implement the stream graph

    const classes = Array.from(new Set(data.flatMap(d => Object.keys(d).filter(k => k !== 'date'))))
    console.log(classes);
    const stack = d3.stack()
        .keys(classes)
        .offset(d3.stackOffsetSilhouette);
    

    const stackedData = stack(data);
    console.log(stackedData);

    // stage 2-2 create the scale of X, Y and color

    const xScale = d3.scaleTime()
        .range([margin.left, width - margin.right])
        .domain(d3.extent(data, d => d.date));
    
    const yScale = d3.scaleLinear()
        .domain([d3.min(stackedData, layer => d3.min(layer, d => d[0])),
            d3.max(stackedData, layer => d3.max(layer, d => d[1]))])
        .range([height - margin.bottom, margin.top]);
       
    
    const distinctColors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2'];
    const colorScale = d3.scaleOrdinal()
                        .range(distinctColors)
                        .domain(classes);
    
    // stage 2-3 implement the interactive functions

    const tooltip = svg.append("text")
                    .attr("x", 0)
                    .attr("y", 0)
                    .style("opacity",0);

    const mouseover = function(event,d) {
        tooltip.style("opacity",1)
        d3.selectAll(".streamArea")
            .style("opacity", 0.2);
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1);
    }
    
    const mousemove = function(event, d, i) {
        tooltip.text(`class: ${d.key}`);
    }
    
    const mouseleave = function(d) {
        tooltip.style("opacity", 0);
        d3.selectAll(".streamArea")
            .style("opacity", 1)
            .style("stroke", "none");
    }

    // stage 2-4 draw the chart

    const area = d3.area()
        .x(d => xScale(d.data.date))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))

    svg.selectAll("layers")
        .data(stackedData)
        .join("path")
        .attr("class", "streamArea")
        .attr("d", area)
        .attr("transform", `translate(${margin.left}, ${margin.top - 30})`)
        .style("fill", d => colorScale(d.key))
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

        

    const xAxisGroup = svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(${margin.left}, ${height - margin.bottom})`);

    const xAxis = d3.axisBottom(xScale)
                    .tickSize(-height + margin.top + margin.bottom)
                    .tickPadding(10);
    xAxisGroup.call(xAxis);

    xAxisGroup.selectAll(".tick line")
        .style("stroke", "#ccc")
        .style("stroke-width", "1px");

    const yAxisGroup = svg.append("g")
                        .attr("class", "y-axis")
                        .attr("transform", `translate(${margin.left + margin.right}, 0)`);
    
    const yAxis = d3.axisLeft(yScale)
                    .tickSize(-width + margin.left + margin.right)
                    .tickPadding(10);
    
    yAxisGroup.call(yAxis);
    
    yAxisGroup.selectAll(".tick line")
        .style("stroke", "#ccc")
        .style("stroke-width", "1px");
    
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("x", margin.left - margin.right)
        .attr("y", margin.top + 25)
        .attr("dy", -margin.left)
        .style("text-anchor", "left")
        .text("Stacked Moving Average Price");

    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width - margin.right - margin.left)
        .attr("y", height + 10)
        .attr("dy", -margin.left)
        .style("text-anchor", "left")
        .text("Time");
}
    