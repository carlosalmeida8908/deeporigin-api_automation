import { ProductListSchema, ProductSchema, CategoriesSchema } from '../../support/schemas'

describe('Products: API Regression tests', () => {
  const q = 'phone'
  const category = 'smartphones'

  before(() => {
    cy.apiLogin() // stores token in Cypress.env('accessToken')  Carlos Almeida
  })

  it('GET /auth/me with token works', () => {
    cy.api({ url: 'https://dummyjson.com/auth/me' })
      .its('status').should('eq', 200)
  })

  it('GET /products with token (not required but demo)', () => {
    cy.api({ url: '/products' })
      .its('status').should('eq', 200)
  })

  it('GET /products → 200 and valid list schema', () => {
    cy.api({ url: '/products' }).then((res) => {
      expect(res.status).to.eq(200)
      const parsed = ProductListSchema.safeParse(res.body)
      expect(parsed.success, JSON.stringify(parsed.error?.issues, null, 2)).to.be.true
      expect(parsed.data.products.length).to.be.greaterThan(0)
    })
  })

  it('GET /products/1 → 200 and id=1', () => {
    cy.api({ url: '/products/1' }).then((res) => {
      expect(res.status).to.eq(200)
      const parsed = ProductSchema.safeParse(res.body)
      expect(parsed.success).to.be.true
      expect(parsed.data.id).to.eq(1)
      expect(parsed.data.title).to.be.a('string')
    })
  })

  it('GET /products/search?q=phone → results contain query', () => {
    cy.api({ url: '/products/search', qs: { q } }).then((res) => {
      expect(res.status).to.eq(200)
      const parsed = ProductListSchema.safeParse(res.body)
      expect(parsed.success).to.be.true
      const term = q.toLowerCase()
      parsed.data.products.forEach((p) => {
        const hay = `${p.title ?? ''} ${p.description ?? ''}`.toLowerCase()
        expect(hay.includes(term), `product ${p.id} should match '${q}'`).to.be.true
      })
    })
  })

  /*Call /products/categories
  Normalize categories to slugs
  For each slug, call /products/category/{slug} and validate the list schema and that every product’s category equals the slug*/
it('Covers ALL categories: each /products/category/{slug} returns products with matching category', () => {
  cy.api({ url: '/products/categories' }).then(({ status, body }) => {
    expect(status).to.eq(200)

    // Validate categories payload (supports string[] OR {slug,name,url}[])
    const parsed = CategoriesSchema.safeParse(body)
    if (!parsed.success) {
      throw new Error(`Invalid categories:\n${JSON.stringify(parsed.error.issues, null, 2)}`)
    }

    // Normalize to slugs
    const slugs = parsed.data.map((c: any) => (typeof c === 'string' ? c : c.slug))

    // Sanity check: one known slug
    expect(slugs).to.include('smartphones')

    // Iterate serially over all categories
    cy.wrap(slugs).each((slug: string) => {
      cy.log(`Validating category: ${slug}`)
      cy.api({ url: `/products/category/${slug}` }).then(({ status, body }) => {
        expect(status).to.eq(200)

        const list = ProductListSchema.safeParse(body)
        expect(list.success, JSON.stringify(list.error?.issues, null, 2)).to.be.true

        // Optional: ensure we got an array back
        expect(list.data.products, `products for ${slug}`).to.be.an('array')

        // Every product must match the category slug
        list.data.products.forEach((p) => {
          expect(p.category, `product ${p.id} category`).to.eq(slug)
        })
      })
    })
  })
})


  it('GET /products with limit/skip/select → respects paging and field selection', () => {
    const limit = 5
    cy.api({ url: '/products', qs: { limit, skip: 10, select: 'title,price' } }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.products).to.have.length(limit)
      res.body.products.forEach((p: any) => {
        expect(p).to.have.property('title')
        expect(p).to.have.property('price')
        expect('description' in p, 'description should be omitted when not selected').to.be.false
      })
    })
  })

  it('GET /products/99999 → 404 for non-existent product', () => {
    cy.api({ url: '/products/99999', failOnStatusCode: false }).then((res) => {
      expect(res.status).to.eq(404)
    })
  })

  it('POST /products/add → echoes created product', () => {
    const payload = { title: 'Cypress Test Product', price: 123 }
    cy.api({ method: 'POST', url: '/products/add', body: payload }).then((res) => {
      expect([200, 201]).to.include(res.status)
      expect(res.body).to.include(payload)
      expect(res.body).to.have.property('id')
    })
  })

  it('PUT /products/1 → echoes updated fields', () => {
    const payload = { title: 'Cypress Updated Title' }
    cy.api({ method: 'PUT', url: '/products/1', body: payload }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body).to.include({ id: 1, ...payload })
    })
  })

  it('PATCH /products/1 → echoes updated fields', () => {
    const payload = { price: 999 }
    cy.api({ method: 'PATCH', url: '/products/1', body: payload }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body).to.include({ id: 1, ...payload })
    })
  })

  it('DELETE /products/1 → echoes deletion for id', () => {
    cy.api({ method: 'DELETE', url: '/products/1' }).then((res) => {
      expect([200, 204]).to.include(res.status)
      if (res.body) {
        expect(res.body).to.have.property('id', 1)
        if ('isDeleted' in res.body) expect(res.body.isDeleted).to.be.true
      }
    })
  })
})
