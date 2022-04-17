import 'reflect-metadata'
import { DataSource } from 'typeorm'
import path from 'path'
import { config } from './../config'

export const dataSource = new DataSource({
  type: 'sqlite',
  database: config.database.name,
  synchronize: config.environment !== 'production',
  logging: config.environment !== 'production',
  entities: [path.join(__dirname, '/models/*.{ts,js}')],
  migrations: [path.join(__dirname, '/migrations/*.{ts,js}')],
  subscribers: [],
})
