import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WikiViewsPerDayChartComponent } from '../wikiviewsperday/wikiviewsperdaychart.component';

describe('ChartComponent', () => {
  let component: WikiViewsPerDayChartComponent;
  let fixture: ComponentFixture<WikiViewsPerDayChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WikiViewsPerDayChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WikiViewsPerDayChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
