import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  private apiUrl = 'https://api.andbank.com.br/candidate/renda-fixa';

  constructor(private http: HttpClient) {}

  getAssets(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
