import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AssetsService } from 'src/app/services/assets.service';

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
  ];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private assetsService: AssetsService) {}

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
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
