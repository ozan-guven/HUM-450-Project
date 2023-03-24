function load_map(
    data_file,
    width = 800,
    height = 600,
    scale = 200000,
    center = [6.65, 46.55],
    min_zoom_dimension = 50,
    default_zone_color = "grey",
) {
    // Global state variables
    let is_zoomed = false
    let clicked_zone = null

    // Define projection
    const projection = d3.geoMercator()
        .center(center)
        .scale(scale)
        .translate([width / 2, height / 2])

    // Define path generator
    const path_generator = d3.geoPath().projection(projection);

    // Create SVG
    const svg = d3.select("svg")
        .attr("width", 800)
        .attr("height", 600)

    const g = svg.append("g")

    // Load data
    d3.json(data_file).then(function(data) {

        g.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("fill", default_zone_color)
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .style("stroke", "white")
            .style("stroke-width", 0.2) 

        // On hover of a country, change the color
        .on("mouseover", function(d) {
            onMouseOverZone(this)
        })
        .on("mouseout", function(d) {
            onMouseOutZone(this)
        })
        .on("click", function(d) {
            zoom.filter(() => !is_zoomed)
            if (is_zoomed) {
                removeZoneTitle()
                zoomOut()
            } else {
                const result = getZoneCenter(this)
                const zone_center = result[0]
                addZoneTitle(this, zone_center[0], zone_center[1])
                zoomOnZone(this)
            }
            is_zoomed = !is_zoomed
            if (!is_zoomed) {
                resetZone(clicked_zone)
            }
            clicked_zone = is_zoomed ? this : null
        })
    });

    // Define zoom and drag behavior
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", function({transform}) {
            g.attr("transform", transform);
        });

    svg.call(zoom);

    function onMouseOverZone(zone) {
        if (is_zoomed) { return }

        fadeToColor(zone, "red")
    }

    function onMouseOutZone(zone) {
        if (is_zoomed) { return }

        fadeToColor(zone, default_zone_color)
    }

    function fadeToColor(zone, color) {
        if (is_zoomed) { return }

        d3.select(zone)
            .transition()
            .duration(200)
            .attr("fill", color)
    }

    function getZoneCenter(zone, project = false, return_borders = false) {
        const zone_coordinates_arrays = d3.select(zone).data()[0].geometry.coordinates[0]
        const most_bottoms = []
        const most_lefts = []
        const most_rights = []
        const most_tops = []

        zone_coordinates_arrays.forEach(function(coordinates_array) {
            most_bottoms.push(d3.min(coordinates_array, function(d) { return d[1] }))
            most_lefts.push(d3.min(coordinates_array, function(d) { return d[0] }))
            most_rights.push(d3.max(coordinates_array, function(d) { return d[0] }))
            most_tops.push(d3.max(coordinates_array, function(d) { return d[1] }))
        })

        const most_bottom = d3.min(most_bottoms)
        const most_left = d3.min(most_lefts)
        const most_right = d3.max(most_rights)
        const most_top = d3.max(most_tops)

        // Place points at locations
        let bottom_left = [most_left, most_bottom]
        let bottom_right = [most_right, most_bottom]
        let top_left = [most_left, most_top]
        if (project) {
            bottom_left = projection(bottom_left)
            bottom_right = projection(bottom_right)
            top_left = projection(top_left)
        }

        const center = [(bottom_left[0] + bottom_right[0]) / 2, (bottom_left[1] + top_left[1]) / 2]

        return [center, return_borders ? [bottom_left, bottom_right, top_left] : null]
    }

    function addZoneTitle(zone, lat, long) {
        let zone_title = d3.select(zone).data()[0].properties.use
        if (zone_title == null || zone_title == "" || zone_title == "nan") {
            zone_title = d3.select(zone).data()[0].properties.class
        }
        g.append("text")
            .attr("x", projection([lat, long])[0])
            .attr("y", projection([lat, long])[1])
            .attr("text-anchor", "middle")
            .attr("id", "zone_name")
            .text(zone_title)
            .attr("font-family", "sans-serif")
            .attr("font-size", "10px")
            .attr("fill", "black")
            .style("pointer-events", "none")
    }

    function removeZoneTitle() {
        d3.select("#zone_name").remove()
    }

    function zoomOnZone(zone) {
        const result = getZoneCenter(zone, project = true, return_borders = true)
        const center = result[0]
        const bottom_left = result[1][0]
        const bottom_right = result[1][1]
        const top_left = result[1][2]

        let zone_width = Math.abs(bottom_right[0] - bottom_left[0])
        zone_width = Math.max(zone_width, min_zoom_dimension)
        let zone_height = Math.abs(top_left[1] - bottom_left[1])
        zone_height = Math.max(zone_height, min_zoom_dimension)

        const scale_factor = Math.min(width / zone_width, height / zone_height) * 0.7

        const translate_x = width / 2 - center[0] * scale_factor
        const translate_y = height / 2 - center[1] * scale_factor

        const transform = d3.zoomIdentity
            .translate(translate_x, translate_y)
            .scale(scale_factor)

        svg.transition()
            .duration(750)
            .call(zoom.transform, transform)
    }

    function zoomOut() {
        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity)
    }

    function resetZone(zone) {
        fadeToColor(zone, default_zone_color)
        removeZoneTitle()
    }
}

// run load_network() when page is loaded
window.onload = function() {
    load_map(data_file="data/berney.geojson")
}
