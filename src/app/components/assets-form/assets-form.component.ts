import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { MatSnackBar } from '@angular/material/snack-bar';
import { AssetsService } from 'src/app/services/assets.service';

@Component({
  selector: 'app-assets-form',
  templateUrl: './assets-form.component.html',
  styleUrls: ['./assets-form.component.scss'],
})
export class AssetsFormComponent implements OnInit {
  assetForm: FormGroup;
  asset: any | null = null;
  loading = false;
  assetId: number | null = null;

  private productTypesSubject = new BehaviorSubject<any[]>([]);
  productTypes$: Observable<any[]> = this.productTypesSubject.asObservable();

  private indexesSubject = new BehaviorSubject<any[]>([]);
  indexes$: Observable<any[]> = this.indexesSubject.asObservable();

  constructor(
    private fb: FormBuilder,
    private assetsService: AssetsService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.assetForm = this.fb.group({
      descricao: ['', [Validators.required, Validators.maxLength(100)]],
      dataValidade: ['', [Validators.required, this.validDate()]],
      investimentoMinimo: ['', [Validators.required]],
      tipoProdutoId: ['', Validators.required],
      indexadorId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadProductTypes();

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          this.assetId = id ? +id : null;
          return this.assetId ? this.loadAsset(this.assetId) : of(null);
        })
      )
      // Lógica para popular o formulário com os dados do ativo
      // Não funciona através do endpoint: https://api.andbank.com.br/candidate/renda-fixa/{id}
      // Erro 405 Method Not Allowed

      .subscribe((data) => {
        if (data) {
          this.asset = data;
          this.assetForm.patchValue(data);
          this.onProductTypeChange(data.tipoProdutoId);
        }
      });

    this.assetForm
      .get('tipoProdutoId')
      ?.valueChanges.pipe(
        switchMap((productTypeId: number) =>
          this.assetsService.getIndexesByProductType(productTypeId)
        )
      )
      .subscribe((indexes) => {
        this.indexesSubject.next(indexes);
      });
  }

  loadProductTypes(): void {
    this.assetsService.getProductTypes().subscribe(
      (productTypes) => {
        this.productTypesSubject.next(productTypes);
      },
      (error: any) => {
        console.error('Erro ao carregar tipos de produto:', error);
      }
    );
  }

  loadAsset(id: number): Observable<any> {
    return this.assetsService.getAssetById(id).pipe(
      tap((data: any) => {
        this.onProductTypeChange(data.tipoProdutoId);
      })
    );
  }

  onProductTypeChange(tipoProdutoId: number): void {
    if (tipoProdutoId) {
      this.assetsService.getIndexesByProductType(tipoProdutoId).subscribe(
        (indexador: any[]) => {
          this.indexesSubject.next(indexador);
        },
        (error: any) => {
          this.showSnackbar('Erro ao carregar indexadores: ' + error.message);
        }
      );
    } else {
      this.indexesSubject.next([]);
    }
  }

  validDate(): Validators {
    return (control: any): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return { invalidDate: 'Data inválida' };
      }

      return null;
    };
  }

  onSubmit(): void {
    if (this.assetForm.valid) {
      this.loading = true;
      const assetData = { ...this.assetForm.value };

      const dataValidade = this.assetForm.get('dataValidade')?.value;
      if (dataValidade) {
        assetData.dataValidade = new Date(dataValidade)
          .toISOString()
          .split('T')[0];
      }

      if (this.assetId) {
        assetData.id = this.assetId;
        this.assetsService.updateAsset(this.assetId, assetData).subscribe(
          () => {
            this.showSnackbar('Ativo atualizado com sucesso!');
            this.router.navigate(['/ativos']);
          },
          (error) => {
            this.loading = false;
            const errorMsg =
              error.error?.message || error.message || 'Erro desconhecido';
            this.showSnackbar('Erro ao atualizar ativo: ' + errorMsg);
          }
        );
      } else {
        // Modo de criação de novo ativo
        this.assetsService.createAsset(assetData).subscribe(
          () => {
            this.showSnackbar('Ativo criado com sucesso!');
            this.router.navigate(['/ativos']);
          },
          (error) => {
            this.loading = false;
            const errorMsg =
              error.error?.message || error.message || 'Erro desconhecido';
            this.showSnackbar('Erro ao criar ativo: ' + errorMsg);
          }
        );
      }
    }
  }

  private showSnackbar(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['rfa-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
    });
  }
}
