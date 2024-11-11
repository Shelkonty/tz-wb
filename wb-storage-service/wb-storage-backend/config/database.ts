import { knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

export const db = knex({
    client: 'postgresql',
    connection: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
    migrations: {
        directory: '../migrations',
        tableName: 'knex_migrations',
    },
});