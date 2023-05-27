import * as d3 from 'd3';

const STATS_ELEMENT_ID = 'stats-plot';
const STATS_DATA_PATH_PREFIX = 'data/stats/';
const STATS_DATA_PATH_SUFFIX = '.json';

const MARGINS = {top: 20, right: 20, bottom: 50, left: 60};

const DEFAULT_STATS_FEATURES: string[] = [];

const HISTOGRAM_OPACITY = 0.5;
const PERMUTED_HISTOGRAM_COLOR = '#777777';
const NON_PERMUTED_HISTOGRAM_COLOR = '#9e2846';

export class StatsPlot {
    private width!: number;
    private height!: number;

    private statsFeatures!: string[];
    private data!: any;

    private svg!: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

    constructor() {
        this.statsFeatures = DEFAULT_STATS_FEATURES
        this.loadData().then(() => {
            this.initDimensions();
            this.initSvgElements();
            this.drawPlot();
        });
    }

    public updatePlot(features: string[]): void {
        this.statsFeatures = features;
        this.loadData().then(() => {
            this.drawPlot();
        });
    }

    /**
     * Initializes the dimensions of the circle packing visualization.
     * @returns {void}
     */
    private initDimensions(): void {
        const parentElement = document.getElementById(STATS_ELEMENT_ID);
        if (parentElement) {
            this.width = parentElement.clientWidth;
            this.height = parentElement.clientHeight;
        }
    }

    private async loadData(): Promise<void> {
        return new Promise((resolve) => {
            const features = this.statsFeatures.sort().reverse().join('_');

            d3.json(`${STATS_DATA_PATH_PREFIX}stats_${features}${STATS_DATA_PATH_SUFFIX}`).then((data) => {
                this.data = data;
                resolve();
            });
        });
    }

    private initSvgElements(): void {
        const parentElement = d3.select(`#${STATS_ELEMENT_ID}`);

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
        const xScale = d3.scaleLinear()
            .domain(d3.extent(this.data.xs) as unknown as [number, number])
            .range([0, this.width - MARGINS.left - MARGINS.right]);
    
        const yScale = d3.scaleLinear()
            .domain([0, Math.max(...this.data.non_permuted_ys, ...this.data.permuted_ys)])
            .range([this.height - MARGINS.top - MARGINS.bottom, 0]);
    
        const xAxis: any = d3.axisBottom(xScale);
        const yAxis: any = d3.axisLeft(yScale);
    
        this.svg.select(".x.axis")
            .attr("transform", `translate(0, ${this.height - MARGINS.top - MARGINS.bottom})`)
            .call(xAxis);
    
        this.svg.select(".y.axis")
            .transition()
            .duration(750)
            .call(yAxis);
    
        const barsData = [];
        this.data.xs.forEach((x: number, i: number) => {
            if (this.data.non_permuted_ys[i] !== 0) {
                barsData.push({
                    x,
                    y: this.data.non_permuted_ys[i],
                    type: 'non_permuted',
                    key: `non_permuted-${i}`,
                });
            }
            if (this.data.permuted_ys[i] !== 0) {
                barsData.push({
                    x,
                    y: this.data.permuted_ys[i],
                    type: 'permuted',
                    key: `permuted-${i}`,
                });
            }
        });
    
        const bars = this.svg.selectAll('.bar')
            .data(barsData, (d: any) => d.key); 
    
        // Exit old elements
        bars.exit()
            .each(function() {
                d3.select(this).selectAll('rect')
                    .transition()
                    .duration(750)
                    .attr('y', yScale(0))
                    .attr('height', 0);
            })
            .transition()
            .delay(750)
            .remove();
    
        // Update existing elements
        bars.select('rect.non_permuted')
            .transition()
            .duration(750)
            .attr('y', (d: any) => yScale(d.y))
            .attr('height', (d: any) => this.height - MARGINS.top - MARGINS.bottom - yScale(d.y))
            .attr('fill', NON_PERMUTED_HISTOGRAM_COLOR);
            
        bars.select('rect.permuted')
            .transition()
            .duration(750)
            .attr('y', (d: any) => yScale(d.y))
            .attr('height', (d: any) => this.height - MARGINS.top - MARGINS.bottom - yScale(d.y))
            .attr('fill', PERMUTED_HISTOGRAM_COLOR);
    
        // Enter new elements
        const newBars = bars.enter().append('g')
            .attr('class', 'bar');
    
        newBars.filter((d: any) => d.type === 'non_permuted').append('rect')
            .attr('class', 'non_permuted')
            .attr('x', (d: any) => xScale(d.x))
            .attr('width', this.width / this.data.xs.length - 1)
            .attr('y', yScale(0))
            .attr('height', 0)
            .transition()
            .duration(750)
            .attr('y', (d: any) => yScale(d.y))
            .attr('height', (d: any) => this.height - MARGINS.top - MARGINS.bottom - yScale(d.y))
            .attr('fill', NON_PERMUTED_HISTOGRAM_COLOR)
            .attr('opacity', HISTOGRAM_OPACITY);
    
        newBars.filter((d: any) => d.type === 'permuted').append('rect')
            .attr('class', 'permuted')
            .attr('x', (d: any) => xScale(d.x))
            .attr('width', this.width / this.data.xs.length - 1)
            .attr('y', yScale(0))
            .attr('height', 0)
            .transition()
            .duration(750)
            .attr('y', (d: any) => yScale(d.y))
            .attr('height', (d: any) => this.height - MARGINS.top - MARGINS.bottom - yScale(d.y))
            .attr('fill', PERMUTED_HISTOGRAM_COLOR)
            .attr('opacity', HISTOGRAM_OPACITY);
    }
}
