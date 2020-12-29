import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('chrezmoheader') chrezmoheader: ElementRef;
  title = 'chrezmo';
  constructor() {
  }
  ngAfterViewInit(): void {
    console.log("http://www.unexplainedmysteries.net/c/chresmomancy.htm");
    this.chrezmoheader.nativeElement.addEventListener('click', () => location.href = "mailto:chrezmo@gmail.com?subject=Info");
  }
}
declare global {
  interface Window {
    modal: any;
    modalText: any;
    g: any;
  }
}