import DatabaseConnection from '../datastore/database/datasource';
import logger from '../logger';
import { DataSource } from 'typeorm';
class ServiceInterface {
  private _db: DatabaseConnection;
  constructor(dbConnection: DatabaseConnection = DatabaseConnection.getInstance()) {
    this._db = dbConnection;
  }

  private async _getDataSource(): Promise<DataSource> {
    return this._db.getDataSource();
  }

  async _getRepository(Model) {
    const source = await this._getDataSource();
    return source.getRepository(Model);
  }
};

export default ServiceInterface;