import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Simulacion } from './simulacion';

describe('Simulacion', () => {
  let component: Simulacion;
  let fixture: ComponentFixture<Simulacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Simulacion],
    }).compileComponents();

    fixture = TestBed.createComponent(Simulacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
