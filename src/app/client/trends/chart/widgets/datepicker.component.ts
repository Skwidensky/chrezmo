import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { NGXLogger } from 'ngx-logger';
import { State } from '../../../state';

export interface DateP {
    placement: string;
    year: string;
    month: string;
    day: string
}

@Component({
    selector: 'datepicker',
    templateUrl: './datepicker.component.html',
    styleUrls: ['../../trends.component.css']
})
export class DatePicker implements OnInit, AfterViewInit {
    @Input() placement: string;
    minDate: Date;
    maxDate: Date;

    constructor(private logger: NGXLogger, private state: State) {
        this.logger.info("Constructor: DatePicker")
    }
    ngAfterViewInit(): void {
        var today = new Date();
        var yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const currentYear = yesterday.getFullYear();
        // Set the minimum to January 1st 20 years in the max to yesterday.
        // Set max to yesterday because the API's used to fetch data are a little slow to update.
        this.minDate = new Date(2015, 6, 1);
        this.maxDate = yesterday;
        this.sendDateP(yesterday);
    }
    ngOnInit(): void {
        console.log('onInit(): DatePicker');
    }
    onDateChange(type: string, event: MatDatepickerInputEvent<Date>) {
        if (event.value) {
            this.sendDateP(event.value);
        }
    }
    sendDateP(date: Date) {
        var month = this.formatDateString((date.getMonth() + 1).toString());
        var day = this.formatDateString((date.getDate()).toString());
        let datep: DateP = {
            placement: this.placement,
            year: date.getFullYear().toString(),
            month: month,
            day: day
        }
        this.state.sendDateP(datep);
    }
    private formatDateString(d: string): string {
        if (d.length == 1) {
            return "0" + d;
        }
        return d;
    }
}
