//@ts-nocheck
import * as d3 from "d3";

const SELECT_JOB = "select_job";
const CHECK_PROPORTION = "check_proportion";
const MAP_BARPLOT_ELEMENT_ID = 'bar';
const MAP_BARPLOT_SVG_ELEMENT_ID = 'bar-svg';
const BAR_PLOT_TRANSITION_DURATION = 500;
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

    return map[id] || '#ffffff';
};

const JOBS_SCALE_DOMAINS = {
    'no_job': { 'min': 0, 'max': 1 },
    'administration': { 'min': 1, 'max': 17, 'color': "blue" },
    'agricole': { 'min': 3, 'max': 122, 'color': "#00A59B" },
    'artisanat': { 'min': 2, 'max': 93, 'color': "#6F2282" },
    'commerce': { 'min': 6, 'max': 44, 'color': "#E84E10" },
    'construction': { 'min': 1, 'max': 39, 'color': "#FCBB00" },
    'rente': { 'min': 5, 'max': 140, 'color': "#143A85" },
    'service': { 'min': 1, 'max': 77, 'color': "#00973B" }
}

export class DivisionsMap {
    constructor(
        map_file,
        locations_file,
        mapBarPlot,
        scale = 700000,
        center = [6.635, 46.525],
        min_zoom_dimension = 100,
        default_zone_color = "rgb(128, 128, 128)",
    ) {
        this.map_file = map_file;
        this.locations_file = locations_file;
        this.mapBarPlot = mapBarPlot;

        // Basic render settings
        this.scale = scale;
        this.center = center;
        this.min_zoom_dimension = min_zoom_dimension;
        this.default_zone_color = default_zone_color;

        // State variables
        this.is_zoomed = false;
        this.clicked_zone = null;

        this.initDimensions();

        // Initialize map
        this.svg = this.init_svg();
        this.layer_1 = this.init_g();
        this.layer_2 = this.init_g();
        this.projection = this.init_projection();
        this.zoom = this.init_zoom();

        let selectedJob = 'no_job';
        let selectedProportion = false;

        const edgesOpacityCheckbox = document.getElementById(CHECK_PROPORTION);
        edgesOpacityCheckbox.addEventListener('change', (event) => {
            selectedProportion = event.target.checked;
            // Get the currently selected job option
            this.handleSelectJob(selectedJob, selectedProportion);
        });

        // Add event listeners
        const selectLayoutElement = document.getElementById(SELECT_JOB);
        selectLayoutElement.addEventListener('change', (event) => {
            selectedJob = event.target.value;
            this.handleSelectJob(event.target.value, selectedProportion);
        });

    }

    handleSelectJob(selectedJob, selectedProportion) {
        console.log(selectedJob, selectedProportion);
        // Here, you can update the color scale domain based on the selected job
        // For example, if the selected job is "construction":
        const selected_domain = JOBS_SCALE_DOMAINS[selectedJob];
        const colorScale = d3.scaleLinear()
            .domain([
                selectedProportion ? 0 : selected_domain.min,
                selectedProportion ? 1 : selected_domain.max])
            .range(["white", selected_domain.color]);

        // Update the fill color of the map zones based on the selected job
        this.layer_1
            .selectAll(".zone")
            // Add a linear transition to the fill color
            .transition()
            .duration(500)
            .attr("fill", d => {
                if (!(selectedJob in d.properties.jobs) || selectedJob === "no_job") {
                    return this.default_zone_color;
                }
                return colorScale(d.properties.jobs[selectedJob] / (selectedProportion ? d.properties.population : 1))
            });
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
            .on("mouseover", function() {
                // disable fullPage.js scrolling when mouse is over any SVG
                $.fn.fullpage.setAllowScrolling(false);
            })
            .on("mouseout", function() {
                // re-enable fullPage.js scrolling when mouse leaves any SVG
                $.fn.fullpage.setAllowScrolling(true);
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

    init_zoom() {
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", ({ transform }) => {
                this.layer_1.attr("transform", transform);
                this.layer_2.attr("transform", transform);
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

        this.load_locations()
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
                .style("fill", "black")
                .style("text-anchor", "middle")
                .style("pointer-events", "none")
                .style("font-family", "sans-serif");
        });
    }

    unload_data() {
        this.layer_1.selectAll("*").remove();
        this.layer_2.selectAll("*").remove();
    }

    update_data(new_map_file) {
        this.map_file = new_map_file;
        this.layer_1.selectAll("*").remove();
        this.layer_2.selectAll("*").remove();
        this.load_data();
    }

    onMouseOverZone(zone) {
        if (this.is_zoomed) { return }

        // Save current fill color in data-old-color attribute
        const old_color = d3.select(zone).attr("fill")
        d3.select(zone).attr("data-old-color", old_color)
        // Get the components of the fill color
        const rgb = old_color.replace(/[^\d,]/g, '').split(',')
        // Make the color lighter by a factor of 1.5
        const new_color = `rgb(${rgb[0] * 1.25}, ${rgb[1] * 1.25}, ${rgb[2] * 1.25})`


        this.fadeToColor(zone, new_color)

        const result = this.getZoneCenter(zone)
        const zone_center = result[0]
        this.addZoneTitle(zone, zone_center[0], zone_center[1])
    }

    onMouseOutZone(zone) {
        if (this.is_zoomed) { return }

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
            .text(zone_title)
            .attr("font-family", "sans-serif")
            .attr("font-size", "10px")
            .attr("fill", "black")
            .style("pointer-events", "none")
    }

    removeZoneTitle() {
        d3.select("#zone_name").remove()
    }

    zoomOnZone(zone) {
        const result = this.getZoneCenter(zone, true, true)
        const center = result[0]
        const bottom_left = result[1][0]
        const bottom_right = result[1][1]
        const top_left = result[1][2]

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

        // zone.__data__.properties.jobs json into {id:..., value:...}
        let data = zone.__data__.properties.jobs
        data = Object.keys(data).map(function (key) {
            return { id: key, value: data[key] };
        });
        this.mapBarPlot.drawBarPlot(data);
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
        const parentElement = document.getElementById(MAP_BARPLOT_ELEMENT_ID);
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
        let svg = d3.select(`#${MAP_BARPLOT_ELEMENT_ID}`).select("svg");
        let group: any;

        if (svg.empty()) {
            svg = d3.select(`#${MAP_BARPLOT_ELEMENT_ID}`)
                .append("svg")
                .attr("id", MAP_BARPLOT_SVG_ELEMENT_ID)
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
                .call(d3.axisBottom(x).tickFormat(d => d))
                .attr("color", "white")
                .selectAll("text")
                .style("fill", "white");
        } else {
            xAxis.transition()
                .duration(BAR_PLOT_TRANSITION_DURATION)
                .call(d3.axisBottom(x).tickFormat(d => d))
                .attr("color", "white")
                .selectAll("text")
                .style("fill", "white");
        }

        // Handle y-axis: create if it doesn't exist, update otherwise
        let yAxis = svg.select(".y-axis");
        if (yAxis.empty()) {
            yAxis = svg.append("g")
                .attr("class", "y-axis")
                .call(d3.axisLeft(y))
                .attr("color", "white")
                .selectAll("text")
                .style("fill", "white");
        } else {
            yAxis.transition()
                .duration(BAR_PLOT_TRANSITION_DURATION)
                .call(d3.axisLeft(y))
                .attr("color", "white")
                .selectAll("text")
                .style("fill", "white");
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
