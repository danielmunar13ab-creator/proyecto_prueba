export type TableStatus = 'disponible' | 'ocupada';

export interface Table {
    id: number;
    number: number;
    capacity: number;
    status: TableStatus;
}
