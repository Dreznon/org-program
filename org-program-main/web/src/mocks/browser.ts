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
    const category = name.includes('knife') || name.includes('kitchen') ? 'Kitchen' : name.includes('tooth') ? 'Bathroom' : 'Miscellaneous'
    const confidence = category === 'Miscellaneous' ? 0.4 : 0.9
    return HttpResponse.json({ category, confidence })
  }),
  http.post('/api/items', async ({ request }) => {
    const body = await request.json().catch(() => ({})) as any
    const id = Math.random().toString(36).slice(2)
    return HttpResponse.json({ id, ...body }, { status: 201 })
  }),
  http.post('/api/items/:id/advanced', async ({ params, request }) => {
    const { id } = params as { id: string }
    const _body = await request.json().catch(() => ({}))
    return HttpResponse.json({ id, ok: true })
  }),
]

const worker = setupWorker(...handlers)

export async function setupMsw() {
  await worker.start({ quiet: true })
}


