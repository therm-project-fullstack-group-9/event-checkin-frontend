describe('Ticket page', () => {
  it('ตั๋วที่ยังไม่เช็คอิน', () => {
    cy.intercept('GET', '**/api/tickets/TK-AAA111', { fixture: 'ticket.json' })
    cy.visit('/ticket/TK-AAA111')
    cy.contains('h1', 'งานสัมมนา Tech 2026').should('be.visible')
    cy.contains('TK-AAA111').should('be.visible')
    cy.contains('สมชาย ใจดี').should('be.visible')
    cy.contains('09:00 - 12:00').should('be.visible')
    cy.contains('ยังไม่ได้เช็คอิน').should('be.visible')
    cy.get('main svg').should('exist')
  })

  it('ตั๋วที่เช็คอินแล้ว', () => {
    cy.fixture('ticket.json').then((t) => {
      cy.intercept('GET', '**/api/tickets/TK-AAA111', {
        body: { ...t, bookingStatus: 'CHECKED_IN', checkInTime: '2026-11-20T03:00:00.000Z' },
      })
    })
    cy.visit('/ticket/TK-AAA111')
    cy.contains('เช็คอินเข้างานแล้ว').should('be.visible')
    cy.contains('เมื่อเวลา').should('be.visible')
  })

  it('ไม่พบตั๋ว', () => {
    cy.intercept('GET', '**/api/tickets/*', { statusCode: 404, body: {} })
    cy.visit('/ticket/NOPE')
    cy.contains('ไม่พบข้อมูลตั๋วใบนี้ในระบบ').should('be.visible')
    cy.contains('a', 'กลับไปหน้าตั๋วของฉัน').click()
    cy.location('pathname').should('eq', '/my-events')
  })
})