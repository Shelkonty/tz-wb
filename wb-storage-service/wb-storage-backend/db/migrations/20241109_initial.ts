import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('storage_coefficients', (table) => {
        table.increments('id').primary();
        table.integer('warehouse_id').notNullable();
        table.string('warehouse_name').notNullable();
        table.decimal('coefficient', 10, 2).notNullable();
        table.date('date').notNullable();
        table.timestamp('updated_at').defaultTo(knex.fn.now());

        table.unique(['warehouse_id', 'date']);
    });

    await knex.schema.createTable('google_sheets_config', (table) => {
        table.increments('id').primary();
        table.string('sheet_id').notNullable().unique();
        table.string('sheet_name').notNullable();
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('storage_coefficients');
    await knex.schema.dropTable('google_sheets_config');
}