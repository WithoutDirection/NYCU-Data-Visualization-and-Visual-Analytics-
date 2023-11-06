const width = 1200;
const pollution_class = ['PM2.5', 'PM10', 'NO2', 'O3', 'CO', 'SO2'];
const scheme_list = [d3.schemeBlues, d3.schemeGreens, d3.schemeOranges, d3.schemePurples, d3.schemeReds, d3.schemeGreys];
let year_month_list = [];
let filteredData = [];


d3.csv('http://vis.lab.djosix.com:2023/data/air-pollution.csv').then(data => {
    

    const parseDate = d3.timeParse('%Y-%m-%d %H:%M');
    

    data.forEach(d => {
        d['Measurement date'] = parseDate(d['Measurement date']);
        d.Address = d.Address; 
        d['PM2.5'] = +d['PM2.5'];
        d.PM10 = +d.PM10;
        d.NO2 = +d.NO2;
        d.O3 = +d.O3;
        d.CO = +d.CO;
        d.SO2 = +d.SO2;
        d['Station code'] = +d['Station code'];
        const yearMonth = d['Measurement date'].toISOString().substring(0, 7);
        if (!year_month_list.includes(yearMonth)) {
            year_month_list.push(yearMonth);
        }
      });

    
    
    console.log(data);
    
    const yearMonthDropdown = document.getElementById("year_month");
    const classDropdown = document.getElementById("pollution_class");
    const colorSchemeDropdown = document.getElementById("colorScheme");
    const bandSlider = document.getElementById("bandSlider");
    const bandValue = document.getElementById("bandValue");

    for(let i = 0; i < year_month_list.length; i++){
        const option = document.createElement("option");
        option.value = year_month_list[i];
        option.text = year_month_list[i];
        yearMonthDropdown.appendChild(option);
    
    }

    
    for(let i = 0; i < pollution_class.length; i++){
        const option = document.createElement("option");
        option.value = pollution_class[i];
        option.text = pollution_class[i];
        classDropdown.appendChild(option);
    
    }
    // default value
    
    let selectedYearMonth = year_month_list[0]; 
    let selectedClass = pollution_class[0];
    let selectedScheme = scheme_list[0];
    let selectedBands = 3;

    filteredData = data.filter(d => {
        const yearMonth = d['Measurement date'].toISOString().substring(0, 7);
        return yearMonth === selectedYearMonth;
    });
    draw(filteredData, selectedClass, selectedScheme, selectedBands);

    yearMonthDropdown.addEventListener("change", function() {
        selectedYearMonth = yearMonthDropdown.value;
        filteredData = data.filter(d => {
            const yearMonth = d['Measurement date'].toISOString().substring(0, 7);
            return yearMonth === selectedYearMonth;
        });
        draw(filteredData, selectedClass, selectedScheme, selectedBands);
    });
    
    classDropdown.addEventListener("change", function() {
        selectedClass = classDropdown.value;        
        filteredData = data.filter(d => {
            const yearMonth = d['Measurement date'].toISOString().substring(0, 7);
            return yearMonth === selectedYearMonth;
        });
        draw(filteredData, selectedClass, selectedScheme, selectedBands);
    });

    colorSchemeDropdown.addEventListener("change", function() {
    
        const index = +colorSchemeDropdown.value;
        selectedScheme = scheme_list[index];
        draw(filteredData, selectedClass, selectedScheme, selectedBands);

    });
    
    bandSlider.addEventListener("input", function() {
        selectedBands = parseInt(bandSlider.value, 10);
        bandValue.textContent = selectedBands;
        draw(filteredData, selectedClass, selectedScheme, selectedBands);
        
        
    });
});

function draw(data, label, scheme, bands) {   
    let infomation = [];
    
    for(let i = 0; i < data.length; i++){
        const addressParts = data[i].Address.split(','); 
        const formattedAddress = addressParts.slice(1, 3).join(', ');
        // console.log(formattedAddress);
        infomation.push({
            date: data[i]['Measurement date'],
            value: data[i][label],
            address: formattedAddress,
        });
    }
    infomation.sort(function(a, b) {
        return a.date - b.date;
    });
    // console.log(infomation);
    chart = HorizonChart(infomation, {
        x: d => d.date,
        y: d => d.value,
        z: d => d.address,
        bands,
        width,
        scheme
    });
    document.getElementById("horizon-chart").innerHTML = "";
    document.getElementById("horizon-chart").appendChild(chart);
}

function HorizonChart(data, {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    z = () => 1, // given d in data, returns the (categorical) z-value
    defined, // for gaps in data
    curve = d3.curveLinear, // method of interpolation between points
    marginTop = 20, // top margin, in pixels
    marginRight = 0, // right margin, in pixels
    marginBottom = 0, // bottom margin, in pixels
    marginLeft = 20, // left margin, in pixels
    width = 1200, // outer width, in pixels
    size = 60, // outer height of a single horizon, in pixels
    bands = 5, // number of bands
    padding = 10, // separation between adjacent horizons
    xType = d3.scaleUtc, // type of x-scale
    xDomain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [size, size - bands * (size - padding)], // [bottom, top]
    zDomain, // array of z-values
    scheme = d3.schemeWarm, // color scheme; shorthand for colors
    colors = scheme[Math.max(3, bands)], // an array of colors
  } = {}) {

    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const Z = d3.map(data, z);
    if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
    const D = d3.map(data, defined);
  
    
    if (xDomain === undefined) xDomain = d3.extent(X);
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];
    if (zDomain === undefined) zDomain = Z;
    zDomain = new d3.InternSet(zDomain);
  
    const I = d3.range(X.length).filter(i => zDomain.has(Z[i]));
    
    const height = zDomain.size * size + marginTop + marginBottom;
  
    
    const xScale = xType(xDomain, xRange);
    const yScale = yType(yDomain, yRange);
    const xAxis = d3.axisTop(xScale).ticks(width / 80).tickSizeOuter(0);
    

    const uid = `O-${Math.random().toString(16).slice(2)}`;
  

    const area = d3.area()
        .defined(i => D[i])
        .curve(curve)
        .x(i => xScale(X[i]))
        .y0(yScale(0))
        .y1(i => yScale(Y[i]));
    
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);
  
    const g = svg.selectAll("g")
      .data(d3.group(I, i => Z[i]))
      .join("g")
        .attr("transform", (_, i) => `translate(0,${i * size + marginTop})`);
  
    const defs = g.append("defs");
  
    defs.append("clipPath")
        .attr("id", (_, i) => `${uid}-clip-${i}`)
      .append("rect")
        .attr("y", padding)
        .attr("width", width)
        .attr("height", size - padding);
  
    defs.append("path")
        .attr("id", (_, i) => `${uid}-path-${i}`)
        .attr("d", ([, I]) => area(I));
  
    g
      .attr("clip-path", (_, i) => `url(${new URL(`#${uid}-clip-${i}`, location)})`)
      .selectAll("use")
      .data((d, i) => new Array(bands).fill(i))
      .join("use")
        .attr("fill", (_, i) => colors[i + Math.max(0, 3 - bands)])
        .attr("transform", (_, i) => `translate(0,${i * size})`)
        .attr("xlink:href", (i) => `${new URL(`#${uid}-path-${i}`, location)}`);
  
    g.append("text")
        .attr("x", marginLeft)
        .attr("y", (size + padding) / 2)
        .attr("dy", "0.35em")
        .text(([z]) => z);
  
    svg.append("g")
        .attr("transform", `translate(0,${marginTop})`)
        .call(xAxis)
        .call(g => g.selectAll(".tick")
          .filter(d => xScale(d) < 10 || xScale(d) > width - 10)
          .remove())
        .call(g => g.select(".domain").remove());
  
    return svg.node();
  }

