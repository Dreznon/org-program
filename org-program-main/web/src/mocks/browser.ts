import { setupWorker, http, HttpResponse } from 'msw'

const categories = [
  { id: 'Bathroom', name: 'Bathroom', count: 1 },
  { id: 'Kitchen', name: 'Kitchen', count: 1 },
]

export const handlers = [
  http.get('/api/categories', () => HttpResponse.json(categories)),
  http.get('/api/items/:id', ({ params }) => {
    const { id } = params as { id: string }
    return HttpResponse.json({ id, name: 'Sample', description: 'Example', quantity: 1, tags: ['sample'], category: 'Bathroom' })
  }),
  http.post('/api/categorize', async ({ request }) => {
    const body = await request.json().catch(() => ({})) as any
    const name: string = (body?.name ?? '').toLowerCase()
    const category = name.includes('knife') ? 'Kitchen' : 'Miscellaneous'
    return HttpResponse.json({ category })
  }),
]

const worker = setupWorker(...handlers)

export async function setupMsw() {
  await worker.start({ quiet: true })
}


