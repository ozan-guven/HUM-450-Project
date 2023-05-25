import { CirclePacking } from './CirclePacking.ts';
import { DivisionsMap } from './map.ts';
import { SankeyBarPlot, SankeyChart } from './SankeyDiagram.ts';
import './style.css';

document.addEventListener("DOMContentLoaded", () => {
    new CirclePacking();
    //const map = new LausanneMap("./data/berney.geojson")
    //map.load_data()
    const map = new DivisionsMap(
        "data/berney_divisions.geojson",
        "data/locations.json",
    );
    map.load_data();

    const sankeyParPlot = new SankeyBarPlot();
    new SankeyChart('data/sankey_sdoj.json', sankeyParPlot);

});