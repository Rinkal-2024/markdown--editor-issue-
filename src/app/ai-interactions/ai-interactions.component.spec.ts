import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiInteractionsComponent } from './ai-interactions.component';

describe('AiInteractionsComponent', () => {
  let component: AiInteractionsComponent;
  let fixture: ComponentFixture<AiInteractionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiInteractionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiInteractionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
