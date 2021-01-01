import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { NGXLogger } from "ngx-logger";

@Component({
    selector: 'carousel',
    templateUrl: 'carousel.component.html',
    styleUrls: ['../../trends.component.css'],
})
export class Carousel implements OnInit, AfterViewInit {
    @ViewChild('carouselTrack') carouselTrack: ElementRef;
    @ViewChild('chevronLeft') chevronLeft: ElementRef;
    @ViewChild('chevronRight') chevronRight: ElementRef;
    @Input() placement: string;
    @Input() vpdcontainer: string;
    @Input() mvacontainer: string;
    riders: any[];
    riderIdx: number;
    constructor(private logger: NGXLogger) {
        logger.info("Constructor: Carousel")
        this.riderIdx = 0;
    }
    ngAfterViewInit(): void {
        this.riders = Array.from(this.carouselTrack.nativeElement.children);
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
    }
    ngOnInit(): void {
    }
    private moveToRider = (currentRider: any, tgtRider: any) => {
        currentRider.classList.remove('current-rider');
        tgtRider.classList.add('current-rider');
    }
}