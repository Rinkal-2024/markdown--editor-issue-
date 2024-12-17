import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOpenaiComponent } from './create-openai.component';

describe('CreateOpenaiComponent', () => {
  let component: CreateOpenaiComponent;
  let fixture: ComponentFixture<CreateOpenaiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOpenaiComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOpenaiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
