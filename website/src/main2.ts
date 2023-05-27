import { CirclePacking } from './CirclePacking.ts';
import { DivisionsMap } from './map.ts';
import { SankeyBarPlot, SankeyChart } from './SankeyDiagram.ts';
import { StatsPlot } from './StatsPlot.ts';
// import { ViolinPlot } from './ViolinPlot.ts';
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

    // Create stats plot
    const statsPlot = new StatsPlot();

    // Checkboxes event listeners
    const STATS_CHECKBOXES_ELEMENT_ID = 'stats-checkboxes';
    const checkboxes: any = document.querySelector(`#${STATS_CHECKBOXES_ELEMENT_ID}`);
    // GET .form-check checkboxes
    const inputs = checkboxes.querySelectorAll('input');
    inputs.forEach((input: any) => {
        input.addEventListener('change', () => {
            const checked = Array.from(inputs).filter((input: any) => input.checked);
            const features = checked.map((input: any) => input.value);
            // Sort features alphabetically
            features.sort().reverse();
            statsPlot.updatePlot(features);

            // Block every checkboxes
            inputs.forEach((input: any) => {
                input.disabled = true;
            });

            // Enable checked checkboxes after 1s
            setTimeout(() => {
                inputs.forEach((input: any) => {
                    input.disabled = false;
                });
            }, 800);
        });
    });

    // // Create violin plot
    // const violinPlot = new ViolinPlot();

    // // Checkbox event listeners
    // const VIOLIN_CHECKBOXES_ELEMENT_ID = 'violin-checkboxes';
    // const violinCheckboxes: any = document.querySelector(`#${VIOLIN_CHECKBOXES_ELEMENT_ID}`);
    // // GET .form-check checkboxes
    // const violinInput = violinCheckboxes.querySelector('input');
    // violinInput.addEventListener('change', () => {
    //     const checked = violinInput.checked;
    //     if (checked) {
    //         violinPlot.updatePlot('assigned_divisions');
    //     } else {
    //         violinPlot.updatePlot('divisions');
    //     }
    // });
});