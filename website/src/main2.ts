//@ts-nocheck
import { CirclePacking } from './CirclePacking.ts';
import { DivisionsMap } from './map.ts';
import { SankeyBarPlot, SankeyChart } from './SankeyDiagram.ts';
import { StatsPlot } from './StatsPlot.ts';
import fullpage from 'fullpage.js';

import './style.css';
import 'fullpage.js/dist/fullpage.css';

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

    const SCROLL_DURATION = 1000;
    new fullpage('#fullpage', {
        navigation: true,
        navigationTooltips: [
            'Title',
            'Introduction',
            'Concentrique & Historique',
            'Sankey & Société',
            'Cartographie Interactive',
            'Carte',
            'Réseaux Interactifs',
            'Réseaux',
            'Analyse K-Moyennes',
            'Conclusion',
            'Crédits'

        ],
        slidesNavigation: false,
        controlArrows: false,
        verticalCentered: false,
        scrollingSpeed: SCROLL_DURATION,
        scrollOverflow: true,
    });
});