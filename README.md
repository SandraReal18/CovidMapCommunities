# data-visualization-covid19-map (V2)

### GOALS
- Set a color scale for the number of cases.
- Set a color for each community depending of it's number of cases using the color scale.

Our starting point will be from the following repository. https://github.com/SandraReal18/CovidMap

### STEPS
First we build the map of Spain.
```typescript
const aProjection = d3Composite
  .geoConicConformalSpain()
  .scale(3300)
  .translate([500, 400]);

const geoPath = d3.geoPath().projection(aProjection);

const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);
```
Create the map:
```typescipt
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
```
Now we have created within update chart some functions that we need.
- We have created two helper function _calculateMaxAffected_ , _calculateBasedOnAffectedCases_ and _calcalculateRadiusBasedOnAffectedCases_. Where the maximum affected is calculated, a radius scale is created for the radius of each circumference of the community according to the number of cases in the most affected community, which depends on the number of affected. (index.ts)
```tyoescript
const calculateMaxAffected = (data) => {
    return data.reduce(
      (max, item) => (item.value > max ? item.value : max),
      0
    );
  };
  const maxAffected = calculateMaxAffected(data);
  
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
```
- To assign each community a color depending on the number of cases we have had to create a color scale with the help of the maximum in addition to the function (my colleagues Fran Valero and Carlos Sanchez helped me in this part)
```typescript
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
```

- To update the graph when the buttons are clicked
```typescript
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
```
- To implement the buttons, we first added in the _index.ts_
```typescript
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
```

- Then we had to add the following in _index.html_:
```typescript
<body>
    <button id="Previous">Resultados anteriores</button>
    <button id="Actual">Resultados Actuales</button>
    <script src="./index.ts"></script>
</body>
```
### INSTRUCTIONS TO START IT

In order to start it we have to install npm:
 -  _npm install_
We install the package to be able to work with maps, the library that contains this projections and the node typings to get require typing
 -  _npm install @types/topojson-client --save-dev_ 
 -  _npm install d3-composite-projections --save_ 
 -  _npm install @types/node --save-dev_ 
      

 #### Once these installations are done to start we have to execute the _npm start_ command and access the localhost to be able to view the results.
