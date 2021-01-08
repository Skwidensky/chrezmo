import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { State } from 'src/app/client/state';
import { DateP } from '../widgets/datepicker.component';
import { Utils } from 'src/app/client/utils'

var axios = require("axios").default;

let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');
let Boost = require('highcharts/modules/boost');
let hist = require('highcharts/modules/histogram-bellcurve');

hist(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);
Boost(Highcharts);

@Component({
    selector: 'wikitopviewedarticleschart',
    templateUrl: './wikitopviewedarticleschart.component.html',
    styleUrls: ['../chart.component.css']
})
export class WikiTopViewdArticlesChartComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() placement: string;
    opts: any;
    dateSub: Subscription;
    date: DateP;
    constructor(private logger: NGXLogger, private state: State) {
        this.logger.info("Constructor: Wiki top-viewed articles chart")
    }
    ngAfterViewInit(): void {
        this.fetchMostViewedArticles();
    }
    ngOnDestroy(): void {
        this.dateSub.unsubscribe();
    }
    ngOnInit(): void {
        // Start the date-range-picker off on today's date
        this.date = { placement: this.placement, year: "2020", month: "01", day: "01"}
        this.dateSub = this.state.datePObs()
            .pipe(filter((date: DateP) => this.placement == date.placement))
            .subscribe((date: DateP) => {
                this.date = date;
                this.fetchMostViewedArticles();
            });
        this.state.sendDateP(this.date);
    }
    private fetchMostViewedArticles(): void {
        new Promise((resolve, reject) => {
            fetch(`https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access/${this.date.year}/${this.date.month}/${this.date.day}`, { method: "GET" })
                .then(response => response.json())
                .then(resolve)
                .catch(reject);
        }).then((result: any) => {
            this.parseMostViewedArticlesMessage(result);
        });
    }
    //#region chart setup
    // Highchart draws messages cached in this.cachedMessages
    private parseMostViewedArticlesMessage(msg: any) {
        this.opts = {
            colors: ['#1e3ee2'],
            chart: {
                type: 'histogram',
                backgroundColor: "#050558"
            },
            boost: {
                enabled: true,
                seriesThreshold: 0,
                useGPUTranslations: true,
                usePreallocated: true
            },
            legend: false,
            title: {
                text: 'Most Viewed Wiki Articles by Day',
                align: "right",
                style: {
                    color: "#ffffff"
                }
            },
            credits: {
                enabled: false
            },
            plotOptions: {
                series: {
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function (this: Highcharts.Point, event: any) {
                                var wikiPage = this.category.replace(" ", "_");
                                window.open("https://en.wikipedia.org/wiki/" + wikiPage, "_blank");
                                // alert(
                                //     this.category + ' clicked\n' +
                                //     'Alt: ' + event.altKey + '\n' +
                                //     'Control: ' + event.ctrlKey + '\n' +
                                //     'Meta: ' + event.metaKey + '\n' +
                                //     'Shift: ' + event.shiftKey
                                // );
                            }
                        }
                    }
                }
            },
            tooltip: {
                formatter: function (this: Highcharts.TooltipFormatterContextObject): string {
                    return this.key.toString().split("_").join(" ") + "<br/>Views: " + Utils.addCommasToNumberStringThousands(this.y.toString());
                }
            },
            series: [],
            xAxis: {
                categories: [],
                labels: {
                    style: {
                        color: "#ffffff"
                    }
                }
            },
            yAxis: {
                title: "Views",
                labels: {
                    style: {
                        color: "#ffffff"
                    }
                }
            }
        }
        if (msg != undefined && msg.items != undefined) {
            // Skip the first two articles because they're always the Main Page and "Special Search"
            var names: string[] = [];
            var views: number[] = [];
            for (let i = 2; i < 50; i++) {
                var article = msg.items[0].articles[i];
                names.push(article.article.split("_").join(" "));
                views.push(article.views);
            }
            this.opts.xAxis.categories = names;
            this.opts.series.push({
                name: "Views",
                data: views
            });
        }
        var container = this.placement == "top" ? "topmvacontainer" : "bottommvacontainer";
        Highcharts.chart(container, this.opts);
    }
    //#endregion chart setup
}