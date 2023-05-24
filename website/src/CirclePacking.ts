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
    'culture': "Division Culture",
    'marterey': "Quartier Marterey",

    'campagne': "Division Campagne",

    'commerce': "Division Commerce",

    'centre': "Division Centre",

    'affaires': "Division Affaires",

    'cathedrale': "Division Cathédrale",

}
const DEFAULT_PACKING_TEXT = "Pour vivre une expérience d'exploration historique immersive, nous vous invitons à découvrir les divisions et quartiers qui constituaient la ville. Pour ce faire, il suffit de cliquer sur les cercles correspondant à chaque quartier ou division.";
const PACKING_TEXT = {
    'culture': "Dans le domaine culturel, la rue Marterey de Lausanne se distingue. En 1803, un théâtre est initié sur le côté occidental de cette rue, et sa construction s'achève en 1805, renforçant l'identité culturelle de ce secteur de la ville.",
    'marterey': "Dans le domaine culturel, la rue Marterey de Lausanne se distingue. En 1803, un théâtre est initié sur le côté occidental de cette rue, et sa construction s'achève en 1805, renforçant l'identité culturelle de ce secteur de la ville.",
    
    'campagne': "La campagne lausannoise, parsemée de hameaux charmants, offrait un cadre idyllique pour ceux cherchant à échapper à l'agitation urbaine. Cette zone était notamment prisée par les rentiers pour sa tranquillité et se situait également sur des axes stratégiques. Ce contexte attirait les familles aristocratiques qui y établissaient leurs villas suburbaines, symbolisant à la fois un lien étroit avec la nature et un certain statut social. D'autre part, les agriculteurs et vignerons, en tant que paysans, se consacraient à leurs activités agricoles et viticoles dans cette campagne luxuriante.",

    'commerce': "Le dynamisme commercial de Lausanne était palpable dans plusieurs quartiers vibrants de la ville avec des centres actifs comme le Grand St-Jean, St-Laurent, Palud, Ale et la Montée de St-Laurent. La place Chauderon, inaugurée en 1830, servait de point de transfert pour les marchandises, tandis que la place de la Palud, avec l'Hôtel de Ville et son marché de fromages, constituait un autre pôle d'activité.",

    'centre': "Le centre de Lausanne était marqué par des rues pittoresques et animées, comme la Montée St-François, le Chêneau de Bourg et la Rue du Pré. Toutefois, le paysage social était significativement influencé par la présence de la tannerie Mercier dans le quartier du Rôtillon. Malgré son importance économique, la tannerie était associée à des conditions sanitaires défavorables et des odeurs désagréables, ce qui a limité la présence de la bourgeoisie dans ce secteur.",

    'affaires': "Le cœur économique de Lausanne se trouvait dans le quartier du Bourg. Ce dernier, vibrant d'activité, abritait l'Hôtel des postes, créé entre 1806 et 1808 suite à la transformation d'une partie de l'ancien manège. C'était ici que le courrier était centralisé et expédié. De plus, ce quartier jouait un rôle crucial dans le transport. En effet, la place Saint-François était le terminus des diligences en provenance ou à destination de Berne, Genève ou Paris. Le quartier du Bourg était donc un véritable pôle d'affaires, où se croisaient les flux de courriers et de voyageurs, symbolisant le dynamisme économique de Lausanne à cette époque.",

    'cathedrale': "La cathédrale de Lausanne se dressait majestueusement comme un emblème du patrimoine de la ville. Implantée au cœur de la Cité Derrière, son architecture impressionnante dominait l'horizon, attirant l'attention et l'admiration des résidents et des visiteurs. Les quartiers pittoresques de la Cité Dessous et de la Barre enveloppaient la cathédrale dans un tissu urbain dense. En outre, la présence de l'académie dans cette division renforçait le statut de la cathédrale comme centre de l'enseignement et de l'érudition.",
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