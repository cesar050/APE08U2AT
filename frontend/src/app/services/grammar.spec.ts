import { TestBed } from '@angular/core/testing';

import { Grammar } from './grammar';

describe('Grammar', () => {
  let service: Grammar;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Grammar);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
