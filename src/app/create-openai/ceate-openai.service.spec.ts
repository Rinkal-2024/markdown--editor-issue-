import { TestBed } from '@angular/core/testing';

import { CeateOpenaiService } from './ceate-openai.service';

describe('CeateOpenaiService', () => {
  let service: CeateOpenaiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CeateOpenaiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
