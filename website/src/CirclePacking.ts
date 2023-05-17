import * as d3 from 'd3';

const PACKING_DATA_PATH = 'data/circle_packing_data.json';

const PACKING_ELEMENT_ID = "circle-packing-plot";
const PACKING_TITLE_ELEMENT_ID = "circle-packing-title";
const PACKING_TEXT_ELEMENT_ID = "circle-packing-text";

const OFF_WHITE_COLOR = '#f4efda';
const PURPLE_COLOR = '#9e2846';
const BLACK_COLOR = '#000000';

const CIRCLE_PADDING = 3;

const MIN_FONT_SIZE = 5;
const MAX_FONT_SIZE = 100;

const DEFAULT_PACKING_TITLE = '';
const PACKING_TITLE = {
    '1-2': 'Division 1-2',
    '3': 'Division 3',
    '4': 'Division 4',
    '5': 'Division 5',
    '6': 'Division 6',
    '7': 'Division 7',
    '7-8': 'Division 7-8',
    '9': 'Division 9',
    '10': 'Division 10',
    '11': 'Division 11',
    '12': 'Division 12',
    '13': 'Division 13',
    '14': 'Division 14',
    '15': 'Division 15',
    '16': 'Division 16',
    '17': 'Division 17',
    '18': 'Division 18',
    '19': 'Division 19',
    '20': 'Division 20'
}
const DEFAULT_PACKING_TEXT = 'Click on each circle to zoom in and explore the different types of transportation.';
const PACKING_TEXT = {
    '1-2': 'Division 1-2',
    '3': 'Division 3',
    '4': 'Division 4',
    '5': 'Division 5',
    '6': 'Division 6',
    '7': 'Division 7',
    '7-8': 'Division 7-8',
    '9': 'Division 9',
    '10': 'Division 10',
    '11': 'Division 11',
    '12': 'Division 12',
    '13': 'Division 13',
    '14': 'Division 14',
    '15': 'Division 15',
    '16': 'Division 16',
    '17': 'Division 17',
    '18': 'Division 18',
    '19': 'Division 19',
    '20': 'Division 20'
}

/**
 * A class representing the circle packing visualization.
 */
export class CirclePacking {

    private data!: any;

    private width!: number;
    private height!: number;

    constructor() {
        this.loadData().then(() => {
            this.initDimensions();
            this.initPacking();
        });
    }

    /**
     * Loads the data for the circle packing visualization.
     * @returns {Promise<void>} A promise that resolves when the data is loaded.
     */
    async loadData(): Promise<void> {
        return new Promise((resolve) => {
            d3.json(PACKING_DATA_PATH).then((data) => {
                this.data = data;
                resolve();
            });
        });
    }

    /**
     * Initializes the dimensions of the circle packing visualization.
     * @returns {void}
     */
    initDimensions(): void {
        const parentElement = document.getElementById(PACKING_ELEMENT_ID);
        if (parentElement) {
            const dimensions = Math.min(parentElement.clientWidth, parentElement.clientHeight);
            this.width = dimensions;
            this.height = dimensions;
        }
    }

    /**
     * Initializes the circle packing visualization.
     */
    initPacking(): void {
        // Get the data and pack it
        const pack = (data: any) => d3.pack()
            .size([this.width, this.height])
            .padding(CIRCLE_PADDING)(
                d3.hierarchy(data)
                .sum(d => d.value)
                .sort((a: any, b: any) => b.value - a.value)
            )

        const root = pack(this.data);
        let focus = root;

        // Define color and font scales for the visualization
        const colorScale = d3.scaleLinear()
            .domain([0, 1])
            .range([OFF_WHITE_COLOR, PURPLE_COLOR] as Iterable<number>)

        const fontSizeScale = d3.scaleSqrt()
            .domain([d3.min(root.descendants(), (d: any) => d.r), d3.max(root.descendants(), (d: any) => d.r)])
            .range([MIN_FONT_SIZE, MAX_FONT_SIZE]);

        // Define SVG
        const svg = d3.select(`#${PACKING_ELEMENT_ID}`)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox", `-${this.width / 2} -${this.height / 2} ${this.width} ${this.height}`)
            .style("display", "block")
            .style("background", colorScale(0))
            .style("cursor", "pointer")
            .on("click", (event) => zoom(event, root));

        // Define nodes
        const node = svg.append("g")
            .selectAll("circle")
            .data(root.descendants().slice(1))
            .join("circle")
            .attr("fill", d => d.children ? colorScale(d.depth) : OFF_WHITE_COLOR)
            .attr("pointer-events", d => !d.children ? "none" : null)
            .on("mouseover", function() { d3.select(this).attr("stroke", BLACK_COLOR); })
            .on("mouseout", function() { d3.select(this).attr("stroke", null); })
            .on("click", (event, d) => focus !== d && (zoom(event, d), event.stopPropagation()));

        // Define labels
        const label = svg.append("g")
            .style("font-family", "var(--default-font-family)")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .selectAll("text")
            .data(root.descendants())
            .join("text")
            .attr("dy", "0.3em")
            .style("font-size", (d: any) => `${fontSizeScale(d.r)}px`)
            .style("fill-opacity", d => d.parent === root ? 1 : 0)
            .style("display", d => d.parent === root ? "inline" : "none")
            .text((d: any) => d.data.name);
        
        let view: any;
        const zoomTo = (v: any) => {
            const k = this.width / v[2];
        
            view = v;
        
            label.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
            node.attr("transform", d => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
            node.attr("r", d => d.r * k);
        }

        zoomTo([root.x, root.y, root.r * 2]);
        
          function zoom(event: any, d: any) {
            // Write title text
            const titleText = document.getElementById(PACKING_TITLE_ELEMENT_ID);
            if (titleText) {
                const titleStr = (PACKING_TITLE as any)[d.data.name] || DEFAULT_PACKING_TITLE;
                titleText.innerHTML = titleStr;
            }

            // Write packing text
            const packingText = document.getElementById(PACKING_TEXT_ELEMENT_ID);
            if (packingText) {
                const packingStr = (PACKING_TEXT as any)[d.data.name] || DEFAULT_PACKING_TEXT;
                packingText.innerHTML = packingStr;
            }

            // Zoom to selected circle
            focus = d;

            const transition = svg.transition()
                .duration(event.altKey ? 7500 : 750)
                .tween("zoom", () => {
                  const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                  return (t: any) => zoomTo(i(t));
                });
        
            // Update label visibility
            label
              .filter(function(d) { return d.parent === focus || (this as SVGElement).style.display === "inline"; })
              .transition(transition as any)
                .style("fill-opacity", d => d.parent === focus ? 1 : 0)
                .on("start", function(d) { if (d.parent === focus) (this as SVGElement).style.display = "inline"; })
                .on("end", function(d) { if (d.parent !== focus) (this as SVGElement).style.display = "none"; });
          }
    }
}