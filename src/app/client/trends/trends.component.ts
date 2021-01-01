import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild('topdiv') topdiv: ElementRef;
  showFull: boolean = true;
  constructor(private logger: NGXLogger) {
    this.logger.info("Constructor(): Trends")
  }
  ngOnInit(): void {

  }
  public click(): void {
    this.showFull = !this.showFull;
    if (this.showFull) {
      this.topdiv.nativeElement.className = "fullWidth"
    } else {
      this.topdiv.nativeElement.className = "noWidth"
    }
  }
}
