// กฎโควตา: ไม่มาตามรอบ (NO_SHOW) — ตรวจการแสดงผลฝั่ง UI (ตัวกฎจริงทดสอบที่ backend)
describe('สถานะไม่มาตามรอบ (NO_SHOW)', () => {
  it('Overview: ผู้ใช้ถูกระงับสิทธิ์จอง → แสดงแถบเตือน', () => {
    cy.intercept('GET', '**/api/events', { fixture: 'events.json' })
    cy.intercept('GET', '**/api/my-bookings', { body: [] })
    cy.intercept('GET', '**/api/profile', {
      body: { firstName: 'สมชาย', lastName: 'ใจดี', bookingBlocked: true, noShowCount: 2 },
    })
    cy.visit('/')
    cy.get('[role="alert"]').should('contain', 'ถูกระงับสิทธิ์การจองตั๋ว').and('contain', '2 ครั้ง')
  })

  it('Overview: ผู้ใช้ปกติ → ไม่มีแถบเตือน', () => {
    cy.intercept('GET', '**/api/events', { fixture: 'events.json' })
    cy.intercept('GET', '**/api/my-bookings', { body: [] })
    cy.intercept('GET', '**/api/profile', { fixture: 'profile.json' })
    cy.visit('/')
    cy.contains('สวัสดีคุณ สมชาย ใจดี').should('be.visible')
    cy.get('[role="alert"]').should('not.exist')
  })

  it('MyEvents: ตั๋ว NO_SHOW แสดงป้าย "ไม่มาตามรอบ"', () => {
    cy.intercept('GET', '**/api/my-bookings', {
      body: [{ id: 'b9', eventId: 'evt-1', role: 'Attendee', bookingStatus: 'NO_SHOW', ticketRef: 'TK-NOSHOW', title: 'งานที่จบไปแล้ว', date: '2026-10-01', imageUrl: '' }],
    })
    cy.visit('/my-events')
    cy.contains('⛔ ไม่มาตามรอบ').should('be.visible')
  })

  it('Ticket: ตั๋ว NO_SHOW แสดงว่าใช้เช็คอินไม่ได้แล้ว', () => {
    cy.fixture('ticket.json').then((ticket) => {
      cy.intercept('GET', '**/api/tickets/*', { body: { ...ticket, bookingStatus: 'NO_SHOW' } })
    })
    cy.visit('/ticket/TK-AAA111')
    cy.contains('ไม่ได้เข้าร่วมตามรอบ').should('be.visible')
    cy.contains('ยังไม่ได้เช็คอิน').should('not.exist')
  })

  it('Dashboard: นับ NO_SHOW แยกจากรอเช็คอิน และกรองได้', () => {
    cy.fixture('dashboard.json').then((dash) => {
      dash.bookings[0].bookingStatus = 'NO_SHOW' // b1 เดิม CONFIRMED
      cy.intercept('GET', '**/api/events/evt-1/dashboard', { body: dash }).as('dash')
    })
    cy.visit('/manage-event/evt-1')
    cy.wait('@dash')

    // 3 ใบจอง: 1 เช็คอินแล้ว, 1 ไม่มาตามรอบ, 1 ยังรอ
    cy.contains('p', /^รอเช็คอิน$/).next().should('contain', '1')
    cy.contains('tr', 'TK-AAA111').should('contain', 'ไม่มาตามรอบ')

    cy.get('select').select('NO_SHOW')
    cy.get('tbody tr').should('have.length', 1)
    cy.contains('tbody tr', 'TK-AAA111').should('exist')
  })
})
