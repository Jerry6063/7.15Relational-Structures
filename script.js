// script.js — 完全还原 Observable 中 mobile-patent-suits 图（包含弯曲箭头）

const width = 960;
const height = 600;

const color = d3.scaleOrdinal()
  .domain(["licensing", "suit", "resolved"])
  .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

const svg = d3.select("svg")
  .attr("width", width)
  .attr("height", height);

svg.append("defs").selectAll("marker")
  .data(color.domain())
  .join("marker")
  .attr("id", d => `arrow-${d}`)
  .attr("viewBox", "0 -5 10 10")
  .attr("refX", 15)
  .attr("refY", 0)
  .attr("markerWidth", 6)
  .attr("markerHeight", 6)
  .attr("orient", "auto")
  .append("path")
  .attr("fill", color)
  .attr("d", "M0,-5L10,0L0,5");

Promise.all([
  d3.json("symbiosis-nodes.json"),
  d3.json("symbiosis-links.json")
]).then(([nodes, links]) => {

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const link = svg.append("g")
    .attr("fill", "none")
    .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(links)
    .join("path")
    .attr("stroke", d => color(d.type))
    .attr("marker-end", d => `url(#arrow-${d.type})`);

  const node = svg.append("g")
    .attr("fill", "currentColor")
    .attr("stroke", "white")
    .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .join("circle")
    .attr("r", 4.5)
    .call(drag(simulation));

  const text = svg.append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .attr("x", 8)
    .attr("y", "0.31em")
    .text(d => d.id)
    .attr("font-size", 10)
    .attr("fill", "#333");

  simulation.on("tick", () => {
    link.attr("d", d => {
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
      return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
    });

    node.attr("cx", d => d.x).attr("cy", d => d.y);
    text.attr("x", d => d.x + 6).attr("y", d => d.y);
  });

  function drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  const legend = svg.append("g")
    .attr("transform", `translate(20,20)`);

  const types = color.domain();

  types.forEach((type, i) => {
    const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
    g.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", color(type));
    g.append("text")
      .attr("x", 18)
      .attr("y", 6)
      .attr("dy", "0.35em")
      .text(type);
  });
});
