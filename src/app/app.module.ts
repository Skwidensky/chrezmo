import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GraphControlsComponent } from './client/chrezmo/graph/graph-controls/graph-controls.component';
import { GraphComponent } from './client/chrezmo/graph/graph.component';
import { SummaryDialogComponent } from './client/chrezmo/graph/summary-dialog/summary-dialog.component';
import { Chrezmo } from './client/chrezmo/chrezmo.component';
import { ChartsComponent } from './client/charts/charts.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger'

@NgModule({
  declarations: [
    AppComponent,
    GraphControlsComponent,
    GraphComponent,
    SummaryDialogComponent,
    Chrezmo,
    ChartsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    MatIconModule,
    HttpClientModule,
    LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.INFO, serverLogLevel: NgxLoggerLevel.ERROR })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
