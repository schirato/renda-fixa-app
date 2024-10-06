import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssetsListComponent } from './assets-list.component';
import { AssetsService } from 'src/app/services/assets.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AssetsListComponent', () => {
  let component: AssetsListComponent;
  let fixture: ComponentFixture<AssetsListComponent>;
  let assetsService: jasmine.SpyObj<AssetsService>;
  let router: jasmine.SpyObj<Router>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let paginator: MatPaginator;

  beforeEach(() => {
    const assetsServiceSpy = jasmine.createSpyObj('AssetsService', [
      'getAssets',
      'deleteAsset',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    const dialogRefMock = {
      afterClosed: () => of(true),
    } as unknown as MatDialogRef<ConfirmationDialogComponent>;

    TestBed.configureTestingModule({
      declarations: [AssetsListComponent],
      providers: [
        { provide: AssetsService, useValue: assetsServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: MatDialog, useValue: dialogSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AssetsListComponent);
    component = fixture.componentInstance;
    assetsService = TestBed.inject(
      AssetsService
    ) as jasmine.SpyObj<AssetsService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    paginator = TestBed.inject(MatPaginator);
    component.paginator = paginator;

    dialog.open.and.returnValue(dialogRefMock);
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve buscar ativos ao iniciar', () => {
    const mockAssets = [
      { id: 1, descricao: 'Ativo 1' },
      { id: 2, descricao: 'Ativo 2' },
    ];
    assetsService.getAssets.and.returnValue(of(mockAssets));

    component.ngOnInit();

    expect(assetsService.getAssets).toHaveBeenCalled();
    expect(component.dataSource.data).toEqual(mockAssets);
    expect(component.dataSource.paginator).toBe(paginator);
  });

  it('deve aplicar filtro corretamente', () => {
    const mockAssets = [
      { id: 1, descricao: 'Ativo 1' },
      { id: 2, descricao: 'Ativo 2' },
      { id: 3, descricao: 'Ativo 3' },
    ];
    component.dataSource.data = mockAssets;

    const event = { target: { value: 'Ativo 1' } } as unknown as Event;
    component.applyFilter(event);

    expect(component.dataSource.filter).toBe('ativo 1');
    expect(component.noDataMessage).toBe(false);
  });

  it('deve navegar para a edição do ativo', () => {
    component.editAsset(1);
    expect(router.navigate).toHaveBeenCalledWith(['/ativos/edit', 1]);
  });

  it('deve excluir um ativo com sucesso', async () => {
    // assetsService.deleteAsset.and.returnValue(of({}));

    spyOn(component, 'fetchAssets').and.callThrough();

    await component.deleteAsset(1);

    expect(dialog.open).toHaveBeenCalledWith(
      ConfirmationDialogComponent,
      jasmine.any(Object)
    );
    expect(assetsService.deleteAsset).toHaveBeenCalledWith(1);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Ativo excluído com sucesso!',
      'Fechar',
      {
        duration: 3000,
        panelClass: ['rfa-snackbar'],
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
      }
    );
    expect(component.fetchAssets).toHaveBeenCalled();
  });

  it('deve mostrar mensagem de erro ao excluir um ativo', async () => {
    const errorResponse = { message: 'Erro ao excluir' };
    assetsService.deleteAsset.and.returnValue(throwError(errorResponse));

    await component.deleteAsset(1);

    expect(snackBar.open).toHaveBeenCalledWith(
      'Erro ao excluir ativo',
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
