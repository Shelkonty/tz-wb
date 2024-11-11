export interface GoogleSheet {
    id: number;
    sheet_id: string;
    sheet_name: string;
    is_active: boolean;
    created_at: string;
}

export interface StorageCoefficient {
    warehouseId: number;
    warehouseName: string;
    coefficient: number;
    updatedAt: string;
}

export interface ApiError {
    message: string;
    status: number;
}