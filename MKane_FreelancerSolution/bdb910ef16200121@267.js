// function _1(md){return(
// md`# Force-Directed Graph Demo

// This is a demo network of 17th century English Quakers from the [Programming Historian Python network lesson](https://programminghistorian.org/en/lessons/exploring-and-analyzing-network-data-with-python).  The [Colab notebook for the actual analysis is available here](https://colab.research.google.com/drive/18w9p4N3uvxQQtTXsZeOU87roPGdyHSuY?usp=sharing).

// There are many possible layouts for network graphs, but the most common one is a **force-directed** layout.  This uses math to simulate gravity by pushing some nodes away and pulling some nodes closer together, usually clustering together nodes that have more ties in common.  It has fewer separate pieces than a bar chart, but those pieces are individually a bit more complex.  

// This notebook is laid out the way most real notebooks are: some introductory text at the top, followed by the main visualization, and utilities like the data and d3 down at the bottom.  To get a feeling for how this works, try forkin this notebook and making some changes.  Remember that D3 uses CSS to add and modify the look of visualizations: can you use [hover](https://www.w3schools.com/cssref/sel_hover.asp) to get text labels to appear and disappear?  Right now the graph is colored by modularity class and nodes are sized by degree.  Can you color by gender or degree?  How would you resize by betweenness and handle the fact that some nodes have 0 betweenness?`
// )}

function _chart(data,d3,width,height,color,drag)
{
  const links = data.links.map(d => Object.create(d)); // read the data and use the links key to create links
  const nodes = data.nodes.map(d => Object.create(d)); // read the data and use the nodes key to create nodes

  const simulation = d3 // use d3 to simulate physical force
    .forceSimulation(nodes) // use the force simulation function from d3 to model how nodes interact
    .force("link", d3.forceLink(links).id(d => d.id)) // use the forceLink function to model how links interact
    .force("charge", d3.forceManyBody()) // use the ManyBody function to simulate gravity between nodes
    .force("center", d3.forceCenter(width / 2, height / 2)) // center the "gravitational pull" in the middle of the visualization
    .force("collision", d3.forceCollide(d => d.degree + 2)); // nodes can't collide with each other and have a 2 pixel pad

  const svg = d3 // use d3 to create the svg or scaleable vector graphics box to draw the chart on
    .create("svg") // make the svg
    .attr("height", height) // make the svg as tall as the height variable
    .attr("width", width); // make the svg as wide as Observable's default width

  const link = svg // draw the links on the svg
    .append("g") // make all the links html elements called g
    .attr("stroke", "#999") // define the color of the link lines
    .attr("stroke-opacity", 0.6) // define the opacity of the link lines
    .selectAll("line") // select all line objects
    .data(links) // use the links entries from the data to draw the lines
    .join("line") // adjust the lines when something moves, like if we drag a node or there's a collission
    .attr("stroke-width", d => Math.sqrt(d.value)); // make the links as wide as the square root of the value column (this is a good way to scale things if you have a wide range in values).

  const node = svg // draw the nodes on the svg
    .append("g") // make all nodes html elements called g
    .attr("stroke", "#fff") // define the default color of the nodes
    .attr("stroke-width", 1.5) // draw a stroke 1.5px wide around each node
    .selectAll("circle") // select all circle objects
    .data(nodes) // use the nodes entries in the data to draw the circles
    .join("circle") // adjust the nodes when something moves
    .attr("r", d => d.degree + 2) // draw each node as a circle with the radius of its degree value plus 2px
    .attr("fill", color) // use the color function defined below to assign a color to each modularity class
    .call(drag(simulation)); // use the drag function defined below to allow us to click and drag nodes.  This can be commented out if you don't want to use the drag function below

  const textElems = svg // add text labels to the nodes on the svg
    .append('g')
    .selectAll('text') // select all text elements
    .data(nodes) // use the nodes information to get the text
    .join('text') // adjust the labels when something moves
    .text(d => d.id) // use the id attribute of the nodes to write the labels
    .attr('font-size', 12) // give each label the css font-size attribute of 12 pixels
    .call(drag(simulation)); // use the drag function defined below to move the labels when nodes are dragged.  This can be commented out if you don't want to use the drag function below

  // this is a standard simulation function that is the same across basically all force directed network visualizations in d3.  It keeps the sources and targets of each interacting node pair linked even when the graph is moving around because of collisions or dragging.  I honestly just copy/paste the same simulation function across all my network graphs instead of rewriting it every time.

  // every time the graph changes due to dragging or movement generated by the layout, update the links, nodes, and text
  simulation.on("tick", () => {
    link // adjust the position of every link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node.attr("cx", d => d.x).attr("cy", d => d.y); // adjust the position of the nodes

    textElems // adjust the text labels
      .attr("x", d => d.x + 10) // draw the label 10px to the left of the center of the node
      .attr("y", d => d.y) // but draw it at the same height as the center of the node
      .attr("visibility", function(d) {
        // add the css visibility attribute to all text labels
        if (d.degree >= 10) {
          // if the degree value of the node is greater than or equal to 10
          return "visible"; // make its label visible using a css attribute
        } else {
          // if the degree of the node is smaller than 10
          return "hidden"; // make its label hidden using a css attribute
        }
      });
  });

  return svg.node(); // draw all the crap above
}


// function _3(md){return(
// md`## Get the data file

// This is the graph.json file we created in the colabs lesson.  Note that both nodes (individual people) and links (the relationships between them) are included in this file.  Expand the triangle carets to see what attributes this data includes--are there other attributes like gender or betweeness it would make sense to color or size our nodes by?  How would you handle sizing a node by betweenness if it had a betweenness of 0?  (Hint: you can do math in your sizing function to give all your nodes a minimum size.  Look at how nodes are sized by degree and given a minimum size of 2 in the chart above using d => d.degree + 2).`
// )}

function _data(FileAttachment){return(
FileAttachment("graph.json").json()
)}

// function _5(md){return(
// md`## Define height

// Does what it says and defines the height in pixels of our visualization.  We don't need to define the width on Observable because Observable makes all visualizations 100% width by default.`
// )}

function _height(){return(
600
)}

// function _7(md){return(
// md`## Define the color scale

// Below, we use d3 to define a categorical color scale like we did in the bar chart lesson, and then tell it [which color palette](https://github.com/d3/d3-scale-chromatic/blob/master/README.md#schemeCategory10) to use.  Try changing schemeCategory10 to a different categorical color palette from the link--remember that capitalization matters!

// After defining the color palette, we tell the function color to assign the color palette to the modularity categories and return those color values.  Try editing this to color by gender instead.

// What if you wanted to color your nodes by a numeric value like degree, birth_year, or betweenness?  Numeric scales don't often work well with categorical color schemes--is there a different kind of color scale at the link above that would work better for a continuous scale of numbers?`
// )}

function _color(d3)
{
  const scale = d3.scaleOrdinal(d3.schemeCategory10);
  return d => scale(d.modularity);
}


function _9(md){return(
md`## Handle dragging

Strictly speaking, you don't **need** a drag function to get the graph to work.  This whole section below could be commented out, as long as every reference to the drag function in the chart function above was also commented out.  This is a fairly standard drag function that doesn't change across force-directed graphs, so you don't need to change this; I usually just copy/paste the same function across all my network graphs.`
)}

function _drag(d3){return(
simulation => {
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

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}
)}

function _11(md){return(
md`### Include D3`
)}

function _d3(require){return(
require("d3@6")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["graph.json", {url: new URL("./files/5aa8a14267ce759730a0d8d2e83fe796c5c89d7349c3a00c2108e20289a9d09dfa98944f6c1fa534402beb567250949f97e4e37728a8d3c5f043244bd2d22b8f.json", import.meta.url), mimeType: "application/json", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  // main.variable(observer()).define(["md"], _1);
  main.variable(observer("chart")).define("chart", ["data","d3","width","height","color","drag"], _chart);
  // main.variable(observer()).define(["md"], _3);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  // main.variable(observer()).define(["md"], _5);
  main.variable(observer("height")).define("height", _height);
  // main.variable(observer()).define(["md"], _7);
  main.variable(observer("color")).define("color", ["d3"], _color);
  // main.variable(observer()).define(["md"], _9);
  main.variable(observer("drag")).define("drag", ["d3"], _drag);
  // main.variable(observer()).define(["md"], _11);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
