//@ts-nocheck
import * as d3 from 'd3';

const DATA_FOLDER = "data/networks";

const DEFAULT_NETWORK = "road_vocation_data";
const DEFAULT_TYPE = "vocation";

const CONTAINER_ID = "#network-graph";
const PARENT_ID = "network-chart";

const TITLE_ID = "#network-title";
const TEXT_ID = "#network-text";

const DEFAULT_LINK_COLOR = "#979487";
const DEFAULT_NODE_COLOR = "#aaaaaa";

const NODE_ID_TO_NAME = (id: string) => {
    const map = {
        "bourg": 'Bourg',
        "place_st_francois": 'Place St-François',
        "chailly": 'Chailly',
        "grange-neuve": 'Grange-Neuve',
        "grange_neuve": 'Grange-Neuve',
        "la_sallaz": 'La Sallaz',
        "ouchy": 'Ouchy',
        "barre": 'Barre',
        "cite_derriere": 'Cité Derrière',
        "cite_dessous": 'Cité Dessous',
        "cheneau_de_bourg": 'Cheneau-de-Bourg',
        "chenneau": 'Cheneau-de-Bourg',
        "montee_st_francois": 'Montée St-François',
        "rue_du_pont": 'Rue du Pré',
        "rue_du_pre": 'Rue du Pré',
        "ale": 'Ale',
        "grand_st_jean": 'Grand St-Jean',
        "montee_de_st_laurent": 'Montée de St-Laurent',
        "palud": 'Palud',
        "st_laurent": 'St-Laurent',
        "marterey": 'Marterey',
        "affaires_division": 'Affaires',
        "campagne_division": 'Campagne',
        "cathedrale_division": 'Cathédrale',
        "centre_division": 'Centre',
        "commerce_division": 'Commerce',
        "culture_division": 'Culture',
        "administration": 'Administration',
        "agricole": 'Agricole',
        "artisanat": 'Artisanat',
        "commerce": 'Commerce',
        "construction": 'Construction',
        "rente": 'Rente',
        "service": 'Service',
        "hors_lausanne": 'Hors Lausanne',
        "lausanne": 'Lausanne',
        "suisse_allemande": 'Suisse Allemande',
        "france": 'France',
        "grandson": 'Grandson',
        "aubonne": 'Aubonne',
        "morges": 'Morges',
        "nyon": 'Nyon',
        "pays_d_enhaut": 'Pays d\'Enhaut',
        "vaud": 'Vaud',
        "angleterre": 'Angleterre',
        "italie": 'Italie',
        "rolle": 'Rolle',
        "geneve": 'Genève',
        "orbe": 'Orbe',
        "vevey": 'Vevey',
        "la_vallee": 'La Vallée',
        "cossonay": 'Cossonay',
        "aigle": 'Aigle',
        "neuchatel": 'Neuchâtel',
        "payerne": 'Payerne',
        "yverdon": 'Yverdon',
        "echallens": 'Echallens',
        "fribourg": 'Fribourg',
        "avenches": 'Avenches',
        "moudon": 'Moudon',
        "oron": 'Oron',
        "lavaux": 'Lavaux',
    };

    return map[id] ?? id;
};

const DEFAULT_NODE_COLOR_BY_TYPE = {
    "road_vocation_data": {
        "street": "#289e61",
        "job": "#9e2846"
    },
    "bipartite_division_type_metiers": {
        "division": "#289e61",
        "job_category": "#9e2846"
    },
    "bipartite_origine_category_type_metiers": {
        "origine_category": "#289e61",
        "job_category": "#9e2846"
    },
    "bipartite_street_type_metiers": {
        "street": "#289e61",
        "job_category": "#9e2846"
    },
    "bipartite_rue_origines": {
        "street": "#289e61",
        "origine_category": "#9e2846"
    },
    "bipartite_divisions_origines": {
        "division": "#289e61",
        "origine_category": "#9e2846"
    },
}

const LOREM_IPSUM = `Lorem ipsum dolor sit amet. Et dolores quia et iste cupiditate sit nisi eligendi ab veritatis voluptatem ea omnis autem. Eos dolor modi eum adipisci facere ex dolores fugiat et laboriosam rerum rem nihil dolor. Et dolores iure ut odio voluptas ut nobis nemo.

Est quisquam totam sit illum rerum aut quia labore. Non voluptas libero sed adipisci quia aut voluptatem sint et nihil nihil ut ipsum voluptatem sit galisum reprehenderit.

Qui vero dolore et doloremque omnis ea error labore rem numquam cumque? Et totam alias et adipisci soluta ut excepturi error id quisquam quia sit voluptates voluptatum ut unde recusandae quo explicabo dolor. Qui temporibus consequuntur est alias quaerat vel culpa quia ut maxime ducimus sed esse assumenda a tempora culpa.`

const TEXT_MAP = {
    "road_vocation_data": {
        "title": "Vocations Voisines",
        "text": 'Ce premier graphe tisse un lien entre les vocations et les rues. Chaque métier est connecté à une rue, la taille de chaque nœud reflétant le nombre de personnes concernées. Les liens entre les rues et les métiers mettent en lumière des proximités intéressantes : par exemple, les rues de <i>Chavannes</i> et de <i>La Sallaz</i> se retrouvent proches dans notre graphe, illustrant la forte présence de paysans parmi leurs habitants, comme l\'indiquent les liens avec les nœuds \'laboureur\' et \'fermier\'. De plus, des rues géographiquement voisines comme <i>Rue Saint François</i> et <i>Place Saint François</i> se retrouvent également proches dans notre réseau, révélant une similarité dans la composition professionnelle de leurs résidents.'
    },
    "bipartite_division_type_metiers": {
        "title": "Métiers Mappés",
        "text": 'Ce graphe met en lumière les liens entre les divisions de la ville de Lausanne et les classes de métiers. Il offre une vue claire sur la répartition des professions à travers la ville. Par exemple, il est évident que la majorité des rentiers proviennent des divisions 17 et 1-2, qui correspondent respectivement à la campagne vers le sud de Lausanne et au quartier de Marterey et ses environs.',
    },
    "bipartite_origine_category_type_metiers": {
        "title": "Origines Occupées",
        "text": 'Cete visualization dévoile les interactions entre les classes d\'origine et les classes de vocations On observe une distribution plutôt homogène des métiers pour chaque origine. Par ailleurs, Yverdon se distingue par une plus grande concentration de constructeurs et d\'artisans. Le Lavaux, région connue pour son paysage viticole et agricole, présente une majorité de personnes engagées dans l\'agriculture.',
    },
    "bipartite_street_type_metiers": {
        "title": "Rues Révélées",
        "text": "Ce graphe lie les classes de métiers aux rues, offrant une perspective encore plus granulaire de la vie à Lausanne au XIX<sup>ème</sup> siècle. Certaines petites rues présentent une faible diversité de vocations, comme Vidy, Paleyres, et Petit Ouchy, où prédomine l'agriculture en périphérie de la ville.",
    },
    "bipartite_rue_origines": {
        "title": "Rues Racines",
        "text": "Cette nouvelle visualisation lie les rues de Lausanne à leurs classes d'origine, offrant une compréhension encore plus nuancée des dynamiques sociales de la ville. Chaque rue se voit attribuer un spectre d'origines, révélant la diversité et la complexité de la composition démographique de la ville. De cette manière, on peut mieux apprécier l'histoire multiculturelle de Lausanne, où chaque rue porte en elle les traces de nombreuses origines différentes, formant un patchwork unique de cultures et de traditions.",
    },
    "bipartite_divisions_origines": {
        "title": "Origines Organisées",
        "text": "Cette dernière visualisation établit un lien direct entre les divisions de la ville et les origines de ses habitants. Elle offre une vue panoramique de la diversité culturelle, illustrant comment les différentes origines ont contribué à la formation de chaque division. À travers ce graphe, nous pouvons voir comment Lausanne, même à cette époque, était un creuset de cultures, où chaque division a été façonnée par une mosaïque d'origines différentes, contribuant à l'identité unique de la ville.",
    }
}   

const MIN_ZOOM_SCALE = 0.1;
const MAX_ZOOM_SCALE = 10;

class Network {
    private svg: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private gnodes: any;
    private glinks: any;

    private simulation!: d3.Simulation<{}, undefined>;
    private data!: any[];
    private container!: d3.Selection<HTMLElement, unknown, HTMLElement, any>;
    private dragActive = false; // Drag behaviour, to skip mouseover events while dragging
    private networkName = DEFAULT_TYPE;
    private linkedById!: any;

    constructor(                     // Name of the first type in the bipartite graph
        expNodeSizeScale = 0.7,      // Exponent for scaling object sizes
        expLinkWeightScale = 0.7,    // Exponent for scaling link weights
        transparency = 0.1,           // Transparency of non-selected nodes and links
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
        this.initEvents();
        this.updatePlot(DEFAULT_NETWORK);
    }

    /**
     * Load the data.
     * @param network 
     * @returns {Promise<void>}
     */
    private async loadData(network: string): Promise<void> {
        const dataPath = `${DATA_FOLDER}/${network}.json`;

        return new Promise((resolve) => {
            d3.json(dataPath).then((data: any) => {
                resolve(data);
            });
        });
    }

    /**
     * Initialize the dimensions of the plot.
     * @returns {void}
     */
    private initDimensions(): void {
        // Define the container and get its size
        this.container = d3.select(CONTAINER_ID);
        const parentElement = document.getElementById(PARENT_ID);
        if (parentElement) {
            this.width = parentElement.clientWidth;
            this.height = parentElement.clientHeight;
        }
    }

    /**
     * Initialize the static elements of the plot.
     * @returns {void}
     */
    private initStaticElements(): void {
        // Create the SVG
        this.svg = this.container
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        this.glinks = this.svg
            .append("g")
            .attr("class", "links");

        this.gnodes = this.svg
            .append("g")
            .attr("class", "nodes");
    }

    /**
     * Initialize the update.
     */
    private initEvents(): void {
        // When the users chooses from the graph-selector dropdown,
        // update the graph
        const graphSelector = document.getElementById("graph-selector");
        if (graphSelector) {
            graphSelector.addEventListener("change", (event) => {
                const network = event.target.value;
                this.updatePlot(network);
            });
        }
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
        const dragstarted = (event) => {
            this.dragActive = true;
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        const dragged = (event) => {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        const dragended = (event) => {
            this.dragActive = false;
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    };

    /**
     * Initialize the data.
     * @returns {void}
     */
    private initData(): void {
        // Update each node's size to the scaled size
        let max_unscaled_node_size = this.data.nodes.reduce((max, node) => Math.max(max, node.size), 0);
        let min_unscaled_node_size = this.data.nodes.reduce((min, node) => Math.min(min, node.size), Infinity);
        max_unscaled_node_size = Math.pow(max_unscaled_node_size, this.expNodeSizeScale);
        min_unscaled_node_size = Math.pow(min_unscaled_node_size, this.expNodeSizeScale);

        this.data.nodes.forEach(node => node.size = this.get_scaled_size(Math.pow(node.size, this.expNodeSizeScale), min_unscaled_node_size, max_unscaled_node_size, this.minNodeSize, this.maxNodeSize));

        // Update each link's weight to the scaled weight
        let max_unscaled_link_weight = this.data.links.reduce((max, link) => Math.max(max, link.weight), 0);
        let min_unscaled_link_weight = this.data.links.reduce((min, link) => Math.min(min, link.weight), Infinity);
        max_unscaled_link_weight = Math.pow(max_unscaled_link_weight, this.expLinkWeightScale);
        min_unscaled_link_weight = Math.pow(min_unscaled_link_weight, this.expLinkWeightScale);

        this.data.links.forEach(link => link.weight = this.get_scaled_size(Math.pow(link.weight, this.expLinkWeightScale), min_unscaled_link_weight, max_unscaled_link_weight, this.minLinkWeight, this.maxLinkWeight));

        // Create linked list of nodes and isConnected function
        this.linkedById = {};
        this.data.links.forEach((d) => {
            this.linkedById[d.source] = []
            this.linkedById[d.target] = []
        });
        this.data.links.forEach((d) => {
            this.linkedById[d.source].push(d.target);
            this.linkedById[d.target].push(d.source);
        });
    }

    /**
     * Create the links.
     * @returns {void}
     */
    private createLinks(): void {
        // Create links
        this.glinks
            .attr("stroke", DEFAULT_LINK_COLOR)
            .attr("stroke-opacity", 1)
            .selectAll("line")
            .data(this.data.links)
            .enter()
            .append("line")
            .attr("stroke-width", function (d) { return d.weight; });
    }

    /**
     * Create the nodes.
     * @returns {void}
     */
    private createNodes(): void {
        // Create group for each node
        const nodeEnter = this.gnodes
            .selectAll('.node')
            .data(this.data.nodes)
            .enter()
            .append("g")
            .attr("class", "node");
    
        // Append a circle to each node
        nodeEnter
            .append("circle")
            .attr("class", "node-circle")
            .attr("r", function (d) { return d.size; })
            .attr("fill", (d) => { 
                const networkColors = DEFAULT_NODE_COLOR_BY_TYPE[this.networkName];
                const nodeColor = networkColors ? networkColors[d.type] : DEFAULT_NODE_COLOR;
                return nodeColor ? nodeColor : DEFAULT_NODE_COLOR;
            })
            .call(this.drag(this.simulation))
            .on("mouseover", (event, d) => {
                if (this.dragActive) {
                    return;
                }

                // Get the ID of the hovered node
                const hoveredNodeId = d.id;

                // Not hovered node less opaque
                this.gnodes
                    .selectAll(".node-circle")
                    .transition()
                    .duration(this.transitionDuration)
                    .attr("fill-opacity", (o) => {
                        return this.isConnected(hoveredNodeId, o.id) || o.id == hoveredNodeId ? 1 : this.transparency;
                    })
                    .attr("r", (o) => {
                        if (o.id == hoveredNodeId) {
                            return o.size + this.nodeSizeInc;
                        }
                        // give the link weight as size to the hovered node
                        if (this.isConnected(hoveredNodeId, o.id)) {
                            let link_weight = this.data.links.find(link => (link.source.id == o.id && link.target.id == hoveredNodeId) || (link.source.id == hoveredNodeId && link.target.id == o.id)).weight;
                            const connected_nodes = this.linkedById[hoveredNodeId];
                            const connected_links = this.data.links.filter(link => (link.source.id == hoveredNodeId || link.target.id == hoveredNodeId));
                            const min_connected_link_weight = connected_links.reduce((min, link) => Math.min(min, link.weight), Infinity);
                            const max_connected_link_weight = connected_links.reduce((max, link) => Math.max(max, link.weight), -Infinity);
                            const scaled_link_weight = this.get_scaled_size(link_weight, min_connected_link_weight, max_connected_link_weight, this.minNodeSize, this.maxNodeSize);
                            return scaled_link_weight;
                        }
                        return o.size;
                    });

                // Not hovered link less opaque
                this.glinks
                    .selectAll("line")
                    .transition()
                    .duration(this.transitionDuration)
                    .attr("stroke-opacity", (o) => {
                        return o.source.id == hoveredNodeId || o.target.id == hoveredNodeId ? 1 : this.transparency;
                    });

                // Opaque selected nodes and neighbours only
                this.gnodes
                    .selectAll(".node-text")
                    .transition()
                    .duration(this.transitionDuration)
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
                if (this.dragActive) {
                    return;
                }

                // Reset opacity and sizes
                this.gnodes
                    .selectAll(".node-circle")
                    .transition()
                    .duration(this.transitionDuration)
                    .attr("fill-opacity", 1)
                    .attr("r", function (d) { return d.size; });
                this.glinks
                    .selectAll("line")
                    .transition()
                    .duration(this.transitionDuration)
                    .attr("stroke-opacity", 1);
                this.gnodes
                    .selectAll(".node-text")
                    .transition()
                    .duration(this.transitionDuration)
                    .attr("fill-opacity", 1)
                    .attr("font-size", (d) => { return d.size + this.labelSizeAdd; });
            });

        // Append text to each node
        nodeEnter
            .append("text")
            .attr("class", "node-text")
            .text(function (d) { return NODE_ID_TO_NAME(d.label) })
            .attr("font-size", (d) => { return d.size + this.labelSizeAdd; })
            .attr("font-family", "sans-serif")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .style("pointer-events", "none");
    }

    /**
     * Initialize the zoom.
     * @returns {void}
     */
    private initZoom(): void {
        // Zoom
        const zoom = d3.zoom()
            .scaleExtent([MIN_ZOOM_SCALE, MAX_ZOOM_SCALE])
            .on("zoom", ({ transform }) => {
                this.gnodes.attr("transform", transform);
                this.glinks.attr("transform", transform);
            });

        this.svg.call(zoom);
    }

    /**
     * Initialize the simulation.
     * @returns {void}
     */
    private initSimulation(): void {
        // Create the simulation
        this.simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function (d) { return d.id; }))
            .force("charge", d3.forceManyBody().strength(this.chargeStrength))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))
            .force("collide", d3.forceCollide().radius((d) => { return d.size + this.collideSizeAdd; }));

        /**
         * Update node and link positions at every step of the force simulation.
         */
        const ticked = () => {
            this.glinks
                .selectAll("line")
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            this.gnodes
                .selectAll(".node-circle")
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            this.gnodes
                .selectAll(".node-text")
                .attr("x", d => d.x + 10)
                .attr("y", d => d.y + 4)
                .attr("dx", -9)
                .attr("dy", ".1em");
        }
        // Run simulation
        this.simulation
            .nodes(this.data.nodes)
            .on("tick", ticked);

        this.simulation.force("link")
            .links(this.data.links);
    }

    /**
     * Update the plot.
     * @param network The network to update to.
     * @returns {Promise<void>}
     */
    private async updatePlot(network: string): Promise<void> {
        return new Promise((resolve) => {
            this.loadData(network).then((data: any) => {
                // Define the network name
                this.networkName = network;

                // Delete the plot
                this.deletePlot();

                // Initialize data
                this.data = data;
                this.initData();

                // Initialize the plot with new data
                this.initSimulation();
                this.createLinks();
                this.createNodes();
                this.initZoom();

                // Modify the title and text
                const titleElement = document.querySelector(TITLE_ID);
                const textElement = document.querySelector(TEXT_ID);
                // Get the text and title from the map
                const dataText = TEXT_MAP[network];

                if (titleElement && textElement) {
                    titleElement.innerHTML =  dataText.title;
                    textElement.innerHTML = dataText.text;
                }
            });

            resolve();
        });
    }

    /**
     * Delete the plot.
     */
    private deletePlot(): void {
        this.gnodes.selectAll("*").remove();
        this.glinks.selectAll("*").remove();
    }
}

// run when page is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("Loading networks...");
    new Network();

    console.log("Networks loaded.");
});