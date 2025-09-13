import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfternoonShift } from './afternoon-shift';

describe('AfternoonShift', () => {
  let component: AfternoonShift;
  let fixture: ComponentFixture<AfternoonShift>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfternoonShift]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AfternoonShift);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
