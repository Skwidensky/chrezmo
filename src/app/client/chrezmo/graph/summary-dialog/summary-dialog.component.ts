import { Component, ElementRef, ViewChild } from '@angular/core';
import { State } from 'src/app/client/state';
import * as $ from 'jquery';

@Component({
  selector: 'summary-dialog',
  templateUrl: './summary-dialog.component.html',
  styleUrls: ['./summary-dialog.component.css']
})
export class SummaryDialogComponent {
  @ViewChild('summaryModal') summaryModal: ElementRef;
  state: State;
  modalText: HTMLElement;
  constructor(state: State) {
    let self = this;
    this.state = state;
    this.modalText = <HTMLElement>document.getElementById("modaltext");
    this.state.presentSummaryObs().subscribe((data: any) => this.presentSummary(data));
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (evt: any) {
      if (evt.target != self.modalText) {
        self.summaryModal.nativeElement.style.display = "none";
      }
    }
  }
  // Presents a modal dialog with a thumbnail image and text-summary of the article represented by 'data'
  presentSummary(data: any): void {
    if (this.summaryModal != undefined) {
      this.summaryModal.nativeElement.style.display = "block";
      $(document).ready(function () {
        if (data.thumbnail) {
          $('.modal-image').html(`<img src=\'${data.thumbnail.source}\'>`);
        } else {
          $(".modal-image").text("Image unavailable");
        }
        if (data.extract) {
          $(".modal-text").text(data.extract);
        } else {
          $(".modal-text").text("Summary unvailable");
        }
      });
    }
  }
}