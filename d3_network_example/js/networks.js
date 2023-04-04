function load_network(
    container_selector, 
    data_file,
    type_name,                      // Name of the first type in the bipartite graph
    exp_node_size_scale = 0.7,      // Exponent for scaling object sizes
    exp_link_weight_scale = 0.7,    // Exponent for scaling link weights
    transparency = 0.1,             // Transparency of non-selected nodes and links
    min_node_size = 7,              // Minimum size of a node
    max_node_size = 40,             // Maximum size of a node
    min_link_weight = 1,            // Minimum weight of a link
    max_link_weight = 8,            // Maximum weight of a link
    label_size_add = 5,             // Additional size of label
    node_size_inc = 5,              // Increment of node size when hovering
    label_size_inc = 5,             // Increment of label size when hovering
    charge_strength = -700,         // Strength of the charge force
    collide_size_add = 2,           // Additional size of collision force
    transition_duration = 200,      // Duration of transitions
    ) {
    d3.json(data_file).then(function(data) {
        // Define the container and get its size
        var container = d3.select(container_selector);
        var width = container.node().getBoundingClientRect().width;
        var height = container.node().getBoundingClientRect().height;

        let drag_active = false; // Drag behaviour, to skip mouseover events while dragging

        /**
         * Map a node size to the given range
         * @param {int} size 
         * @returns 
         */
        function get_scaled_size(size, min_unscaled_size, max_unscaled_size, min_size, max_size) {
            if (max_unscaled_size - min_unscaled_size == 0) {
                return (min_size + max_size) / 2;
            }

            return min_size + (size - min_unscaled_size) * (max_size - min_size) / (max_unscaled_size - min_unscaled_size);
        }

        // Update each node's size to the scaled size
        let max_unscaled_node_size = data.nodes.reduce((max, node) => Math.max(max, node.size), 0);
        let min_unscaled_node_size = data.nodes.reduce((min, node) => Math.min(min, node.size), Infinity);
        max_unscaled_node_size = Math.pow(max_unscaled_node_size, exp_node_size_scale);
        min_unscaled_node_size = Math.pow(min_unscaled_node_size, exp_node_size_scale);

        data.nodes.forEach(node => node.size = get_scaled_size(Math.pow(node.size, exp_node_size_scale), min_unscaled_node_size, max_unscaled_node_size, min_node_size, max_node_size));

        // Update each link's weight to the scaled weight
        let max_unscaled_link_weight = data.links.reduce((max, link) => Math.max(max, link.weight), 0);
        let min_unscaled_link_weight = data.links.reduce((min, link) => Math.min(min, link.weight), Infinity);
        max_unscaled_link_weight = Math.pow(max_unscaled_link_weight, exp_link_weight_scale);
        min_unscaled_link_weight = Math.pow(min_unscaled_link_weight, exp_link_weight_scale);

        data.links.forEach(link => link.weight = get_scaled_size(Math.pow(link.weight, exp_link_weight_scale), min_unscaled_link_weight, max_unscaled_link_weight, min_link_weight, max_link_weight));

        // Create linked list of nodes and isConnected function
        const linkedById = {};
        data.links.forEach(function(d) {
            linkedById[d.source] = []
            linkedById[d.target] = []
        });
        data.links.forEach(function(d) {
            linkedById[d.source].push(d.target);
            linkedById[d.target].push(d.source);
        });

        /**
         * 
         * @param {string} a: ID of node a 
         * @param {string} b: ID of node b
         * @returns {boolean} True if a and b are connected, false otherwise
         */
        function isConnected(a, b) {
            return linkedById[a].indexOf(b) > -1 || linkedById[b].indexOf(a) > -1 || a == b;
        }



        // Create the simulation
        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody().strength(charge_strength))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(function(d) { return d.size + collide_size_add; }));

        // Create the SVG
        let svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        // Create links
        var link = svg.append("g")
            .attr("stroke", "#BBB")
            .attr("stroke-opacity", 1.0)
            .selectAll("line")
            .data(data.links)
            .enter().append("line")
            .attr("stroke-width", function(d) { return d.weight; });

        // Create nodes
        var gnodes = svg.selectAll("g.gnode")
            .data(data.nodes)
            .enter()
            .append("g")
            .classed("gnode", true);

        // Create visible nodes
        var node = gnodes.append("circle")
            .attr("class", "node")
            .attr("r", function(d) { return d.size; })
            .attr("fill", function(d) { return d.type == type_name ? "#FF3333" : "#29A329"; });

        // Create text labels
        var labels = gnodes.append("text")
            .text(function(d) { return d.label; })
            .attr("font-size", function(d) { return d.size + label_size_add; })
            .attr("font-family", "sans-serif")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle");

        // Create circular zones around nodes to detect mouseover
        var clickCircle = gnodes.append("circle")
            .attr("class", "node")
            .attr("r", function(d) { return d.size; })
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
                        if (o.id == hoveredNodeId) {
                            return o.size + node_size_inc;
                        }	
                        // give the link weight as size to the hovered node
                        if (isConnected(hoveredNodeId, o.id)) {
                            let link_weight = data.links.find(link => (link.source.id == o.id && link.target.id == hoveredNodeId) || (link.source.id == hoveredNodeId && link.target.id == o.id)).weight;
                            const connected_nodes = linkedById[hoveredNodeId];
                            const connected_links = data.links.filter(link => (link.source.id == hoveredNodeId || link.target.id == hoveredNodeId));
                            const min_connected_link_weight = connected_links.reduce((min, link) => Math.min(min, link.weight), Infinity);
                            const max_connected_link_weight = connected_links.reduce((max, link) => Math.max(max, link.weight), -Infinity);
                            const scaled_link_weight = get_scaled_size(link_weight, min_connected_link_weight, max_connected_link_weight, min_node_size, max_node_size);
                            return scaled_link_weight;
                        }
                        return o.size;
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
                        if (o.id == hoveredNodeId) {
                            return o.size + label_size_inc + label_size_add;
                        }	
                        if (isConnected(hoveredNodeId, o.id)) {
                            let link_weight = data.links.find(link => (link.source.id == o.id && link.target.id == hoveredNodeId) || (link.source.id == hoveredNodeId && link.target.id == o.id)).weight;
                            const connected_nodes = linkedById[hoveredNodeId];
                            const connected_links = data.links.filter(link => (link.source.id == hoveredNodeId || link.target.id == hoveredNodeId));
                            const min_connected_link_weight = connected_links.reduce((min, link) => Math.min(min, link.weight), Infinity);
                            const max_connected_link_weight = connected_links.reduce((max, link) => Math.max(max, link.weight), -Infinity);
                            const scaled_link_weight = get_scaled_size(link_weight, min_connected_link_weight, max_connected_link_weight, min_node_size, max_node_size);
                            return scaled_link_weight + label_size_add;
                        }
                        return o.size + label_size_add
                    });
            })
            .on("mouseout", function(d) {
                if (drag_active) {
                    return;
                }

                // Reset opacity and sizes
                node.transition()
                    .duration(transition_duration)
                    .attr("fill-opacity", 1)
                    .attr("r", function(d) { return d.size; });
                link.transition()
                    .duration(transition_duration)
                    .attr("stroke-opacity", 1);
                labels.transition()
                    .duration(transition_duration)
                    .attr("fill-opacity", 1)
                    .attr("font-size", function(d) { return d.size + label_size_add; });
            });

        // Zoom
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", ({transform}) => {
                link.attr("transform", transform);
                node.attr("transform", transform);
                labels.attr("transform", transform);
                clickCircle.attr("transform", transform);
            });

            svg.call(zoom);

            
        // Run simulation
        simulation
            .nodes(data.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(data.links);



        /**
          * Update node and link positions at every step of the force simulation.
          */
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
                .attr("dy", "-.15em");
        }

        /**
         * The drag simulation.
         */
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
    console.log("Loading networks...");
    load_network("#road_vocation_data", "/data/networks/road_vocation_data.json", "vocation");
    load_network("#bipartite_division_type_metiers", "/data/networks/bipartite_division_type_metiers.json", "division");
    load_network("#bipartite_origine_category_type_metiers", "/data/networks/bipartite_origine_category_type_metiers.json", "origine_category");
    load_network("#bipartite_street_type_metiers", "/data/networks/bipartite_street_type_metiers.json", "street");
    console.log("Networks loaded.");

    // get references to the select element and network divs
    const selector = document.getElementById('graph-selector');
    const networks = document.querySelectorAll('.network');

    // hide all networks except the initially selected one
    const selectedNetwork = document.getElementById(selector.value);
    networks.forEach(network => {
        if (network !== selectedNetwork) {
            network.style.visibility = 'hidden';
        } else {
            network.style.visibility = 'visible';
        }
    });

    // listen for changes in the select element and show the corresponding network
    selector.addEventListener('change', (event) => {
        const selectedNetwork = document.getElementById(event.target.value);
        networks.forEach(network => {
            if (network === selectedNetwork) {
                network.style.visibility = 'visible';
            } else {
                network.style.visibility = 'hidden';
            }
        });
    });
}