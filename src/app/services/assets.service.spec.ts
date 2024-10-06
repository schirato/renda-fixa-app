import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AssetsService } from './assets.service';
import { Asset } from '../models/asset.model';

describe('AssetsService', () => {
  let service: AssetsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AssetsService],
    });

    service = TestBed.inject(AssetsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve recuperar todos os ativos (GET)', () => {
    const mockAssets: Asset[] = [
      {
        id: 1,
        descricao: 'CDB XPTO',
        dataValidade: '2026-01-01',
        investimentoMinimo: 1500.0,
        tipoProdutoId: 1,
        indexadorId: 1,
      },
    ];

    service.getAssets().subscribe((assets) => {
      expect(assets.length).toBe(1);
      expect(assets).toEqual(mockAssets);
    });

    const req = httpMock.expectOne(
      'https://api.andbank.com.br/candidate/renda-fixa'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockAssets); // Responde com dados simulados
  });

  it('deve recuperar um ativo pelo id (GET)', () => {
    const mockAsset: Asset = {
      id: 1,
      descricao: 'CDB XPTO',
      dataValidade: '2026-01-01',
      investimentoMinimo: 1500.0,
      tipoProdutoId: 1,
      indexadorId: 1,
    };

    service.getAssetById(1).subscribe((asset) => {
      expect(asset).toEqual(mockAsset);
    });

    const req = httpMock.expectOne(
      'https://api.andbank.com.br/candidate/renda-fixa/1'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockAsset);
  });

  it('deve criar um ativo (POST)', () => {
    const newAsset: Asset = {
      id: 0, // Defina um valor padrão para id, pois ele não é fornecido na criação
      descricao: 'Novo CDB',
      dataValidade: '2026-12-31',
      investimentoMinimo: 2000.0,
      tipoProdutoId: 1,
      indexadorId: 1,
    };

    service.createAsset(newAsset).subscribe((asset) => {
      expect(asset).toEqual(newAsset);
    });

    const req = httpMock.expectOne(
      'https://api.andbank.com.br/candidate/renda-fixa'
    );
    expect(req.request.method).toBe('POST');
    req.flush(newAsset);
  });

  it('deve atualizar um ativo (PUT)', () => {
    const updatedAsset: Asset = {
      id: 1,
      descricao: 'CDB Atualizado',
      dataValidade: '2027-01-01',
      investimentoMinimo: 2500.0,
      tipoProdutoId: 1,
      indexadorId: 1,
    };

    service.updateAsset(1, updatedAsset).subscribe((response) => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(
      'https://api.andbank.com.br/candidate/renda-fixa'
    );
    expect(req.request.method).toBe('PUT');
    req.flush(null); // Resposta vazia
  });

  it('deve deletar um ativo (DELETE)', () => {
    service.deleteAsset(1).subscribe((response) => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(
      'https://api.andbank.com.br/candidate/renda-fixa/1'
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('deve recuperar todos os tipos de produto (GET)', () => {
    const mockProductTypes = [
      { id: 1, nome: 'CDB' },
      { id: 2, nome: 'Debenture' },
    ];

    service.getProductTypes().subscribe((productTypes) => {
      expect(productTypes.length).toBe(2);
      expect(productTypes).toEqual(mockProductTypes);
    });

    const req = httpMock.expectOne(
      'https://api.andbank.com.br/candidate/tipo-produto'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockProductTypes);
  });

  it('deve recuperar índices pelo tipo de produto (GET)', () => {
    const mockIndexes = [
      { id: 1, nome: 'CDI' },
      { id: 2, nome: 'SELIC' },
    ];

    service.getIndexesByProductType(1).subscribe((indexes) => {
      expect(indexes.length).toBe(2);
      expect(indexes).toEqual(mockIndexes);
    });

    const req = httpMock.expectOne(
      'https://api.andbank.com.br/candidate/indexadores/1'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockIndexes);
  });
});
