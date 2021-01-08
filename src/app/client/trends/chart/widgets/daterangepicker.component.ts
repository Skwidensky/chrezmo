import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { NGXLogger } from 'ngx-logger';
import { State } from '../../../state';

export interface DateRange {
    placement: string;
    start: string;
    end: string;
}

@Component({
    selector: 'daterangepicker',
    templateUrl: './daterangepicker.component.html',
    styleUrls: ['../../trends.component.css']
})

export class DateRangePicker implements OnInit, AfterViewInit {
    @Input() placement: string;
    minDate: Date;
    maxDate: Date;
    startDate: Date | undefined;
    endDate: Date | undefined;

    constructor(private logger: NGXLogger, private state: State) {
        this.logger.info('Constructor(): DateRangePicker');
    }
    ngOnInit() {
        this.logger.info('onInit(): DateRangePicker');
        let date = new Date();
        var day = date.getDate();
        if (day != 1) {
            day -= 1;
        }
    }
    ngAfterViewInit(): void {
        this.logger.info('afterViewInit(): DateRangePicker');
        var today = new Date();
        var yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const currentYear = yesterday.getFullYear();
        // Set the minimum to January 1st 20 years in the max to yesterday.
        // Set max to yesterday because the API's used to fetch data are a little slow to update.
        this.minDate = new Date(2015, 6, 1);
        this.maxDate = yesterday;
        this.startDate = this.minDate;
        this.endDate = this.maxDate;
        this.sendDateRange();
    }
    onDateChange(type: string, event: MatDatepickerInputEvent<Date>) {
        if (this.startDate && this.endDate) {
            this.startDate = undefined;
            this.endDate = undefined;
        }
        if (event.value) {
            if (!this.startDate || this.startDate > event.value) {
                this.startDate = event.value;
            } else if (this.startDate < event.value) {
                this.endDate = event.value;
            }
            if (this.startDate && this.endDate) {
                this.sendDateRange();
            }
        }
    }
    private sendDateRange() {
        var beginMonth = this.formatDateString((this.startDate!.getMonth() + 1).toString());
        var beginDay = this.formatDateString(this.startDate!.getDate().toString());
        var endMonth = this.formatDateString((this.endDate!.getMonth() + 1).toString());
        var endDay = this.formatDateString(this.endDate!.getDate().toString());
        let range: DateRange = {
            placement: this.placement,
            start: this.startDate!.getFullYear().toString() + beginMonth + beginDay,
            end: this.endDate!.getFullYear().toString() + endMonth + endDay,
        }
        this.state.sendDateRange(range);
    }
    private formatDateString(d: string): string {
        if (d.length == 1) {
            return "0" + d;
        }
        return d;
    }
}