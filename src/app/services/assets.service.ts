import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Asset } from '../models/asset.model';

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  private apiUrl = 'https://api.andbank.com.br/candidate/renda-fixa';

  constructor(private http: HttpClient) {}

  getAssets(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getAssetById(id: number): Observable<Asset> {
    return this.http.get<Asset>(`${this.apiUrl}/${id}`);
  }

  createAsset(asset: Asset): Observable<Asset> {
    return this.http.post<Asset>(this.apiUrl, asset);
  }

  updateAsset(id: number, asset: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}`, asset);
  }

  deleteAsset(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getProductTypes(): Observable<any[]> {
    return this.http.get<any[]>(
      'https://api.andbank.com.br/candidate/tipo-produto'
    );
  }

  getIndexesByProductType(productTypeId: number): Observable<any[]> {
    return this.http.get<any[]>(
      `https://api.andbank.com.br/candidate/indexadores/${productTypeId}`
    );
  }
}
