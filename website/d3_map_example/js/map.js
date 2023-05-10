class LausanneMap {
    constructor(
        map_file,
        scale = 200000,
        center = [6.65, 46.55],
        min_zoom_dimension = 50,
        default_zone_color = "grey",
        zone_colors = {
            "vigne": "#9BA17B",
            "bois": "#61764B",
            "buissons": "#61764B",
            "pré": "#FFD56F",
            "pâturage": "#FFD56F", 
            "champ": "#FFD56F",
            "road_network": "#000000",
            "water": "#6096B4",
            "maison": "#CD5888",
            "cour": "#CD5888",
            "jardin": "#CD5888",
        }
    ) {
        this.map_file = map_file;

        // Basic render settings
        this.scale = scale;
        this.center = center;
        this.min_zoom_dimension = min_zoom_dimension;
        this.default_zone_color = default_zone_color;
        this.zone_colors = zone_colors;
        
        // State variables
        this.is_zoomed = false;
        this.clicked_zone = null;

        // Initialize map
        this.svg = this.init_svg();
        this.g = this.init_g();
        this.projection = this.init_projection();
        this.zoom = this.init_zoom();
    }

    init_svg() {
        const svg = d3.select("svg");
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
        .on("zoom", ({transform}) => {
            this.g.attr("transform", transform);
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
            this.g.selectAll("path")
                .data(data.features)
                .enter()
                .append("path")
                .attr("fill", this.default_zone_color)
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
    }

    color_zones() {
        this.g.selectAll("path")
            .attr("fill", d => {
                let zone_type = this.getZoneTitle(d)
                if (zone_type in this.zone_colors) {
                    return this.zone_colors[zone_type]
                } else {
                    return this.default_zone_color
                }
            })
    }

    update_data(new_map_file) {
        this.map_file = new_map_file;
        this.g.selectAll("*").remove();
        this.load_data();
    }

    onMouseOverZone(zone) {
        if (this.is_zoomed) { return }

        this.fadeToColor(zone, "red")

        const result = this.getZoneCenter(zone)
        const zone_center = result[0]
        this.addZoneTitle(zone, zone_center[0], zone_center[1])
    }

    onMouseOutZone(zone) {
        if (this.is_zoomed) { return }

        this.fadeToColor(zone, this.default_zone_color)
        this.removeZoneTitle()
    }

    fadeToColor(zone, color) {
        if (this.is_zoomed) { return }

        d3.select(zone)
            .transition()
            .duration(200)
            .attr("fill", color)
    }

    getZoneCenter(zone, project, return_borders) {
        const node = d3.select(zone).node()
        const bbox = node.getBBox()
        let center2 = [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2]
        if(!project) {
            center2 = this.projection.invert(center2) // invert projection
        }

        return [center2, return_borders ? this.getZoneBorders(zone) : null]
    }

    getZoneBorders(zone) {
        const node = d3.select(zone).node()
        const bbox = node.getBBox()
        const bottom_left = this.projection.invert([bbox.x, bbox.y + bbox.height])
        const bottom_right = this.projection.invert([bbox.x + bbox.width, bbox.y + bbox.height])
        const top_left = this.projection.invert([bbox.x, bbox.y])
        const top_right = this.projection.invert([bbox.x + bbox.width, bbox.y])

        return [bottom_left, bottom_right, top_left, top_right]
    }

    getZoneTitle(zone) {
        let zone_obj = zone
        if (zone_obj.nodeName == "path") {
            zone_obj = d3.select(zone).data()[0]
        }

        let zone_title = zone_obj.properties.use
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
        this.g.append("text")
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
    }

    zoomOut() {
        this.svg.transition()
            .duration(750)
            .call(this.zoom.transform, d3.zoomIdentity)
    }

    resetZone(zone) {
        this.fadeToColor(zone, this.default_zone_color)
        this.removeZoneTitle()
    }
}

let map = null

// run load_network() when page is loaded
window.onload = function() {
    map = new LausanneMap(map_file="data/berney.geojson")
    map.load_data()
}

// on space bar press, zoom out
document.onkeydown = function(e) {
    if (e.keyCode == 32) {
        map.color_zones()
    }
}
