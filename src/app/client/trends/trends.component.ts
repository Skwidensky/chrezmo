import { Component, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { State } from '../state';

/**
 * The second-page created for Chrezmo. Contains tools for visualizing side-by-side trends for:
 *   > Wikipedia (via Wikimedia REST)
 *   > News headlines (via NewsAPI)
 *   > Google Trends (TODO: via Google Trends API)
 *   > Financial data (TODO: via some historic financial data API)
 *   > Twitter (TODO: via Twitter API)
 */
@Component({
  selector: 'app-trends',
  templateUrl: './trends.component.html',
  styleUrls: ['./trends.component.css']
})
export class TrendsComponent implements OnInit {
  constructor(private logger: NGXLogger) {
    this.logger.info("Constructor(): Trends")    
   }
  ngOnInit(): void {

  }
}
