import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { BehaviorSubject, interval, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('chrezmoheader') chrezmoheader: ElementRef;
  @ViewChild('c') c: ElementRef;
  @ViewChild('h') h: ElementRef;
  @ViewChild('r') r: ElementRef;
  @ViewChild('e') e: ElementRef;
  @ViewChild('z') z: ElementRef;
  @ViewChild('m') m: ElementRef;
  @ViewChild('o') o: ElementRef;
  title = 'chrezmo';
  flyingAway: boolean;
  flyingAwayObs: Observable<number>;
  flyingAwaySub: Subscription;
  constructor() {
    this.flyingAway = false;
    this.flyingAwayObs = interval(1000 / 60);
    this.flyingAwaySub = Subscription.EMPTY;
    // this.flyingAwayObs = new BehaviorSubject(1).asObservable();
  }
  ngAfterViewInit(): void {
    this.h.nativeElement.style.left = "30px";
    this.r.nativeElement.style.left = "35px";
    this.e.nativeElement.style.left = "40px";
    this.z.nativeElement.style.left = "45px";
    this.m.nativeElement.style.left = "50px";
    this.o.nativeElement.style.left = "55px";
    this.chrezmoheader.nativeElement.addEventListener('click', () => location.href = "mailto:chrezmo@gmail.com?subject=Info");
  }
  flyAway() {
    this.flyingAwaySub = this.flyingAwayObs.subscribe(itr => {
      this.c.nativeElement.style.position = "absolute";
      this.h.nativeElement.style.position = "absolute";
      this.h.nativeElement.style.left = this.h.nativeElement.style.offsetLeft;
      this.r.nativeElement.style.position = "absolute";
      this.e.nativeElement.style.position = "absolute";
      this.z.nativeElement.style.position = "absolute";
      this.m.nativeElement.style.position = "absolute";
      this.o.nativeElement.style.position = "absolute";
      this.c.nativeElement.style.left = (this.c.nativeElement.offsetLeft + 1) + 'px';
      
      console.log('fly away')
    });
  }
  comeBack() {
    this.flyingAwaySub.unsubscribe();
  }
}
declare global {
  interface Window {
    modal: any;
    modalText: any;
    g: any;
  }
}