import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chrezmo } from './chrezmo.component';

describe('Chrezmo', () => {
  let component: Chrezmo;
  let fixture: ComponentFixture<Chrezmo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Chrezmo ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Chrezmo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
