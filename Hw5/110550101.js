const itemsPerPage = 20;
let currentPage = 1;
let sort__target, sort_trend;

d3.csv('http://vis.lab.djosix.com:2023/data/TIMES_WorldUniversityRankings_2024.csv').then(data => {
  
  
  data.forEach(d => {
    if (d['scores_overall'].includes(' - ')) {
        const rangeValues = d['scores_overall'].split(' - ');
        const min = +rangeValues[0];
        const max = +rangeValues[1];
        
        d['scores_overall'] = (min + max) / 2;
    } else {
        d['scores_overall'] = +d['scores_overall'];
    }
    d['scores_research'] = +d['scores_research'];
    d['scores_teaching'] = +d['scores_teaching'];
    d['scores_citations'] = +d['scores_citations'];
    d['scores_industry_income'] = +d['scores_industry_income'];
    d['scores_international_outlook'] = +d['scores_international_outlook'];

  });
  
    Data = data.map(d => ({
        rank: d['rank'],
        name: d['name'],
        scores_overall: d['scores_overall'],
        scores_research: d['scores_research'],
        scores_teaching: d['scores_teaching'],
        scores_citations: d['scores_citations'],
        scores_industry_income: d['scores_industry_income'],
        scores_international_outlook: d['scores_international_outlook'],
        scores_total: (d['scores_research'] + d['scores_teaching'] + d['scores_citations'] + d['scores_industry_income'] + d['scores_international_outlook']) ,
        
    })).filter(d => !isNaN(d.scores_overall));
    const totalPages = Math.ceil(Data.length / itemsPerPage);
    

    // default chart
    updateStackedBarChart(Data, 'scores_overall', 'des', currentPage);
    updatePaginationInfo(currentPage, totalPages, itemsPerPage, Data.length);
    
    console.log(Data);

    document.getElementById("sortOverallAsc").addEventListener("click", () => {
        sort__target = "scores_overall";
        sort_trend = "asc";
        updateStackedBarChart(Data, sort__target, sort_trend, currentPage);
        
    });
    
    document.getElementById("sortOverallDesc").addEventListener("click", () => {
        sort__target = "scores_overall";
        sort_trend = "desc";
        updateStackedBarChart(Data, sort__target, sort_trend, currentPage);
    });
    
    document.getElementById("sortTeachingAsc").addEventListener("click", () => {
        sort__target = "scores_teaching";
        sort_trend = "asc";
        updateStackedBarChart(Data, sort__target, sort_trend, currentPage);
    });
    
    document.getElementById("sortTeachingDesc").addEventListener("click", () => {
        sort__target = "scores_teaching";
        sort_trend = "desc";
        updateStackedBarChart(Data, sort__target, sort_trend, currentPage);
    });

    document.getElementById("sortResearchAsc").addEventListener("click", () => {
        sort__target = "scores_research";
        sort_trend = "asc";
        updateStackedBarChart(Data, sort__target, sort_trend, currentPage);
    });
    
    document.getElementById("sortResearchDesc").addEventListener("click", () => {
        sort__target = "scores_research";
        sort_trend = "desc";
        updateStackedBarChart(Data, sort__target, sort_trend, currentPage);
    });
    
    document.getElementById("sortCitationsAsc").addEventListener("click", () => {
        sort__target = "scores_citations";
        sort_trend = "asc";
        updateStackedBarChart(Data, sort__target, sort_trend, currentPage);
    });
    
    document.getElementById("sortCitationsDesc").addEventListener("click", () => {
        sort__target = "scores_citations";
        sort_trend = "desc";
        updateStackedBarChart(Data, sort__target, sort_trend, currentPage);
    });

    document.getElementById("sortIndustry_incomeAsc").addEventListener("click", () => {
        sort__target = "scores_industry_income";
        sort_trend = "asc";
        updateStackedBarChart(Data, sort__target, sort_trend, currentPage);
    });
    
    document.getElementById("sortIndustry_incomeDesc").addEventListener("click", () => {
        sort__target = "scores_industry_income";
        sort_trend = "desc";
        updateStackedBarChart(Data, sort__target, sort_trend, currentPage);
    });
    
    document.getElementById("sortInternational_outlookAsc").addEventListener("click", () => {
        sort__target = "scores_international_outlook";
        sort_trend = "asc";
        updateStackedBarChart(Data, sort__target, sort_trend, currentPage);
    });
    
    document.getElementById("sortInternational_outlookDesc").addEventListener("click", () => {
        sort__target = "scores_international_outlook";
        sort_trend = "desc";
        updateStackedBarChart(Data, sort__target, sort_trend, currentPage);
    });
    document.getElementById("prevPageButton").addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          updateStackedBarChart(Data, sort__target, sort_trend, currentPage);
        }
        else{
            currentPage = totalPages;
            updateStackedBarChart(Data, sort__target, sort_trend, currentPage);
        }
        updatePaginationInfo(currentPage, totalPages, itemsPerPage, Data.length);

      });
      
    document.getElementById("nextPageButton").addEventListener("click", () => {
        if (currentPage < totalPages) {
          currentPage++;
          updateStackedBarChart(Data, sort__target, sort_trend, currentPage);
        }
        else{
            currentPage = 1;
            updateStackedBarChart(Data, sort__target, sort_trend, currentPage);
        }
        updatePaginationInfo(currentPage, totalPages, itemsPerPage, Data.length);

    });

    
}).catch(error => console.error('Error loading CSV:', error));



function updateStackedBarChart(data, sortingCriterion, sortOrder, currentPage) {
    
   
    

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const slicedData = data.slice(startIndex, endIndex);
    if(itemsPerPage * currentPage > data.length){
        for(let i = startIndex + 1; i < endIndex; i++){
            slicedData.push({name:(i)});
        }
        // console.log(slicedData);
    }
    
    slicedData.sort((a, b) => {
        if (sortOrder === 'asc') {
            return a[sortingCriterion] - b[sortingCriterion];
        } else {
            return b[sortingCriterion] - a[sortingCriterion];
        }
    });

    
    const customFeatureOrder = ["scores_teaching", "scores_research", "scores_citations", "scores_industry_income", "scores_international_outlook"];

    const colorScale = d3.scaleOrdinal()
        .domain(customFeatureOrder)
        .range(['#ff7f0e', '#1f77b4', '#2ca02c', '#d62728', '#9467bd']);

   
    const margin = { top: 20, right: 20, bottom: 50, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    d3.select("#stacked_bar_chart").selectAll("*").remove();



    // Create an SVG element
    const svg = d3.select("#stacked_bar_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);



    // Define the x and y scales
    const xScale = d3.scaleBand()
        .domain(slicedData.map(d => d.name))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(slicedData, d => d['scores_total'])])
        .range([height, 0]);




    // Create a stack generator
    const stack = d3.stack()
        .keys(customFeatureOrder)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    // Generate the stacked data
    const stackedData = stack(slicedData);

    // Create the stacked bars
    svg.selectAll("g")
        .data(stackedData)
        .enter()
        .append("g")
        .attr("fill", d => colorScale(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.data.name))
        .attr("y", d => yScale(isNaN(d[1]) ? 0 : d[1]))
        .attr("height", d => yScale(isNaN(d[0]) ? 0 : d[0]) - yScale(isNaN(d[1]) ? 0 : d[1]))
        .attr("width", xScale.bandwidth() / 2)
        .on("click", function (event, d) {
            showScores(d.data)});


    
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
        .tickSize(0)
        .tickValues([]) 
        )
        .selectAll("text") 
        .style("text-anchor", "middle")
        .style("font-size", "10px"); 


    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale));

    // Add labels

    svg.append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + 30) 
    .attr("text-anchor", "middle")
    .text("University");

    svg.append("text")
    .attr("class", "y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -30) 
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Total Score");

}

function updatePaginationInfo(currentPage, totalPages, itemsPerPage, totalItems) {
    const paginationInfo = document.getElementById("paginationInfo");
    paginationInfo.innerHTML = `Page ${currentPage} of ${totalPages} (${itemsPerPage} items per page, ${calculateItemsInCurrentPage(currentPage, itemsPerPage, totalItems)} items in this page)`;
  }
  
  function calculateItemsInCurrentPage(currentPage, itemsPerPage, totalItems) {
    // console.log(currentPage, itemsPerPage, totalItems);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    return endIndex - startIndex;
  }

  function showScores(data) {
    console.log(data);
    const scoresInfo = document.getElementById('scores_info');

    const customFeatureOrder = ["scores_teaching", "scores_research", "scores_citations", "scores_industry_income", "scores_international_outlook"];

    const colorScale = d3.scaleOrdinal()
        .domain(customFeatureOrder)
        .range(['#ff7f0e', '#1f77b4', '#2ca02c', '#d62728', '#9467bd']);
    scoresInfo.innerHTML = `
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Total Score:</strong> ${data.scores_total}</p>
        <p><strong>Teaching Score:</strong> <span style="color: ${colorScale('scores_teaching')}">${data.scores_teaching}</span></p>
        <p><strong>Research Score:</strong> <span style="color: ${colorScale('scores_research')}">${data.scores_research}</span></p>
        <p><strong>Citations Score:</strong> <span style="color: ${colorScale('scores_citations')}">${data.scores_citations}</span></p>
        <p><strong>Industry Income Score:</strong> <span style="color: ${colorScale('scores_industry_income')}">${data.scores_industry_income}</span></p>
        <p><strong>International Outlook Score:</strong> <span style="color: ${colorScale('scores_international_outlook')}">${data.scores_international_outlook}</span></p>
    `;
}