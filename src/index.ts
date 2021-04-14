import * as d3 from "d3";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
const d3Composite = require("d3-composite-projections");
import { latLongCommunities } from "./communities";
import { stats_0, stats_1 } from "./stats";

const div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

const aProjection = d3Composite
  .geoConicConformalSpain()
  .scale(3300)
  .translate([500, 400]);

const geoPath = d3.geoPath().projection(aProjection);

const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);

const svg = d3
.select("body")
.append("svg")
.attr("width", 1024)
.attr("height", 800)
.attr("style", "background-color: #FBFAF0");

svg
.selectAll("path")
.data(geojson["features"])
.enter()
.append("path")
.attr("class", "country")
.attr("d", geoPath as any)
.attr("style", "background-color: #FFFFF");

const updateChart = (data: any[]) => {

  const calculateMaxAffected = (data) => {
    return data.reduce(
      (max, item) => (item.value > max ? item.value : max),
      0
    );
  };
  const maxAffected = calculateMaxAffected(data);

  const color = d3
  .scaleThreshold<number, string>()
  .domain([0, maxAffected*0.1, maxAffected*0.2, maxAffected*0.6, maxAffected*0.7, maxAffected,])
  .range([
    "#C5FCEE",
    "#61BCA9",
    "#268675",
    "#177A76",
    "#166D74",
    "#20616E",
  ]);

  const assignColorCommunity = (comunidad: string, data) => {
    const entry = data.find((item) => item.name === comunidad);
  
    return entry ? color(entry.value) : color(0);
  };
  
  const calculateBasedOnAffectedCases = (comunidad: string, data: any[]) => {
    const entry = data.find((item) => item.name === comunidad);
    var max = data[0].value;
    for (var i = 0; i < data.length; i++) {
      if (max < data[i].value) {
        max = data[i].value;
      }
    }
    return entry ? (entry.value / max) * 50: 0;
  };
  
  const calculateRadiusBasedOnAffectedCases = (
    comunidad: string,
    data: any[]
  ) => {
    return calculateBasedOnAffectedCases(comunidad, data);
  };
  
  svg.selectAll("path").remove();
  svg
    .selectAll("path")
    .data(geojson["features"])
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", geoPath as any)
    .style("fill", function (d: any){
      return assignColorCommunity(d.properties.NAME_1, data)
    });

  svg.selectAll("circle").remove();
  svg
    .selectAll("circle")
    .data(latLongCommunities)
    .enter()
    .append("circle")
    .attr("class", "affected-marker")
    .attr("r", (d) => calculateRadiusBasedOnAffectedCases(d.name, data))
    .attr("cx", (d) => aProjection([d.long, d.lat])[0])
    .attr("cy", (d) => aProjection([d.long, d.lat])[1]);
};

document
  .getElementById("Previous")
  .addEventListener("click", function handleResultsApril() {
    updateChart(stats_0);
  });

document
  .getElementById("Actual")
  .addEventListener("click", function handleResultsNovember() {
    updateChart(stats_1);
  });

