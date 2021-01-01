import { Component, OnDestroy, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';

var axios = require("axios").default;

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);

@Component({
    selector: 'newschart',
    templateUrl: './newschart.component.html',
    styleUrls: ['../chart.component.css']
})
export class NewsChartComponent implements OnInit, OnDestroy {

    constructor() {

    }
    ngOnDestroy(): void {
    }
    ngOnInit(): void {
        // this.getNews();
    }

    private getNews() {
        var options = {
            method: 'GET',
            url: 'https://contextualwebsearch-websearch-v1.p.rapidapi.com/api/search/NewsSearchAPI',
            params: {
                q: 'taylor swift',
                pageNumber: '1',
                pageSize: '10',
                autoCorrect: 'true',
                fromPublishedDate: '05/29/2015',
                toPublishedDate: '05/29/2016'
            },
            headers: {
                'x-rapidapi-key': '95f93e6fbcmshf079a40d24a8114p1a6551jsn754cdea7efad',
                'x-rapidapi-host': 'contextualwebsearch-websearch-v1.p.rapidapi.com'
            }
        };

        axios.request(options).then(function (response) {
            console.log(response.data);
        }).catch(function (error) {
            console.error(error);
        });
    }
}