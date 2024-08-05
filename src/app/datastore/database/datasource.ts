import 'reflect-metadata';
import { DataSource } from 'typeorm';
import logger from '../../logger';
import { getDBConfigs } from '../../utils/env-utils';
import LineItemsModel from '../models/line_items';
export default class DatabaseConnection {
  private _dataSource: DataSource;
  private static _instance: DatabaseConnection;

  static getInstance(): DatabaseConnection {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new DatabaseConnection();
    return this._instance;
  }

  private async _initializeCredentials() {
    const configs = await getDBConfigs();
    if (!configs) {
      throw new Error('Error Fetching Secret Configs');
    }
    const {
      database,
      synchronize
    } = configs;

    this._dataSource = new DataSource({
      type: 'sqlite',
      database,
      logger: 'simple-console',
      synchronize,
      entities: [
        LineItemsModel
      ],
    });

  }

  public async getDataSource(): Promise<DataSource> {
    const lgr = "[getDataSource]"
    try {
      if (!this._dataSource || !this._dataSource.isInitialized) {
        logger.info(`${lgr} loading credentials ...`);
        await this._initializeCredentials();

        logger.info(`${lgr} Creating new db connection ...`);
        await this._dataSource.initialize().catch(err => {
          logger.error(`[getDataSource] DB Connection failed: ${err.message} ...`);
          throw err;
        });
        logger.info(`${lgr} Database connection successful ...`);
      } else {
        logger.info(`${lgr} Reusing existing db connection ...`);
      }
    } catch (e) {
      logger.error(`[${lgr} Failed to initialize datasource: ${e.message}`);
    }
    return this._dataSource;
  }
}