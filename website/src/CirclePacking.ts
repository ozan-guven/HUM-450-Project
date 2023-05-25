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

const ID_TO_TITLE: { [key: string]: string } = {
    'culture': 'Culture',
    'marterey': 'Marterey',

    'campagne': 'Campagne',
    'ouchy': 'Ouchy',
    'la_sallaz': 'La Sallaz',
    'chailly': 'Chailly',
    'grange_neuve': 'Grange-Neuve',

    'commerce': 'Commerce',
    'st_laurent': 'St-Laurent',
    'palud': 'Palud',
    'grand_st_jean': 'Grand St-Jean',
    'ale': 'Ale',
    'montee_de_st_laurent': 'Montée de St-Laurent',

    'centre': 'Centre',
    'rue_du_pont': 'Rue du Pont',
    'cheneau_de_bourg': 'Cheneau de Bourg',
    'rue_du_pre': 'Rue du Pré',

    'affaires': 'Affaires',
    'bourg': 'Bourg',
    'place_st_francois': 'Place St-François',

    'cathedrale': 'Cathédrale',
    'barre': 'Barre',
    'cite_derriere': 'Cité Derrière',
    'cite_dessous': 'Cité Dessous',
}

const DEFAULT_PACKING_TITLE = '';
const PACKING_TITLE = {
    'culture': "Section Culture",
    'marterey': "Division Marterey",

    'campagne': "Section Campagne",
    'ouchy': "Division Ouchy",
    'la sallaz': "Division La Sallaz",
    'chailly': "Division Chailly",
    'grange-neuve': "Division Grange-Neuve",

    'commerce': "Section Commerce",
    'st laurent': "Division St-Laurent",
    'palud': "Division Palud",
    'grand st jean': "Division Grand St-Jean",
    'ale': "Division Ale",
    'montee de st laurent': "Division Montée de St-Laurent",

    'centre': "Section Centre",
    'cheneau de bourg': 'Division Cheneau de Bourg',
    'montee st francois': "Division Montée St-François",
    'rue du pre': "Division Rue du Pré",

    'affaires': "Section Affaires",
    'bourg': "Division Bourg",
    'place st francois': "Division Place St-François",

    'cathedrale': "Section Cathédrale",
    'barre': "Division Barre",
    'cite derriere': "Division Cité Derrière",
    'cite dessous': "Division Cité Dessous",
}
const DEFAULT_PACKING_TEXT = "Pour vivre une expérience d'exploration historique immersive, nous vous invitons à découvrir les divisions et quartiers qui constituaient la ville. Pour ce faire, il suffit de cliquer sur les cercles correspondant à chaque quartier ou division.";
const PACKING_TEXT = {
    'culture': "Dans le domaine culturel, la rue Marterey de Lausanne se distingue. En 1803, un théâtre est initié sur le côté occidental de cette rue, et sa construction s'achève en 1805, renforçant l'identité culturelle de ce secteur de la ville.",
    'marterey': "La rue Marterey était un véritable bastion culturel, se distinguant par son grand théâtre, construit entre 1803 et 1805, et de nombreux autres établissements culturels tels que des salons et des casinos. Ces lieux de divertissement étaient particulièrement attrayants pour les rentiers, faisant de Marterey leur deuxième choix de résidence après Ouchy. De plus, la profusion de ces établissements culturels offrait de nombreuses opportunités d'emploi, attirant ainsi une population travaillant principalement dans les services. L'effervescence culturelle de Marterey contribuait à façonner son identité unique au sein de la ville de Lausanne.",
    
    'campagne': "La campagne lausannoise, parsemée de hameaux charmants, offrait un cadre idyllique pour ceux cherchant à échapper à l'agitation urbaine. Cette zone était notamment prisée par les rentiers pour sa tranquillité et se situait également sur des axes stratégiques. Ce contexte attirait les familles aristocratiques qui y établissaient leurs villas suburbaines, symbolisant à la fois un lien étroit avec la nature et un certain statut social. D'autre part, les agriculteurs et vignerons, en tant que paysans, se consacraient à leurs activités agricoles et viticoles dans cette campagne luxuriante.",
    'ouchy': "",
    'la sallaz': "",
    'chailly': "",
    'grange-neuve': "",

    'commerce': "Le dynamisme commercial de Lausanne était palpable dans plusieurs quartiers vibrants de la ville avec des centres actifs comme la place de la Palud. La place Chauderon, inaugurée en 1830, servait de point de transfert pour les marchandises, tandis que la place de la Palud, avec l'Hôtel de Ville et son marché de fromages, constituait un autre pôle d'activité.",
    'st laurent': "",
    'palud': "",
    'grand st jean': "",
    'ale': "",
    'montee de st laurent': "",

    'centre': "Le centre de Lausanne était marqué par des rues pittoresques et animées, comme la Montée St-François, le Cheneau de Bourg et la Rue du Pré. Toutefois, le paysage social était significativement influencé par la présence de la tannerie Mercier dans le quartier du Rôtillon. Malgré son importance économique, la tannerie était associée à des conditions sanitaires défavorables et des odeurs désagréables, ce qui a limité la présence de la bourgeoisie dans ce secteur.",
    'cheneau de bourg': "La division Cheneau de Bourg de Lausanne était principalement peuplée par une population artisanale, tandis que le nombre de personnes aisées, comme les rentiers et le personnel d'administration, était relativement restreint. Cette répartition démographique pourrait être attribuée à la présence passée de la Louve et de la Venoge. Ces deux rivières, propices à de nombreux métiers manuels, avaient probablement aussi contribué à créer une ambiance moins attrayante pour ceux qui ne travaillaient pas dans ces métiers. Les odeurs et la mauvaise réputation associées à ces zones industrielles auraient dissuadé les personnes plus aisées de s'y installer, renforçant ainsi la caractéristique artisanale de cette division.",
    'montee st francois': "La montée St-François se démarquait en tant que quartier de prédilection des commerçants et, conjointement avec la division Marteray, des artisans. Il est indéniable que cette division tenait une place dominante dans le paysage commercial de Lausanne, à l'image de la division Rue du Pré. Ce quartier dynamique était sans aucun doute un moteur économique essentiel de la ville à cette époque.",
    'rue du pre': "Située en plein cœur de l'activité commerciale et artisanale, la Rue du Pré semble avoir été un lieu clé pour le commerce local et les exportations. Cependant, à l'image de la Place St-François, la Rue du Pré se caractérisait par une faible présence de rentiers, indiquant probablement des conditions de vie et de bien-être moins favorables, malgré un intérêt économique évident. L'absence de personnel administratif dans cette division suggère également qu'elle ne faisait pas partie des priorités principales de la commune à cette époque, renforçant l'idée d'une division plus orientée vers le commerce et l'artisanat que vers le bien-être de ses habitants.",

    'affaires': "Le cœur économique de Lausanne se trouvait dans le quartier du Bourg. Ce dernier, vibrant d'activité, abritait l'Hôtel des postes, créé entre 1806 et 1808 suite à la transformation d'une partie de l'ancien manège. C'était ici que le courrier était centralisé et expédié. De plus, ce quartier jouait un rôle crucial dans le transport. En effet, la place Saint-François était le terminus des diligences en provenance ou à destination de Berne, Genève ou Paris. Le quartier du Bourg était donc un véritable pôle d'affaires, où se croisaient les flux de courriers et de voyageurs, symbolisant le dynamisme économique de Lausanne à cette époque.",
    'bourg': "La rue de Bourg et la Place St-François à proximité étaient des lieux prisés par les intellectuels dits \"libéraux\". Leur présence a contribué à l'arrivée de populations moins manuelles, diversifiant ainsi la composition démographique de la division. Par ailleurs, la présence de nombreuses familles patriciennes ajoutait une note de raffinement à cette division, qui était alors considérée comme l'une des plus chics et raffinées de la ville. Malgré la présence notable d'artisans et de travailleurs manuels, le Bourg se distinguait aussi par son attrait pour les intellectuels et son ambiance aristocratique.",
    'place st francois': "La Place St-François, à l'instar de la Rue de Bourg, était une enclave de libéralisme intellectuel en 1832. Ce havre intellectuel attire un nombre important d'individus dont l'occupation est loin d'être manuelle, ce qui pourrait en partie expliquer la longévité exceptionnelle de ses résidents - l'espérance de vie y était en effet de 48.5 ans en 1838, bien au-dessus de la moyenne lausannoise qui ne dépassait pas la trentaine. Bien que cette mesure ne soit pas directement liée au niveau de vie, elle suggère des conditions de vie probablement supérieures à la moyenne de Lausanne, ce qui est cohérent avec le fait que moins du quart de ses habitants exerçaient des métiers dits \"physiques\". La Place St-François, tout comme la Place de la Palud, était un foyer d'activité urbaine et économique, avec de nombreux travaux d'infrastructure, notamment la construction de routes et de ponts, entrepris pour favoriser le transit et stimuler la croissance.",

    'cathedrale': "La cathédrale de Lausanne se dressait majestueusement comme un emblème du patrimoine de la ville. Implantée au cœur de la Cité Derrière, son architecture impressionnante dominait l'horizon, attirant l'attention et l'admiration des résidents et des visiteurs. Les quartiers pittoresques de la Cité Dessous et de la Barre enveloppaient la cathédrale dans un tissu urbain dense. En outre, la présence de l'académie dans cette division renforçait le statut de la cathédrale comme centre de l'enseignement et de l'érudition.",
    'barre': "",
    'cite derriere': "",
    'cite dessous': "",
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
            .text((d: any) => ID_TO_TITLE[d.data.name] ?? d.data.name);
        
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