// @ts-nocheck
import * as d3 from 'd3';
import * as d3Sankey from "d3-sankey"

const SANKEY_ELEMENT_ID = 'sankey';
const LINK_HOVERED_OPACITY = 0.8;

const DEFAULT_NODE_ALIGN = 'justify';
const DEFAULT_NODE_GROUP = (d: any) => d.id.split(/\W/)[0]; // Take first word for color
const DEFAULT_COLORS = (id: string) => {
    const map = {
        "bourg": '#2081C3',
        "place_st_francois": '#2081C3',
        "chailly": '#289e61',
        "grange": '#289e61',
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
        "affaires": '#2081C3',
        "campagne": '#289e61',
        "cathedrale": '#725AC1',
        "centre": '#F4743B',
        "commerce": '#aaaaaa',
        "culture": '#9E2846',
        "administration": '#aaaaaa',
        "agricole": '#aaaaaa',
        "artisanat": '#aaaaaa',
        "commerce": '#F4B860',
        "construction": '#aaaaaa',
        "rente": '#aaaaaa',
        "service": '#aaaaaa'
    };

    return map[id] ?? '#aaaaaa';
}
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

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/sankey-diagram
class Sankey {
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
            dataPath: string
        ) {
            this.dataPath = dataPath;
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
        const getValue = (value: any) => {
            return value !== null && typeof value === "object" ? value.valueOf() : value;
        };
        const LS = d3.map(this.data, ({source}) => source).map(getValue);
        const LT = d3.map(this.data, ({target}) => target).map(getValue);
        const LV = d3.map(this.data, ({value}) => value);

        this.nodes = Array.from(d3.union(LS, LT), id => ({id}));

        this.N = d3.map(this.nodes, (d) => d.id).map(getValue);
        this.G = d3.map(this.nodes, DEFAULT_NODE_GROUP).map(getValue);

        // Replace the input nodes and links with mutable objects for the simulation.
        this.nodes = d3.map(this.nodes, (_, i) => ({id: this.N[i]}));
        this.links = d3.map(this.data, (_, i) => ({source: LS[i], target: LT[i], value: LV[i]}));
    }

    private initColor(): void {
        this.color = DEFAULT_COLORS
    }

    private computeSankeyLayout(): void {
        d3Sankey.sankey()
            .nodeId(({index: i}) => this.N[i])
            .nodeAlign(this.nodeAlign)
            .nodeWidth(DEFAULT_NODE_WIDTH)
            .nodePadding(DEFAULT_NODE_PADDING)
            .extent([[DEFAULT_MARGIN_LEFT, DEFAULT_MARGIN_TOP], [this.width - DEFAULT_MARGIN_RIGHT, this.height - DEFAULT_MARGIN_BOTTOM]])
        ({nodes: this.nodes, links: this.links});
    }

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
            .attr("x", (d: any) => d.x0)
            .attr("y", (d: any) => d.y0)
            .attr("height", (d: any) => d.y1 - d.y0)
            .attr("width", (d: any) => d.x1 - d.x0);

        this.node.on("mouseover", function() {
        });

        if (this.G) this.node.attr("fill", ({index: i}) => this.color(this.G[i]));
        if (this.Tt) this.node.append("title").text(({index: i}) => Tt[i]);

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
            .attr("stroke", ({source: {index: i}}) => this.color(this.G[i]))
            .attr("stroke-width", ({width}) => Math.max(1, width))
            .call(Lt ? path => path.append("title").text(({index: i}) => Lt[i]) : () => {});

        this.link.on("mouseover", function(d) {
                d3.select(this).style("stroke-opacity", LINK_HOVERED_OPACITY);
        })
        .on("mouseout", (d) => {
            this.link.style("stroke-opacity", DEFAULT_LINK_STROKE_OPACITY);
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
                .text(({index: i}) => Tl[i]);
        }

        console.log(this.G)
    }
}
const sankey = new Sankey('sankey_ddj.json');