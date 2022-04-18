import dayjs, { Dayjs } from 'dayjs'
import { formatDate, formatPlan, getPlanByUsers } from './db/logic'
import { Plan, User } from './db/models'
import _ from 'lodash'
import { execSync } from 'child_process'

export async function formatStart(id?: number) {
  return `hello, it is me the boijo bot\n\n${await formatUserPlans(id)}`
}

export async function formatUserPlans(id?: number) {
  if (id === undefined) return `you bojio`

  const plans = await getPlanByUsers(id)
  if (plans.length === 0) return `you bojio`
  return [
    `you got ${plans.length} jio${plans.length > 1 ? 's' : ''}:`,
    ..._(plans)
      .sortBy((plan) => plan.date.getTime())
      .map((plan) => {
        return `${formatPlan(plan)} (${plan.status})`
      })
      .value(),
  ].join('\n')
}

export function formatHelp() {
  return `help! i was created because my friends have too many friends...\n\nbuild: ${execSync(
    'git rev-parse HEAD',
  ).subarray(0, 6)}`
}

export const formatNew0 = () => `jio people:\nselect date`
export const formatNew1 = (date: Dayjs) =>
  `jio people:\ndate: ${formatDate(date)}\nselect location`
export const formatNew2 = (date: Dayjs, location: string) =>
  `jio people:\ndate: ${formatDate(date)}\nlocation: ${location}\nselect status`
export const formatNew3 = (date: Dayjs, location: string, status: string) =>
  `jio people:\ndate: ${formatDate(
    date,
  )}\nlocation: ${location}\nstatus: ${status}\nadded!`

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
                  plan.status === 'ok'
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
