function load_network(
    container_selector, 
    data_file
    ) {
    d3.json(data_file).then(function(data) {
        // Define the container and get its size
        var container = d3.select(container_selector);
        var width = container.node().getBoundingClientRect().width;
        var height = container.node().getBoundingClientRect().height;

        var drag_active = false; // Drag behaviour, to skip mouseover events while dragging
        var exp_size_scale = 0.7 // Exponent for scaling object sizes
        var transparency = 0.1 // Transparency of non-selected nodes and links
        var add_size = 7 // Add this to the size of the selected node

        // Create the SVG
        var svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        // Create linked list of nodes and isConnected function
        const linkedById = {};
        data.links.forEach(function(d) {
            linkedById[d.source + "," + d.target] = 1;
        });

        /**
         * 
         * @param {string} a: ID of node a 
         * @param {string} b: ID of node b
         * @returns {boolean} True if a and b are connected, false otherwise
         */
        function isConnected(a, b) {
            return linkedById[a + "," + b] || linkedById[b + "," + a];
        }

        // Create the simulation
        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody().strength(-700))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(function(d) { return 10 + Math.pow(d.size, exp_size_scale); }))
            .on("tick", ticked);

        var link = svg.append("g")
            .attr("stroke", "#BBB")
            .attr("stroke-opacity", 1.0)
            .selectAll("line")
            .data(data.links)
            .enter().append("line")
            .attr("stroke-width", function(d) { return Math.pow(d.weight, exp_size_scale); });

        var gnodes = svg.selectAll("g.gnode")
            .data(data.nodes)
            .enter()
            .append("g")
            .classed("gnode", true);

        // Visible node
        var node = gnodes.append("circle")
            .attr("class", "node")
            .attr("r", function(d) { return 3 + Math.pow(d.size, exp_size_scale); })
            .attr("fill", function(d) { return d.type == "vocation" ? "#FF3333" : "#29A329"; });

        // Text label
        var labels = gnodes.append("text")
            .text(function(d) { return d.id; })
            .attr("font-size", function(d) { return 10 + Math.pow(d.size, Math.max(0.1, exp_size_scale - 0.1)); })
            .attr("font-family", "sans-serif")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle");

        // Circle on top of text to make it easier to click
        var clickCircle = gnodes.append("circle")
            .attr("class", "node")
            .attr("r", function(d) { return 10 + Math.pow(d.size, exp_size_scale); })
            .attr("fill", "transparent")
            .call(drag(simulation))
            .on("mouseover", function(d) {
                if (drag_active) {
                    return;
                }

                // Get the ID of the hovered node
                const d_node = d3.select(this).node().__data__;
                const hoveredNodeId = d_node.id;

                // Not hovered node less opaque
                node
                    .transition()
                    .duration(200)
                    .attr("fill-opacity", function(o) {
                        const d_node = d3.select(o).node().__data__;
                        return isConnected(hoveredNodeId, o.id) || o.id == hoveredNodeId ? 1 : transparency;
                    })
                    .attr("r", function(o) {
                        return isConnected(hoveredNodeId, o.id) || o.id == hoveredNodeId ? add_size + 3 + Math.pow(o.size, exp_size_scale) : 3 + Math.pow(o.size, exp_size_scale);
                    });

                // Not hovered link less opaque
                link
                    .transition()
                    .duration(200)
                    .attr("stroke-opacity", function(o) {
                        return o.source.id == hoveredNodeId || o.target.id == hoveredNodeId ? 1 : transparency;
                    });

                // Opaque selected nodes and neighbours only
                labels
                    .transition()
                    .duration(200)
                    .attr("fill-opacity", function(o) {
                        return isConnected(hoveredNodeId, o.id) || o.id == hoveredNodeId ? 1 : transparency;
                    })
                    .attr("font-size", function(o) {
                        return isConnected(hoveredNodeId, o.id) || o.id == hoveredNodeId ? add_size + 10 + Math.pow(o.size, Math.max(0.1, exp_size_scale - 0.1)) : 10 + Math.pow(o.size, Math.max(0.1, exp_size_scale - 0.1));
                    });
            })
            .on("mouseout", function(d) {
                if (drag_active) {
                    return;
                }

                // Reset opacity and sizes
                node.transition()
                    .duration(200)
                    .attr("fill-opacity", 1)
                    .attr("r", function(d) { return 3 + Math.pow(d.size, exp_size_scale); });
                link.transition()
                    .duration(200)
                    .attr("stroke-opacity", 1);
                labels.transition()
                    .duration(200)
                    .attr("fill-opacity", 1)
                    .attr("font-size", function(d) { return 10 + Math.pow(d.size, Math.max(0.1, exp_size_scale - 0.1)); });
            });
            
        simulation
            .nodes(data.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(data.links);

        function ticked() {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
            
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            clickCircle
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            labels
                .attr("x", d => d.x + 10)
                .attr("y", d => d.y + 4)
                .attr("dx", -9)
                .attr("dy", "-0.15em");
        }

        function drag(simulation) {    
            function dragstarted(event) {
                drag_active = true;
            if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
            
            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
            
            function dragended(event) {
                drag_active = false;
            if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
            
            return d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended);
        }
    });
}

// run load_network() when page is loaded
window.onload = function() {
    console.log("Loading network...");
    //load_network("#network", "/data/networks/test_data.json");
    load_network("#network", "/data/networks/bipartite_chef_vocation/road_vocation_data.json");
    console.log("Network loaded.");
}