// server/api/auth/refresh.post.ts
export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const response = await $fetch('http://localhost:8080/auth/refresh', {
      method: 'POST',
      body,
    })
    return response
  })