import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
const VALID_TOKEN = /^Expo(nent)?PushToken\[/

// Envia uma notificação push para um ou mais usuários
export async function sendPush(userIds, title, body, data = {}) {
  try {
    const ids = Array.isArray(userIds) ? userIds : [userIds]

    const users = await prisma.user.findMany({
      where: { id: { in: ids }, pushToken: { not: null } },
      select: { pushToken: true }
    })

    const messages = users
      .filter((u) => VALID_TOKEN.test(u.pushToken))
      .map((u) => ({
        to: u.pushToken,
        sound: 'default',
        title,
        body,
        data
      }))

    if (messages.length === 0) return

    await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(messages)
    })
  } catch (error) {
    console.error('[sendPush]', error)
  }
}

export default { sendPush }