import { Component, OnDestroy } from '@angular/core';
import { Contextual } from 'src/plugins/contextual';
import { State } from '../state';
import { NGXLogger } from 'ngx-logger';
import * as $ from 'jquery';
import { Subscription } from 'rxjs';

@Component({
  selector: 'chrezmo',
  templateUrl: './chrezmo.component.html',
  styleUrls: ['./chrezmo.component.css']
})
export class Chrezmo implements OnDestroy {
  state: State;
  ctxMenuSub: Subscription;
  constructor(private logger: NGXLogger, state: State) {
    this.logger.info("Chrezmo Object constructing")
    this.state = state;
    this.makeSubscriptions();
    // Disable default context menu
    window.oncontextmenu = (evt: any) => {
      evt.preventDefault();
    }
    this.state.makeQuery();
  }
  ngOnDestroy(): void {
    console.log("DESTROYING CHREZMO");
    this.ctxMenuSub.unsubscribe();
  }
  // Subscribes to relevant data streams
  private makeSubscriptions() {
    // Subscribe to context-menu events from the Graph
    this.ctxMenuSub = this.state.ctxMenuObs().subscribe(nodeAndEvt => {
      if (nodeAndEvt[0] != [""]) {
        let node = nodeAndEvt[0];
        let evt = nodeAndEvt[1];
        this.showCtxMenu(node, evt);
      }
    });
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
            if (!this.state.getSubjects().includes(node.title)) {
              this.state.getSubjects().push(node.title);
              this.state.setSubjects(this.state.getSubjects());
            }
            this.state.makeQuery();
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
}