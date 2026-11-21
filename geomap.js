Promise.all([
  d3.json("./topo.json"),
  d3.csv("./cities.csv"),
  d3.csv("./states.csv")
]).then((data) => {
  const topology = data[0];
  const cities = data[1];
  const states = data[2];
  console.log(topology, cities, states);

  const topo = topojson.feature(topology, topology.objects.states);

  const stateDictionary = new Map();
  states.forEach((state) => {
    stateDictionary.set(state.State, +state["2018 Population"]);
  });
  console.log(stateDictionary);

  var blues = d3.scaleSequential()
    .domain(d3.extent(stateDictionary.values()))
    .range(["white", "steelblue"]);

  var projection = d3.geoAlbersUsa().scale(700).translate([487.5, 305]);
  var path = d3.geoPath(projection);

  const svg = d3.select("#geomap").append("g").attr("transform", "translate(50,50)");

  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .join("path")
    .attr("d", path)
    .attr("fill", (d) => {
      const pop = stateDictionary.get(d.properties.name);
      return pop ? blues(pop) : "whitesmoke";
    })
    .attr("stroke", "black")
    .attr("stroke-width", "1px");

  svg.append("g")
    .selectAll("circle")
    .data(cities)
    .join("circle")
    .attr("cx", (d) => {
      const p = projection([+d.longitude, +d.latitude]);
      return p ? p[0] : null;
    })
    .attr("cy", (d) => {
      const p = projection([+d.longitude, +d.latitude]);
      return p ? p[1] : null;
    })
    .attr("r", 4)
    .attr("fill", "crimson")
    .attr("stroke", "black")
    .attr("opacity", 0.8);
});