// Chart dimensions and margins
const margin = { top: 60, right: 30, bottom: 80, left: 80 };
const width = 1000 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create tooltip
const tooltip = d3.select("#tooltip");

// Fetch and process data
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
    .then(data => {
        const dataset = data.data;
        
        // Parse dates and convert GDP to numbers
        const parseDate = d3.timeParse("%Y-%m-%d");
        dataset.forEach(d => {
            d[0] = parseDate(d[0]);
            d[1] = +d[1];
        });

        // Create scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(dataset, d => d[0]))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, d => d[1])])
            .range([height, 0]);

        // Create axes
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat("%Y"));

        const yAxis = d3.axisLeft(yScale)
            .tickFormat(d => `$${d3.format(".1f")(d / 1000)}T`);

        // Add x-axis
        g.append("g")
            .attr("id", "x-axis")
            .attr("class", "axis")
            .attr("transform", `translate(0,${height})`)
            .call(xAxis);

        // Add y-axis
        g.append("g")
            .attr("id", "y-axis")
            .attr("class", "axis")
            .call(yAxis);

        // Add axis labels
        g.append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Gross Domestic Product");

        g.append("text")
            .attr("class", "axis-label")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .text("Year");

        // Create bars
        g.selectAll(".bar")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("data-date", d => d3.timeFormat("%Y-%m-%d")(d[0]))
            .attr("data-gdp", d => d[1])
            .attr("x", d => xScale(d[0]))
            .attr("y", d => yScale(d[1]))
            .attr("width", width / dataset.length)
            .attr("height", d => height - yScale(d[1]))
            .on("mouseover", function(event, d) {
                tooltip
                    .attr("data-date", d3.timeFormat("%Y-%m-%d")(d[0]))
                    .html(`
                        <div><strong>${d3.timeFormat("%B %Y")(d[0])}</strong></div>
                        <div>GDP: $${d3.format(",.2f")(d[1])} Billion</div>
                    `)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px")
                    .classed("show", true);
            })
            .on("mouseout", function() {
                tooltip.classed("show", false);
            });
    })
    .catch(error => {
        console.error("Error loading data:", error);
        d3.select("#chart")
            .append("div")
            .style("text-align", "center")
            .style("color", "#e74c3c")
            .style("font-size", "18px")
            .text("Error loading data. Please check your internet connection.");
    });
