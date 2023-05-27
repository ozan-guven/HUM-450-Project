//@ts-nocheck
import * as d3 from "d3";

const TOOLTIP_ELEMENT_ID = 'sankey-tooltip';

const SELECT_JOB = "select_job";
const CHECK_PROPORTION = "check_proportion";
const MAP_BARPLOT_JOBS_ELEMENT_ID = 'bar-jobs';
const MAP_BARPLOT_ORIGINS_ELEMENT_ID = 'bar-origins';
const MAP_BARPLOT_TITLE_ID = "bar_chart_title";
const BAR_PLOT_TRANSITION_DURATION = 500;

const TITL_JOBS_GRAPH = "Distribution des catégories de métiers";
const TITLE_ORIGINS_GRAPH = "Distribution des origines des habitants";

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
        "not_lausanne": 'Hors Lausanne',
    };

    return map[id] ?? id;
};

const DEFAULT_COLORS = (id) => {
    const map = {
        'administration': 'blue',
        'agricole': '#00A59B',
        'artisanat': '#6F2282',
        'commerce': '#E84E10',
        'construction': '#FCBB00',
        'rente': '#143A85',
        'service': '#00973B',
    };

    return map[id] || "turquoise";//"#FAF4DD";
};

const SCALE_DOMAINS = {
    // Jobs
    'no_selection': { 'min': 0, 'max': 1 },
    'administration': { 'min': 1, 'max': 17, 'color': "blue", 'max_ratio': 0.081340 },
    'agricole': { 'min': 3, 'max': 122, 'color': "#00A59B", 'max_ratio': 0.657143 },
    'artisanat': { 'min': 2, 'max': 93, 'color': "#6F2282", 'max_ratio': 0.308081 },
    'commerce': { 'min': 6, 'max': 44, 'color': "#E84E10", 'max_ratio': 0.135000 },
    'construction': { 'min': 1, 'max': 39, 'color': "#FCBB00", 'max_ratio': 0.135458 },
    'rente': { 'min': 5, 'max': 140, 'color': "#143A85", 'max_ratio': 0.412979 },
    'service': { 'min': 1, 'max': 77, 'color': "#00973B", 'max_ratio': 0.158103 },

    // Origins 
    "not_lausanne": { 'max': 370, 'color': 'turquoise', 'max_ratio': 0.80000 },
    "aigle": { 'max': 8, 'color': 'turquoise', 'max_ratio': 0.032609 },
    "angleterre": { 'max': 14, 'color': 'turquoise', 'max_ratio': 0.041298 },
    "aubonne": { 'max': 10, 'color': 'turquoise', 'max_ratio': 0.030303 },
    "avenches": { 'max': 3, 'color': 'turquoise', 'max_ratio': 0.014354 },
    "cossonay": { 'max': 17, 'color': 'turquoise', 'max_ratio': 0.065217 },
    "echallens": { 'max': 12, 'color': 'turquoise', 'max_ratio': 0.045455 },
    "france": { 'max': 21, 'color': 'turquoise', 'max_ratio': 0.093264 },
    "fribourg": { 'max': 6, 'color': 'turquoise', 'max_ratio': 0.085714 },
    "geneve": { 'max': 6, 'color': 'turquoise', 'max_ratio': 0.017699 },
    "grandson": { 'max': 2, 'color': 'turquoise', 'max_ratio': 0.010870 },
    "italie": { 'max': 3, 'color': 'turquoise', 'max_ratio': 0.010050 },
    "la_vallee": { 'max': 14, 'color': 'turquoise', 'max_ratio': 0.400000 },
    "lausanne": { 'max': 149, 'color': 'turquoise', 'max_ratio': 0.540230 },
    "lavaux": { 'max': 53, 'color': 'turquoise', 'max_ratio': 0.106195 },
    "morges": { 'max': 26, 'color': 'turquoise', 'max_ratio': 0.092527 },
    "moudon": { 'max': 13, 'color': 'turquoise', 'max_ratio': 0.055276 },
    "neuchatel": { 'max': 3, 'color': 'turquoise', 'max_ratio': 0.011858 },
    "nyon": { 'max': 10, 'color': 'turquoise', 'max_ratio': 0.043478 },
    "orbe": { 'max': 10, 'color': 'turquoise', 'max_ratio': 0.035587 },
    "oron": { 'max': 15, 'color': 'turquoise', 'max_ratio': 0.059289 },
    "payerne": { 'max': 4, 'color': 'turquoise', 'max_ratio': 0.021739 },
    "pays_d_enhaut": { 'max': 11, 'color': 'turquoise', 'max_ratio': 0.038278 },
    "rolle": { 'max': 8, 'color': 'turquoise', 'max_ratio': 0.020202 },
    "suisse_allemande": { 'max': 36, 'color': 'turquoise', 'max_ratio': 0.100503 },
    "vaud": { 'max': 6, 'color': 'turquoise', 'max_ratio': 0.085714 },
    "vevey": { 'max': 15, 'color': 'turquoise', 'max_ratio': 0.045226 },
    "yverdon": { 'max': 12, 'color': 'turquoise', 'max_ratio': 0.072464 },
}
const DEFAULT_OPACITY = 0.3;

export class DivisionsMap {
    constructor(
        map_file,
        locations_file,
        scale = 700000,
        center = [6.635, 46.525],
        min_zoom_dimension = 100,
        default_zone_color = `rgba(128, 128, 128, 1)`,
    ) {
        this.map_file = map_file;
        this.locations_file = locations_file;
        this.mapBarPlotJobs = new MapBarPlot(MAP_BARPLOT_JOBS_ELEMENT_ID, TITL_JOBS_GRAPH);
        this.mapBarPlotOrigins = new MapBarPlot(MAP_BARPLOT_ORIGINS_ELEMENT_ID, TITLE_ORIGINS_GRAPH);

        // Basic render settings
        this.scale = scale;
        this.center = center;
        this.min_zoom_dimension = min_zoom_dimension;
        this.default_zone_color = default_zone_color;

        // State variables
        this.is_zoomed = false;
        this.clicked_zone = null;

        this.selectedJobsData = null;
        this.selectedOriginsData = null;

        this.initDimensions();

        // Initialize map
        this.svg = this.init_svg();
        this.layer_1 = this.init_g();
        this.layer_3 = this.init_g();
        this.layer_2 = this.init_g();
        this.legend = this.init_legend();
        this.projection = this.init_projection();
        this.zoom = this.init_zoom();

        let selectedJob = 'no_selection';
        let selectedOrigin = 'no_origin';
        let selectedProportion = false;
        let isJobSelected = false;
        let isOriginSelected = false;

        const edgesOpacityCheckbox = document.getElementById(CHECK_PROPORTION);
        edgesOpacityCheckbox.addEventListener('change', (event) => {
            console.log(isJobSelected, isOriginSelected, selectedJob, selectedOrigin, selectedProportion)
            selectedProportion = event.target.checked;
            if (isJobSelected) {
                // Get the currently selected job option
                this.handleSelectJob(selectedJob, selectedProportion);
                this.update_legend(selectedJob, selectedProportion);
            } else if (isOriginSelected) {
                this.handleSelectOrigin(selectedOrigin, selectedProportion);
                this.update_legend(selectedOrigin, selectedProportion);
            } else {
                this.hadleNoSelection();
            }
        });

        // Add event listeners
        const selectLayoutElement = document.getElementById(SELECT_JOB);
        selectLayoutElement.addEventListener('change', (event) => {
            // Check if no_selection
            if (event.target.value === 'no_selection') {
                isJobSelected = false;
                isOriginSelected = false;
                this.hadleNoSelection()
            }

            // Get the label of the optgroup that contains the selected option
            const optgroup = event.target.selectedOptions[0].parentNode.id;
            if (optgroup === 'job_category_optgroup') {
                isJobSelected = true;
                isOriginSelected = false;
                selectedJob = event.target.value;
                this.handleSelectJob(event.target.value, selectedProportion);
            } else if (optgroup === 'origin_category_optgroup') {
                isJobSelected = false;
                isOriginSelected = true;
                selectedOrigin = event.target.value;
                this.handleSelectOrigin(event.target.value, selectedProportion);
            }

            this.update_legend(event.target.value, selectedProportion);

            // Update the bar plot if the data are not null
            if (this.selectedJobsData !== null) {
                this.mapBarPlotJobs.drawBarPlot(this.selectedJobsData, event.target.value);
            }
            if (this.selectedOriginsData !== null) {
                this.mapBarPlotOrigins.drawBarPlot(this.selectedOriginsData, event.target.value);
            }
        });
    }

    handleSelectJob(selectedJob, selectedProportion) {
        // Here, you can update the color scale domain based on the selected job
        // For example, if the selected job is "construction":
        const selected_domain = SCALE_DOMAINS[selectedJob];

        const colorScale = d3.scaleLinear()
            .domain([
                0,
                selectedProportion ? selected_domain.max_ratio : selected_domain.max])
            .range(["#FAF4DD", selected_domain.color]);

        // Update the fill color of the map zones based on the selected job
        this.layer_1
            .selectAll(".zone")
            // Add a linear transition to the fill color
            .transition()
            .duration(500)
            .attr("fill", d => {
                if (!(selectedJob in d.properties.jobs) || selectedJob === "no_selection") {
                    return colorScale(0);
                }
                return colorScale(d.properties.jobs[selectedJob] / (selectedProportion ? d.properties.population : 1))
            })
            // Set data-old-color attribute to the new color
            .attr("data-old-color", d => {
                if (!(selectedJob in d.properties.jobs) || selectedJob === "no_selection") {
                    return colorScale(0);
                }
                return colorScale(d.properties.jobs[selectedJob] / (selectedProportion ? d.properties.population : 1))
            });
    }

    handleSelectOrigin(selectedOrigin, selectedProportion) {
        // Here, you can update the color scale domain based on the selected job
        // For example, if the selected job is "construction":
        const selected_domain = SCALE_DOMAINS[selectedOrigin];
        const colorScale = d3.scaleLinear()
            .domain([
                0,
                selectedProportion ? selected_domain.max_ratio : selected_domain.max])
            .range(["#FAF4DD", selected_domain.color]);

        // Update the fill color of the map zones based on the selected job
        this.layer_1
            .selectAll(".zone")
            // Add a linear transition to the fill color
            .transition()
            .duration(500)
            .attr("fill", d => {
                if (!(selectedOrigin in d.properties.origins) || selectedOrigin === "no_selection") {
                    return colorScale(0);
                }
                return colorScale(d.properties.origins[selectedOrigin] / (selectedProportion ? d.properties.population : 1))
            })
            .attr("data-old-color", d => {
                if (!(selectedOrigin in d.properties.origins) || selectedOrigin === "no_selection") {
                    return colorScale(0);
                }
                return colorScale(d.properties.origins[selectedOrigin] / (selectedProportion ? d.properties.population : 1))
            });
    }

    hadleNoSelection() {
        this.layer_1
            .selectAll(".zone")
            // Add a linear transition to the fill color
            .transition()
            .duration(500)
            .attr("fill", d => this.default_zone_color)
            .attr("data-old-color", d => this.default_zone_color);
    }


    /**
     * Initializes the dimensions of the circle packing visualization.
     * @returns {void}
     */
    initDimensions(): void {
        const parentElement = document.getElementById("map-chart");
        if (parentElement) {
            this.width = parentElement.clientWidth;
            this.height = parentElement.clientHeight;
        }
    }

    init_svg() {
        const svg = d3
            .select("#map")
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("viewBox", [0, 0, this.width, this.height])
            .on("mouseover", function () {
                // disable fullPage.js scrolling when mouse is over any SVG
                //$.fn.fullpage.setAllowScrolling(false);
            })
            .on("mouseout", function () {
                // re-enable fullPage.js scrolling when mouse leaves any SVG
                //$.fn.fullpage.setAllowScrolling(true);
            });
        return svg;
    }

    init_projection() {
        const projection = d3.geoMercator()
            .center(this.center)
            .scale(this.scale)
            .translate([this.svg_width / 2, this.svg_height / 2]);
        return projection;
    }

    init_g() {
        const g = this.svg.append("g");
        return g;
    }

    init_legend() {
        const legend = this.svg
            .append("g")
            .attr("class", "legend")
            .attr("transform", "translate(20, " + (this.height - 70) + ")");

        // Define color scale: TODO: take from data
        const colorScale = d3.scaleSequential(d3.interpolateBlues)
            .domain([0, 100]);

        // Create gradient
        const defs = this.svg.append("defs");

        const linearGradient = defs.append("linearGradient")
            .attr("id", "linear-gradient");

        linearGradient.append("stop")
            .attr("id", "gradient-start")
            .attr("offset", "0%")
            .attr("stop-color", colorScale.range()[0]);

        linearGradient.append("stop")
            .attr("id", "gradient-end")
            .attr("offset", "100%")
            .attr("stop-color", colorScale.range()[1]);

        // Draw legend rectangle
        legend.append("rect")
            .attr("id", "legend-rect")
            .attr("width", 200)
            .attr("height", 20)
            .style("fill", "url(#linear-gradient)");

        // Draw legend axis
        const legendScale = d3.scaleLinear()
            .domain(colorScale.domain())
            .range([0, 200]);

        const legendAxis = d3.axisBottom(legendScale)
            .ticks(5);

        legend.append("g")
            .attr("id", "legend-axis")
            .attr("transform", "translate(0, 20)")
            .style("color", "#fff")
            .call(legendAxis);
        
        legend.style("opacity", 0);

        // Add legend title
        legend.append("text")
            .attr("id", "legend-title")
            .attr("x", 0)
            .attr("y", -10)
            .style("fill", "#fff")
            .text("Nombre de personnes");

        return legend;
    }

    update_legend(selection, selectedProportion) {
        // If selection is "no_selection", we hide the legend
        if (selection === "no_selection") {
            this.svg
                .select(".legend")
                .transition()
                .duration(500)
                .style("opacity", 0);
            return;
        }

        if (selectedProportion) {
            this.svg
                .select("#legend-title")
                .text("Proportion de personnes [%]");
        } else {
            this.svg
                .select("#legend-title")
                .text("Nombre de personnes");
        }

        // If selection is not "no_selection", we show the legend
        this.svg
                .select(".legend")
                .transition()
                .duration(500)
                .style("opacity", 1);

        const selected_domain = SCALE_DOMAINS[selection];

        const colorScale = d3.scaleLinear()
            .domain([
                0,
                selectedProportion ? selected_domain.max_ratio * 100: selected_domain.max])
            .range(["#FAF4DD", selected_domain.color]);

        // Select the linearGradient to update it with a transition
        const linearGradient = this.svg.select("#linear-gradient")

        linearGradient.select("#gradient-start")
            .transition()
            .duration(500)
            .attr("stop-color", colorScale.range()[0]);

        linearGradient.select("#gradient-end")
            .transition()
            .duration(500)
            .attr("stop-color", colorScale.range()[1]);

        // Select te legend rectangle to update the color
        const legendRect = this.svg.select("#legend-rect");
        legendRect
            .transition()
            .duration(500)
            .style("fill", "url(#linear-gradient)");

        // Draw legend axis
        const legendScale = d3.scaleLinear()
            .domain(colorScale.domain())
            .range([0, 200]);

        const legendAxis = d3.axisBottom(legendScale)
            .ticks(5);

        this.svg.select("#legend-axis")
            .transition()
            .duration(500)
            .style("color", "#fff")
            .call(legendAxis);
    }

    init_zoom() {
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", ({ transform }) => {
                this.layer_1.attr("transform", transform);
                this.layer_2.attr("transform", transform);
                this.layer_3.attr("transform", transform);
            });

        this.svg.call(zoom);

        return zoom;
    }

    get svg_width() {
        const svgNode = this.svg.node();
        return svgNode.getBoundingClientRect().width;
    }

    get svg_height() {
        const svgNode = this.svg.node();
        return svgNode.getBoundingClientRect().height;
    }

    get path_generator() {
        return d3.geoPath().projection(this.projection);
    }

    load_data() {
        d3.json(this.map_file).then(data => {
            //this.correctWindingOrder(data)
            this.layer_1.selectAll("path")
                .data(data.features)
                .enter()
                .append("path")
                .attr("class", "zone")
                .attr("id", d => d.properties.id)
                .attr("fill", d => this.default_zone_color)
                .attr('data-old-color', d => this.default_zone_color)
                .attr("d", d3.geoPath()
                    .projection(this.projection)
                )
                .style("stroke", "white")
                .style("stroke-width", 0.2)
                .on("mouseover", d => {
                    this.onMouseOverZone(d.target)
                })
                .on("mouseout", d => {
                    this.onMouseOutZone(d.target)
                })
                .on("mousemove", (event) => {
                    // Update tooltip position
                    const tooltip = d3.select(`#${TOOLTIP_ELEMENT_ID}`);
                    tooltip.style("top", (event.pageY - 10) + "px")
                        .style("left", (event.pageX + 10) + "px");
                })
                .on("click", d => {
                    if (this.is_zoomed) {
                        this.zoomOut()
                    } else {
                        this.zoomOnZone(d.target)
                    }
                    this.is_zoomed = !this.is_zoomed
                    this.zoom.filter(() => !this.is_zoomed)
                    if (!this.is_zoomed) {
                        this.resetZone(this.clicked_zone)
                    }
                    this.clicked_zone = this.is_zoomed ? d.target : null
                });
        });

        this.load_locations();
        this.load_buildings();
    }

    load_locations() {
        d3.json(this.locations_file).then(data => {
            data = Object.entries(data);
            this.layer_2.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", d => this.projection(d[1])[0])
                .attr("cy", d => this.projection(d[1])[1])
                .attr("r", 2)
                .attr("fill", "black")
                .style("pointer-events", "none");

            this.layer_2.selectAll("text")
                .data(data)
                .enter()
                .append("text")
                .attr("x", d => this.projection(d[1])[0])
                .attr("y", d => this.projection(d[1])[1])
                .attr("dy", -3)
                .text(d => d[0])
                .style("font-size", "6px")
                .style("text-anchor", "middle")
                .style("pointer-events", "none")
                .style("font-family", "sans-serif")
        });
    }

    load_buildings() {
        d3.json('data/buildings.geojson').then(data => {
            this.layer_3.selectAll(".building")
                .data(data.features)
                .enter()
                .append("path")
                .attr("class", "building")
                .attr("d", this.path_generator)
                .attr("fill", `rgba(0, 0, 0, ${DEFAULT_OPACITY})`)
                .style("stroke", `rgba(0, 0, 0, ${DEFAULT_OPACITY})`) // rgba(250, 244, 221, ${DEFAULT_OPACITY})
                .style("stroke-width", 0.2)
                .style("pointer-events", "none");
        });
    }

    onMouseOverZone(zone) {
        if (this.is_zoomed) { return }

        const population = zone.__data__.properties.population

        // Get the value of the select
        const select = document.getElementById("selection_option");
        const value = select.value;
        let info: string = "";
        if (value !== "no_selection") {
            let jobSelect = zone.__data__.properties.jobs
            let originsSelect = zone.__data__.properties.origins
            info = '0';
            // Check if the value is in either dictionary
            if (value in jobSelect) {
                info = jobSelect[value]
            } else if (value in originsSelect) {
                info = originsSelect[value]
            }
            info = `<br>${NODE_ID_TO_NAME(value)}: ${info}<br>Proportion: ${Math.round((info / population) * 100)}%`
        }


        // Show tooltip
        const tooltip = d3.select(`#${TOOLTIP_ELEMENT_ID}`);
        tooltip
            .style("visibility", "visible");
        console.log(zone)
        tooltip.html(`<b>${NODE_ID_TO_NAME(this.getZoneTitle(zone))}</b><br>Population: ${population}${info}`);

        // Save current fill color in data-old-color attribute
        const old_color = d3.select(zone).attr("fill")
        d3.select(zone).attr("data-old-color", old_color)
        // Get the components of the fill color
        const rgb = old_color.replace(/[^\d,]/g, '').split(',')
        // Make the color lighter by a factor of 1.5
        const new_color = `rgb(${rgb[0] * 1.25}, ${rgb[1] * 1.25}, ${rgb[2] * 1.25})`


        this.fadeToColor(zone, new_color)
    }

    onMouseOutZone(zone) {
        if (this.is_zoomed) { return }

        // Hide tooltip
        const tooltip = d3.select(`#${TOOLTIP_ELEMENT_ID}`);
        tooltip.style("visibility", "hidden");

        // Restore old fill color
        const old_color = d3.select(zone).attr("data-old-color")

        this.fadeToColor(zone, old_color)
        this.removeZoneTitle()
    }

    fadeToColor(zone, color) {
        if (this.is_zoomed) { return }

        d3.select(zone)
            .attr("fill", color)
    }

    getZoneCenter(zone, project, return_borders) {
        const node = d3.select(zone).node()
        const bbox = node.getBBox()
        let center = [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2]
        if (!project) {
            center = this.projection.invert(center) // invert projection
        }

        return [center, return_borders ? this.getZoneBorders(zone, project) : null]
    }

    getZoneBorders(zone, project) {
        const node = d3.select(zone).node()
        const bbox = node.getBBox()
        let bottom_left = [bbox.x, bbox.y + bbox.height]
        let bottom_right = [bbox.x + bbox.width, bbox.y + bbox.height]
        let top_left = [bbox.x, bbox.y]
        let top_right = [bbox.x + bbox.width, bbox.y]

        if (!project) {
            bottom_left = this.projection.invert(bottom_left)
            bottom_right = this.projection.invert(bottom_right)
            top_left = this.projection.invert(top_left)
            top_right = this.projection.invert(top_right)
        }

        return [bottom_left, bottom_right, top_left, top_right]
    }

    getZoneTitle(zone) {
        let zone_obj = zone
        if (zone_obj.nodeName == "path") {
            zone_obj = d3.select(zone).data()[0]
        }

        let zone_title = zone_obj.properties.name
        if (zone_title == null || zone_title == "" || zone_title == "nan") {
            zone_title = zone_obj.properties.class
        }

        zone_title = decodeURIComponent(escape(zone_title))
        zone_title = zone_title.split(" ")[0]
        zone_title = zone_title.replace(",", "")

        return zone_title
    }

    addZoneTitle(zone, lat, long) {
        let zone_title = this.getZoneTitle(zone)
        this.layer_2.append("text")
            .attr("x", this.projection([lat, long])[0])
            .attr("y", this.projection([lat, long])[1])
            .attr("text-anchor", "middle")
            .attr("id", "zone_name")
            .text(NODE_ID_TO_NAME(zone_title))
            .attr("font-family", "sans-serif")
            .attr("font-size", "10px")
            .attr("fill", "black")
            .style("pointer-events", "none")
    }

    removeZoneTitle() {
        d3.select("#zone_name").remove()
    }

    zoomOnZone(zone) {
        this.selectedZone = zone;
        const result = this.getZoneCenter(zone, true, true)
        const center = result[0]
        const bottom_left = result[1][0]
        const bottom_right = result[1][1]
        const top_left = result[1][2]

        // Select MAP_BARPLOT_TITLE_ID and change the text
        d3.select(`#${MAP_BARPLOT_TITLE_ID}`)
            .transition()
            .duration(500)
            .text(`Distributions pour ${NODE_ID_TO_NAME(this.getZoneTitle(zone))}`)

        let zone_width = Math.abs(bottom_right[0] - bottom_left[0])
        zone_width = Math.max(zone_width, this.min_zoom_dimension)
        let zone_height = Math.abs(top_left[1] - bottom_left[1])
        zone_height = Math.max(zone_height, this.min_zoom_dimension)

        const scale_factor = Math.min(this.svg_width / zone_width, this.svg_height / zone_height) * 0.7

        const translate_x = this.svg_width / 2 - center[0] * scale_factor
        const translate_y = this.svg_height / 2 - center[1] * scale_factor

        const transform = d3.zoomIdentity
            .translate(translate_x, translate_y)
            .scale(scale_factor)

        this.svg.transition()
            .duration(750)
            .call(this.zoom.transform, transform)

        // Get the element currently selected in the job_select dropdown
        const selected = document.getElementById("selection_option")
        const selectedOption = selected.options[selected.selectedIndex].value

        // zone.__data__.properties.jobs json into {id:..., value:...}
        let jobSelect = zone.__data__.properties.jobs
        this.selectedJobsData = Object.keys(jobSelect).map(function (key) {
            return { id: key, value: jobSelect[key] };
        });
        this.mapBarPlotJobs.drawBarPlot(this.selectedJobsData, selectedOption);

        // zone.__data__.properties.origins json into {id:..., value:...}
        let originsSelect = zone.__data__.properties.origins
        this.selectedOriginsData = Object.keys(originsSelect).map(function (key) {
            return { id: key, value: originsSelect[key] };
        });
        this.mapBarPlotOrigins.drawBarPlot(this.selectedOriginsData, selectedOption);
    }

    zoomOut() {
        this.svg.transition()
            .duration(750)
            .call(this.zoom.transform, d3.zoomIdentity)
    }

    resetZone(zone) {
        // Restore old fill color
        const old_color = d3.select(zone).attr("data-old-color")

        this.fadeToColor(zone, old_color)
        this.removeZoneTitle()
    }
}

export class MapBarPlot {
    private width: number;
    private height: number;
    private barPlotElementId: string = MAP_BARPLOT_JOBS_ELEMENT_ID;
    private title: string = "Jobs";

    private svg: any;

    constructor(barPlotElementId: string, title: string) {
        this.barPlotElementId = barPlotElementId;
        this.title = title;
        this.initDimensions();
        this.initColor();
    }

    /**
     * Initialize the dimensions of the plot.
     * @returns {void}
     */
    private initDimensions(): void {
        const parentElement = document.getElementById(this.barPlotElementId);
        if (parentElement) {
            const dimensions = Math.min(parentElement.clientWidth, parentElement.clientHeight);
            this.width = parentElement.clientWidth;
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
    public drawBarPlot(data: any[], selectedOption: string): void {
        console.log(data);
        // Define margins
        const margin = { top: 10, right: 30, bottom: 100, left: 50 },
            width = this.width - margin.left - margin.right,
            height = this.height - margin.top - margin.bottom;

        // Create SVG if it doesn't exist
        let svg = d3.select(`#${this.barPlotElementId}`).select("svg");
        let group: any;

        if (svg.empty()) {
            svg = d3.select(`#${this.barPlotElementId}`)
                .append("svg")
                .attr("id", `${this.barPlotElementId}-svg`)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            group = svg
                .append("g")
                .attr("class", "bars");

            // Add title to the plot
            svg
                .append("text")
                .attr("x", (width / 2))
                .attr("y", 20)
                .attr("text-anchor", "middle")
                .style("font-size", "1em")
                .attr("fill", "#FAF4DD")
                .text(this.title);
        } else {
            group = svg.select(".bars");
        }

        // Sort data by value
        data.sort((a, b) => d3.descending(a.value, b.value));
        // Remove the "not_lausanne" from the data
        data = data.filter(d => d.id !== "not_lausanne");

        // X axis
        const x = d3
            .scaleBand()
            .range([0, width])
            .domain(data.map(d => NODE_ID_TO_NAME(d.id)))
            .padding(0.2);

        // Y axis
        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([height, 0]);

        // Handle x-axis: create if it doesn't exist, update otherwise
        let xAxis = svg.select(".x-axis");
        if (xAxis.empty()) {
            xAxis = svg
                .append("g")
                .attr("class", "x-axis")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x).tickFormat(d => d))
                .attr("color", "#FAF4DD")
                .selectAll("text")
                .style("fill", "#FAF4DD")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)")
                // for the selected option, we want to highlight the text by making it bold and underlined
                // Reset all text to normal
                .style("font-weight", "normal")
                .style("text-decoration", "none")
                .filter(d => d === selectedOption)
                .style("font-weight", "bold")
                .style("text-decoration", "underline");
        } else {
            xAxis
                .transition()
                .duration(BAR_PLOT_TRANSITION_DURATION)
                .call(d3.axisBottom(x).tickFormat(d => d))
                .attr("color", "#FAF4DD")
                .selectAll("text")
                .style("fill", "#FAF4DD")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)")
                .style("font-weight", "normal")
                .style("text-decoration", "none")
                .filter(d => d === selectedOption)
                .style("font-weight", "bold")
                .style("text-decoration", "underline");
        }

        // Handle y-axis: create if it doesn't exist, update otherwise
        let yAxis = svg.select(".y-axis");
        if (yAxis.empty()) {
            yAxis = svg
                .append("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(y))
                .attr("color", "#FAF4DD")
                .selectAll("text")
                .style("fill", "#FAF4DD");
        } else {
            yAxis.transition()
                .duration(BAR_PLOT_TRANSITION_DURATION)
                .call(d3.axisLeft(y))
                .attr("color", "#FAF4DD")
                .selectAll("text")
                .style("fill", "#FAF4DD");
        }

        // Bars
        const bars = group
            .selectAll(`.${this.barPlotElementId}-bar`)
            .data(data, (d: any) => NODE_ID_TO_NAME(d.id));

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
            .attr("x", (d: any) => x(NODE_ID_TO_NAME(d.id)))
            .attr("width", x.bandwidth())
            .attr("y", (d: any) => y(d.value))
            .attr("height", (d: any) => height - y(d.value))
            // If the selected option is the current one, we want to highlight the bar by putting a border around it
            .attr("stroke", (d: any) => d.id === selectedOption ? "white" : "none")
            .attr("stroke-width", (d: any) => d.id === selectedOption ? "2px" : "0px")
            // We also chagne the opacity of the other bars
            .attr("opacity", (d: any) => {
                if (selectedOption === "no_selection" || selectedOption === "not_lausanne") return 1;
                return d.id === selectedOption ? 1 : 0.6
            });

        // Enter selection
        const barsEnter = bars
            .enter()
            .append("rect")
            .attr("class", `${this.barPlotElementId}-bar`)
            .attr("x", (d: any) => x(NODE_ID_TO_NAME(d.id)))
            .attr("width", x.bandwidth())
            .attr("y", y(0))
            .attr("height", 0)
            .attr("fill", (d: any) => this.color(d.id));

        barsEnter
            .transition()
            .duration(BAR_PLOT_TRANSITION_DURATION)
            .attr("height", (d: any) => height - y(d.value))
            .attr("y", (d: any) => y(d.value))
            // If the selected option is the current one, we want to highlight the bar by putting a border around it
            .attr("stroke", (d: any) => d.id === selectedOption ? "white" : "none")
            .attr("stroke-width", (d: any) => d.id === selectedOption ? "2px" : "0px")
            // We also chagne the opacity of the other bars
            .attr("opacity", (d: any) => {
                if (selectedOption === "no_selection" || selectedOption === "not_lausanne") return 1;
                return d.id === selectedOption ? 1 : 0.6
            });
    }
}
