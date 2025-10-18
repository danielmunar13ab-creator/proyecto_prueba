import { Injectable, signal } from '@angular/core';
import { Table, TableStatus } from '../models/table.model';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  private _tables = signal<Table[]>([
    { id: 1, number: 1, capacity: 4, status: 'disponible' },
    { id: 2, number: 2, capacity: 2, status: 'disponible' },
    { id: 3, number: 3, capacity: 4, status: 'ocupada' },
    { id: 4, number: 4, capacity: 6, status: 'disponible' },
    { id: 5, number: 5, capacity: 2, status: 'ocupada' },
    { id: 6, number: 6, capacity: 8, status: 'disponible' },
    { id: 7, number: 7, capacity: 4, status: 'disponible' },
    { id: 8, number: 8, capacity: 2, status: 'disponible' },
  ]);

  get tables() {
    return this._tables.asReadonly();
  }

  updateTableStatus(tableId: number, status: TableStatus) {
    this._tables.update(tables => 
      tables.map(table => 
        table.id === tableId ? { ...table, status } : table
      )
    );
  }
}
