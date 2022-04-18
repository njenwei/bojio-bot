import { dataSource } from './dataSource'
import { Location, Plan, PlanStatus, User } from './models'
import _ from 'lodash'
import dayjs from 'dayjs'
import { config } from './../config'

const database = dataSource

async function addFixtures() {
  console.log('Connecting to database')
  await database.initialize()
  console.log('Connected to database')

  const LOCATIONS = [
    'fitbloc og',
    'fitbloc 2',
    'lighthouse',
    'chevons',
    'apariy',
  ]

  await database.manager.save(
    LOCATIONS.map((key, index) => {
      const location = new Location()
      location.name = key
      location.id = index
      return location
    }),
  )
}

async function addTestFixtures() {
  const USERS = [
    { id: 101, name: 'testuser1', username: 'testuser1' },
    { id: 102, name: 'testuser2', username: 'testuser2' },
    { id: 103, name: 'testuser3', username: 'testuser3' },
    { id: 104, name: 'testuser4', username: 'testuser4' },
  ]

  await database.manager.save(
    _.map(USERS, (u) => {
      const user = new User()
      user.id = u.id
      user.name = u.name
      user.username = u.username
      return user
    }),
  )

  // --
  let plan = new Plan()
  plan.id = 1
  plan.user = new User()
  plan.location = new Location()
  plan.user.id = 101
  plan.location.name = 'fitbloc og'
  plan.date = dayjs().startOf('day').toDate()
  plan.status = PlanStatus.ok
  await database.manager.save(plan)

  plan.id = 2
  plan.date = dayjs().startOf('day').add(1, 'day').toDate()
  await database.manager.save(plan)

  plan.id = 3
  plan.date = dayjs().startOf('day').add(2, 'day').toDate()
  await database.manager.save(plan)

  plan.id = 4
  plan.date = dayjs().startOf('day').add(3, 'day').toDate()
  await database.manager.save(plan)

  plan.id = 5
  plan.date = dayjs().startOf('day').add(4, 'day').toDate()
  await database.manager.save(plan)

  plan.id = 6
  plan.date = dayjs().startOf('day').add(5, 'day').toDate()
  await database.manager.save(plan)

  plan.id = 7
  plan.date = dayjs().startOf('day').add(6, 'day').toDate()
  await database.manager.save(plan)

  plan.id = 8
  plan.date = dayjs().startOf('day').add(7, 'day').toDate()
  await database.manager.save(plan)

  plan.id = 9
  plan.location.name = 'fitbloc 2'
  plan.date = dayjs().startOf('day').add(8, 'day').toDate()
  await database.manager.save(plan)

  plan.id = 10
  plan.location.name = 'fitbloc 2'
  plan.date = dayjs().startOf('day').subtract(1, 'day').toDate()
  await database.manager.save(plan)

  // --
  plan.id = 201
  plan.user.id = 102
  plan.location.name = 'fitbloc og'
  plan.date = dayjs().startOf('day').add(2, 'day').toDate()
  await database.manager.save(plan)

  plan.id = 202
  plan.location.name = 'fitbloc og'
  plan.date = dayjs().startOf('day').add(3, 'day').toDate()
  await database.manager.save(plan)

  plan.id = 203
  plan.location.name = 'lighthouse'
  plan.date = dayjs().startOf('day').add(4, 'day').toDate()
  await database.manager.save(plan)

  plan.id = 204
  plan.location.name = 'lighthouse'
  plan.date = dayjs().startOf('day').add(6, 'day').toDate()
  await database.manager.save(plan)

  // --
  plan.id = 301
  plan.user.id = 103
  plan.location.name = 'lighthouse'
  plan.date = dayjs().startOf('day').add(4, 'day').toDate()
  await database.manager.save(plan)

  plan.id = 302
  plan.user.id = 103
  plan.location.name = 'lighthouse'
  plan.date = dayjs().startOf('day').add(3, 'day').toDate()
  await database.manager.save(plan)

  plan.id = 303
  plan.user.id = 103
  plan.location.name = 'lighthouse'
  plan.status = 'maybe'
  plan.date = dayjs().startOf('day').add(5, 'day').toDate()
  await database.manager.save(plan)

  console.log('Loading locations from the database...')
  const locations = await dataSource.manager.find(Location)
  console.log('Loaded locations: ', locations)

  console.log('Loading users from the database...')
  const users = await dataSource.manager.find(User)
  console.log('Loaded users: ', users)

  console.log('Loading plans from the database...')
  const plans = await dataSource.manager.find(Plan)
  console.log('Loaded plans: ', plans)

  // // Select a user and all their watchers
  // const query = (await database
  // 	.createQueryBuilder('plan', 'plan')
  // 	.leftJoinAndSelect('plan.user', 'user')
  // 	.leftJoinAndSelect('plan.location', 'location')
  // 	.getMany()) as Plan[]
  // const sorted = _(query)
  // 	.groupBy((v) => {
  // 		return dayjs(v.date).local().format('YYYY-MM-DD')
  // 	})
  // 	.map((plans, group) => {
  // 		return {
  // 			date: group,
  // 			results: _.map(plans, (b) => {
  // 				return {
  // 					name: b.user.name,
  // 					location: b.location.name,
  // 				}
  // 			}),
  // 		}
  // 	})
  // 	.value()
  // console.log(sorted)
  //
  // const userRepo = database.getRepository(User)
  // const dbUser = await userRepo.find({ where: { id: 101 } })
  // console.log(dbUser)
  //
  // const planRepo = database.getRepository(Plan)
  // const dbPlan = await planRepo.find({
  // 	relations: {
  // 		location: true,
  // 	},
  // 	where: {
  // 		date: Between(
  // 			dayjs().startOf('day').subtract(1, 'sec').toDate(),
  // 			dayjs().startOf('day').add(7, 'days').toDate(),
  // 		),
  // 		user: { id: 103 },
  // 	},
  // })
  // console.log(dbPlan)
}

addFixtures().then(() => {
  if (config.environment === 'development') addTestFixtures()
})
export default database
