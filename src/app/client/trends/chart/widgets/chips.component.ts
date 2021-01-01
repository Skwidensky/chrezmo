import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { NGXLogger } from 'ngx-logger';
import { State } from '../../../state';

export interface Article {
    placement: string;
    name: string;
}

/**
 * @title Chips with input
 */
@Component({
    selector: 'chips',
    templateUrl: 'chips.component.html',
    styleUrls: ['../chart.component.css'],
})
export class Chips implements OnInit, AfterViewInit {
    @Input() placement: string;
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    articles: Article[];

    constructor(private logger: NGXLogger, private state: State) {
        this.logger.info("Constructor: Chips")
    }
    ngOnInit(): void {
        this.articles = [
            {
                placement: this.placement,
                name: 'Wikipedia'
            }];
        this.state.sendWikiViewsPerDayArticles(this.articles);
    }
    ngAfterViewInit(): void {
    }
    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add the article
        if ((value || '').trim() && this.articles.length < 8) {
            this.articles.push({
                placement: this.placement,
                name: value.trim()
            });
            this.state.sendWikiViewsPerDayArticles(this.articles);
        }
        // Reset the input value
        if (input) {
            input.value = '';
        }
    }
    remove(article: Article): void {
        const index = this.articles.indexOf(article);

        if (index >= 0 && this.articles.length > 1) {
            this.articles.splice(index, 1);
        }
        this.state.sendWikiViewsPerDayArticles(this.articles);
    }
}