/*Some of the contents of this document are referenced from
    https://comp6234.gitbook.io/3-html-css-and-javascript
    https://comp6234.gitbook.io/7-maps/
    https://comp6234.gitbook.io/6-legends-and-interactivity
    http://edshare.soton.ac.uk/19800/
    https://www.w3schools.com/jquery/
    https://www.w3schools.com/js/
    custom.geo.json is from http://edshare.soton.ac.uk/19800/
*/
var indexOfClick = 0;
var viewNumber = 0;
$(document).ready(function () {
    toFirstPage();
});

function toFirstPage() {
    indexOfClick = 0;

    dataRefresh(viewNumber);
}
function toLastPage() {
    indexOfClick = 14;
    dataRefresh(viewNumber);
}
function toPreviousPage() {
    if (indexOfClick == 0) {
        indexOfClick = 14;
    } else { indexOfClick -= 1; }
    dataRefresh(viewNumber);
}
function toLastPage() {
    indexOfClick = 14;
    dataRefresh(viewNumber);
}
function toNextPage() {
    if (indexOfClick == 14) {
        indexOfClick = 0;
    } else { indexOfClick += 1; }
    dataRefresh(viewNumber);
}

function viewType(number) {
    viewNumber = number;
    dataRefresh(viewNumber);
    changeType(viewNumber);
}

function changeType(number) {
    var dataType_array = ["Number", "Capacity", "Estimated"];
    document.getElementById("svgTitleBar").innerHTML = dataType_array[number] + " of Power Station Statistics by Country";
    document.getElementById("svgTitlePie").innerHTML = "Fuel Structure Details of " + dataType_array[number];

}

function dataRefresh(dataType) {
    changeType(viewNumber);
    //console.log(dataType);
    if (indexOfClick + 1 >= 10) {
        document.getElementById("page").innerHTML = (indexOfClick + 1) + "/15";
    }
    else {
        document.getElementById("page").innerHTML = "0" + (indexOfClick + 1) + "/15";
    }
    d3.select("div#pieSvgDiv").selectAll("svg").remove();
    d3.select("div#barSvgDiv").selectAll("svg").remove();
    d3.queue()
        .defer(d3.csv, "OpenData_CW1.csv",
            function (data, i) {
                return {
                    id: i,
                    country: data["country"],
                    country_long: data["country_long"],
                    name: data["name"],
                    capacity_mw: data["capacity_mw"],
                    latitude: data["latitude"],
                    longitude: data["longitude"],
                    fuel1: data["fuel1"],
                    fuel2: data["fuel2"],
                    fuel3: data["fuel3"],
                    fuel4: data["fuel4"],
                    commissioning_year: data["commissioning_year"],
                    estimated_generation: data["estimated_generation_gwh"]
                };
            }).defer(d3.json, "custom.geo.json").await(analyze);
    function analyze(error, dataset, world_map) {
        //Deal with the data from dataset
        if (error) {
            //console.log(error);
            return;
        }
        //console.log(dataset);
        var dataType_array = ["Number", "Capacity", "Estimated"];
        var country_name = new Set();
        var country_set = new Set();
        var fuel_set = new Set();
        var capacity_set = new Array();
        var estimated_set = new Array();
        var location = new Array(2);
        var latitude_array = new Array();
        var longitude_array = new Array();
        for (var i = 0; i < dataset.length; i++) {
            country_set.add(dataset[i].country);
            country_name.add(dataset[i].country_long);
            fuel_set.add(dataset[i].fuel1);
            fuel_set.add(dataset[i].fuel2);
            fuel_set.add(dataset[i].fuel3);
            fuel_set.add(dataset[i].fuel4);
            capacity_set[i] = parseFloat(dataset[i].capacity_mw);
            estimated_set[i] = parseFloat(dataset[i].estimated_generation);
            latitude_array[i] = dataset[i].latitude;
            longitude_array[i] = dataset[i].longitude;
        }
        location[0] = latitude_array;
        location[1] = longitude_array;
        //console.log(location);
        country_name.delete("");
        country_set.delete("");
        fuel_set.delete("");
        //console.log(estimated_set);
        var country_set_array = Array.from(country_set);
        var country_name_array = Array.from(country_name);
        var fuel_set_array = Array.from(fuel_set);
        //console.log(country_set_array);
        //console.log(country_name_array);
        //console.log(fuel_set_array);
        /*
        ["Hydro", "Gas", "Other", "Oil", "Wind", "Coal", 
        "Nuclear", "Solar", "Waste", "Biomass", 
        "Petcoke", "Geothermal", "Cogeneration", "Wave and Tidal"]
        */
        var country_fuel_count = new Array(country_name_array.length);
        var country_fuel_capacity = new Array(country_name_array.length);
        var country_fuel_estimated = new Array(country_name_array.length);
        var country_count = new Array(country_name_array.length);
        var country_capacity = new Array(country_name_array.length);
        var country_estimated = new Array(country_name_array.length);
        for (let index = 0; index < country_name_array.length; index++) {
            country_fuel_count[index] = new Array(fuel_set_array.length);
            country_fuel_capacity[index] = new Array(fuel_set_array.length);
            country_fuel_estimated[index] = new Array(fuel_set_array.length);
        }
        var fuel_temp_count = new Array(fuel_set_array.length);
        var fuel_temp_capacity = new Array(fuel_set_array.length);
        var fuel_temp_estimated = new Array(fuel_set_array.length);
        for (let index = 0; index < country_name_array.length; index++) {

            country_count[index] = 0;
            country_capacity[index] = 0;
            country_estimated[index] = 0;
        }
        for (let index = 0; index < fuel_set_array.length; index++) {
            fuel_temp_count[index] = 0;
            fuel_temp_capacity[index] = 0;
            fuel_temp_estimated[index] = 0;
        }
        for (let j = 0; j < country_name_array.length; j++) {
            for (let index = 0; index < fuel_set_array.length; index++) {
                fuel_temp_count[index] = 0;
                fuel_temp_capacity[index] = 0;
                fuel_temp_estimated[index] = 0;
            }

            for (let i = 0; i < dataset.length; i++) {
                for (let k = 0; k < fuel_set_array.length; k++) {
                    if (dataset[i].country == country_set_array[j]) {

                        if (dataset[i].fuel1 == fuel_set_array[k] ||
                            dataset[i].fuel2 == fuel_set_array[k] ||
                            dataset[i].fuel3 == fuel_set_array[k] ||
                            dataset[i].fuel4 == fuel_set_array[k]) {
                            fuel_temp_count[k] += 1;
                            fuel_temp_capacity[k] += capacity_set[i];
                            fuel_temp_estimated[k] += estimated_set[i];
                            //console.log(fuel_set_array[k] + "," + fuel_temp_capacity[k] + "," + country_name_array[j]);
                            for (let l = 0; l < fuel_set_array.length; l++) {
                                country_fuel_count[j][l] = fuel_temp_count[l];
                                country_fuel_capacity[j][l] = parseInt(fuel_temp_capacity[l]);
                                country_fuel_estimated[j][l] = parseInt(fuel_temp_estimated[l]);
                            }
                        }
                    }
                }
            }
        }

        for (let i = 0; i < dataset.length; i++) {

            for (let j = 0; j < country_name_array.length; j++) {
                if (dataset[i].country == country_set_array[j]) {
                    country_count[j] += 1;
                    country_capacity[j] += capacity_set[i];
                    country_estimated[j] += estimated_set[i];
                }
            }

        }
        var all_fuel_count = new Object();
        var all_fuel_capcity = new Object();
        var all_fuel_estimated = new Object();
        var fuel_key = new Array(fuel_set_array.length);
        var fuel_value = new Array(fuel_set_array.length);
        var fuel_key_capcity = new Array(fuel_set_array.length);
        var fuel_value_capcity = new Array(fuel_set_array.length);
        var fuel_key_estimated = new Array(fuel_set_array.length);
        var fuel_value_estimated = new Array(fuel_set_array.length);
        for (let index = 0; index < fuel_set_array.length; index++) {
            fuel_value[index] = 0;
            fuel_value_capcity[index] = 0;
            fuel_value_estimated[index] = 0;
        }
        for (let i = 0; i < dataset.length; i++) {
            for (let index = 0; index < fuel_set_array.length; index++) {
                if (dataset[i].fuel1 == fuel_set_array[index] ||
                    dataset[i].fuel2 == fuel_set_array[index] ||
                    dataset[i].fuel3 == fuel_set_array[index] ||
                    dataset[i].fuel4 == fuel_set_array[index]) {
                    fuel_key[index] = fuel_set_array[index].replace(/ /g, "_");
                    fuel_value[index] += 1;
                    fuel_key_estimated[index] = fuel_set_array[index].replace(/ /g, "_");
                    fuel_value_estimated[index] += estimated_set[i];
                    fuel_key_capcity[index] = fuel_set_array[index].replace(/ /g, "_");
                    fuel_value_capcity[index] += capacity_set[i];
                }

            }

        }
        for (let index = 0; index < fuel_set_array.length; index++) {
            all_fuel_count[fuel_key[index]] = fuel_value[index];
            all_fuel_capcity[fuel_key_capcity[index]] = parseInt(fuel_value_capcity[index]);
            all_fuel_estimated[fuel_key_estimated[index]] = parseInt(fuel_value_estimated[index]);
        }

        //console.log(all_fuel_count);

        for (let j = 0; j < country_name_array.length; j++) {

            country_count[j] = parseInt(country_count[j]);
            country_capacity[j] = parseInt(country_capacity[j]);
            country_estimated[j] = parseInt(country_estimated[j]);;
        }
        var estimated_all = 0.0;
        var capacity_all = 0;
        for (let index = 0; index < country_estimated.length; index++) {
            estimated_all += country_estimated[index];
            capacity_all += country_capacity[index];

        }
        //console.log("all" + estimated_all + ',' + capacity_all);


        //console.log(country_count);
        //console.log(country_capacity);
        //console.log(country_estimated);
        var data = new Array();
        for (let index = 0; index < country_set_array.length; index++) {
            var data_temp = new Object();
            //count_data_temp.id=index;
            data_temp.country = country_set_array[index];
            data_temp.count = country_count[index];
            data_temp.country_name = country_name_array[index];
            data_temp.estimated = country_estimated[index];
            data_temp.capacity = country_capacity[index];
            var fuel_temp = new Array();
            /*
        ["Hydro", "Gas", "Other", "Oil", "Wind", "Coal", 
        "Nuclear", "Solar", "Waste", "Biomass", 
        "Petcoke", "Geothermal", "Cogeneration", "Wave and Tidal"]
        */

            var key = new Array();
            var value = new Array();
            var value_capacity = new Array();
            var value_estimated = new Array();

            var obj_count = new Object();
            var obj_capacity = new Object();
            var obj_estimated = new Object();



            for (let i = 0; i < fuel_set_array.length; i++) {

                key[i] = fuel_set_array[i].replace(/ /g, "_");
                value[i] = country_fuel_count[index][i];
                value_capacity[i] = country_fuel_capacity[index][i];
                value_estimated[i] = country_fuel_estimated[index][i];

                obj_count[key[i]] = value[i];
                obj_capacity[key[i]] = value_capacity[i];
                obj_estimated[key[i]] = value_estimated[i];

            }
            data_temp.fuel_count = obj_count;
            data_temp.fuel_capacity = obj_capacity;
            data_temp.fuel_estimated = obj_estimated;
            data[index] = data_temp;

        }
        var segDataSet = new Set();
        for (let i = 0; i < data.length; i += 10) {
            segDataSet.add(data.slice(i, i + 10));
        }
        var segData = Array.from(segDataSet);
        // console.log(segData.length + "!");
        //Set bar Data
        var barData = segData[indexOfClick];
        var pieData = new Array();
        if (dataType == 0) {
            pieData = all_fuel_count;
        } else if (dataType == 1) {
            pieData = all_fuel_capcity;

        } else if (dataType == 2) {
            pieData = all_fuel_estimated;
        }
        //console.log(pieData);
        //console.log("data\n" + barData);
        //console.log(data[1].fuel_count);
        var margin = { top: 30, right: 30, bottom: 30, left: 30 };
        const t = d3.transition().duration(750);
        var width = 480, pieWidth = 360;
        var height = 400, pieHeight = 360;
        var colour = d3.scaleOrdinal(d3.schemeCategory10);
        var radius = Math.min(pieWidth, pieHeight) / 2;
        //var pie=d3.pie().value
        function drawBars() {
            var barSvg = d3.select('body').select('div#barSvgDiv')
                .append('svg')
                .attr("id", "barChart")
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ")");

            //A Band scale is good for discrete values, such as the number of bars in a bar chart
            var y = d3.scaleBand()
                .domain(barData.map(function (d) { return d.country; }))
                .range([0, height])
                .padding(0.1);
            //console.log(y.bandwidth());
            //A Linear scale is good for continuous values, such as real numbers
            var x = d3.scaleLinear()
                .domain([0, d3.max(barData, function (d) {
                    if (dataType == 0) {
                        return d.count;
                    } else if (dataType == 1) {
                        return d.capacity;
                    } else if (dataType == 2) {
                        return d.estimated;
                    }
                })])
                .range([0, width - 80]);

            var bars = barSvg.selectAll(".bar")
                .data(barData)
                .enter()
                .append("g")
                .attr("class", "bar")
                ;

            bars.append("rect")
                .attr("height", y.bandwidth())

                .attr("x", 0)
                .attr("y", function (d) { return y(d.country); })
                .transition(t)
                .attr("width", function (d) {
                    if (dataType == 0) {
                        return x(d.count);
                    } else if (dataType == 1) {
                        return x(d.capacity);
                    } else if (dataType == 2) {
                        return x(d.estimated);
                    }
                })
                .attr("fill", function (d) { return colour(d.country); })
                ;
            bars.append("text")
                .attr("class", "label")

                .attr("y", function (d) { return y(d.country) + y.bandwidth() / 2; })
                .transition(t)
                .attr("x", function (d) {
                    if (dataType == 0) {
                        return x(d.count);
                    } else if (dataType == 1) {
                        return x(d.capacity);
                    } else if (dataType == 2) {
                        return x(d.estimated);
                    }
                })
                .text(function (d) {
                    //console.log(d);
                    if (dataType == 0) {
                        // console.log(d);
                        return d.count;
                    } else if (dataType == 1) {
                        return d.capacity;
                    } else if (dataType == 2) {
                        return d.estimated;
                    }
                })
                .style("font-size", 15);
            ;
            //Add the x axis
            barSvg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

            barSvg.append("g")
                .call(d3.axisLeft(y).tickSize(0)
                    .tickFormat(function (d, i) {
                        return barData[i].country;
                    })
                );
            bars.on("mouseover", mouseover)
                .on("mouseout", mouseout)
                ;

        }
        function drawPie(dataOfPie) {
            //console.log(pieData);
            colour = d3.scaleOrdinal(d3.schemeCategory10);
            var total = 0;
            var arc = d3.arc()
                .outerRadius(radius * 0.8)
                .innerRadius(radius * 0.5);

            var labelArc = d3.arc()
                .outerRadius(radius * 0.7)
                .innerRadius(radius * 0.7);

            var pieSvg = d3.select('body').select('div#pieSvgDiv')
                .append('svg')
                .attr("id", "pieChart")
                .attr('width', pieWidth)
                .attr('height', pieHeight)
                .append("g")
                .attr("transform", "translate(" + (pieWidth / 2) + "," + (pieHeight / 2) + ")")
                .data(Object.values(dataOfPie));
            var pie = d3.pie()
                .sort(null)
                .value(function (d) { return d; });
            var gPie = pieSvg.selectAll(".arc")
                .data(pie(Object.values(dataOfPie)))
                .enter().append("g")
                .attr("class", "arc");

            gPie.append("path")
                .attr("d", arc)
                .style("fill", function (d, i) {
                    //console.log(d);
                    total += d.data;
                    return colour(i);
                })
                ;

            gPie.append("text")
                .attr("transform", function (d) { return "translate(" + labelArc.centroid(d) + ")"; })
                .attr("text-anchor", "middle")
                .text(function (d, i) {
                    if (d.data != 0)
                        return (100 * d.data / total).toFixed(2) + "%";
                });
            colour = d3.scaleOrdinal(d3.schemeCategory10);
            var legendSvg = d3.select('body').select('div#pieSvgDiv')
                .append('svg')
                .attr("id", "legendChart")
                .attr('width', width / 3)
                .attr('height', height)
                .append('g')
                .attr('x', 0)
                .attr('y', 0)
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ")")
                .append("g")
                .attr("class", "legend");
            var legend = legendSvg.selectAll(".legend")
                .data(pie(Object.values(dataOfPie)))
                .enter().append("g")
                .attr("transform", function (d, i) {
                    {
                        //console.log(i);
                        return "translate(0," + i * 20 + ")";
                    }
                });
            legend.append('rect')
                .attr("x", 0)
                .attr("y", 70)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", function (d, i) {
                    //console.log(d)
                    return colour(i);

                });

            legend.append("text")
                .attr("x", 20)
                .attr("y", 75)
                .attr("dy", ".35em")
                .text(function (d, i) {
                    return fuel_set_array[i] + ":" + (100 * d.data / total).toFixed(2) + "%-"+d.data;
                })
                .attr("class", "textselected")
                .style("text-anchor", "start")
                .style("font-size", 10);
        }
        function drawMap() {
            d3.select('body').select("div#map").select("svg").remove();
            var mapWidth = document.getElementById("alertInfo").offsetWidth;
            alert(mapWidth);
            var mapHeight = 0.6 * mapWidth;
            var scale = mapWidth / 2 / Math.PI;

            var projection = d3.geoMercator()
                .scale(scale)
                .translate([mapWidth / 2, mapHeight / 2]);
            var path = d3.geoPath()
                .projection(projection);
            var map = d3.select("div#map").append("svg")
                .attr("width", mapWidth)
                .attr("height", mapHeight);
            map.selectAll("path")
                .data(world_map.features)
                .enter()
                .append("path")
                .attr("d", path)
                .classed("country", true)
                .on("click", function (d) {
                    //console.log(d);
                    updateSelected(this, d);
                });

            var all_countries = new Array();
            for (let i = 0; i < data.length; i++) {
                all_countries[data[i].country] = data[i].count;

            }

            //console.log(all_countries);
            countries = Object.keys(all_countries);
            var max_data = d3.max(countries, function (d) {
                //console.log(d);
                return all_countries[d];
            })
            //console.log(max_data);
            var color = d3.scaleQuantize()
                .domain([0, max_data])
                .range(d3.schemeBrBG[9]);

            map.selectAll("path")
                .style("fill", function (d) {
                    //console.log(d);
                    var val = all_countries[d.properties.iso_a3];

                    d.visVal = val;
                    if (val) {
                        return color(val);
                    }
                });
            var x = d3.scaleLinear()
                .domain([0, max_data])
                .rangeRound([mapWidth / 2, 3 * mapWidth / 4]);

            map.selectAll("g.key").remove();
            var g = map.append("g")
                .attr("class", "key")
                .attr("transform", "translate(0,40)");

            g.selectAll("rect")
                .data(color.range().map(function (d) {
                    d = color.invertExtent(d);
                    if (d[0] == null) d[0] = x.domain()[0];
                    if (d[1] == null) d[1] = x.domain()[1];
                    return d;
                }))
                .enter().append("rect")
                .attr("height", 8)
                .attr("x", function (d) { return x(d[0]); })
                .attr("width", function (d) { return x(d[1]) - x(d[0]); })
                .attr("fill", function (d) { return color(d[0]); });

            g.append("text")
                .attr("class", "caption")
                .attr("x", x.range()[0])
                .attr("y", -6)
                .attr("fill", "#000")
                .attr("text-anchor", "start")
                .attr("font-weight", "bold");

            g.call(d3.axisBottom(x)
                .tickSize(13)
                .tickFormat(function (x, i) { return x; })
                .tickValues(color.domain()))
                .select(".domain")
                .remove();
            function updateSelected(el, thisdata) {
                var temp = new Array();
                for (let index = 0; index < data.length; index++) {
                    if (data[index].country == thisdata.properties.iso_a3) {
                        //console.log("click");

                        temp = data[index];
                        // console.log(temp);
                    }

                }
                // we've clicked on the currently active country
                // deactivate it and hide the tooltip
                if (d3.select(el).classed("active")) {
                    d3.select(el).classed("active", false);
                    d3.select("#map_tooltip").classed("active", false);
                    mouseout(temp);
                    return;
                }

                // make sure no country is active
                map.selectAll("path.active").classed("active", false);

                // make the country that was clicked on active
                d3.select(el).classed("active", true);

                // write tooltip message and move it into position

                var msg = thisdata.properties.name;
                if (thisdata.visVal) {
                    msg += ("<br/>Number:" + thisdata.visVal
                        + "<br/>Capitity:" + temp.capacity + "<br/>Estimated:" + temp.estimated);
                } else {
                    msg += ("<br/>Data Not Included");
                }
                d3.select("#map_tooltip").html(msg)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 50) + "px")
                    .style("width", "100px");

                // make sure tooltip is visible
                d3.select("#map_tooltip").classed("active", true);
                if (temp.country == thisdata.properties.iso_a3) {
                    mouseover(temp);
                }
            }


            for (let index = 0; index < location[0].length; index++) {
                var loc = [0, 0];
                loc = [location[1][index], location[0][index]];
                map.append("circle")
                    .attr("cx", projection(loc)[0])
                    .attr("cy", projection(loc)[1])
                    .attr("r", "0.7px")
                    .style("fill", d3.rgb(0, 255, 255));
            }

        }
        function mouseover(d) {
            document.getElementById("svgTitleBar").innerHTML = dataType_array[dataType] + " of Power Station Statistics by Country";
            document.getElementById("svgTitlePie").innerHTML = d.country_name + "'s Fuel Structure Details of " + dataType_array[dataType];

            var pieSvg = d3.select('body').select('div#pieSvgDiv').select("#pieChart");
            pieSvg.remove();
            var legend = d3.select('body').select('div#pieSvgDiv').select("#legendChart");
            legend.remove();
            if (viewNumber == 0) {
                drawPie(d.fuel_count);
            } else if (dataType == 1) {
                drawPie(d.fuel_capacity);
            } else if (dataType == 2) {
                drawPie(d.fuel_estimated);
            }
        }
        function mouseout(d) {
            document.getElementById("svgTitleBar").innerHTML = dataType_array[dataType] + " of Power Station Statistics by Country";
            document.getElementById("svgTitlePie").innerHTML = "Fuel Structure Details of " + dataType_array[dataType];
            var pieSvg = d3.select('body').select('div#pieSvgDiv').select("#pieChart");
            pieSvg.remove();
            var legend = d3.select('body').select('div#pieSvgDiv').select("#legendChart");
            legend.remove();
            if (viewNumber == 0) {
                drawPie(all_fuel_count);
            } else if (dataType == 1) {
                drawPie(all_fuel_capcity);
            } else if (dataType == 2) {
                drawPie(all_fuel_estimated);
            }
        }
        var barChart = drawBars();
        var pieChart = drawPie(pieData);
        var mapChart = drawMap();




    }
}
