import * as d3 from 'd3';

const VIOLIN_ELEMENT_ID = 'violin-plot';
const VIOLIN_DATA_PATH_PREFIX = 'data/violin/';
const VIOLIN_DATA_PATH_SUFFIX = '.json';

const DEFAULT_VIOLIN_FEATURE = 'divisions'

const MARGINS = {top: 20, right: 20, bottom: 50, left: 60};
const DEFAULT_YEAR_MARGIN: number = 10;

export class ViolinPlot {
    private width!: number;
    private height!: number;

    private feature!: string;
    private data!: any;

    private svg!: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

    constructor() {
        this.feature = DEFAULT_VIOLIN_FEATURE;
        this.loadData().then(() => {
            this.initDimensions();
            this.initSvgElements();
            this.drawPlot();
        });
    }

    public updatePlot(feature: string): void {
        this.feature = feature;
        this.loadData().then(() => {
            this.drawPlot();
        });
    }

    /**
     * Initializes the dimensions of the circle packing visualization.
     * @returns {void}
     */
    private initDimensions(): void {
        const parentElement = document.getElementById(VIOLIN_ELEMENT_ID);
        if (parentElement) {
            this.width = parentElement.clientWidth;
            this.height = parentElement.clientHeight;
        }
    }

    private async loadData(): Promise<void> {
        return new Promise((resolve) => {
            d3.json(`${VIOLIN_DATA_PATH_PREFIX}violin_${this.feature}${VIOLIN_DATA_PATH_SUFFIX}`).then((data) => {
                this.data = data;
                resolve();
            });
        });
    }

    private initSvgElements(): void {
        const parentElement = d3.select(`#${VIOLIN_ELEMENT_ID}`);

        this.svg = parentElement.append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .append('g')
            .attr('transform', `translate(${MARGINS.left}, ${MARGINS.top})`);

        // Create X and Y axis groups
        this.svg.append("g")
        .attr("class", "x axis");

        this.svg.append("g")
            .attr("class", "y axis");
    }

    public drawPlot(): void {
        let xScale = d3.scaleBand()
            .domain(this.data.map((d: any) => d.group))  // Extract group names for the domain
            .range([0, this.width - MARGINS.left - MARGINS.right])  // width is the total width of your svg or chart area
            .padding(0.1);
    
        const minYScale: any = (d3.min(this.data, (d: any) => d3.min(d.values)) ?? 0) as number - DEFAULT_YEAR_MARGIN;
        const maxYScale: any = (d3.max(this.data, (d: any) => d3.max(d.values)) ?? 0) as number + DEFAULT_YEAR_MARGIN;
        let yScale = d3.scaleLinear()
            .domain([minYScale, maxYScale])  // Input data range
            .range([this.height - MARGINS.top - MARGINS.bottom, 0]);  // height is the total height of your svg or chart area

        const xAxis: any = d3.axisBottom(xScale);
        const yAxis: any = d3.axisLeft(yScale);
    
        this.svg.select(".x.axis")
            .transition()
            .duration(750)
            .attr("transform", `translate(0, ${this.height - MARGINS.top - MARGINS.bottom})`)
            .call(xAxis);
    
        this.svg.select(".y.axis")
            .transition()
            .duration(750)
            .call(yAxis);
    
        // Set up the generator for the KDE
    let kde = kernelDensityEstimator(kernelEpanechnikov(3), yScale.ticks(100));

    // Set up the area generator for the violin shape
    const violinPaths = this.svg.selectAll('.violin')
        .data(this.data, (d: any) => d.group); // Use unique key based on group

    // Exit old violin plots
    violinPaths.exit()
        .transition()
        .duration(750)
        .style('opacity', 0)
        .remove();

    // Enter new violin plots
    violinPaths.enter()
        .append('path')
        .attr('class', 'violin')
        .attr('d', (d: any) => {
            // Compute the kernel density estimation
            let area = d3.area()
                .y((density: any) => yScale(density.value))
                .x0((density: any) => (xScale(d.group) ?? 0) + (xScale.bandwidth() / 2) + (xScale.bandwidth() * density.density * 3))
                .x1((density: any) => (xScale(d.group) ?? 0) + (xScale.bandwidth() / 2) - (xScale.bandwidth() * density.density * 3))
                .curve(d3.curveCatmullRom);

            let kdeData = kde(d.values);
            return area(kdeData);
        })
        .style('fill', '#9e2846')
        .style('opacity', 0)
        .style('stroke', '#250312')
        .style('stroke-width', 1)
        .merge(violinPaths) // Merge enter and update selections
        .transition()
        .duration(750)
        .attr('d', (d: any) => {
            let area = d3.area()
                .y((density: any) => yScale(density.value))
                .x0((density: any) => (xScale(d.group) ?? 0) + (xScale.bandwidth() / 2) + (xScale.bandwidth() * density.density * 3))
                .x1((density: any) => (xScale(d.group) ?? 0) + (xScale.bandwidth() / 2) - (xScale.bandwidth() * density.density * 3))
                .curve(d3.curveCatmullRom);

            let kdeData = kde(d.values);
            return area(kdeData);
        })
        .style('opacity', 0.6);
    
        // KDE function
        function kernelDensityEstimator(kernel: any, X: any) {
            return function(V: any) {
                return X.map(function(x: any) {
                    return {
                        value: x,
                        density: d3.mean(V, function(v: any) { return kernel(x - v); })
                    };
                });
            };
        }
    
        // Epanechnikov Kernel
        function kernelEpanechnikov(k: any) {
            return function(v: any) {
                return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
            };
        }
    }    
}