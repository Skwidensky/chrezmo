import { AfterViewInit, Component, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { State } from "../../../state";
import { NGXLogger } from 'ngx-logger';

/**
 * Contains the extras for the 3D Force Graph:
 *   > Input for single query with search-button
 *   > Slide-down menu
 *     >> Shortest-path inputs
 *     >> Child-node limit input
 */
@Component({
  selector: 'graph-controls',
  templateUrl: './graph-controls.component.html',
  styleUrls: ['./graph-controls.component.css']
})
export class GraphControlsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('queryInput') queryInput: ElementRef;
  @ViewChild('querySearchBtn') searchBtn: ElementRef;
  @ViewChild('fromInput') fromInput: ElementRef;
  @ViewChild('toInput') toInput: ElementRef;
  @ViewChild('nodeLimitInput') nodeLimitInput: ElementRef;
  @ViewChild('sideNavBtn') sideNavBtn: ElementRef;
  @ViewChild('sideNav') sideNav: ElementRef;
  @ViewChild('sideNavCloseBtn') sideNavCloseBtn: ElementRef;
  state: State;
  showSideNav: boolean;
  querySub: Subscription;
  DELIMITER: string;
  public constructor(private logger: NGXLogger, state: State) {
    this.state = state;
    this.showSideNav = false;
    this.DELIMITER = "&";
  }
  ngOnDestroy(): void {
    this.querySub.unsubscribe();
  }
  ngAfterViewInit(): void {
    this.initEvtListeners();
  }
  // Adds event listeners to the different graph-control components
  private initEvtListeners(): void {
    this.state.queryObs().subscribe(query => {
      this.queryInput.nativeElement.value = query;
    });
    this.querySub = this.state.makeQueryObs().subscribe(() => {
      this.makeQuery();
    });
    //#region EventListeners
    // Search query on return press
    var self = this;
    this.queryInput.nativeElement.addEventListener("keyup", function (evt: any) {
      if (evt.keyCode === 13) {
        evt.preventDefault();
        self.state.setSubjects([self.queryInput.nativeElement.value]);
        self.makeQuery();
      }
    });
    // Query the contents of the queryinput field whenever the search button is clicked
    this.searchBtn.nativeElement.addEventListener("click", () => {
      this.state.setSubjects([this.queryInput.nativeElement.value]);
      this.state.makeQuery();
    });
    // Shortest path on return press
    this.fromInput.nativeElement.addEventListener("keyup", function (evt: any) {
      if (evt.keyCode === 13) {
        evt.preventDefault();
        self.state.setSubjects([self.fromInput.nativeElement.value, self.toInput.nativeElement.value]);
        self.shortestPath();
      }
    });
    // Shortest path on return press
    this.toInput.nativeElement.addEventListener("keyup", function (evt: any) {
      if (evt.keyCode === 13) {
        evt.preventDefault();
        self.state.setSubjects([self.fromInput.nativeElement.value, self.toInput.nativeElement.value]);
        self.shortestPath();
      }
    });
    // Shortest path on return press
    this.nodeLimitInput.nativeElement.addEventListener("keyup", function (evt: any) {
      if (evt.keyCode === 13) {
        evt.preventDefault();
        self.checkNodeLimit();
        self.makeQuery();
      }
    });
    // Listen to clicks on the side-nav toolbar icon and side-nav close icon
    this.sideNavBtn.nativeElement.addEventListener('click', () => self.toggleSideNav());
    this.sideNavCloseBtn.nativeElement.addEventListener('click', () => self.toggleSideNav());
    // When the node-limit input changes, makesure it's within the lower and upper-bounds
    this.nodeLimitInput.nativeElement.addEventListener("blur", function (evt: any) { self.checkNodeLimit(); });
    //#endregion EventListeners
  }
  // Keeps the number of nodes allowed to be rendered between 1 and 1_000
  private checkNodeLimit() {
    let nodeLimit = Number(this.nodeLimitInput.nativeElement.value);
    if (nodeLimit < 1) {
      this.nodeLimitInput.nativeElement.value = '1';
    } else if (nodeLimit > 1000) {
      this.nodeLimitInput.nativeElement.value = '1000';
    }
  }
  // Show or hide the side-nav toolbar -- I had to do this with the border-color because even whenever the Element
  // was height = 0, the border would still show as a solid horizontal line
  private toggleSideNav() {
    this.showSideNav = !this.showSideNav;
    if (this.showSideNav) {
      this.sideNav.nativeElement.style.height = "100px";
      this.sideNav.nativeElement.style.borderColor = "white";
    } else {
      this.sideNav.nativeElement.style.height = "0";
      this.sideNav.nativeElement.style.borderColor = "transparent";
    }
  }
  // Forwards a query Promise to State's query-Promise BehaviorSubject
  private makeQuery(): void {
    this.logger.info("Sending query request to server for current subjects list");
    this.state.makeQueryPromise(this.queryApi(this.state.getSubjects(), this.nodeLimitInput.nativeElement.value));
  }
  // Forwards a shortest-path Promise to State's shortest-path-Promise BehaviorSubject
  private shortestPath(): void {
    this.logger.info("Sending shortest-path request to server for from/to inputs");
    this.state.makeShortestPathPromise(this.shortestPathApi([this.fromInput.nativeElement.value, this.toInput.nativeElement.value]));
  }
  //#region API helper functions
  // Double-promise for JSON
  // Delimits all subjects in State#getSubjects together into a single query to send to the server
  private queryApi(subjects: any, limit: any) {
    return new Promise((resolve, reject) => {
      fetch(`http://localhost:3000/api/query?queries=${encodeURIComponent(subjects.join(this.DELIMITER))}&limit=${limit}`, { method: "GET" })
        .then(response => response.json())
        .then(resolve)
        .catch(reject);
    })
  }
  // Return the shortest path between the two subjects entered in fromInput and toInput
  private shortestPathApi(pair: any) {
    return new Promise((resolve, reject) => {
      fetch(`http://localhost:3000/api/shortestpath?pair=${encodeURIComponent(pair.join(this.DELIMITER))}`, { method: "GET" })
        .then(response => response.json())
        .then(resolve)
        .catch(reject);
    })
  }
  //#endregion API helper functions
}