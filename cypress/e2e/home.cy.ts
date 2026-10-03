describe('Overview', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/profile', { fixture: 'profile.json' }).as('profile')
    cy.intercept('GET', '**/api/my-bookings', { fixture: 'my-bookings.json' }).as('bookings')
    cy.intercept('GET', '**/api/events', { fixture: 'events.json' }).as('events')
  })

  it('เรียก API ครบ 3 ตัวและทักทายด้วยชื่อผู้ใช้', () => {
    cy.visit('/')
    cy.wait(['@profile', '@bookings', '@events'])
    cy.contains('สวัสดีคุณ สมชาย ใจดี').should('be.visible')
  })

  it('คำนวณการ์ดสถิติถูกต้อง', () => {
    cy.visit('/')
    cy.contains('p', 'ตั๋วเข้างานของฉันทั้งหมด').next().should('contain', '2 ใบ')
    cy.contains('p', 'เช็คอินเข้างานแล้ว').next().should('contain', '1 งาน')
    cy.contains('p', 'กิจกรรมที่ฉันเป็นผู้จัด').next().should('contain', '3 งาน')
  })

  it('แสดงตั๋วล่าสุดและลิงก์ไปหน้า ticket', () => {
    cy.visit('/')
    cy.contains('TK-AAA111').should('be.visible')
    cy.contains('a', 'เปิด QR Code').first()
      .should('have.attr', 'href', '/ticket/TK-AAA111')
  })

  it('แสดงกิจกรรมแนะนำและลิงก์ไปหน้ารายละเอียด', () => {
    cy.visit('/')
    cy.contains('งานสัมมนา Tech 2026').should('be.visible')
    cy.contains('Workshop ศิลปะ').should('be.visible')
    cy.contains('a', 'ดูรายละเอียด / จองตั๋ว').first()
      .should('have.attr', 'href', '/event/evt-1')
  })

  it('ไม่มีตั๋ว → แสดงข้อความว่าง', () => {
    cy.intercept('GET', '**/api/my-bookings', { body: [] })
    cy.visit('/')
    cy.contains('คุณยังไม่มีตั๋วเข้างานในขณะนี้').should('be.visible')
    cy.contains('p', 'ตั๋วเข้างานของฉันทั้งหมด').next().should('contain', '0 ใบ')
  })

  it('ถ้า API ล่ม แอปไม่พังและใช้ชื่อ "ผู้ใช้งาน"', () => {
    cy.intercept('GET', '**/api/profile', { statusCode: 500, body: {} })
    cy.visit('/')
    cy.contains('สวัสดีคุณ ผู้ใช้งาน').should('be.visible')
  })
})