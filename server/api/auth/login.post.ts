// server/api/auth/login.post.ts
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  access_token_expiry: string;
  refresh_token_expiry: string;
}

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const response = await $fetch<LoginResponse>('http://localhost:8080/auth/login', {
      method: 'POST',
      body,
    })
    return {
      ...response,
      username: body.username, // Include username in the response
    }
  })