import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { NGXLogger } from 'ngx-logger';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { State } from '../../../state';
import { Article } from '../widgets/chips.component';
import { DateRange } from '../widgets/daterangepicker.component';
import * as $ from 'jquery';

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);

@Component({
  selector: 'wikiviewsperdaychart',
  templateUrl: './wikiviewsperdaychart.component.html',
  styleUrls: ['../chart.component.css']
})
export class WikiViewsPerDayChartComponent implements OnInit, OnDestroy {
  @Input() placement: string;
  opts: any;
  dateRangeSub: Subscription;
  wikiViewsPerDayArticlesSub: Subscription;
  dateRange: DateRange;
  cachedMessages: any[];
  constructor(private logger: NGXLogger, private state: State) {
    this.logger.info("Constructor(): Views-per-day chart")
    this.cachedMessages = [];
  }
  ngOnDestroy(): void {
    this.dateRangeSub.unsubscribe();
    this.wikiViewsPerDayArticlesSub.unsubscribe();
  }
  ngOnInit(): void {
    this.dateRangeSub = this.state.dateRangeObs()
      .pipe(filter((dateRange: DateRange) => this.placement == dateRange.placement))
      .subscribe((dateRange: DateRange) => {
        this.dateRange = dateRange;
        this.fetchViewsPerDay();
      });
    this.wikiViewsPerDayArticlesSub = this.state.wikiViewsPerDayArticlesObs()
      .pipe(filter((articles: Article[]) => {
        if (articles[0] != undefined) {
          return this.placement == articles[0].placement;
        }
        return false;
      }))
      .subscribe((articles: Article[]) => this.fetchViewsPerDay());
  }
  private fetchViewsPerDay(): void {
    if (this.dateRange) {
      this.showLoader();
      // Clear cached messages
      this.cachedMessages = [];
      this.state.wikiViewsPerDayChipsSubj.getValue().forEach((article: Article) => {
        new Promise((resolve, reject) => {
          fetch(`https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia.org/all-access/user/${article.name}/daily/${this.dateRange.start}/${this.dateRange.end}`, { method: "GET" })
            .then(response => response.json())
            .then(resolve)
            .catch(reject);
        }).then((result: any) => {
          // result:
          // access: "all-access" -- agent: "all-agents" -- article: "Cat" -- granularity: "daily"
          // project: "en.wikipedia" -- timestamp: "2020010200" -- views: 7039
          this.cachedMessages.push(result);
        }).then(() => {
          if (this.cachedMessages.length == this.state.wikiViewsPerDayChipsSubj.getValue().length) {
            this.parseWikiViewsPerPageMessage();
          }
        });
      });
    }
  }
  private hideLoader() {
    $("#loading").removeClass("loading-dot");
  }
  private showLoader() {
    $("#loading").addClass("loading-dot")
  }
  //#region chart setup
  // Highchart draws messages cached in this.cachedMessages
  private parseWikiViewsPerPageMessage() {
    let self = this;
    this.opts = {
      colors: ['#af1717', '#a6af17', '#17af46', '#1777af', '#8317af', '#8bd6e2', '#fff038', '#9cff7b'],
      chart: {
        type: 'line',
        zoomType: 'xy',
        backgroundColor: "#050558"
      },
      title: {
        text: 'Wiki Article Views-per-Day',
        align: "right",
        style: {
          color: "#ffffff"
        }
      },
      legend: {
        backgroundColor: "#ffffff"
      },
      credits: {
        enabled: false
      },
      tooltip: {
        formatter: function (this: Highcharts.TooltipFormatterContextObject): string {
          var date = this.x.toString();
          var formattedDate = date.slice(0, 4) + "/" + date.slice(4, 6) + "/" + date.slice(6, 8);
          return Highcharts.dateFormat('%Y %b %e', new Date(formattedDate).getTime()) + ': ' + this.y.toFixed();
        }
      },
      xAxis: {
        type: 'datetime',
        categories: [],
        labels: {
          enabled: false
        }
      },
      yAxis: {
        title: undefined,
        labels: {
          style: {
            color: "#ffffff"
          }
        }
      },
      series: [],
      plotOptions: {
        series: {
          cursor: 'pointer',
          point: {
            events: {
              click: function () {
                // @ts-ignore -- this.series.name and this.category doesn't compile, but they're correct.
                // Get your shit together, Typescript.
                self.state.sendsNewsObj({
                  // Send the NewsObj to the opposite news-panel
                  placement: self.placement == "top" ? "bottom" : "top",
                  // @ts-ignore
                  keywords: [this.series.name.split('_').join(' ')],
                  // @ts-ignore
                  date: this.category
                })
              }
            }
          }          
        }
      }
    }
    this.cachedMessages.forEach((msg: any) => {
      if (msg != undefined && msg.items != undefined) {
        var views: number[] = [];
        var dates: number[] = [];
        msg.items.forEach((item: any) => {
          views.push(item.views);
          dates.push(item.timestamp);
        });
        this.opts.series.push({
          name: msg.items[0].article,
          data: views
        });
        this.opts.xAxis.categories = dates;
      }
    });
    var container = this.placement == "top" ? "topvpdcontainer" : "bottomvpdcontainer";
    Highcharts.chart(container, this.opts);
    this.hideLoader();
  }
  //#endregion chart setup
}