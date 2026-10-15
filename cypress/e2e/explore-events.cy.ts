describe('Explore events', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/events', { fixture: 'events.json' }).as('events')
    cy.visit('/explore-events')
    cy.wait('@events')
  })

  it('แสดงการ์ดกิจกรรมทั้งหมด', () => {
    cy.contains('h3', 'งานสัมมนา Tech 2026').should('be.visible')
    cy.contains('h3', 'Workshop ศิลปะ').should('be.visible')
  })

  it('ค้นหาด้วยชื่อกิจกรรม', () => {
    cy.get('input[placeholder^="ค้นหา"]').type('tech')
    cy.contains('h3', 'งานสัมมนา Tech 2026').should('exist')
    cy.contains('h3', 'Workshop ศิลปะ').should('not.exist')
  })

  it('ค้นหาด้วยสถานที่', () => {
    cy.get('input[placeholder^="ค้นหา"]').type('หอศิลป์')
    cy.contains('h3', 'Workshop ศิลปะ').should('exist')
    cy.contains('h3', 'งานสัมมนา Tech 2026').should('not.exist')
  })

  it('กรองตามหมวดหมู่', () => {
    cy.get('select').select('Art & Culture')
    cy.contains('h3', 'Workshop ศิลปะ').should('exist')
    cy.contains('h3', 'งานสัมมนา Tech 2026').should('not.exist')
    cy.get('select').select('All')
    cy.get('h3').should('have.length', 2)
  })

  it('ค้นหาไม่เจอ → ไม่มีการ์ดเลย', () => {
    cy.get('input[placeholder^="ค้นหา"]').type('zzzzzz')
    cy.get('h3').should('not.exist')
  })

  it('กด "ดูรายละเอียด" แล้วไปหน้า /event/:id', () => {
    cy.intercept('GET', '**/api/events/evt-1', { fixture: 'event-detail.json' })
    cy.contains('a', 'ดูรายละเอียด / จองตั๋ว').first().click()
    cy.location('pathname').should('eq', '/event/evt-1')
  })
})
describe('Explore events (status badge)', () => {
  it('แสดงสถานะต่อจากป้ายหมวดหมู่ในการ์ด', () => {
    cy.fixture('events.json').then((evs) => {
      cy.intercept('GET', '**/api/events', [
        { ...evs[0], eventsStatus: 'Upcoming' },
        { ...evs[1], eventsStatus: 'Ongoing' },
      ]).as('events')
    })
    cy.visit('/explore-events')
    cy.wait('@events')
    cy.contains('h3', 'งานสัมมนา Tech 2026').parent().within(() => {
      cy.contains('span', 'Technology').next('[data-testid=event-status]').should('have.text', 'Upcoming')
    })
    cy.contains('h3', 'Workshop ศิลปะ').parent().within(() => {
      cy.contains('span', 'Art & Culture').next('[data-testid=event-status]').should('have.text', 'Ongoing')
    })
  })
})
