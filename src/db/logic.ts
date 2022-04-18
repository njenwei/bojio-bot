import database from './index'
import dayjs, { Dayjs } from 'dayjs'
import _ from 'lodash'
import { Location, Plan, User } from './models'
import { Between } from 'typeorm'

export function formatDate(d: Dayjs | Date): string {
	if (d instanceof Date) d = dayjs(d)
	d = d.local()

	if (d.isSame(dayjs(), 'day')) {
		return d.format('[today] [-] DD/MM')
	}

	if (d.isSame(dayjs().add(1, 'day'), 'day')) {
		return d.format('[tmr] [-] DD/MM')
	}

	return d.format('ddd [-] DD/MM').toLowerCase()
}

export function formatPlan(plan: Plan): string {
	return `${formatDate(plan!.date)} @ ${plan!.location.name}`
}

export async function getLocations(): Promise<Location[]> {
	return await database.manager.find(Location)
}

export function getDates(): Dayjs[] {
	return _.range(0, 7).map((i: number) => dayjs().add(i, 'day'))
}

export async function getPlans() {
	return (await database
		.createQueryBuilder('plan', 'plan')
		.leftJoinAndSelect('plan.user', 'user')
		.leftJoinAndSelect('plan.location', 'location')
		.where({
			date: Between(
				dayjs().startOf('day').subtract(1, 'sec').toDate(),
				dayjs().startOf('day').add(7, 'days').subtract(1, 'sec').toDate(),
			),
		})
		.getMany()) as Plan[]
}

export async function getUsers(): Promise<User[]> {
	return database.manager.find(User)
}

export async function getPlan(id: number): Promise<Plan | null> {
	const planRepo = database.getRepository(Plan)
	return planRepo.findOne({
		relations: ['location', 'user'],
		where: { id: id },
	})
}

export async function getLocation(id: number): Promise<Location | null> {
	return database.getRepository(Location).findOne({
		where: { id: id },
	})
}

export async function updateUser(user: User) {
	console.log('updateUser', user)
	return database.getRepository(User).save(user)
}

export async function updatePlan(plan: Plan) {
	console.log('updatePlan', plan)
	return database.getRepository(Plan).save(plan)
}

export async function deletePlan(plan: Plan) {
	const planRepo = database.getRepository(Plan)
	return planRepo.remove(plan)
}

export async function getPlanByUsers(id: number) {
	const planRepo = database.getRepository(Plan)
	const dbPlan = await planRepo.find({
		relations: {
			location: true,
		},
		where: {
			date: Between(
				dayjs().startOf('day').subtract(1, 'sec').toDate(),
				dayjs().startOf('day').add(7, 'days').toDate(),
			),
			user: { id: id },
		},
		order: {
			date: 'ASC',
		},
	})

	return dbPlan
}

export function getStatus(): string[] {
	return ['ok', 'maybe']
}
