import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AfterViewInit, Component } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { NGXLogger } from 'ngx-logger';
import { State } from '../../state';

export interface Article {
    name: string;
}

/**
 * @title Chips with input
 */
@Component({
    selector: 'chips',
    templateUrl: 'chips.component.html',
    styleUrls: ['chart.component.css'],
})
export class Chips implements AfterViewInit {
    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    articles: Article[] = [
        { name: 'Wikipedia' }];

    constructor(private logger: NGXLogger, private state: State) {
        this.logger.info("Constructor: Chips")
    }
    ngAfterViewInit(): void {
        this.state.sendWikiViewsPerDayArticles(this.articles);
    }
    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add the article
        if ((value || '').trim()) {
            this.articles.push({ name: value.trim() });
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
        this.state.sendWikiViewsPerDayArticles(this.articles);
    }

    remove(article: Article): void {
        const index = this.articles.indexOf(article);

        if (index >= 0) {
            this.articles.splice(index, 1);
        }
        this.state.sendWikiViewsPerDayArticles(this.articles);
    }
}