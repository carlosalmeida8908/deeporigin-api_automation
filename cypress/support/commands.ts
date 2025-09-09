/// <reference types="cypress" />

// Make this file a module so TS picks up the global augmentation
export {}

// --------- Types for our helper ----------
export type ApiOptions = {
  url: string
  method?: Cypress.HttpMethod
  qs?: Record<string, any>
  body?: any
  headers?: Record<string, string>
  failOnStatusCode?: boolean
}

// --------- Augment Cypress commands ----------
declare global {
  namespace Cypress {
    interface Chainable {
      /** Logs in, stores token in Cypress.env('accessToken'), and returns it */
      apiLogin(): Chainable<string>
      /** cy.request with Authorization header auto-injected (if token exists) */
      api(options: ApiOptions): Chainable<Cypress.Response<any>>
    }
  }
}

// --------- Implementations ----------
Cypress.Commands.add('apiLogin', () => {
  return cy
    .request('POST', 'https://dummyjson.com/auth/login', {
      username: 'emilys',
      password: 'emilyspass',
      expiresInMins: 30
    })
    .then(({ body }) => {
      const token = body?.accessToken as string
      expect(token, 'accessToken').to.be.a('string').and.not.be.empty
      Cypress.env('accessToken', token)
      if (body?.refreshToken) Cypress.env('refreshToken', body.refreshToken)
      return token
    })
})

Cypress.Commands.add('api', (options: ApiOptions) => {
  const token = Cypress.env('accessToken') as string | undefined
  const auth = token ? { Authorization: `Bearer ${token}` } : {}
  return cy.request({
    method: options.method ?? 'GET',
    url: options.url,
    qs: options.qs,
    body: options.body,
    failOnStatusCode: options.failOnStatusCode,
    headers: { ...auth, ...(options.headers ?? {}) }
  })
})
