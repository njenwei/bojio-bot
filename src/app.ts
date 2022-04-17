import { Bot, GrammyError, HttpError } from 'grammy'
import { Menu } from '@grammyjs/menu'
import { getPlans, getUsers } from './db/logic'
import { manageMenu, pickerMenu } from './menu'
import {
  formatHelp,
  formatModify0,
  formatNew0,
  formatPlans,
  formatStart,
  formatUsers,
} from './userMessage'
import { config } from './config'

const bot = new Bot(config.BOT_TOKEN)

const mainMenu = new Menu('menu')
  .text('who', async (ctx) => {
    const users = await getUsers()
    await ctx.menu.close({ immediate: true })
    await ctx.editMessageText(formatUsers(users), { parse_mode: 'MarkdownV2' })
  })
  .text('when', async (ctx) => {
    const plans = await getPlans()
    await ctx.menu.close({ immediate: true })
    await ctx.editMessageText(formatPlans(plans), { parse_mode: 'MarkdownV2' })
  })
  .row()
  .submenu(
    { text: 'new jio', payload: `!payload` },
    'date-picker-menu',
    async (ctx) => await ctx.editMessageText(formatNew0()),
  )
  .row()
  .submenu(
    { text: 'manage jio', payload: `!payload` },
    'manage-menu',
    async (ctx) => await ctx.editMessageText(formatModify0()),
  )
  .row()
  .text('help', (ctx) => ctx.editMessageText(formatHelp()))
  .text('quit', (ctx) => ctx.deleteMessage())

mainMenu.register(pickerMenu)
mainMenu.register(manageMenu)
bot.use(mainMenu)

bot.command('start', async (ctx) => {
  await ctx.reply(await formatStart(ctx.from?.id), { parse_mode: 'MarkdownV2', reply_markup: mainMenu })
})

bot.api.setMyCommands([
  { command: 'start', description: 'Start the bojio bot' },
])

bot.catch((err) => {
  const ctx = err.ctx
  console.error(`Error while handling update ${ctx.update.update_id}:`)
  const e = err.error
  if (e instanceof GrammyError) {
    console.error('Error in request:', e.description)
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram:', e)
  } else {
    console.error('Unknown error:', e)
  }
})

bot.start()
