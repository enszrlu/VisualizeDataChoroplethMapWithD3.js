// The svg
/* const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"); */

const width = 950;
const height = 600;
const padding = 60;
const scale = 100;

const svg = d3.select("#d3Canvas")
    .append("svg")
    .attr('id', 'choropleth')
    .attr("width", width)
    .attr("height", height);

var div = d3.select("#d3Canvas").append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);


const pathGenerator = d3.geoPath();


fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json').then(response => response.json())
    .then((data) => {
        fetch('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json').then(response => response.json())
            .then((education) => {
                const counties = topojson.feature(data, data.objects.counties);
                const countyEducationByFips = {}
                const educationRange = []

                education.forEach(function (county) {
                    countyEducationByFips[county.fips] = {
                        "state": county.state,
                        "area_name": county.area_name,
                        "bachelorsOrHigher": county.bachelorsOrHigher
                    }
                    educationRange.push(county.bachelorsOrHigher)
                });

                const colorScale = d3.scaleSequential()
                    .interpolator(d3.interpolateRdYlBu)
                    .domain([d3.max(educationRange), d3.min(educationRange)])

                svg.selectAll('path').data(counties.features)
                    .enter().append('path')
                    .attr('class', 'county')
                    .attr('d', pathGenerator)
                    .attr('data-fips', (d) => d.id)
                    .attr('data-education', (d) => countyEducationByFips[d.id].bachelorsOrHigher)
                    .attr('data-state', (d) => countyEducationByFips[d.id].state)
                    .attr('data-area_name', (d) => countyEducationByFips[d.id].area_name)
                    .style('fill', (d) => colorScale(countyEducationByFips[d.id].bachelorsOrHigher))
                    .on("mouseover", function (d) {
                        var fips = this.getAttribute('data-fips');
                        var education = this.getAttribute('data-education');
                        var state = this.getAttribute('data-state');
                        var area_name = this.getAttribute('data-area_name')

                        var coordinates = d3.pointer(d);
                        var x = coordinates[0] + document.getElementById('choropleth').getBoundingClientRect().x - 2 * padding;
                        var y = coordinates[1] + document.getElementById('choropleth').getBoundingClientRect().y - padding;

                        div.attr('data-education', education);
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html(area_name + ', ' + state + " : " + education + '%')
                            .style("left", x + "px")
                            .style("top", y + "px");
                    })
                    .on("mouseout", function (d) {
                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });

                svg
                    .append('path')
                    .datum(
                        topojson.mesh(data, data.objects.states, function (a, b) {
                            return a !== b;
                        })
                    )
                    .attr('class', 'states')
                    .attr('d', pathGenerator);


                const colorDom = colorScale.domain();
                const increase = (d3.max(colorDom) - d3.min(colorDom)) / 4;
                var colors = []

                for (var i = 0; i < 5; i++) {
                    colors.push(parseFloat(i * increase + d3.min(colorDom)).toFixed(3))
                }

                console.log(colors)

                var legendWidth = 200;
                var legendHeight = 50;
                var legendPadding = 20;

                var legendRectWidth = (legendWidth) / colors.length

                const legend = d3.select("#d3Canvas")
                    .append("svg")
                    .attr('id', 'legend')
                    .attr('width', legendWidth)
                    .attr('height', legendHeight);

                legend
                    .selectAll('rect')
                    .data(colors)
                    .enter()
                    .append('rect')
                    .attr('x', (d, i) => i * legendRectWidth)
                    .attr('y', 0)
                    .attr('width', legendRectWidth)
                    .attr('height', legendHeight - legendPadding)
                    .attr('fill', (d) => colorScale(d))

                const legendScale = d3.scaleBand()
                    .domain(colors)
                    .range([0, legendWidth]);

                const legendAxis = d3.axisBottom(legendScale);

                legend.append("g")
                    .attr("id", "legend-x-axis")
                    .attr("transform", "translate(0," + (legendHeight - 20) + ")")
                    .call(legendAxis);
            })

    })