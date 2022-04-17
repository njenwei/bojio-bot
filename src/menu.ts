import { Menu } from '@grammyjs/menu'
import {
  deletePlan,
  formatDate,
  formatPlan,
  getDates,
  getLocation,
  getLocations,
  getPlan,
  getPlanByUsers,
  getStatus,
  updatePlan,
  updateUser,
} from './db/logic'
import _ from 'lodash'
import { Plan, User } from './db/models'
import dayjs from 'dayjs'
import {
  formatModify0,
  formatModify1,
  formatModify2,
  formatModify3,
  formatNew0,
  formatNew1,
  formatNew2,
  formatNew3,
  formatStart,
} from './userMessage'

const datePickerMenu = new Menu('date-picker-menu')
  .dynamic(async (ctx, range) => {
    const payload = `!payload`
    console.log(`date-picker-menu called with ${ctx.match} ${payload}`)

    const opts = getDates()
    opts.forEach((d) => {
      range
        .submenu(
          { text: formatDate(d), payload: `${d.format('YYYYMMDD')}` },
          'location-picker-menu',
          async (ctx) => {
            await ctx.editMessageText(formatNew1(d))
          },
        )
        .row()
    })
    range.back({ text: 'back', payload }, async (ctx) =>
			ctx.editMessageText(await formatStart(ctx.from.id), { parse_mode: 'MarkdownV2' }),
    )
    return range
  })
  .text('quit', (ctx) => ctx.deleteMessage())

const locationPickerMenu = new Menu('location-picker-menu')
  .dynamic(async (ctx, range) => {
    const payload = `${ctx.match}`.split(':').slice(0, 1).join(':')
    console.log(`location-picker-menu called with ${ctx.match} ${payload}`)

    const locations = await getLocations()
    locations.forEach((location) => {
      range
        .submenu(
          { text: location.name, payload: `${payload}:${location.id}` },
          'status-picker-menu',
          async (ctx) => {
            const params = payload.split(':')
            const date = dayjs(params[0], 'YYYYMMDD')
            await ctx.editMessageText(formatNew2(date, location.name))
          },
        )
        .row()
    })
    range.back({ text: 'back', payload }, (ctx) => {
      ctx.editMessageText(formatNew0())
    })
    return range
  })
  .text('quit', (ctx) => ctx.deleteMessage())

const statusPickerMenu = new Menu('status-picker-menu')
  .dynamic(async (ctx, range) => {
    const payload = `${ctx.match}`.split(':').slice(0, 2).join(':')
    console.log(`status-picker-menu called with ${ctx.match} ${payload}`)

    const opts = getStatus()
    opts.forEach((opt) => {
      range
        .text({ text: opt, payload: `${payload}:${opt[0]}` }, async (ctx) => {
          const params = payload.split(':')
          const location = await getLocation(_.toInteger(params[1]))
          const plan = new Plan()
          plan.user = new User()
          plan.location = location!
          plan.user.id = ctx.from.id
          plan.user.name = ctx.from.first_name
          plan.user.username = ctx.from.username ?? 'no_username'
          plan.date = dayjs(params[0], 'YYYYMMDD').toDate()
          plan.status = opt
          await ctx.menu.close({ immediate: true })
          await ctx.editMessageText(
            formatNew3(dayjs(params[0], 'YYYYMMDD'), location!.name, opt),
          )
          await updateUser(plan.user)
          await updatePlan(plan)
        })
        .row()
    })
    range.back({ text: 'back', payload }, (ctx) => {
      const params = payload.split(':')
      const date = dayjs(params[0], 'YYYYMMDD')
      ctx.editMessageText(formatNew1(date))
    })
    return range
  })
  .text('quit', (ctx) => ctx.deleteMessage())

datePickerMenu.register(locationPickerMenu)
locationPickerMenu.register(statusPickerMenu)

export const pickerMenu = datePickerMenu

export const manageMenu = new Menu('manage-menu')
  .dynamic(async (ctx, range) => {
    const payload = `!payload`
    console.log(`manage-menu called with ${ctx.match} ${payload}`)
    const plans = await getPlanByUsers(ctx.from?.id as number)
    plans.forEach((plan) => {
      const text = `${formatPlan(plan!)} (${plan.status})`
      range
        .submenu(
          { text, payload: `${plan.id}` },
          'cancel-manage-menu',
          async (ctx) => {
            await ctx.editMessageText(formatModify3(plan))
          },
        )
        .row()
    })
    range.back({ text: 'back', payload }, async (ctx) =>
			ctx.editMessageText(await formatStart(ctx.from.id), { parse_mode: 'MarkdownV2' }),
    )
    return range
  })
  .text('quit', (ctx) => ctx.deleteMessage())

const manageCancelMenu = new Menu('cancel-manage-menu')
  .dynamic(async (ctx, range) => {
    const payload = `${ctx.match}`.split(':').slice(0, 1).join(':')
    console.log(`cancel-manage-menu called with ${ctx.match} ${payload}`)

    const params = payload.split(':')
    const plan = await getPlan(_.toInteger(params[0]))
    // Create options
    const opts = ['confirm', 'maybe', 'cancel']
    opts
      .filter((e) => plan?.status !== e)
      .forEach((opt) => {
        range
          .text({ text: opt, payload: `${payload}:${opt}` }, async (ctx) => {
            await ctx.menu.close({ immediate: true })
            const plan = await getPlan(_.toInteger(params[0]))
            if (opt === 'cancel') {
              await ctx.editMessageText(formatModify1(plan!))
              await deletePlan(plan!)
            } else {
              await ctx.editMessageText(formatModify2(plan!, opt))
              plan!.status = opt
              await updatePlan(plan!)
            }
          })
          .row()
      })
    range.back({ text: 'back', payload }, (ctx) =>
      ctx.editMessageText(formatModify0()),
    )
    return range
  })
  .text('quit', (ctx) => ctx.deleteMessage())

manageMenu.register(manageCancelMenu)
