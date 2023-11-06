var svg = d3.select('#chart');
var buttoms = d3.select('#choose_xy');
const W = +svg.attr('width');
const H = +svg.attr('height');

var Data;
// default xy label
var x_label = "sepal length";
var y_label = "sepal width";
const labels = ["sepal length","sepal width","petal length","petal width"];

var label_order = ["sepal length","sepal width","petal length","petal width"];

var order_count = 1;
var selected_mark = 0;

const render = (data)=>{
    const margin = {top: 20, bottom: 20, left: 50, right: 90};
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;


    const Yscale1 = d3.scaleLinear()
        .domain([d3.min(data, d => d[label_order[0]]),
                 d3.max(data, d => d[label_order[0]])])
        .range([margin.top,innerH])

    const Yscale2 = d3.scaleLinear()
        .domain([d3.min(data, d => d[label_order[1]]),
                 d3.max(data, d => d[label_order[1]])])
        .range([margin.top,innerH])

    const Yscale3 = d3.scaleLinear()
        .domain([d3.min(data, d => d[label_order[2]]),
                 d3.max(data, d => d[label_order[2]])])
        .range([margin.top,innerH])

    const Yscale4 = d3.scaleLinear()
        .domain([d3.min(data, d => d[label_order[3]]),
                 d3.max(data, d => d[label_order[3]])])
        .range([margin.top,innerH])
    
    svg.selectAll('line').remove();

    const g1 = svg.append('g');

    svg.selectAll('label1').data(data)
        .enter().append('line')
            .attr('x1', margin.left + 0*W/4)
            .attr('y1', d=>Yscale1(d[label_order[0]])+30)
            .attr('x2', margin.left + 1*W/4)
            .attr('y2', d=>Yscale2(d[label_order[1]])+30)
            .style('stroke', d=>{
                if(d['class'] === 'Iris-setosa') return 'blue';
                if(d['class'] === 'Iris-versicolor') return 'green';
                if(d['class'] === 'Iris-virginica') return 'red';
            })
            .style('stroke-width', 3)
            .attr("transform", 'translate('+(margin.left)+',0)')
            .classed("label1",true);
        

    svg.selectAll('label2').data(data)
        .enter().append('line')
            .attr('x1', margin.left + 1*W/4)
            .attr('y1', d=>Yscale2(d[label_order[1]])+30)
            .attr('x2', margin.left + 2*W/4)
            .attr('y2', d=>Yscale3(d[label_order[2]])+30)
            .style('stroke', d=>{
                if(d['class'] === 'Iris-setosa') return 'blue';
                if(d['class'] === 'Iris-versicolor') return 'green';
                if(d['class'] === 'Iris-virginica') return 'red';
            })
            .style('stroke-width', 3)
            .attr("transform", 'translate('+(margin.left)+',0)')
            .classed("label2",true);

    svg.selectAll('label3').data(data)
        .enter().append('line')
            .attr('x1', margin.left + 2*W/4)
            .attr('y1', d=>Yscale3(d[label_order[2]])+30)
            .attr('x2', margin.left + 3*W/4)
            .attr('y2', d=>Yscale4(d[label_order[3]])+30)
            .style('stroke', d=>{
                if(d['class'] === 'Iris-setosa') return 'blue';
                if(d['class'] === 'Iris-versicolor') return 'green';
                if(d['class'] === 'Iris-virginica') return 'red';
            })
            .style('stroke-width', 3)
            .attr("transform", 'translate('+(margin.left)+',0)')
            .classed("label3",true);




            
/*
            .attr('cy', d=>Yscale(d[y_label]))
            .attr('cx',d =>Xscale(d[x_label]))
    */
        
    svg.selectAll('g').remove();
    const g = svg.append('g')
        //.attr("transform", 'translate('+(margin.left+8)+','+margin.top+')');
    g.append('g').call(d3.axisLeft(Yscale1))
        .attr("transform", 'translate('+(2*margin.left + 0*W/4)+',30)');

    g.append('g').call(d3.axisLeft(Yscale2))
        .attr("transform", 'translate('+(2*margin.left + 1*W/4)+',30)');

    g.append('g').call(d3.axisLeft(Yscale3))
        .attr("transform", 'translate('+(2*margin.left + 2*W/4)+',30)');

    g.append('g').call(d3.axisLeft(Yscale4))
        .attr("transform", 'translate('+(2*margin.left + + 3*W/4)+',30)');


    g.append("text").text(label_order[0])
        .attr("x", margin.left+50)
        .attr("y",margin.top)
        .attr("text-anchor", "middle");
    
    g.append("text").text(label_order[1])
        .attr("x",  margin.left+50 + W/4)
        .attr("y",margin.top)
        .attr("text-anchor", "middle");

    g.append("text").text(label_order[2])
        .attr("x", margin.left+50 + 2*W/4)
        .attr("y",margin.top)
        .attr("text-anchor", "middle");

    g.append("text").text(label_order[3])
        .attr("x", margin.left+50 + 3*W/4)
        .attr("y",margin.top)
        .attr("text-anchor", "middle");
    
    var legend = d3.select('#legend');


    legend.append("line").attr('x1', 15).attr('y1', 30).attr('x2', 45).attr('y2', 30).style('stroke', 'blue').style('stroke-width', 5);
    legend.append("line").attr('x1', 15).attr('y1', 60).attr('x2', 45).attr('y2', 60).style('stroke', 'green').style('stroke-width', 5);
    legend.append("line").attr('x1', 15).attr('y1', 90).attr('x2', 45).attr('y2', 90).style('stroke', 'red').style('stroke-width', 5);

    legend.append("text").attr("x", 50).attr("y", 35).text("Iris-setosa").style("font-size", "15px").attr("text-anchor", "start")
    legend.append("text").attr("x", 50).attr("y", 65).text("Iris-versicolor").style("font-size", "15px").attr("text-anchor", "start")
    legend.append("text").attr("x", 50).attr("y", 95).text("Iris-virginica").style("font-size", "15px").attr("text-anchor", "start")
    
}

const show_buttoms = ()=>{
    

        for(var j = 1 ; j <= 4 ; j++){
            var label = labels[j-1];

            var color = 'rgb(211, 211, 211)';
            buttoms.append("text").text(label)
                .attr("x", 100*j +230)
                .attr("y", 80*1.5-30)
                .attr("text-anchor", "middle");

            const buttom_g = buttoms.append('g')
                .classed("choose_g",true)
                .on("click",function(){
                    var x = (d3.select(this).select("circle").attr("cx")-230)/100
                    x--;
                    if(  Math.floor(selected_mark/(2**x))%2 != 1 || order_count>=5){
                        if(order_count>=5){
                            d3.selectAll('.choose_g').selectAll("text").remove()
                            order_count = 1;
                            selected_mark = 0;
                        }
                        
                        label_order[order_count-1] = labels[x]
                        d3.select(this).append('text')
                            .attr("dx", d3.select(this).select("circle").attr("cx"))
                            .attr("dy", +d3.select(this).select("circle").attr("cy")+5)
                            .text(order_count)
                            .attr("text-anchor", "middle")
                            .transition().duration(0).style('cursor', 'pointer')
                        
                        order_count++;
                        selected_mark += 2**(x)
                        if(order_count>= 5){
                            update_chart()
                        }
                    }
                });

            const buttom = buttom_g.append('circle')
                .classed("choose_x",true)
                .attr("cx", 100*j +230)
                .attr("cy", 80*1.5)
                .attr("r", 25)
                .attr('fill', color)
                .attr('stroke', 'rgb(0, 0, 0)')
                .on('mouseover', function () {
                        d3.select(this)
                        .transition().duration(0).style('cursor', 'pointer')
                })
                .on("mouseleave", function () {
                        d3.select(this)
                            .transition().duration(0).style('cursor', 'pointer')
                })

                
        }
        buttoms.append("text").text("Order : ")
                .attr("x", 25+200)
                .attr("y", 80*1.5)
                .attr("text-anchor", "middle");
}
   
    


d3.csv('http://vis.lab.djosix.com:2023/data/iris.csv').then(data=>{
    data.forEach(d => {
        d['sepal length'] = +d['sepal length'];
        d['sepal width'] = +d['sepal width'];
        d['petal length'] = +d['petal length'];
        d['petal width'] = +d['petal width'];
    });
    
    data.pop();
    Data = data;
    console.log(data)
    render(data);
    show_buttoms();
});


// update order i to label j
const update_chart = ()=>{
        render(Data);
}