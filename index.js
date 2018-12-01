const deps = require('./jellyfish-deps.json')

let active = null

let graph = {
  nodes: [],
  links: []
}

graph.nodes = Object.keys(deps.files).map(x => {
  return { id: x, group: 1 }
})

const internals = []

for (const file in deps.files) {
  if (deps.files[file].dependencies.length) {
    for (const dep of deps.files[file].dependencies) {
      const target = dep.realpath

      const type = target.indexOf('node_modules') === 0 ? 'module' :
        dep.type === 'internal' ? 'internal' : 'local'

      if (type === 'internal' && internals.indexOf(target) === -1) {
        console.log('ADDING INTERNAL TYPE', { target })
        graph.nodes.push({
          id: target,
          group: 1
        })
        internals.push(target)
      }

      for (const node of graph.nodes) {
        if (node.id === target) {
          node.type = type
          break
        }
      }

      graph.links.push({
        source: file,
        target,
        value: type === 'module' ? 2 : 1
      })
    }
  }
}

// graph.links = graph.links.slice(0, graph.links.length / 2)

console.log(graph)

var canvas = document.querySelector("canvas"),
    context = canvas.getContext("2d"),
    width = canvas.width,
    height = canvas.height;

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

simulation
    .nodes(graph.nodes)
    .on("tick", ticked);

simulation.force("link")
    .links(graph.links);

d3.select(canvas)
    .call(d3.drag()
        .container(canvas)
        .subject(dragsubject)
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

function ticked() {
  context.clearRect(0, 0, width, height);

  context.beginPath();
  graph.links.forEach(drawLink);
  context.strokeStyle = "#aaa";
  context.stroke();

  graph.nodes.forEach(drawNode);

  if (active) {
    context.fillStyle = 'black'
    context.font = '14px monospace';
    context.fillText(active.id, active.x + 5, active.y + 2);
  }
}

function dragsubject() {
  return simulation.find(d3.event.x, d3.event.y);
}

function dragstarted() {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d3.event.subject.fx = d3.event.subject.x;
  d3.event.subject.fy = d3.event.subject.y;

  active = d3.event.subject
}

function dragged() {
  d3.event.subject.fx = d3.event.x;
  d3.event.subject.fy = d3.event.y;
}

function dragended() {
  if (!d3.event.active) simulation.alphaTarget(0);
  d3.event.subject.fx = null;
  d3.event.subject.fy = null;

  active = null
}

function drawLink(d) {
  context.moveTo(d.source.x, d.source.y);
  context.lineTo(d.target.x, d.target.y);
}

function drawNode(d) {
  const color = d.type === 'local' ? "limegreen" : "purple";
  context.beginPath();
  context.moveTo(d.x + 3, d.y);
  context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
  context.fillStyle = color
  context.fill();
  context.strokeStyle = color
  context.stroke();
}

