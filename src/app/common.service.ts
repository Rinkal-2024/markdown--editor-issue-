import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private createAuthHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Authentication token is missing');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  constructor(private http: HttpClient) {}

  setlanguage(local:any): Observable<any> {
    const headers = this.createAuthHeaders();
    const body = {
      local: local,
    };
    const localapi = `${environment.apiServerUrl}/update-local`;
    return this.http.post(localapi, body, { headers }).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }
}
