import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolQuantityComponent } from './tool-quantity.component';

describe('ToolQuantityComponent', () => {
  let component: ToolQuantityComponent;
  let fixture: ComponentFixture<ToolQuantityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToolQuantityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToolQuantityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
