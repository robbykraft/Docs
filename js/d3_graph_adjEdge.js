var updateEdgesAdjacentToNode; // set these to functions to interact with DOM
var updateEdgesAdjacentToEdge;

window.document.addEventListener("DOMContentLoaded", () => {
  function fillGraph(graph, numVertices) {
    const numEdges = numVertices * 1.2;
    // graph.clear();
    graph.edges_vertices = Array.from(Array(numVertices)).map((_, i) => [i,
      (i + 1 + Math.floor(Math.random() * (numVertices - 1))) % numVertices
    ]);
    while (graph.edges_vertices.length < numEdges) {
      graph.edges_vertices.push([
        Math.floor(Math.random() * numVertices),
        Math.floor(Math.random() * numVertices)]);
      ear.graph.removeCircularEdges(graph);
      ear.graph.removeDuplicateEdges(graph);
    }
    ear.graph.populate(graph);
  }

  function didTouchNode02(index, circles, links) {
    let highlighted_id = [];
    let highlighted_indices = [];
    if (index != undefined) {
      // let adjacent = g02.getEdgesAdjacentToNode(index);
      // let adjacent = g02.vertices[index].edges;
      let adjacent = g02.vertices_edges[index];
      for (let i = 0; i < adjacent.length; i += 1) {
        let nameString = "link" + adjacent[i];
        highlighted_id.push(nameString);
        highlighted_indices.push("<arg>" + adjacent[i] + "</arg>");
      }
    }
    updateSelection("node" + index, circles, links, highlighted_id);
    if (updateEdgesAdjacentToNode != undefined) { updateEdgesAdjacentToNode(index, highlighted_indices); }
    if (updateEdgesAdjacentToEdge != undefined) { updateEdgesAdjacentToEdge(undefined); }
    return highlighted_id;
  }

  // we removed edges_edges from the traditional workflow
  function didTouchEdge02(index, circles, links) {
    return;
    // let highlighted_id = [];
    // let highlighted_indices = [];
    // if (index != undefined) {
    //   // let adjacent = g02.getEdgesAdjacentToEdge(index);
    //   let adjacent = g02.edges[index].edges;
    //   for (let i = 0; i < adjacent.length; i += 1) {
    //     let nameString = "link" + adjacent[i];
    //     highlighted_id.push(nameString);
    //     highlighted_indices.push("<arg>" + adjacent[i] + "</arg>");
    //   }
    // }
    // updateSelection("link" + index, circles, links, highlighted_id);
    // if (updateEdgesAdjacentToEdge != undefined){ updateEdgesAdjacentToEdge(index, highlighted_indices); }
    // if (updateEdgesAdjacentToNode != undefined){ updateEdgesAdjacentToNode(undefined); }
    // return highlighted_id;
  }

  function updateSelection(id, circles, links, highlighted_id) {
    for (let i = 0; i < circles.length; i += 1) {
      if (id == circles[i].id)                          circles[i].style.stroke = "#e53";
      else if (contains(circles[i].id, highlighted_id)) circles[i].style.stroke = "#37c";
      else                                             circles[i].style.stroke = "#000";
    }
    for (let i = 0; i < links.length; i += 1) {
      if (id == links[i].id)                          links[i].style.stroke = "#e53";
      else if (contains(links[i].id, highlighted_id)) links[i].style.stroke = "#37c";
      else                                           links[i].style.stroke = "#000";
    }
  }

  function contains(obj, list) {
    for (let i = 0; i < list.length; i += 1) {
      if (list[i] === obj) {
        return true;
      }
    }
    return false;
  }

  let g02 = {};
  fillGraph(g02, 7);

  let d3Graph02 = graphToD3(g02);
  let svgCanvas02 = d3.select("#svgTest02");
  makeForceDirectedGraph(d3Graph02, svgCanvas02, didTouchNode02, didTouchEdge02);
});
