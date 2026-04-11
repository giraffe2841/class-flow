export async function getPaddleCustomerPortalUrl(customerId: string): Promise<string> {
  const isProd = process.env.NEXT_PUBLIC_PADDLE_ENV === 'production'
  const baseUrl = isProd ? 'https://api.paddle.com' : 'https://sandbox-api.paddle.com'
  const res = await fetch(`${baseUrl}/customers/${customerId}/portal-sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })
  const data = await res.json()
  return data.data?.urls?.general?.overview ?? 'https://customer.paddle.com'
}
