//@ts-nocheck
import * as d3 from 'd3';

const DATA_FOLDER = "data/networks";

const DEFAULT_NETWORK = "road_vocation_data";
const DEFAULT_TYPE = "vocation";

const CONTAINER = "network_graph";
const PARENT_ID = "network_chart";

const WIDHT = 800;
const HEIGHT = 800;

class Network {
    private svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private simulation!: d3.Simulation<{}, undefined>;
    private data!: any[];
    private container!: d3.Selection<HTMLElement, unknown, HTMLElement, any>;
    private drag_active = false; // Drag behaviour, to skip mouseover events while dragging
    private type = DEFAULT_TYPE;
    private linkedById!: any;

    private links!: d3.Selection<SVGLineElement, { source: string; target: string; weight: number; }, SVGGElement, unknown>;
    private nodes!: d3.Selection<SVGCircleElement, { id: string; label: string; size: number; type: string; }, SVGGElement, unknown>;
    private gnodes!: d3.Selection<SVGGElement, { id: string; label: string; size: number; type: string; }, SVGGElement, unknown>;
    private labels!: d3.Selection<SVGTextElement, { id: string; label: string; size: number; type: string; }, SVGGElement, unknown>;
    private clickCircle!: d3.Selection<SVGCircleElement, { id: string; label: string; size: number; type: string; }, SVGGElement, unknown>;

    constructor(                     // Name of the first type in the bipartite graph
        expNodeSizeScale = 0.7,      // Exponent for scaling object sizes
        expLinkWeightScale = 0.7,    // Exponent for scaling link weights
        transparency = 0.1,             // Transparency of non-selected nodes and links
        minNodeSize = 7,              // Minimum size of a node
        maxNodeSize = 40,             // Maximum size of a node
        minLinkWeight = 1,            // Minimum weight of a link
        maxLinkWeight = 8,            // Maximum weight of a link
        labelSizeAdd = 5,             // Additional size of label
        nodeSizeInc = 5,              // Increment of node size when hovering
        labelSizeInc = 5,             // Increment of label size when hovering
        chargeStrength = -700,         // Strength of the charge force
        collideSizeAdd = 2,           // Additional size of collision force
        transitionDuration = 200,      // Duration of transitions
    ) {
        this.expNodeSizeScale = expNodeSizeScale;
        this.expLinkWeightScale = expLinkWeightScale;
        this.transparency = transparency;
        this.minNodeSize = minNodeSize;
        this.maxNodeSize = maxNodeSize;
        this.minLinkWeight = minLinkWeight;
        this.maxLinkWeight = maxLinkWeight;
        this.labelSizeAdd = labelSizeAdd;
        this.nodeSizeInc = nodeSizeInc;
        this.labelSizeInc = labelSizeInc;
        this.chargeStrength = chargeStrength;
        this.collideSizeAdd = collideSizeAdd;
        this.transitionDuration = transitionDuration;

        this.initDimensions();
        this.initStaticElements();
        this.initPlot();
    }

    private async loadData(network: string): Promise<void> {
        const dataPath = `${DATA_FOLDER}/${network}.json`;

        return new Promise((resolve, reject) => {
            d3.json(dataPath).then((data: any) => {
                resolve(data);
            });
        });
    }

    private initDimensions(): void {
        // Define the container and get its size
        this.container = d3.select(CONTAINER);
        const parentElement = document.getElementById(PARENT_ID);
        if (parentElement) {
            this.width = parentElement.clientWidth;
            this.height = parentElement.clientHeight / 2;
        }
    }

    private initStaticElements(): void {
        // Create the SVG
        this.svg = this.container
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        // Create the simulation
        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function (d) { return d.id; }))
            .force("charge", d3.forceManyBody().strength(this.chargeStrength))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .force("collide", d3.forceCollide().radius((d) => { return d.size + this.collideSizeAdd; }));
    }
    /**
     * Map a node size to the given range
     * @param {int} size 
     * @returns 
     */
    private get_scaled_size(size: int, min_unscaled_size, max_unscaled_size, min_size, max_size) {
        if (max_unscaled_size - min_unscaled_size == 0) {
            return (min_size + max_size) / 2;
        }

        return min_size + (size - min_unscaled_size) * (max_size - min_size) / (max_unscaled_size - min_unscaled_size);
    }

    /**
     * 
     * @param {string} a: ID of node a 
     * @param {string} b: ID of node b
     * @returns {boolean} True if a and b are connected, false otherwise
     */
    private isConnected(a: string, b: string): boolean {
        return this.linkedById[a].indexOf(b) > -1 || this.linkedById[b].indexOf(a) > -1 || a == b;
    }

    /**
     * The drag simulation.
     */
    private drag(simulation) {
        const dragstarted = (event) =>  {
            this.drag_active = true;
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        const dragged = (event) => {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        const dragended = (event) => {
            this.drag_active = false;
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }

    /**
     * Update node and link positions at every step of the force simulation.
     */
    private ticked() {
        this.link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        this.node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        this.clickCircle
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        this.labels
            .attr("x", d => d.x + 10)
            .attr("y", d => d.y + 4)
            .attr("dx", -9)
            .attr("dy", "-.15em");
    }

    private initData(): void {
        this.data.forEach(d => {
            // Update each node's size to the scaled size
            let max_unscaled_node_size = data.nodes.reduce((max, node) => Math.max(max, node.size), 0);
            let min_unscaled_node_size = data.nodes.reduce((min, node) => Math.min(min, node.size), Infinity);
            max_unscaled_node_size = Math.pow(max_unscaled_node_size, exp_node_size_scale);
            min_unscaled_node_size = Math.pow(min_unscaled_node_size, exp_node_size_scale);

            d.nodes.forEach(node => node.size = get_scaled_size(Math.pow(node.size, exp_node_size_scale), min_unscaled_node_size, max_unscaled_node_size, min_node_size, max_node_size));

            // Update each link's weight to the scaled weight
            let max_unscaled_link_weight = data.links.reduce((max, link) => Math.max(max, link.weight), 0);
            let min_unscaled_link_weight = data.links.reduce((min, link) => Math.min(min, link.weight), Infinity);
            max_unscaled_link_weight = Math.pow(max_unscaled_link_weight, exp_link_weight_scale);
            min_unscaled_link_weight = Math.pow(min_unscaled_link_weight, exp_link_weight_scale);

            d.links.forEach(link => link.weight = get_scaled_size(Math.pow(link.weight, exp_link_weight_scale), min_unscaled_link_weight, max_unscaled_link_weight, min_link_weight, max_link_weight));

            // Create linked list of nodes and isConnected function
            this.linkedById = {};
            d.links.forEach((dt) => {
                this.linkedById[dt.source] = []
                this.linkedById[dt.target] = []
            });
            d.links.forEach((dt) => {
                this.linkedById[dt.source].push(dt.target);
                this.linkedById[dt.target].push(dt.source);
            });
        });
    }

    private createLinks(): void {
        // Create links
        this.link = this.svg.append("g")
            .attr("stroke", "#BBB")
            .attr("stroke-opacity", 1.0)
            .selectAll("line")
            .data(this.data.links)
            .enter().append("line")
            .attr("stroke-width", function (d) { return d.weight; });
    }

    private createNodes(): void {
        // Create nodes
        this.gnodes = this.svg.selectAll("g.gnode")
            .data(data.nodes)
            .enter()
            .append("g")
            .classed("gnode", true);

        // Create visible nodes
        this.node = this.gnodes.append("circle")
            .attr("class", "node")
            .attr("r", function (d) { return d.size; })
            .attr("fill", (d) => { return d.type == this.typeName ? "#FF3333" : "#29A329"; });
    }

    private createLabels(): void {
        // Create text labels
        this.labels = this.gnodes.append("text")
            .text(function (d) { return d.label; })
            .attr("font-size", (d) => { return d.size + this.labelSizeAdd; })
            .attr("font-family", "sans-serif")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle");
    }

    private initClickCircle(): void {
        // Create circular zones around nodes to detect mouseover
        this.clickCircle = this.gnodes.append("circle")
            .attr("class", "node")
            .attr("r", function (d) { return d.size; })
            .attr("fill", "transparent")
            .call(drag(this.simulation))
            .on("mouseover", (that, d) => {
                if (this.drag_active) {
                    return;
                }

                // Get the ID of the hovered node
                const d_node = d3.select(that).node().__data__;
                const hoveredNodeId = d_node.id;

                // Not hovered node less opaque
                this.node
                    .transition()
                    .duration(200)
                    .attr("fill-opacity", (o) => {
                        const d_node = d3.select(o).node().__data__;
                        return isConnected(hoveredNodeId, o.id) || o.id == hoveredNodeId ? 1 : this.transparency;
                    })
                    .attr("r", (o) => {
                        if (o.id == hoveredNodeId) {
                            return o.size + this.nodeSizeInc;
                        }
                        // give the link weight as size to the hovered node
                        if (isConnected(hoveredNodeId, o.id)) {
                            let link_weight = data.links.find(link => (link.source.id == o.id && link.target.id == hoveredNodeId) || (link.source.id == hoveredNodeId && link.target.id == o.id)).weight;
                            const connected_nodes = this.linkedById[hoveredNodeId];
                            const connected_links = this.data.links.filter(link => (link.source.id == hoveredNodeId || link.target.id == hoveredNodeId));
                            const min_connected_link_weight = connected_links.reduce((min, link) => Math.min(min, link.weight), Infinity);
                            const max_connected_link_weight = connected_links.reduce((max, link) => Math.max(max, link.weight), -Infinity);
                            const scaled_link_weight = this.get_scaled_size(link_weight, min_connected_link_weight, max_connected_link_weight, min_node_size, max_node_size);
                            return scaled_link_weight;
                        }
                        return o.size;
                    });

                // Not hovered link less opaque
                link
                    .transition()
                    .duration(200)
                    .attr("stroke-opacity", (o) => {
                        return o.source.id == hoveredNodeId || o.target.id == hoveredNodeId ? 1 : this.transparency;
                    });

                // Opaque selected nodes and neighbours only
                this.labels
                    .transition()
                    .duration(200)
                    .attr("fill-opacity", (o) => {
                        return this.isConnected(hoveredNodeId, o.id) || o.id == hoveredNodeId ? 1 : this.transparency;
                    })
                    .attr("font-size", (o) => {
                        if (o.id == hoveredNodeId) {
                            return o.size + this.labelSizeInc + this.labelSizeAdd;
                        }
                        if (this.isConnected(hoveredNodeId, o.id)) {
                            let link_weight = this.data.links.find(link => (link.source.id == o.id && link.target.id == hoveredNodeId) || (link.source.id == hoveredNodeId && link.target.id == o.id)).weight;
                            const connected_nodes = this.linkedById[hoveredNodeId];
                            const connected_links = this.data.links.filter(link => (link.source.id == hoveredNodeId || link.target.id == hoveredNodeId));
                            const min_connected_link_weight = connected_links.reduce((min, link) => Math.min(min, link.weight), Infinity);
                            const max_connected_link_weight = connected_links.reduce((max, link) => Math.max(max, link.weight), -Infinity);
                            const scaled_link_weight = this.get_scaled_size(link_weight, min_connected_link_weight, max_connected_link_weight, this.minNodeSize, this.maxNodeSize);
                            return scaled_link_weight + this.labelSizeAdd;
                        }
                        return o.size + this.labelSizeAdd;
                    });
            })
            .on("mouseout", (d) => {
                if (this.drag_active) {
                    return;
                }

                // Reset opacity and sizes
                this.node.transition()
                    .duration(this.transitionDuration)
                    .attr("fill-opacity", 1)
                    .attr("r", function (d) { return d.size; });
                this.link.transition()
                    .duration(this.transitionDuration)
                    .attr("stroke-opacity", 1);
                this.labels.transition()
                    .duration(this.transitionDuration)
                    .attr("fill-opacity", 1)
                    .attr("font-size", (d) => { return d.size + this.labelSizeAdd; });
            });
    }

    private initZoom(): void {
        // Zoom
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", ({ transform }) => {
                link.attr("transform", transform);
                node.attr("transform", transform);
                labels.attr("transform", transform);
                clickCircle.attr("transform", transform);
            });

        this.svg.call(zoom);
    }

    private initSimulation(): void {
        // Run simulation
        this.simulation
            .nodes(this.data.nodes)
            .on("tick", this.ticked);

        this.simulation.force("link")
            .links(this.data.links);
    }

    private initPlot(): void {
        this.loadData(DEFAULT_NETWORK).then((data: any) => {
            this.data = data;

            this.initData();
            this.createLinks();
            this.createNodes();
            this.createLabels();
            this.initClickCircle();
            this.initZoom();
            this.initSimulation();
        });
    }
}

// run when page is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("Loading networks...");
    new Network();
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
});