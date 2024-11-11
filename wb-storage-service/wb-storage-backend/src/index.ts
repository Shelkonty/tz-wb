import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from '../config/database';
import { WildberriesService } from '../services/wb.service';
import { GoogleSheetsService } from '../services/sheets.service';
import { SchedulerService } from '../services/scheduler.service';
import { StorageCoefficientRepository } from '../repositories/storage-coefficient.repository';
import { logger } from '../utils/logger.utils';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());

// Инициализация сервисов
const repository = new StorageCoefficientRepository(db);
const wbService = new WildberriesService(process.env.WB_API_TOKEN || '');
const sheetsService = new GoogleSheetsService(repository);
const schedulerService = new SchedulerService(wbService, sheetsService, repository);

// Роуты
app.get('/api/coefficients', async (req, res) => {
    try {
        const date = req.query.date as string || new Date().toISOString().split('T')[0];
        const coefficients = await repository.getCoefficientsForDate(date);
        res.json(coefficients);
    } catch (error) {
        logger.error('Error fetching coefficients:', error);
        res.status(500).json({ error: 'Failed to fetch coefficients' });
    }
});

app.get('/api/sheets', async (req, res) => {
    try {
        const sheets = await repository.getActiveSheets();
        res.json(sheets);
    } catch (error) {
        logger.error('Error fetching sheets:', error);
        res.status(500).json({ error: 'Failed to fetch sheets' });
    }
});

app.post('/api/sheets', async (req, res) => {
    try {
        const { sheet_id, sheet_name } = req.body;
        await repository.addSheet(sheet_id, sheet_name);
        res.json({ message: 'Sheet added successfully' });
    } catch (error) {
        logger.error('Error adding sheet:', error);
        res.status(500).json({ error: 'Failed to add sheet' });
    }
});

// Запуск приложения
async function startApp() {
    try {
        // Проверяем подключение к БД
        await db.raw('SELECT 1');
        logger.info('Database connected successfully');

        // Запускаем планировщик
        await schedulerService.start();

        // Запускаем сервер
        app.listen(port, () => {
            logger.info(`Server is running on port ${port}`);
        });
    } catch (error) {
        logger.error('Failed to start application:', error);
        process.exit(1);
    }
}

startApp();

// Обработка завершения работы
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully');
    schedulerService.stop();
    await db.destroy();
    process.exit(0);
});