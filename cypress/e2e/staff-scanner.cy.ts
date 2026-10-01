describe('Staff scanner', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/**', { body: [] })
    cy.visit('/staff/scanner', {
      onBeforeLoad(win) {
        // จำลองว่าไม่อนุญาตกล้อง เพื่อไม่ให้ popup ขอสิทธิ์ขัดจังหวะ
        cy.stub(win.navigator.mediaDevices, 'getUserMedia').rejects(
          new win.DOMException('denied', 'NotAllowedError')
        )
      },
    })
  })

  const input = () => cy.get('input[placeholder^="เช่น EVT"]')

  it('แสดงหัวข้อและช่องกรอกรหัสสำรอง', () => {
    cy.contains('STAFF MODE').should('be.visible')
    cy.contains('h1', 'ระบบสแกนตั๋วเข้างาน').should('be.visible')
    input().should('be.visible')
    cy.contains('button', 'ตรวจสอบ').should('be.visible')
  })

  it('กรอกรหัสพิมพ์เล็ก → ส่ง POST เป็นตัวพิมพ์ใหญ่ แสดงผลสำเร็จ และล้างช่อง', () => {
    cy.intercept('POST', '**/api/staff/check-in', {
      statusCode: 200,
      body: {
        message: 'เช็คอินสำเร็จ',
        ticketRef: 'TK-AAA111',
        attendee: 'สมชาย ใจดี',
        eventTitle: 'งานสัมมนา Tech 2026',
        checkInTime: '2026-11-20T03:00:00.000Z',
      },
    }).as('checkin')

    input().type('  tk-aaa111  ')
    cy.contains('button', 'ตรวจสอบ').click()

    cy.wait('@checkin').its('request.body').should('deep.equal', { ticketRef: 'TK-AAA111' })
    cy.contains('เช็คอินสำเร็จ').should('be.visible')
    cy.contains('✅').should('be.visible')
    cy.contains('TK-AAA111').should('be.visible')
    cy.contains('สมชาย ใจดี').should('be.visible')
    cy.contains('งานสัมมนา Tech 2026').should('be.visible')
    cy.contains('เวลา:').should('be.visible')
    input().should('have.value', '')
  })

  it('กด Enter ก็ตรวจสอบได้', () => {
    cy.intercept('POST', '**/api/staff/check-in', {
      body: { message: 'เช็คอินสำเร็จ', ticketRef: 'TK-X', attendee: 'ทดสอบ', eventTitle: 'งาน', checkInTime: null },
    }).as('checkin')
    input().type('tk-x{enter}')
    cy.wait('@checkin').its('request.body.ticketRef').should('eq', 'TK-X')
    cy.contains('เช็คอินสำเร็จ').should('be.visible')
  })

  it('ช่องว่าง → ไม่ยิง POST', () => {
    cy.intercept('POST', '**/api/staff/check-in', { body: {} }).as('checkin')
    cy.contains('button', 'ตรวจสอบ').click()
    input().type('   {enter}')
    cy.get('@checkin.all').should('have.length', 0)
    cy.contains('✅').should('not.exist')
    cy.contains('❌').should('not.exist')
  })

  it('ตั๋วถูกใช้ไปแล้ว (400) → แสดง error พร้อมข้อมูลผู้ถือตั๋ว', () => {
    cy.intercept('POST', '**/api/staff/check-in', {
      statusCode: 400,
      body: {
        message: 'ตั๋วนี้ถูกใช้เช็คอินไปแล้ว',
        attendee: 'สมหญิง รักเรียน',
        eventTitle: 'Workshop ศิลปะ',
        checkInTime: '2026-11-20T03:00:00.000Z',
      },
    })
    input().type('tk-bbb222')
    cy.contains('button', 'ตรวจสอบ').click()
    cy.contains('❌').should('be.visible')
    cy.contains('ตั๋วนี้ถูกใช้เช็คอินไปแล้ว').should('be.visible')
    cy.contains('TK-BBB222').should('be.visible')
    cy.contains('สมหญิง รักเรียน').should('be.visible')
    cy.contains('เวลา:').should('be.visible')
  })

  it('ไม่พบตั๋ว (404) → แสดงข้อความ error', () => {
    cy.intercept('POST', '**/api/staff/check-in', {
      statusCode: 404,
      body: { message: 'ไม่พบตั๋วนี้ในระบบ' },
    })
    input().type('nope')
    cy.contains('button', 'ตรวจสอบ').click()
    cy.contains('❌').should('be.visible')
    cy.contains('ไม่พบตั๋วนี้ในระบบ').should('be.visible')
    cy.contains('ผู้เข้าร่วม:').should('not.exist')
  })

  it('เครือข่ายล่ม → แสดงข้อความ error เริ่มต้น', () => {
    cy.intercept('POST', '**/api/staff/check-in', { forceNetworkError: true })
    input().type('tk-1')
    cy.contains('button', 'ตรวจสอบ').click()
    cy.contains('เกิดข้อผิดพลาดในการตรวจสอบตั๋ว').should('be.visible')
  })

  it('กดปุ่ม "ปิด" แล้วกล่องผลลัพธ์หายไป', () => {
    cy.intercept('POST', '**/api/staff/check-in', {
      statusCode: 404,
      body: { message: 'ไม่พบตั๋วนี้ในระบบ' },
    })
    input().type('nope{enter}')
    cy.contains('ไม่พบตั๋วนี้ในระบบ').should('be.visible')
    cy.contains('button', /^ปิด$/).click()
    cy.contains('ไม่พบตั๋วนี้ในระบบ').should('not.exist')
  })

  it('เปิด/ปิดกล้องด้วยปุ่มควบคุม', () => {
    cy.contains('button', 'ปิดกล้องชั่วคราว').click()
    cy.contains('กล้องถูกปิดอยู่เพื่อประหยัดพลังงาน').should('be.visible')
    cy.contains('button', 'เปิดกล้องสแกน').should('be.visible')

    cy.contains('button', 'แตะเพื่อเปิดกล้อง').click()
    cy.contains('กล้องถูกปิดอยู่เพื่อประหยัดพลังงาน').should('not.exist')
    cy.contains('button', 'ปิดกล้องชั่วคราว').should('be.visible')
  })

  it('ไม่อนุญาตกล้อง → แสดงคำเตือน และปิดคำเตือนได้', () => {
    cy.contains('ไม่สามารถเข้าถึงกล้องได้').should('be.visible')
    cy.contains('button', 'ลองอีกครั้ง').click()
    cy.contains('ไม่สามารถเข้าถึงกล้องได้').should('not.exist')
  })
})