import config from 'config';
import { Sequelize } from 'sequelize';
import { ICommerceDebugger } from '@lib/common';

/**
 * Create new PostgreSQL database connection.
 *
 * @param {ICommerceDebugger} logger
 * @returns {Sequelize}
 */
export const createPgConnection = (logger: ICommerceDebugger | null): Sequelize =>
  new Sequelize({
    dialect: 'postgres',
    host: config.get('database.host') || 'localhost',
    port: parseInt(config.get('database.port') || '5432', 10),
    database: config.get('database.database') || 'postgres',
    username: config.get('database.username') || 'postgres',
    password: config.get('database.password') || 'postgres',
    pool: { min: 5, max: 50, acquire: 10000 },
    logging: logger ? (sql: string) => logger.info(sql) : false,
  });

export const initPgConnection = async (connection: Sequelize, logger: ICommerceDebugger) => {
  try {
    await connection.authenticate();
    logger.info('[PostgreSQL] connection has been established.');
  } catch (e) {
    logger.error('[PostgreSQL] unable to connect to the database', e);
  }
};
