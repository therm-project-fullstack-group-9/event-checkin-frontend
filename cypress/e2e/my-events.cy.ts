describe('My events (status badge)', () => {
  it('แสดงสถานะกิจกรรมต่อจากป้ายบทบาท (Organizer / Attendee)', () => {
    cy.intercept('GET', '**/api/my-bookings', [
      { id: 'a1', eventId: 'e1', role: 'Attendee', bookingStatus: 'CONFIRMED', ticketRef: 'TK-AAA111', title: 'งานผู้เข้าร่วม', date: '2026-11-20', imageUrl: '', eventsStatus: 'Ongoing' },
      { id: 'o1', eventId: 'e2', role: 'Organizer', title: 'งานผู้จัด', date: '2026-12-05', imageUrl: '', eventsStatus: 'Completed' },
    ]).as('mine')
    cy.visit('/my-events')
    cy.wait('@mine')

    cy.contains('h3', 'งานผู้เข้าร่วม').closest('div.rounded-2xl').within(() => {
      cy.contains('span', 'Attendee').next('[data-testid=event-status]').should('have.text', 'Ongoing')
    })
    cy.contains('h3', 'งานผู้จัด').closest('div.rounded-2xl').within(() => {
      cy.contains('span', 'Organizer').next('[data-testid=event-status]').should('have.text', 'Completed')
    })
  })

  it('ไม่มี eventsStatus (ข้อมูลเก่า) → ไม่แสดงป้ายสถานะและหน้าไม่พัง', () => {
    cy.intercept('GET', '**/api/my-bookings', [
      { id: 'o1', eventId: 'e2', role: 'Organizer', title: 'งานผู้จัด', date: '2026-12-05', imageUrl: '' },
    ])
    cy.visit('/my-events')
    cy.contains('h3', 'งานผู้จัด').should('be.visible')
    cy.get('[data-testid=event-status]').should('not.exist')
  })
})
