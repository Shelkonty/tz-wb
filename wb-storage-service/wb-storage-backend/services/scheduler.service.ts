import schedule from 'node-schedule';
import { WildberriesService } from './wb.service';
import { GoogleSheetsService } from './sheets.service';
import { StorageCoefficientRepository } from '../repositories/storage-coefficient.repository';
import { logger } from '../utils/logger.utils';

export class SchedulerService {
    private wbService: WildberriesService;
    private sheetsService: GoogleSheetsService;
    private repository: StorageCoefficientRepository;

    constructor(
        wbService: WildberriesService,
        sheetsService: GoogleSheetsService,
        repository: StorageCoefficientRepository
    ) {
        this.wbService = wbService;
        this.sheetsService = sheetsService;
        this.repository = repository;
    }

    async start(): Promise<void> {
        schedule.scheduleJob('0 * * * *', async () => {
            try {
                const coefficients = await this.wbService.getStorageCoefficients();
                await this.repository.upsertCoefficients(coefficients);
                await this.sheetsService.updateAllSheets();
                logger.info('Scheduled task completed successfully');
            } catch (error) {
                logger.error('Scheduled task failed:', error);
            }
        });

        logger.info('Scheduler started');
    }

    stop(): void {
        schedule.gracefulShutdown();
        logger.info('Scheduler stopped');
    }
}