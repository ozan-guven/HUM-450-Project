// @ts-nocheck
import * as d3 from 'd3';
import * as d3Sankey from "d3-sankey"

const SANKEY_ELEMENT_ID = 'sankey';
const TOOLTIP_ELEMENT_ID = 'sankey-tooltip';
const BARPLOT_ELEMENT_ID = 'sankey-barplot';
const BARPLOT_SVG_ELEMENT_ID = 'sankey-barplot-svg';
const LINK_HOVERED_OPACITY = 0.8;

const DEFAULT_NODE_ALIGN = 'justify';
const DEFAULT_NODE_GROUP = (d: any) => d.id.split(/\W/)[0]; // Take first word for color
const DEFAULT_NODE_WIDTH = 15;
const DEFAULT_NODE_PADDING = 10;
const DEFAULT_MARGIN_LEFT = 1;
const DEFAULT_MARGIN_RIGHT = 1;
const DEFAULT_MARGIN_TOP = 5;
const DEFAULT_MARGIN_BOTTOM = 5;
const DEFAULT_FORMAT = ',';
const DEFAULT_NODE_STROKE = 'currentColor';
const DEFAULT_NODE_STROKE_OPACITY = 0.5;
const DEFAULT_NODE_STROKE_WIDTH = 1.5;
const DEFAULT_NODE_STROKE_LINEJOIN = 'round';
const DEFAULT_LINK_STROKE_OPACITY = 0.5;
const DEFAULT_LINK_MIX_BLEND_MODE = 'multiply';
const DEFAULT_LINK_PATH = d3Sankey.sankeyLinkHorizontal();
const DEFAULT_NODE_LABEL_PADDING = 6;
const DEFAULT_UNSELECTED_COLOR = '#aaaaaa';
const BAR_PLOT_TRANSITION_DURATION = 500;
const DEFAULT_COLORS = (id: string) => {
    const map = {
        "bourg": '#2081C3',
        "place_st_francois": '#2081C3',
        "chailly": '#289e61',
        "grange_neuve": '#289e61',
        "la_sallaz": '#289e61',
        "ouchy": '#289e61',
        "barre": '#725AC1',
        "cite_derriere": '#725AC1',
        "cite_dessous": '#725AC1',
        "cheneau_de_bourg": '#F4743B',
        "montee_st_francois": '#F4743B',
        "rue_du_pre": '#F4743B',
        "ale": '#F4B860',
        "grand_st_jean": '#F4B860',
        "montee_de_st_laurent": '#F4B860',
        "palud": '#F4B860',
        "st_laurent": '#F4B860',
        "marterey": '#9E2846',
        "affaires_division": '#2081C3',
        "campagne_division": '#289e61',
        "cathedrale_division": '#725AC1',
        "centre_division": '#F4743B',
        "commerce_division": '#F4B860',
        "culture_division": '#9E2846',
        "administration": '#cccccc',
        "agricole": '#cccccc',
        "artisanat": '#cccccc',
        "commerce": '#cccccc',
        "construction": '#cccccc',
        "rente": '#cccccc',
        "service": '#cccccc',
        "hors_lausanne": '#cccccc',
        "lausanne": '#cccccc'
    };

    return map[id] ?? '#aaaaaa';
};
const NODE_ID_TO_NAME = (id: string) => {
    const map = {
        "bourg": 'Bourg',
        "place_st_francois": 'Place St-François',
        "chailly": 'Chailly',
        "grange_neuve": 'Grange-Neuve',
        "la_sallaz": 'La Sallaz',
        "ouchy": 'Ouchy',
        "barre": 'Barre',
        "cite_derriere": 'Cité Derrière',
        "cite_dessous": 'Cité Dessous',
        "cheneau_de_bourg": 'Cheneau-de-Bourg',
        "montee_st_francois": 'Montée St-François',
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
        "lausanne": 'Lausanne'
    };

    return map[id] ?? id;
};

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/sankey-diagram
class SankeyChart {
    private dataPath: string;
    private uid: string; 

    private width!: number;
    private height!: number;

    private data!: any;
    private links!: any;
    private nodes!: any;
    private N!: any;
    private G!: any;

    private nodeAlign!: any;
    private color!: any;
    private format!: any;

    private svg!: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    private node!: d3.Selection<SVGRectElement, unknown, HTMLElement, any>;
    private link!: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;

    constructor(
            dataPath: string,
            sankeyBarPlot: SankeyBarPlot
        ) {
            this.dataPath = dataPath;
            this.sankeyBarPlot = sankeyBarPlot;
            this.uid = `O-${Math.random().toString(16).slice(2)}`;

            this.loadData().then(() => {
                this.initDimensions();
                this.initNodeAlign();
                this.initGraph();
                this.initColor();
                this.computeSankeyLayout();
                this.initSvgElements();
            });
        }

    /**
     * Load data from json file.
     * @returns {Promise<any>}
     */
    private loadData(): Promise<any> {
        return new Promise((resolve) => {
            d3.json(this.dataPath).then((data) => {
                this.data = data;
                resolve();
            });
        });
    }

    /**
     * Initializes the dimensions of the sankey chart.
     * @returns {void}
     */
    private initDimensions(): void {
        const parentElement = document.getElementById(SANKEY_ELEMENT_ID);
        if (parentElement) {
            const dimensions = Math.min(parentElement.clientWidth, parentElement.clientHeight);
            this.width = dimensions;
            this.height = dimensions;
        }
    }

    /**
     * Initializes the node alignment.
     * @returns {void}
     */
    private initNodeAlign(): void {
        this.nodeAlign = {
            left: d3Sankey.sankeyLeft,
            right: d3Sankey.sankeyRight,
            center: d3Sankey.sankeyCenter
        }[DEFAULT_NODE_ALIGN] ?? d3Sankey.sankeyJustify;
    }

    /**
     * Initializes the sankey graph.
     * @returns {void}
     */
    private initGraph(): void {
        const LS = d3.map(this.data, ({source}) => source);
        const LT = d3.map(this.data, ({target}) => target);
        const LV = d3.map(this.data, ({value}) => value);

        this.nodes = Array.from(d3.union(LS, LT), id => ({id}));

        this.N = d3.map(this.nodes, (d) => d.id);
        this.G = d3.map(this.nodes, DEFAULT_NODE_GROUP);

        // Replace the input nodes and links with mutable objects for the simulation.
        this.nodes = d3.map(this.nodes, (_, i) => ({id: this.N[i]}));
        this.links = d3.map(this.data, (_, i) => ({source: LS[i], target: LT[i], value: LV[i]}));
    }

    /**
     * Initializes the color of the sankey chart.
     * @returns {void}
     */
    private initColor(): void {
        this.color = DEFAULT_COLORS
    }

    /**
     * Computes the sankey layout.
     * @returns {void}
     */
    private computeSankeyLayout(): void {
        d3Sankey.sankey()
            .nodeId(({index: i}) => this.N[i])
            .nodeAlign(this.nodeAlign)
            .nodeWidth(DEFAULT_NODE_WIDTH)
            .nodePadding(DEFAULT_NODE_PADDING)
            .extent([[DEFAULT_MARGIN_LEFT, DEFAULT_MARGIN_TOP], [this.width - DEFAULT_MARGIN_RIGHT, this.height - DEFAULT_MARGIN_BOTTOM]])
        ({nodes: this.nodes, links: this.links});
    }

    /**
     * Initializes the svg elements.
     * @returns {void}
     */
    private initSvgElements(): void {
        // Compute titles and labels using layout nodes, so as to access aggregate values.
        this.format = d3.format(DEFAULT_FORMAT);
        const Tl = this.N
        const Tt = d3.map(this.nodes, (d: any) => `${d.id}\n${this.format(d.value)}`);
        const Lt = d3.map(this.links, (d: any) => `${d.source.id} → ${d.target.id}\n${this.format(d.value)}`);

        // Init svg element
        this.svg = d3.select(`#${SANKEY_ELEMENT_ID}`)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox", [0, 0, this.width, this.height]);

        // Init node element
        this.node = this.svg.append("g")
            .attr("stroke", DEFAULT_NODE_STROKE)
            .attr("stroke-width", DEFAULT_NODE_STROKE_WIDTH)
            .attr("stroke-opacity", DEFAULT_NODE_STROKE_OPACITY)
            .attr("stroke-linejoin", DEFAULT_NODE_STROKE_LINEJOIN)
        .selectAll("rect")
        .data(this.nodes)
        .join("rect")
            .attr("id", (d: any) => d.id)
            .attr("class", (d: any) => 'sankey-rect')
            .attr("x", (d: any) => d.x0)
            .attr("y", (d: any) => d.y0)
            .attr("height", (d: any) => d.y1 - d.y0)
            .attr("width", (d: any) => d.x1 - d.x0);

        this.node
            .on("mouseover", (event, d) => {
                // Make all nodes gray
                d3.selectAll(".sankey-rect").style("fill", DEFAULT_UNSELECTED_COLOR);
                d3.selectAll(".sankey-path").style("stroke", DEFAULT_UNSELECTED_COLOR);

                // Highlight selected node
                d3.select(`#${d.id}`).style("fill", (node: any) => this.color(node.id));

                // Highlight linked nodes
                d.sourceLinks.forEach((link: any) => d3.select(`#${link.target.id}`).style("fill", (node: any) => this.color(node.id)));
                d.targetLinks.forEach((link: any) => d3.select(`#${link.source.id}`).style("fill", (node: any) => this.color(node.id)));

                // Highlight linked links
                d.sourceLinks.forEach((link: any) => d3.select(`#${link.source.id}-${link.target.id}`).style("stroke", (d: any) => this.color(d.source.id)));
                d.targetLinks.forEach((link: any) => d3.select(`#${link.source.id}-${link.target.id}`).style("stroke", (d: any) => this.color(d.source.id)));
            
                // Show tooltip
                const tooltip = d3.select(`#${TOOLTIP_ELEMENT_ID}`);
                tooltip.style("visibility", "visible");
                tooltip.html(`${d.value}`);
            })
            .on("mouseout", (event, d) => {
                // Make all nodes and links their original color
                d3.selectAll(".sankey-rect").style("fill", (node: any) => this.color(node.id));
                d3.selectAll(".sankey-path").style("stroke", (d: any) => this.color(d.source.id));

                // Hide tooltip
                const tooltip = d3.select(`#${TOOLTIP_ELEMENT_ID}`);
                tooltip.style("visibility", "hidden");
            })
            .on("mousemove", (event) => {
                // Update tooltip position
                const tooltip = d3.select(`#${TOOLTIP_ELEMENT_ID}`);
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("click", (event, d) => {
                this.updateBarChart(d);
            });

        if (this.G) this.node.attr("fill", ({index: i}) => this.color(this.G[i]));

        // Init link element
        this.link = this.svg.append("g")
            .attr("fill", "none")
            .attr("stroke-opacity", DEFAULT_LINK_STROKE_OPACITY)
            .selectAll("g")
            .data(this.links)
            .join("g")
            .style("mix-blend-mode", DEFAULT_LINK_MIX_BLEND_MODE);

        this.link.append("path")
            .attr("d", DEFAULT_LINK_PATH)
            .attr("id", (d: any) => `${d.source.id}-${d.target.id}`)
            .attr("class", (d: any) => 'sankey-path')
            .attr("stroke", ({source: {index: i}}) => this.color(this.G[i]))
            .attr("stroke-width", ({width}) => Math.max(1, width))

        this.link.on("mouseover", function(event, d) {
                d3.select(this).style("stroke-opacity", LINK_HOVERED_OPACITY);

                // Show tooltip
                const tooltip = d3.select(`#${TOOLTIP_ELEMENT_ID}`);
                tooltip.style("visibility", "visible");
                tooltip.html(`${d.value}`);
        })
        .on("mouseout", (d) => {
            this.link.style("stroke-opacity", DEFAULT_LINK_STROKE_OPACITY);

            // Hide tooltip
            const tooltip = d3.select(`#${TOOLTIP_ELEMENT_ID}`);
            tooltip.style("visibility", "hidden");
        })
        .on("mousemove", (event) => {
            // Update tooltip position
            const tooltip = d3.select(`#${TOOLTIP_ELEMENT_ID}`);
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        });

        // Init label element
        if (Tl) {
            this.svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 10)
            .selectAll("text")
            .data(this.nodes)
            .join("text")
                .attr("x", (d: any) => d.x0 < this.width / 2 ? d.x1 + DEFAULT_NODE_LABEL_PADDING : d.x0 - DEFAULT_NODE_LABEL_PADDING)
                .attr("y", (d: any) => (d.y1 + d.y0) / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", d => d.x0 < this.width / 2 ? "start" : "end")
                .attr("pointer-events", "none")
                .text(({index: i}) => NODE_ID_TO_NAME(Tl[i]));
        }
    }

    private updateBarChart(d: any): void {
        // Get child nodes
        const sourceChildren = d.sourceLinks.map((link: any) => ({
            id: link.target.id,
            value: link.value
        }));
        const targetChildren = d.targetLinks.map((link: any) => ({
            id: link.source.id,
            value: link.value
        }));

        if (sourceChildren.length === 0 && targetChildren.length === 0) return;
        
        let childNodes = sourceChildren.length === 0 ? targetChildren : sourceChildren;
        this.sankeyBarPlot.drawBarPlot(childNodes);
    }
}

class SankeyBarPlot {
    private width: number;
    private height: number;

    private svg: any;

    constructor() {
        this.initDimensions();
        this.initColor();
    }

    /**
     * Initialize the dimensions of the plot.
     * @returns {void}
     */
    private initDimensions(): void {
        const parentElement = document.getElementById(BARPLOT_ELEMENT_ID);
        if (parentElement) {
            const dimensions = Math.min(parentElement.clientWidth, parentElement.clientHeight);
            this.width = dimensions;
            this.height = dimensions;
        }
    }

    /**
     * Initializes the color of the sankey chart.
     * @returns {void}
     */
    private initColor(): void {
        this.color = DEFAULT_COLORS
    }

    /**
     * Draw the bar plot.
     * @param data The data to draw the bar plot with.
     * @returns {void}
     */
    public drawBarPlot(data: any[]): void {
        // Define margins
        const margin = {top: 10, right: 30, bottom: 100, left: 50},
            width = this.width - margin.left - margin.right,
            height = this.height - margin.top - margin.bottom;

        // Create SVG if it doesn't exist
        let svg = d3.select(`#${BARPLOT_ELEMENT_ID}`).select("svg");
        let group: any;

        if (svg.empty()) {
            svg = d3.select(`#${BARPLOT_ELEMENT_ID}`)
                .append("svg")
                .attr("id", BARPLOT_SVG_ELEMENT_ID)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);
            
            group = svg.append("g");
        } else {
            group = svg.select("g");
        }

        // Sort data by value
        data.sort((a, b) => d3.descending(a.value, b.value));

        // X axis
        const x = d3.scaleBand()
            .range([0, width])
            .domain(data.map(d => d.id))
            .padding(0.2);

        // Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([height, 0]);

        // Handle x-axis: create if it doesn't exist, update otherwise
        let xAxis = svg.select(".x-axis");
        if (xAxis.empty()) {
            xAxis = svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).tickFormat(d => NODE_ID_TO_NAME(d)));
        } else {
            xAxis.transition()
                .duration(BAR_PLOT_TRANSITION_DURATION)
                .call(d3.axisBottom(x).tickFormat(d => NODE_ID_TO_NAME(d)));
        }

        // Handle y-axis: create if it doesn't exist, update otherwise
        let yAxis = svg.select(".y-axis");
        if (yAxis.empty()) {
            yAxis = svg.append("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(y));
        } else {
            yAxis.transition()
                .duration(BAR_PLOT_TRANSITION_DURATION)
                .call(d3.axisLeft(y));
        }

        // Bars
        const bars = group.selectAll(".sankey-bar")
            .data(data, (d: any) => d.id);

        // Exit selection
        bars.exit()
            .transition()
            .duration(BAR_PLOT_TRANSITION_DURATION)
            .attr("height", 0)
            .attr("y", y(0))
            .remove();

        // Update selection
        bars
            .transition()
            .duration(BAR_PLOT_TRANSITION_DURATION)
            .attr("x", (d: any) => x(d.id))
            .attr("width", x.bandwidth())
            .attr("y", (d: any) => y(d.value))
            .attr("height", (d: any) => height - y(d.value));

        // Enter selection
        const barsEnter = bars
            .enter()
            .append("rect")
            .attr("class", "sankey-bar")
            .attr("x", (d: any) => x(d.id))
            .attr("width", x.bandwidth())
            .attr("y", y(0))
            .attr("height", 0)
            .attr("fill", (d: any) => this.color(d.id));

        barsEnter
            .transition()
            .duration(BAR_PLOT_TRANSITION_DURATION)
            .attr("height", (d: any) => height - y(d.value))
            .attr("y", (d: any) => y(d.value));
    }
}

const sankeyParPlot = new SankeyBarPlot();
const sankeyChart = new SankeyChart('sankey_ddo.json', sankeyParPlot);