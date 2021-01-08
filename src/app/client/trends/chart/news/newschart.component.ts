// https://mediastack.com/documentation
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as Highcharts from 'highcharts';
import { NGXLogger } from 'ngx-logger';
import * as $ from 'jquery';
import { State } from 'src/app/client/state';
import { Subscription } from 'rxjs';
import { Utils } from 'src/app/client/utils';

var axios = require("axios").default;

const ARTICLES_PER_PAGE = 100;
declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);

export interface NewsObj {
    placement: string,
    keywords: string[],
    date: string
}

@Component({
    selector: 'newschart',
    templateUrl: './newschart.component.html',
    styleUrls: ['./newschart.component.css']
})
export class NewsChartComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input() placement: string;
    @ViewChild("cardholder") cardholder: ElementRef;
    @ViewChild("searchinput") searchinput: ElementRef;
    header: string;
    newsKeyword: string;
    newsDate: string;
    newsSub: Subscription;
    key: string = 'b32ec741c9b7b2deecb37409020b29a1';
    articles: any[] = [];
    totalPages: number = 0;
    paginationOffset: number = 0;
    newsCache: Map<number, any> = new Map();

    constructor(private logger: NGXLogger, private state: State, private changeRef: ChangeDetectorRef) {
        this.logger.info("Constructor: NewsChartComponent");
    }
    ngAfterViewInit(): void {
        this.header = "News";
        this.newsDate = this.getTodaysFormattedDate();
        // Display top news by default
        this.fetchNews('');
    }
    ngOnInit(): void {
        // Subscribe to NewsObject Observable -- listen for when other panels need to show news
        this.newsSub = this.state.newsObs().subscribe(newsobj => {
            if (newsobj.placement == this.placement) {
                let apiDate = newsobj.date;
                apiDate = apiDate.slice(0, 4) + "-" + apiDate.slice(4, 6) + "-" + apiDate.slice(6, 8)
                // Mediastack's API presents date as YYYY-MM-DD, and it tacks on '00' to the end of the date for whatever reason
                this.newsDate = apiDate;
                this.fetchNews(newsobj.keywords.join(","));
            }
        })
    }
    ngOnDestroy(): void {
        this.newsSub.unsubscribe();
    }
    onPrevClick() {
        if (this.paginationOffset > 0) {
            this.paginationOffset -= ARTICLES_PER_PAGE;
            this.parseLiveNews(this.newsCache.get(this.paginationOffset));
        }
    }
    onNextClick() {
        if (this.totalPages > 0 && this.paginationOffset / ARTICLES_PER_PAGE < this.totalPages) {
            this.paginationOffset += 100;
            let cachedMsg = this.newsCache.get(this.paginationOffset);
            if (cachedMsg) {
                this.parseLiveNews(cachedMsg);
            } else {
                this.fetchNews(this.newsKeyword);
            }
        }
    }
    manualNewsSearch(keyword?: string) {
        if (keyword) {
            this.fetchNews(keyword);
        } else {
            this.fetchNews(this.searchinput.nativeElement.value);
        }
    }
    /**
     * Request message fields for live news:
     * access_key [Required] Use this parameter to specify your unique API access key, which is shown when you log in to your account dashboard.
     * sources	  [Optional] Use this parameter to include or exclude one or multiple comma-separated news sources. Example: To include CNN, but exclude BBC: &sources=cnn,-bbc
     * categories [Optional] Use this parameter to include or exclude one or multiple comma-separated news categories. Example: To include business, but exclude sports: &sources=business,-sports.
     * countries  [Optional] Use this parameter to include or exclude one or multiple comma-separated countries. Example: To include Australia, but exclude the US: &sources=au,-us.
     * languages  [Optional] Use this parameter to include or exclude one or multiple comma-separated languages. Example: To include English, but exclude German: &sources=en,-de.
     * keywords	  [Optional] Use this parameter to include or exclude one or multiple comma-separated search keywords. Example: To include the keyword "virus", but exclude "corona": &sources=virus,-corona
     * date	      [Optional] Use this parameter to specify a date or date range. Example: &date=2020-01-01 for news on Jan 1st and &date=2020-12-24,2020-12-31 for news between Dec 24th and 31st.
     * sort	      [Optional] Use this parameter to specify a sorting order. Available values: published_desc (default), published_asc, popularity
     * limit      [Optional] Use this parameter to specify a pagination limit (number of results per page) for your API request. Default limit value is 25, maximum allowed limit value is 100.
     * offset	  [Optional] Use this parameter to specify a pagination offset value for your API request. Example: An offset value of 100 combined with a limit value of 10 would show results 100-110.
     *                       Default value is 0, starting with the first available result.
     * @param keywords
     */
    private fetchNews(keywords: string): void {
        this.logger.info(`Getting news for ${keywords} for date ${this.newsDate}`);
        document.documentElement.style.cursor = "wait";
        // Reset the article cache and pagination offset if a new keyword is searched for
        if (keywords !== this.newsKeyword) {
            this.newsCache = new Map();
            this.paginationOffset = 0;
        }
        this.newsKeyword = keywords;
        new Promise((resolve, reject) => {
            fetch(`http://api.mediastack.com/v1/news?access_key=${this.key}&languages=en&countries=us&keywords=${keywords}&date=${this.newsDate},${this.newsDate}&limit=${ARTICLES_PER_PAGE}&sort=popularity&offset=${this.paginationOffset}`, { method: "GET" })
                .then(response => response.json())
                .then(resolve)
                .catch(reject);
        }).then((result: any) => {
            this.parseLiveNews(result);
        });
    }
    /**
     * Reply message fields for live news:
     * pagination > limit  Returns your pagination limit value.
     * pagination > offset Returns your pagination offset value.
     * pagination > count  Returns the results count on the current page.
     * pagination > total  Returns the total count of results available.
     * data > author	   Returns the name of the author of the given news article.
     * data > title	       Returns the title text of the given news article.
     * data > description  Returns the description text of the given news article.
     * data > url	       Returns the URL leading to the given news article.
     * data > image	       Returns an image URL associated with the given news article.
     * data > category	   Returns the category associated with the given news article.
     * data > language	   Returns the language the given news article is in.
     * data > country	   Returns the country code associated with the given news article.
     * data > published_at Returns the exact time stamp the given news article was published.
     * 
     * @param msg -- API reply message for live news request
     */
    private parseLiveNews(msg: any): void {
        this.articles = []; // forces ngFor to recognize and change
        if (msg && msg.data) {
            this.totalPages = (Math.floor(msg.pagination.total / ARTICLES_PER_PAGE));
            this.header = `News >> ${Utils.addCommasToNumberStringThousands(msg.pagination.total.toString())} results for '${this.newsKeyword == '' ? 'Top News' : this.newsKeyword}' (${this.newsDate}) Page: ${this.paginationOffset / ARTICLES_PER_PAGE}`
            for (let i = 0; i < msg.pagination.count; i++) {
                let article = msg.data[i]
                // .published_at returns a date with too much information -- we just want the year, month, day
                let date = article.published_at.toString();
                if (date.includes("T")) {
                    let cutoffIdx = date.indexOf("T"); // the BS I don't want from the date starts after a "T"
                    article.published_at = date.slice(0, cutoffIdx)
                }
                let title = article.title;
                const existsAlready = this.articles.filter(article => article.title == title);
                if (existsAlready.length == 0) {
                    this.articles.push(article);
                }
            }
        }
        this.newsCache.set(this.paginationOffset, msg);
        this.changeRef.detectChanges();
        this.cardholder.nativeElement.scrollTop = 0;
        document.documentElement.style.cursor = "default";
    }
    private getTodaysFormattedDate(): string {
        let date = new Date();
        var year = date.getFullYear();
        var month = this.formatDateString((date.getMonth() + 1).toString());
        var day = this.formatDateString((date.getDate()).toString());
        return year + '-' + month + '-' + day
    }
    private formatDateString(d: string): string {
        if (d.length == 1) {
            return "0" + d;
        }
        return d;
    }
}