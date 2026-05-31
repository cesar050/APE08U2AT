import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Derivacion } from './derivacion';

describe('Derivacion', () => {
  let component: Derivacion;
  let fixture: ComponentFixture<Derivacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Derivacion],
    }).compileComponents();

    fixture = TestBed.createComponent(Derivacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
