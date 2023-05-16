import * as d3 from 'd3';

const PACKING_DATA_PATH = 'data/circle_packing_data.json';

const PACKING_ELEMENT_ID = "circle-packing-plot";
const PACKING_TEXT_ELEMENT_ID = "circle-packing-text";

const OFF_WHITE_COLOR = '#f4efda';
const GREEN_COLOR = '#2e5d52';
const BLACK_COLOR = '#000000';

const CIRCLE_PADDING = 3;

const MIN_FONT_SIZE = 5;
const MAX_FONT_SIZE = 100;

const DEFAULT_PACKING_TEXT = 'Click on each circle to zoom in and explore the different types of transportation.';
const PACKING_TEXT = {
    'B': 'A kaleidoscope of bus numbers crisscross Switzerland, each serving its unique route in cities and rural corners alike.',
    'Bus': 'A kaleidoscope of bus numbers crisscross Switzerland, each serving its unique route in cities and rural corners alike.',
    'T': 'Trams, the urban chariots, mark their presence in the bustling cities of Geneva, Zurich, Basel, and Bern, weaving through the cityscape.',
    'M': 'Lausanne boasts the only metro system in Switzerland - the M1, a modern marvel darting beneath the city.',
    'Metro': 'Lausanne boasts the only metro system in Switzerland - the M1, a modern marvel darting beneath the city.',
    'Train': 'Switzerland\'s train network, from local \'S\' trains to high-speed ICEs, weaves a diverse tapestry of punctuality, efficiency, and connectivity.',
    'CC': 'From the scenic trails of Montreux to the peak of Jungfraujoch, rack railways conquer the Swiss mountains, providing unforgettable journeys.',
    'Rack Railway': 'From the scenic trails of Montreux to the peak of Jungfraujoch, rack railways conquer the Swiss mountains, providing unforgettable journeys.',
    'Boat': 'Whether it\'s the serene Lac de Thoune or the expansive Lac des Quatre Cantons, boats gently cut through the tranquil Swiss waters, offering a unique perspective of the landscape.',
    'BAT': 'Whether it\'s the serene Lac de Thoune or the expansive Lac des Quatre Cantons, boats gently cut through the tranquil Swiss waters, offering a unique perspective of the landscape.',

    'S': 'The local \'S\' trains serve as the reliable veins of the Swiss rail system, connecting suburbs to city centers.',
    'R': '\'R\' trains, or Regional trains, make frequent stops, ensuring even the smallest towns are connected.',
    'RE': 'The Regional Express (RE) trains, quicker than the \'R\', make fewer stops, bringing regions closer together.',
    'IC': 'InterCity (IC) trains link major Swiss cities, providing a swift and comfortable journey.',
    'TER': 'Transport Express Régional (TER) trains ensure the smooth running of regional transport, serving both urban and rural areas.',
    'RJX': 'Railjet Express (RJX) is the high-speed star, offering a swift connection between major cities.',
    'RJ': 'Railjet (RJ) trains, while not as fast as RJX, still offer quick, long-distance travel across the country.',
    'EC': 'EuroCity (EC) trains reach beyond Swiss borders, connecting Switzerland with neighboring European countries.',
    'ICE': 'The InterCity Express (ICE) trains are the epitome of speed and comfort, bringing distant cities within easy reach.',
    'Z': 'The \'Z\' trains, a rare sight, are special trains often used for seasonal routes or specific events.',
    'RB': 'RegionalBahn (RB) trains are the workhorses of the Swiss rail system, stopping at each station within a region.',
    'NJ': 'NightJet (NJ) trains turn travel time into rest time, offering sleeping facilities for long-distance overnight journeys.',
    'PE': 'The Panorama Express (PE) offers scenic rides through some of the most beautiful landscapes Switzerland has to offer.',
    'IRE': 'InterRegio-Express (IRE) trains offer regional services with fewer stops, connecting regions quickly and efficiently.',
    'EXT': 'The \'EXT\' trains are extra trains deployed during peak times or special events to ensure everyone gets where they\'re going.',
    'IR': 'InterRegio (IR) trains are crucial connectors, bridging the gap between local and long-distance services by linking smaller cities with major Swiss hubs.',
    'TGV': 'The TGV (Train à Grande Vitesse), or \'High-Speed Train\', is France\'s intercity high-speed rail service, but its influence extends beyond French borders, including into Switzerland.',
    'RBus': 'The \'R\' buses, similar to \'R\' trains, are regional buses. They serve a vital role in connecting smaller towns and regions that may not have direct train services.',
    'CAR': 'The \'CAR\' buses in Switzerland refer to coach services, usually providing longer distance intercity connections or international routes.'
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
            .domain([0, 2])
            .range([OFF_WHITE_COLOR, GREEN_COLOR] as Iterable<number>)

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
            // Write packing text
            const packingText = document.getElementById(PACKING_TEXT_ELEMENT_ID);
            if (packingText) {
                const p = packingText.getElementsByTagName("p")[0];
                console.log(d.data.name);
                const packingStr = (PACKING_TEXT as any)[d.data.name] || DEFAULT_PACKING_TEXT;
                p.innerHTML = packingStr;
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