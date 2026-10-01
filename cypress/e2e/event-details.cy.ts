describe('Event details & booking', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/events/evt-1', { fixture: 'event-detail.json' }).as('detail')
    cy.visit('/event/evt-1')
    cy.wait('@detail')
  })

  it('แสดงรายละเอียดกิจกรรมและผู้จัด', () => {
    cy.contains('h1', 'งานสัมมนา Tech 2026').should('be.visible')
    cy.contains('อาคารนวัตกรรม เชียงใหม่').should('be.visible')
    cy.contains('ผู้จัดงาน').parent().should('contain', 'ผู้จัด ทดสอบ')
    cy.contains('รายละเอียดเต็มของงานสัมมนา').should('be.visible')
  })

  it('เรียงรอบเวลาจากเช้าไปบ่าย', () => {
    cy.get('button[type="button"]').filter(':contains("น.")').then(($b) => {
      expect($b.eq(0).text()).to.contain('09:00')
      expect($b.eq(1).text()).to.contain('13:00')
    })
  })

  it('รอบที่เต็มถูก disable และแสดง "เต็มแล้ว"', () => {
    cy.contains('button', '13:00 - 16:00').should('be.disabled').and('contain', 'เต็มแล้ว')
    cy.contains('button', '09:00 - 12:00').should('not.be.disabled').and('contain', 'ว่าง 80 ที่')
  })

  it('ยังไม่เลือกรอบ → ปุ่มจองถูก disable', () => {
    cy.contains('button', 'ยืนยันการจองตั๋วเข้างาน').should('be.disabled')
    cy.contains('button', '09:00 - 12:00').click()
    cy.contains('button', 'ยืนยันการจองตั๋วเข้างาน').should('not.be.disabled')
  })

  it('จองสำเร็จ → ส่ง body ถูกต้อง แสดง QR และรหัสตั๋ว', () => {
    cy.intercept('POST', '**/api/bookings', {
      statusCode: 201,
      body: { booking: { ticketRef: 'TK-NEW999' } },
    }).as('book')

    cy.contains('button', '09:00 - 12:00').click()
    cy.get('input[placeholder^="เช่น แพ้อาหาร"]').type('แพ้อาหารทะเล')
    cy.contains('button', 'ยืนยันการจองตั๋วเข้างาน').click()

    cy.wait('@book').its('request.body').should('deep.equal', {
      eventId: 'evt-1',
      sessionId: 'ses-1',
      healthDeclaration: 'แพ้อาหารทะเล',
    })
    cy.wait('@detail') // โหลดซ้ำหลังจอง
    cy.contains('จองตั๋วสำเร็จ').should('be.visible')
    cy.contains('TK-NEW999').should('be.visible')
    cy.get('main svg').should('exist')
  })

  it('ไม่กรอกสุขภาพ → ส่งค่า "ปกติ"', () => {
    cy.intercept('POST', '**/api/bookings', {
      body: { booking: { ticketRef: 'TK-X' } },
    }).as('book')
    cy.contains('button', '09:00 - 12:00').click()
    cy.contains('button', 'ยืนยันการจองตั๋วเข้างาน').click()
    cy.wait('@book').its('request.body.healthDeclaration').should('eq', 'ปกติ')
  })

  it('จองซ้ำ (409) → แสดง error พร้อมตั๋วเดิม', () => {
    cy.intercept('POST', '**/api/bookings', {
      statusCode: 409,
      body: { message: 'คุณจองกิจกรรมนี้แล้ว', ticketRef: 'TK-OLD111' },
    })
    cy.contains('button', '09:00 - 12:00').click()
    cy.contains('button', 'ยืนยันการจองตั๋วเข้างาน').click()
    cy.contains('คุณจองกิจกรรมนี้แล้ว').should('be.visible')
    cy.contains('TK-OLD111').should('be.visible')
  })

  it('ไม่พบกิจกรรม → แสดงข้อความและลิงก์กลับหน้าหลัก', () => {
    cy.intercept('GET', '**/api/events/nope', { statusCode: 404, body: {} })
    cy.visit('/event/nope')
    cy.contains('ไม่พบข้อมูลกิจกรรมนี้').should('be.visible')
    cy.contains('a', 'กลับหน้าหลัก').should('have.attr', 'href', '/')
  })
})