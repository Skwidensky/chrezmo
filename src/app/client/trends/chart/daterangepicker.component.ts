import { Component, Input, OnInit } from '@angular/core';
import { IMyDrpOptions, IMyDateRangeModel, IMyInputFieldChanged, IMyCalendarViewChanged, IMyDateSelected, IMyOptions } from 'mydaterangepicker';
import { State } from '../../state';
import { DateRange } from './daterange';

@Component({
    selector: 'daterangepicker',
    templateUrl: './daterangepicker.component.html',
    styleUrls: ['./chart.component.css']
})
export class DateRangePicker implements OnInit {
    @Input() placement: string;
    myDateRangePickerOptions: IMyDrpOptions = {
        dateFormat: 'yyyy mmm dd',
        firstDayOfWeek: 'mo',
        sunHighlight: true,
        height: '34px',
        width: '250px',
        inline: false,
        alignSelectorRight: false,
        indicateInvalidDateRange: true,
        minYear: 1970,
        maxYear: 2200,
        componentDisabled: false,
        showClearDateRangeBtn: true,
        showSelectorArrow: true,
        disableHeaderButtons: true,
        showWeekNumbers: false,
        showClearBtn: true,
        showApplyBtn: true,
        showSelectDateText: true,
        openSelectorOnInputClick: false,
        monthSelector: true,
        yearSelector: true,
        disableSince: { year: 0, month: 0, day: 0 }
    };


    selectedDateRange: any;

    selectedText: string = '';
    border: string = 'none';
    placeholderTxt: string = 'Select a date range';

    constructor(private state: State) {
        console.log('constructor(): DateRangePicker');
    }
    ngOnInit() {
        console.log('onInit(): DateRangePicker');
        let date = new Date();
        var day = date.getDate();
        if (day != 1) {
            day -= 1;
        }
        this.selectedDateRange = {
            beginDate: { year: date.getFullYear(), month: date.getMonth() + 1, day: day },
            endDate: { year: date.getFullYear(), month: date.getMonth() + 1, day: day }
        };
        this.disableSince();
    }
    // Calling this function disable future dates starting from today
    disableSince() {
        let d: Date = new Date();
        let copy = this.getCopyOfOptions();
        copy.disableSince = {
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            day: d.getDate()
        };
        this.myDateRangePickerOptions = copy;
    }
    clearDateRange() {
        this.selectedDateRange = null as any;
    }
    onDisableComponent(checked: boolean) {
        let copy = this.getCopyOfOptions();
        copy.componentDisabled = checked;
        this.myDateRangePickerOptions = copy;
    }
    onEditableDateField(checked: boolean) {
        let copy = this.getCopyOfOptions();
        copy.editableDateRangeField = checked;
        copy.openSelectorOnInputClick = !checked;
        this.myDateRangePickerOptions = copy;
    }
    onAlignSelectorRight(checked: boolean) {
        let copy = this.getCopyOfOptions();
        copy.alignSelectorRight = checked;
        this.myDateRangePickerOptions = copy;
    }
    onShowClearButton(checked: boolean) {
        let copy = this.getCopyOfOptions();
        copy.showClearDateRangeBtn = checked;
        this.myDateRangePickerOptions = copy;
    }
    onShowPlaceholderText(checked: boolean) {
        this.placeholderTxt = checked ? 'Select a date range' : '';
    }
    onDisableHeaderButtons(checked: boolean) {
        let copy = this.getCopyOfOptions();
        copy.disableHeaderButtons = checked;
        this.myDateRangePickerOptions = copy;
    }
    onShowWeekNumbers(checked: boolean) {
        let copy = this.getCopyOfOptions();
        copy.showWeekNumbers = checked;
        this.myDateRangePickerOptions = copy;
    }
    onDisableToday(checked: boolean) {
        let date = new Date();
        // Disable/enable today
        let copy = this.getCopyOfOptions();
        copy.disableDates = checked ? [{ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }] : [];
        this.myDateRangePickerOptions = copy;
    }
    onShowClearBtn(checked: boolean) {
        let copy = this.getCopyOfOptions();
        copy.showClearBtn = checked;
        this.myDateRangePickerOptions = copy;
    }
    onShowApplyBtn(checked: boolean) {
        let copy = this.getCopyOfOptions();
        copy.showApplyBtn = checked;
        this.myDateRangePickerOptions = copy;
    }
    onShowSelectDateText(checked: boolean) {
        let copy = this.getCopyOfOptions();
        copy.showSelectDateText = checked;
        this.myDateRangePickerOptions = copy;
    }
    onMonthSelector(checked: boolean) {
        let copy = this.getCopyOfOptions();
        copy.monthSelector = checked;
        this.myDateRangePickerOptions = copy;
    }
    onYearSelector(checked: boolean) {
        let copy = this.getCopyOfOptions();
        copy.yearSelector = checked;
        this.myDateRangePickerOptions = copy;
    }
    onDateRangeChanged(event: IMyDateRangeModel) {
        //TODO: Rx Event -- date range changed
        console.log('onDateRangeChanged(): Begin: ', event.beginDate, ' - beginJsDate: ', new Date(event.beginJsDate).toLocaleDateString(), ' - End: ',
            event.endDate, ' - endJsDate: ', new Date(event.endJsDate).toLocaleDateString(), ' - formatted: ', event.formatted, ' - beginEpoc timestamp: ',
            event.beginEpoc, ' - endEpoc timestamp: ', event.endEpoc);
        if (event.formatted !== '') {
            this.selectedText = 'Formatted: ' + event.formatted;
            this.border = '1px solid #CCC';
            this.selectedDateRange = { beginDate: event.beginDate, endDate: event.endDate };
            var beginMonth = this.formatDateString(event.beginDate.month.toString());
            var beginDay = this.formatDateString(event.beginDate.day.toString());
            var endMonth = this.formatDateString(event.endDate.month.toString());
            var endDay = this.formatDateString(event.endDate.day.toString());
            let range: DateRange = {
                placement: this.placement,
                start: event.beginDate.year.toString() + beginMonth + beginDay,
                end: event.endDate.year.toString() + endMonth + endDay,
            }
            this.state.sendDateRange(range);
        }
        else {
            this.selectedText = '';
            this.border = 'none';
        }
    }
    onInputFieldChanged(event: IMyInputFieldChanged) {
        console.log('onInputFieldChanged(): Value: ', event.value, ' - dateRangeFormat: ', event.dateRangeFormat, ' - valid: ', event.valid);
    }
    onCalendarViewChanged(event: IMyCalendarViewChanged) {
        console.log('onCalendarViewChanged(): Year: ', event.year, ' - month: ', event.month, ' - first: ', event.first, ' - last: ', event.last);
    }
    onDateSelected(event: IMyDateSelected) {
        console.log('onDateSelected(): Value: ', event);
    }
    getCopyOfOptions(): IMyDrpOptions {
        return JSON.parse(JSON.stringify(this.myDateRangePickerOptions));
    }
    private formatDateString(d: string): string {
        if (d.length == 1) {
            return "0" + d;
        }
        return d;
    }
}