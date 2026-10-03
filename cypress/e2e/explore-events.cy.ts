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