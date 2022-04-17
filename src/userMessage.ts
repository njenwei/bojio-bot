import dayjs, { Dayjs } from 'dayjs'
import { formatDate, formatPlan, getPlanByUsers } from './db/logic'
import { Plan, User } from './db/models'
import _ from 'lodash'

export async function formatStart(id?: number) {
  return `Hello, it is me the boijo bot\n\n${await formatUserPlans(id)}`
}

export async function formatUserPlans(id?: number) {
  if (id === undefined) return `you have nothing`

  const plans = await getPlanByUsers(id)
  if (plans.length === 0) return `you have nothing`
  return (
    _(plans)
      // Group by day
      .groupBy((plan) => dayjs(plan.date).local().startOf('day').format())
      .sortBy((plans) => plans[0].date.getTime())
      .map((plans) => {
        const locUserText = _(plans)
          // Group by location
          .groupBy((plan) => plan.location.name)
          .sortBy((plans) => -plans.length) // sort by descending
          .map(
            (plans) =>
              // Format maybe users as italics
              `${plans[0].location.name}`,
          )
          .value()

        return [`__*${formatDate(plans[0].date)}*__`, ...locUserText, ''].join(
          '\n',
        )
      })
      .value()
      .join('\n')
      .replace(/\./g, '\\.')
      .replace(/-/g, '\\-')
  )
}

export const formatHelp = () =>
  `help! i was created because my friends have too many friends...`

export const formatNew0 = () => `new jio:\n1. select date`
export const formatNew1 = (date: Dayjs) =>
  `new jio:\n1. date: ${formatDate(date)}\n2. select location`
export const formatNew2 = (date: Dayjs, location: string) =>
  `new jio:\n1. date: ${formatDate(
    date,
  )}\n2. location: ${location}\n3. select status`
export const formatNew3 = (date: Dayjs, location: string, status: string) =>
  `new jio:\n1. date: ${formatDate(
    date,
  )}\n2. location: ${location}\n3. status: ${status}\nadded!`

export const formatModify0 = () => `select jio to modify`
export const formatModify3 = (plan: Plan) =>
  `modifying ${formatPlan(plan)} (${plan.status})`
export const formatModify1 = (plan: Plan) => `cancelled ${formatPlan(plan)}`
export const formatModify2 = (plan: Plan, status: string) =>
  `changed ${formatPlan(plan)} to ${status}`

export const formatUsers = (users: User[]) => {
  if (users.length === 0) return `no active users yet`
  return `*active users:*\n${users.map((user) => user.name).join('\n')}`
}

export const formatPlans = (plans: Plan[]) => {
  if (plans.length === 0) return `no plans yet`

  function fmtTgUser(user: User) {
    return `[${user.name}](tg://user?id=${user.id})`
  }

  return (
    _(plans)
      // Group by day
      .groupBy((plan) => dayjs(plan.date).local().startOf('day').format())
      .sortBy((plans) => plans[0].date.getTime())
      .map((plans) => {
        const locUserText = _(plans)
          // Group by location
          .groupBy((plan) => plan.location.name)
          .sortBy((plans) => -plans.length) // sort by descending
          .map(
            (plans) =>
              // Format maybe users as italics
              `${plans[0].location.name}: ${plans
                .map((plan) =>
                  plan.status === 'confirm'
                    ? `${fmtTgUser(plan.user)}`
                    : `_${fmtTgUser(plan.user)}_`,
                )
                .join(', ')}`,
          )
          .value()

        return [`__*${formatDate(plans[0].date)}*__`, ...locUserText, ''].join(
          '\n',
        )
      })
      .value()
      .join('\n')
      .replace(/\./g, '\\.')
      .replace(/-/g, '\\-')
  )
}
