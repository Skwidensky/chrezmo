import { AfterViewInit, Component } from '@angular/core';
import { Contextual } from 'src/plugins/contextual';
import { State } from '../state';
import { GraphControlsComponent } from './graph/graph-controls/graph-controls.component';
import { GraphComponent } from './graph/graph.component';
import { SummaryDialogComponent } from './graph/summary-dialog/summary-dialog.component';
import * as $ from 'jquery';

@Component({
  selector: 'chrezmo',
  templateUrl: './chrezmo.component.html',
  styleUrls: ['./chrezmo.component.css']
})
export class Chrezmo implements AfterViewInit {
  state: State;
  g: GraphComponent;
  constructor(state: State) {
    var self = this;
    this.state = state;
    // Initialize Graph components
    this.g = new GraphComponent(state);
    this.makeSubscriptions();
    // Disable default context menu
    window.oncontextmenu = (evt: any) => {
      evt.preventDefault();
    }
    // Double-click anywhere to center camera on graph
    window.ondblclick = function (evt: any) {
      self.g.centerCamera();
    }
    this.state.makeQuery();
  }
  // Make an initial query after loading
  ngAfterViewInit(): void {
    // this.state.makeQuery();
  }
  // Subscribes to relevant data streams
  private makeSubscriptions() {
    // Subscribe to context-menu events from the Graph
    this.state.ctxMenuObs().subscribe(nodeAndEvt => {
      if (nodeAndEvt[0] != [""]) {
        let node = nodeAndEvt[0];
        let evt = nodeAndEvt[1];
        this.showCtxMenu(node, evt);
      }
    });
    // Subscribe to Promises for normal queries
    this.state.queryPromiseObs().subscribe(p => { this.onPromise(p) })
    // Subscribe to shortest-path Promises
    this.state.shortestPathPromiseObs().subscribe(p => { this.onPromise(p) })
  }
  // Display a context menu for a specific node
  private showCtxMenu(node: any, evt: any) {
    var wikiPage = node.title.replace(" ", "_");
    new Contextual({
      isSticky: false,
      event: evt,
      items: [
        { label: 'Article Summary', onClick: () => { this.getWikiSummary(wikiPage) } },
        { label: 'Open Wiki page in new tab', onClick: () => { window.open("https://en.wikipedia.org/wiki/" + wikiPage, "_blank"); } },
        { label: 'Query this node', onClick: () => { this.state.setSubjects([node.title]); this.state.makeQuery(); } },
        {
          label: 'Expand this node', onClick: () => {
            if (!this.state.getSubjects().includes(node.title)) { this.state.getSubjects().push(node.title) } this.state.makeQuery();
          }
        }
      ]
    }).show();
  }
  // Sends a JSON object to the summary dialog to display
  private getWikiSummary(wikiPage: string) {
    var self = this;
    var summJson = "https://en.wikipedia.org/api/rest_v1/page/summary/" + wikiPage;
    $.getJSON(summJson, function (data: any) {
      self.state.presentSummary(data);
      // self.summaryDialog.presentSummary(data);
    });
  }
  private onPromise(promise: Promise<any>) {
    this.showLoader();
    this.drawGraphResult(promise);
  }
  // Draws query result --should probably go in graph.component.ts
  private drawGraphResult(result: Promise<any>) {
    var self = this;
    result.then(function (result: any) {
      const nodes = result.nodes;
      self.state.resetSourceNodes();
      Object.entries(nodes).forEach((key: any, value: any) => {
        if (self.state.getSubjects().includes(value.title)) {
          self.state.getSourceNodes().push(value.id);
        }
      });
      const links = result.links;
      const gData = { nodes: Object.values(nodes), links: links }
      self.g.graphData(gData);
      // Set the text for the query input
      self.state.setCurrentQuery(self.state.getSubjects()[0]);
      self.hideLoader();
    }).catch(function (error) {
      console.log(error);
    });
  }
  hideLoader() {
    $("#loading").removeClass("loading-dot");
  }
  showLoader() {
    $("#loading").addClass("loading-dot")
  }
}
