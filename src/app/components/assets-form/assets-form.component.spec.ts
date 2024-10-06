import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssetsService } from 'src/app/services/assets.service';
import { AssetsFormComponent } from './assets-form.component';

describe('AssetsFormComponent', () => {
  let component: AssetsFormComponent;
  let fixture: ComponentFixture<AssetsFormComponent>;
  let assetsService: jasmine.SpyObj<AssetsService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: ActivatedRoute;

  beforeEach(async () => {
    const assetsServiceSpy = jasmine.createSpyObj('AssetsService', [
      'getProductTypes',
      'getIndexesByProductType',
      'getAssetById',
      'createAsset',
      'updateAsset',
    ]);

    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [AssetsFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AssetsService, useValue: assetsServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => (key === 'id' ? '1' : null) }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssetsFormComponent);
    component = fixture.componentInstance;
    assetsService = TestBed.inject(
      AssetsService
    ) as jasmine.SpyObj<AssetsService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    assetsService.getProductTypes.and.returnValue(of([{ id: 1, nome: 'CDB' }]));
    assetsService.getAssetById.and.returnValue(
      of({
        id: 1,
        descricao: 'CDB XPTO',
        dataValidade: '2026-01-01',
        investimentoMinimo: 1500.0,
        tipoProdutoId: 1,
        indexadorId: 1,
      })
    );

    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar tipos de produtos no ngOnInit', () => {
    component.ngOnInit();
    expect(assetsService.getProductTypes).toHaveBeenCalled();
    expect(component.productTypes$.subscribe).toBeTruthy();
  });

  it('deve carregar um ativo ao inicializar com um id', () => {
    component.ngOnInit();
    expect(assetsService.getAssetById).toHaveBeenCalledWith(1);
    expect(component.assetForm.value).toEqual({
      descricao: 'CDB XPTO',
      dataValidade: '2026-01-01',
      investimentoMinimo: 1500.0,
      tipoProdutoId: 1,
      indexadorId: 1,
    });
  });

  it('deve criar um novo ativo', () => {
    const novoAtivo = {
      id: 2,
      descricao: 'Novo CDB',
      dataValidade: '2026-12-31',
      investimentoMinimo: 2000,
      tipoProdutoId: 1,
      indexadorId: 1,
    };

    assetsService.createAsset.and.returnValue(of(novoAtivo));

    component.assetForm.setValue({
      descricao: 'Novo CDB',
      dataValidade: '2026-12-31',
      investimentoMinimo: 2000,
      tipoProdutoId: 1,
      indexadorId: 1,
    });

    component.onSubmit();

    expect(assetsService.createAsset).toHaveBeenCalledWith(
      jasmine.objectContaining({
        descricao: 'Novo CDB',
        dataValidade: '2026-12-31',
        investimentoMinimo: 2000,
        tipoProdutoId: 1,
        indexadorId: 1,
      })
    );
    expect(snackBar.open).toHaveBeenCalledWith(
      'Ativo criado com sucesso!',
      'Fechar',
      {
        duration: 3000,
        panelClass: ['rfa-snackbar'],
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
      }
    );
    expect(router.navigate).toHaveBeenCalledWith(['/ativos']);
  });

  it('deve atualizar um ativo existente', () => {
    component.assetId = 1;
    component.assetForm.setValue({
      descricao: 'CDB Atualizado',
      dataValidade: '2027-01-01',
      investimentoMinimo: 2500,
      tipoProdutoId: 1,
      indexadorId: 1,
    });

    component.onSubmit();

    expect(assetsService.updateAsset).toHaveBeenCalledWith(
      1,
      jasmine.objectContaining({
        descricao: 'CDB Atualizado',
        dataValidade: '2027-01-01',
        investimentoMinimo: 2500,
        tipoProdutoId: 1,
        indexadorId: 1,
      })
    );
    expect(snackBar.open).toHaveBeenCalledWith(
      'Ativo atualizado com sucesso!',
      'Fechar',
      {
        duration: 3000,
        panelClass: ['rfa-snackbar'],
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
      }
    );
    expect(router.navigate).toHaveBeenCalledWith(['/ativos']);
  });

  it('deve mostrar mensagem de erro ao criar um ativo', () => {
    const errorResponse = { error: { message: 'Erro ao criar' } };

    // Mock do retorno com erro
    assetsService.createAsset.and.returnValue(throwError(errorResponse));

    component.assetForm.setValue({
      descricao: 'Novo CDB',
      dataValidade: '2026-12-31',
      investimentoMinimo: 2000,
      tipoProdutoId: 1,
      indexadorId: 1,
    });

    component.onSubmit();

    expect(snackBar.open).toHaveBeenCalledWith(
      'Erro ao criar ativo: Erro ao criar',
      'Fechar',
      {
        duration: 3000,
        panelClass: ['rfa-snackbar'],
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
      }
    );
  });
});
