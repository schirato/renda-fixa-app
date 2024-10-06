import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AssetsService } from 'src/app/services/assets.service';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-assets-list',
  templateUrl: './assets-list.component.html',
  styleUrls: ['./assets-list.component.scss'],
})
export class AssetsListComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'descricao',
    'dataValidade',
    'investimentoMinimo',
    'acoes',
  ];
  dataSource = new MatTableDataSource<any>([]);
  noDataMessage: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private assetsService: AssetsService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchAssets();
  }

  fetchAssets(): void {
    this.assetsService.getAssets().subscribe(
      (data: any[]) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
      },
      (error: any) => {
        console.error('Erro ao carregar ativos:', error);
      }
    );
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return data.descricao.toLowerCase().includes(filter);
    };
    this.dataSource.filter = filterValue;
    this.noDataMessage = this.dataSource.filteredData.length === 0;
  }

  editAsset(id: number): void {
    this.router.navigate(['/ativos/edit', id]);
  }

  async deleteAsset(id: number): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        message: 'Tem certeza que deseja excluir este ativo?',
      },
    });

    const result = await firstValueFrom(dialogRef.afterClosed());

    if (result === true) {
      try {
        await firstValueFrom(this.assetsService.deleteAsset(id));
        this.snackBar.open('Ativo excluído com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['rfa-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
        });
        this.fetchAssets();
      } catch (error) {
        console.error('Erro ao excluir ativo:', error);
        this.snackBar.open('Erro ao excluir ativo', 'Fechar', {
          duration: 3000,
          panelClass: ['rfa-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
        });
      }
    }
  }
}
