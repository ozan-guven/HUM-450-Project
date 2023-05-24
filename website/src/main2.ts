import { CirclePacking } from './CirclePacking.ts';
import { DivisionsMap, MapBarPlot } from './map.ts';
import {SankeyBarPlot, SankeyChart } from './SankeyDiagram.ts';
import './style.css';

document.addEventListener("DOMContentLoaded", () => {
    new CirclePacking();
    //const map = new LausanneMap("./data/berney.geojson")
    //map.load_data()
    const mapBarPlot = new MapBarPlot();
    const map = new DivisionsMap(
        "data/berney_divisions.geojson",
        "data/locations.json",
        mapBarPlot
    );
    map.load_data();

    const sankeyParPlot = new SankeyBarPlot();
    new SankeyChart('data/sankey_ddo.json', sankeyParPlot);

});