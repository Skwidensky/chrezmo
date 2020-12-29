import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule }  from '@angular/material/chips'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphControlsComponent } from './client/chrezmo/graph/graph-controls/graph-controls.component';
import { GraphComponent } from './client/chrezmo/graph/graph.component';
import { SummaryDialogComponent } from './client/chrezmo/graph/summary-dialog/summary-dialog.component';
import { Chrezmo } from './client/chrezmo/chrezmo.component';
import { TrendsComponent } from './client/trends/trends.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MyDateRangePickerModule } from 'mydaterangepicker';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ChartComponent } from './client/trends/chart/wikiviewsperdaychart.component'
import { DateRangePicker } from './client/trends/chart/daterangepicker.component'
import { Chips } from './client/trends/chart/chips.component'

@NgModule({
  declarations: [
    AppComponent,
    GraphControlsComponent,
    GraphComponent,
    SummaryDialogComponent,
    Chrezmo,
    TrendsComponent,
    ChartComponent,
    DateRangePicker,
    Chips
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MyDateRangePickerModule,
    FormsModule,
    HttpClientModule,
    LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.INFO, serverLogLevel: NgxLoggerLevel.ERROR })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
