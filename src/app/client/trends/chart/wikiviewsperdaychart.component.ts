import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import { NGXLogger } from 'ngx-logger';
import { State } from '../../state';
import { DateRange } from './daterange';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Article } from './chips.component';
import { start } from 'repl';

const NewsAPI = require('newsapi');
const newsapi = new NewsAPI('49c923bbfae040418a7593b5c09e8149');

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
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit, OnDestroy {
  @Input() container: string;
  opts: any;
  dateRangeSub: Subscription;
  wikiViewsPerDayArticlesSub: Subscription;
  cachedMessages: any[];
  constructor(private logger: NGXLogger, private state: State) {
    this.logger.info("Constructor(): Chart")
    this.dateRangeSub = this.state.dateRangeObs().pipe(filter((dateRange: DateRange) => dateRange.placement == "top"))
      .subscribe((dateRange: DateRange) => this.fetchViewsPerDay());
    this.wikiViewsPerDayArticlesSub = this.state.wikiViewsPerDayArticlesObs()
      .subscribe((articles: Article[]) => this.fetchViewsPerDay());
    this.cachedMessages = [];
  }
  ngOnDestroy(): void {
    this.dateRangeSub.unsubscribe();
    this.wikiViewsPerDayArticlesSub.unsubscribe();
  }
  ngOnInit(): void {
    let todaysDate = this.todaysFormattedDate();
    let defaultDateRange: DateRange = {
      placement: "top",
      start: todaysDate,
      end: todaysDate
    }
    this.state.sendDateRange(defaultDateRange);
    // this.fetchViewsPerDay();
    // .then((result: any) => {
    //   this.parseWikiViewsPerPageMessage(result);
    //   // access: "all-access"
    //   // agent: "all-agents"
    //   // article: "Cat"
    //   // granularity: "daily"
    //   // project: "en.wikipedia"
    //   // timestamp: "2020010200"
    //   // views: 7039
    // });
  }
  private getNews() {
    // To query /v2/top-headlines
    // All options passed to topHeadlines are optional, but you need to include at least one of them
    newsapi.v2.topHeadlines({
      sources: 'bbc-news,the-verge',
      q: 'bitcoin',
      category: 'business',
      language: 'en',
      country: 'us'
    }).then((response: any) => {
      console.log(response);
      /*
        {
          status: "ok",
          articles: [...]
        }
      */
    });
  }
  private fetchViewsPerDay(): void {
    // Clear catched messages
    this.cachedMessages = [];
    let dateRange = this.state.dateRangeSubj.getValue();
    this.state.wikiViewsPerDayChipsSubj.getValue().forEach((article: Article) => {
      new Promise((resolve, reject) => {
        fetch(`https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia.org/all-access/all-agents/${article.name}/daily/${dateRange.start}/${dateRange.end}`, { method: "GET" })
          .then(response => response.json())
          .then(resolve)
          .catch(reject)
      }).then((result: any) => {
        this.cachedMessages.push(result);
        // this.parseWikiViewsPerPageMessage(result);
      }).then(() => {
        if (this.cachedMessages.length == this.state.wikiViewsPerDayChipsSubj.getValue().length) {
          this.parseWikiViewsPerPageMessage();
        }
      });
    });
  }
  private parseWikiViewsPerPageMessage() {
    this.opts = {
      chart: {
        type: 'line'
      },
      title: {
        text: 'Views per Day',
        align: "right"
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
        title: undefined
      },
      series: []
    }
    this.cachedMessages.forEach((msg: any) => {
      if (msg != undefined) {
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
    Highcharts.chart(this.container, this.opts);
  }
  private todaysFormattedDate(): string {
    let date = new Date();
    // Wikimedia's API requires a two-digit day
    var day: any = date.getDate();
    if (day != 1) {
      day -= 1;
    }
    if (day < 10) {
      day = "0" + day.toString();
    }
    return date.getFullYear().toString() + (date.getMonth() + 1).toString() + day;
  }
}
