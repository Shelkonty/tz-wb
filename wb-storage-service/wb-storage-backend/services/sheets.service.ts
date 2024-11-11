import { google } from 'googleapis';
import { GoogleSheetConfig } from '../types/index.types';
import { StorageCoefficientRepository } from '../repositories/storage-coefficient.repository';
import { logger } from '../utils/logger.utils';

export class GoogleSheetsService {
    private sheets;
    private repository: StorageCoefficientRepository;

    constructor(repository: StorageCoefficientRepository) {
        const auth = new google.auth.GoogleAuth({
            keyFile: 'credentials.json',
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        this.sheets = google.sheets({ version: 'v4', auth });
        this.repository = repository;
    }

    async updateAllSheets(): Promise<void> {
        try {
            const today = new Date().toISOString().split('T')[0];
            const coefficients = await this.repository.getCoefficientsForDate(today);
            const sheets = await this.repository.getActiveSheets();

            for (const sheet of sheets) {
                await this.updateSheet(sheet, coefficients);
            }

            logger.info('All sheets updated successfully');
        } catch (error) {
            logger.error('Failed to update sheets:', error);
            throw error;
        }
    }

    private async updateSheet(sheet: GoogleSheetConfig, data: any[]): Promise<void> {
        try {
            const values = [
                ['ID склада', 'Название склада', 'Коэффициент', 'Дата обновления'],
                ...data.map(item => [
                    item.warehouse_id.toString(),
                    item.warehouse_name,
                    item.coefficient.toString(),
                    new Date(item.updated_at).toLocaleString('ru-RU')
                ])
            ];

            await this.sheets.spreadsheets.values.update({
                spreadsheetId: sheet.sheet_id,
                range: 'stocks_coefs!A1',
                valueInputOption: 'RAW',
                requestBody: { values },
            });

            logger.info(`Sheet ${sheet.sheet_name} updated successfully`);
        } catch (error) {
            logger.error(`Failed to update sheet ${sheet.sheet_name}:`, error);
            throw error;
        }
    }
}