// src/services/wb.service.ts
import axios from 'axios';
import { WbStorageCoefficient } from '../types/index.types';
import { logger } from '../utils/logger.utils';

export class WildberriesService {
    private readonly apiUrl = 'https://common-api.wildberries.ru/api/v1/tariffs/box';
    private readonly apiToken: string;
    private lastRequestTime: number = 0;
    private readonly minRequestInterval = 1000;

    constructor(apiToken: string) {
        this.apiToken = apiToken;
    }

    private async throttleRequest(): Promise<void> {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve =>
                setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
            );
        }

        this.lastRequestTime = Date.now();
    }

    async getStorageCoefficients(): Promise<WbStorageCoefficient[]> {
        try {
            await this.throttleRequest();
            const today = new Date().toISOString().split('T')[0];

            const response = await axios.get(this.apiUrl, {
                headers: { 'Authorization': this.apiToken },
                params: { date: today }
            });

            return response.data.map((item: any) => ({
                warehouseId: item.warehouseId,
                warehouseName: item.warehouseName,
                coefficient: item.coefficient,
                updatedAt: new Date()
            }));
        } catch (error) {
            logger.error('Failed to fetch WB storage coefficients:', error);
            throw error;
        }
    }
}