export interface WbStorageCoefficient {
    warehouseId: number;
    warehouseName: string;
    coefficient: number;
    updatedAt: Date;
}

export interface GoogleSheetConfig {
    id?: number;
    sheet_id: string;
    sheet_name: string;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface StorageCoefficientRow {
    warehouse_id: number;
    warehouse_name: string;
    coefficient: number;
    date: string;
    updated_at: Date;
}