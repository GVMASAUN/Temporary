import { TestBed } from '@angular/core/testing';

import { RequestHandlerInterceptor } from './request-handler.interceptor';

describe('RequestHandlerInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      RequestHandlerInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: RequestHandlerInterceptor = TestBed.inject(RequestHandlerInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
