import dotenv from 'dotenv-flow'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import convict from 'convict'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Singapore')

process.env.NODE_ENV = process.env.ENV ?? 'development'
dotenv.config()

const isProduction = process.env.NODE_ENV === 'production'

export const config = convict({
  BOT_TOKEN: {
    env: 'BOT_TOKEN',
    sensitive: true,
    default: '',
    format: String,
  },
  environment: {
    env: 'NODE_ENV',
    format: ['development', 'production'],
    default: 'development',
  },
  database: {
    name: {
      default: isProduction ? './db.production.sqlite' : './db.sqlite',
      format: String,
    },
  },
})
  .validate()
  .getProperties()

console.log(config)
