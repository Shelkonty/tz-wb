import { Knex } from 'knex';
import { WbStorageCoefficient, GoogleSheetConfig, StorageCoefficientRow } from '../types/index.types';
import { logger } from '../utils/logger.utils';

export class StorageCoefficientRepository {
    constructor(private readonly db: Knex) {}

    async upsertCoefficients(coefficients: WbStorageCoefficient[]): Promise<void> {
        const date = new Date().toISOString().split('T')[0];

        await this.db.transaction(async (trx) => {
            for (const coef of coefficients) {
                await trx('storage_coefficients')
                    .insert({
                        warehouse_id: coef.warehouseId,
                        warehouse_name: coef.warehouseName,
                        coefficient: coef.coefficient,
                        date: date,
                        updated_at: coef.updatedAt,
                    })
                    .onConflict(['warehouse_id', 'date'])
                    .merge();
            }
        });

        logger.info(`Upserted ${coefficients.length} coefficients for date ${date}`);
    }

    async getCoefficientsForDate(date: string): Promise<StorageCoefficientRow[]> {
        const results = await this.db<StorageCoefficientRow>('storage_coefficients')
            .where('date', date)
            .orderBy('coefficient', 'asc')
            .select('*');

        logger.info(`Retrieved ${results.length} coefficients for date ${date}`);
        return results;
    }

    async getActiveSheets(): Promise<GoogleSheetConfig[]> {
        const sheets = await this.db<GoogleSheetConfig>('google_sheets_config')
            .where('is_active', true)
            .select('*');

        logger.info(`Retrieved ${sheets.length} active sheets`);
        return sheets;
    }

    async addSheet(sheetId: string, sheetName: string): Promise<void> {
        await this.db<GoogleSheetConfig>('google_sheets_config')
            .insert({
                sheet_id: sheetId,
                sheet_name: sheetName,
                is_active: true,
            });

        logger.info(`Added new sheet: ${sheetName} (${sheetId})`);
    }

    async updateSheetStatus(sheetId: string, isActive: boolean): Promise<void> {
        await this.db<GoogleSheetConfig>('google_sheets_config')
            .where('sheet_id', sheetId)
            .update({
                is_active: isActive,
                updated_at: new Date(),
            });

        logger.info(`Updated sheet ${sheetId} status to ${isActive}`);
    }
}