import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Clone the request to add the new header.
    const clonedRequest = req.clone({
      headers: req.headers.set('X-Test-Key', 'NnBjcAztghCc2O7m6ENOR'),
    });

    // Pass the cloned request instead of the original request to the next handler.
    return next.handle(clonedRequest);
  }
}
