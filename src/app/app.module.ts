import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule }  from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphControlsComponent } from './client/chrezmo/graph/graph-controls/graph-controls.component';
import { GraphComponent } from './client/chrezmo/graph/graph.component';
import { SummaryDialogComponent } from './client/chrezmo/graph/summary-dialog/summary-dialog.component';
import { Chrezmo } from './client/chrezmo/chrezmo.component';
import { TrendsComponent } from './client/trends/trends.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { WikiViewsPerDayChartComponent } from './client/trends/chart/wikiviewsperday/wikiviewsperdaychart.component'
import { WikiTopViewdArticlesChartComponent } from './client/trends/chart/wikitopviewedarticles/wikitopviewedarticles'
import { DateRangePicker } from './client/trends/chart/widgets/daterangepicker.component'
import { Chips } from './client/trends/chart/widgets/chips.component'
import { Carousel } from './client/trends/chart/widgets/carousel.component'
import { DatePicker } from './client/trends/chart/widgets/datepicker.component';
import { NewsChartComponent } from './client/trends/chart/news/newschart.component'

@NgModule({
  declarations: [
    AppComponent,
    GraphControlsComponent,
    GraphComponent,
    SummaryDialogComponent,
    Chrezmo,
    TrendsComponent,
    WikiViewsPerDayChartComponent,
    WikiTopViewdArticlesChartComponent,
    NewsChartComponent,
    DateRangePicker,
    DatePicker,
    Chips,
    Carousel
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
    MatNativeDateModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.INFO, serverLogLevel: NgxLoggerLevel.ERROR })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
