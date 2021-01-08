import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { NGXLogger } from "ngx-logger";
import { Subscription } from "rxjs";
import { State } from "src/app/client/state";

@Component({
    selector: 'carousel',
    templateUrl: 'carousel.component.html',
    styleUrls: ['../../trends.component.css'],
})
export class Carousel implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('carouselTrack') carouselTrack: ElementRef;
    @ViewChild('chevronLeft') chevronLeft: ElementRef;
    @ViewChild('chevronRight') chevronRight: ElementRef;
    @Input() placement: string;
    @Input() vpdcontainer: string;
    @Input() mvacontainer: string;
    riders: any[];
    riderIdx: number;
    newsSub: Subscription;
    constructor(private logger: NGXLogger, private state: State) {
        logger.info("Constructor: Carousel")
        this.riderIdx = 0;
    }
    ngAfterViewInit(): void {
        this.riders = Array.from(this.carouselTrack.nativeElement.children);
        // Left-arrow rider swap
        this.chevronLeft.nativeElement.addEventListener("click", () => {
            if (this.riderIdx == 0) {
                return;
            }
            const currentRider = this.riders[this.riderIdx];
            const prevRider = currentRider.previousElementSibling;
            // Move to previous rider
            this.moveToRider(currentRider, prevRider);
            this.riderIdx -= 1;
        });
        // Right-arrow rider swap
        this.chevronRight.nativeElement.addEventListener("click", () => {
            if (this.riderIdx == this.riders.length - 1) {
                return;
            }
            const currentRider = this.riders[this.riderIdx];
            const nextRider = currentRider.nextElementSibling;
            // Move to next rider
            this.moveToRider(currentRider, nextRider);
            this.riderIdx += 1;
        });
        // Subscribe to newsObj emissions to swap to the correct rider
        this.newsSub = this.state.newsObs().subscribe(newsobj => {
            if (newsobj.placement == this.placement) {
                this.moveToRider(this.riders[this.riderIdx], this.riders[2]);
                this.riderIdx = 2; // stupid but ok
            }
        })
    }
    ngOnInit(): void {
    }
    ngOnDestroy(): void {
        this.newsSub.unsubscribe();
    }
    private moveToRider = (currentRider: any, tgtRider: any) => {
        currentRider.classList.remove('current-rider');
        tgtRider.classList.add('current-rider');
    }
}