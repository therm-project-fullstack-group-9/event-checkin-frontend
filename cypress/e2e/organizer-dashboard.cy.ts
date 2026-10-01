describe('Organizer dashboard', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/events/evt-1/dashboard', { fixture: 'dashboard.json' }).as('dash')
    cy.visit('/manage-event/evt-1')
    cy.wait('@dash')
  })

  it('แสดงหัวข้อกิจกรรมและลิงก์ action ทั้ง 3', () => {
    cy.contains('ORGANIZER DASHBOARD').should('be.visible')
    cy.contains('h1', 'งานสัมมนา Tech 2026').should('be.visible')
    cy.contains('อาคารนวัตกรรม เชียงใหม่').should('be.visible')
    cy.contains('a', 'แก้ไขกิจกรรม').should('have.attr', 'href', '/edit-event/evt-1')
    cy.contains('a', 'เปิดกล้องสแกนตั๋ว').should('have.attr', 'href', '/staff/scanner')
    cy.contains('a', 'ดูหน้างาน').should('have.attr', 'href', '/event/evt-1')
  })

  it('คำนวณการ์ดสถิติถูกต้อง', () => {
    cy.contains('p', 'ผู้ลงทะเบียนทั้งหมด').next().should('contain', '3').and('contain', '/ 150 ที่นั่ง')
    cy.contains('p', 'สแกนเช็คอินเข้างานแล้ว').next().should('contain', '1')
    cy.contains('p', /^รอเช็คอิน$/).next().should('contain', '2')
  })

  it('แสดงยอดและแถบความคืบหน้าของแต่ละรอบเวลา', () => {
    cy.contains('span', '09:00 - 12:00').parent().should('contain', '20/100')
    cy.contains('span', '09:00 - 12:00').closest('div.p-4')
      .find('div[style]').should('have.attr', 'style').and('contain', 'width: 20%')

    cy.contains('span', '13:00 - 16:00').parent().should('contain', '50/50')
    cy.contains('span', '13:00 - 16:00').closest('div.p-4')
      .find('div[style]').should('have.attr', 'style').and('contain', 'width: 100%')
  })

  it('ตารางแสดงผู้ลงทะเบียนครบ 3 แถว', () => {
    cy.contains('h2', 'รายชื่อผู้ลงทะเบียน (3 รายการ)').should('be.visible')
    cy.get('tbody tr').should('have.length', 3)
    cy.contains('tr', 'TK-AAA111').should('contain', 'สมชาย ใจดี').and('contain', 'somchai@example.com')
      .and('contain', 'แพ้อาหารทะเล').and('contain', 'รอเช็คอิน')
    cy.contains('tr', 'TK-BBB222').should('contain', 'เช็คอินแล้ว')
  })

  it('แสดงเวลาเช็คอินเฉพาะคนที่เช็คอินแล้ว และ "-" สำหรับคนที่ยังไม่เช็คอิน', () => {
    cy.contains('tr', 'TK-BBB222').find('td').last().should('not.have.text', '-')
    cy.contains('tr', 'TK-AAA111').find('td').last().should('have.text', '-')
  })

  it('หมายเหตุสุขภาพว่าง → แสดง "-"', () => {
    cy.contains('tr', 'TK-CCC333').find('td').eq(3).should('have.text', '-')
  })

  it('ค้นหาด้วยชื่อ / รหัสตั๋ว / อีเมล', () => {
    cy.get('input[placeholder^="ค้นหา"]').as('search')

    cy.get('@search').type('สมหญิง')
    cy.get('tbody tr').should('have.length', 1).and('contain', 'TK-BBB222')
    cy.contains('h2', '(1 รายการ)').should('be.visible')

    cy.get('@search').clear().type('tk-ccc')
    cy.get('tbody tr').should('have.length', 1).and('contain', 'วิชัย')

    cy.get('@search').clear().type('somchai@')
    cy.get('tbody tr').should('have.length', 1).and('contain', 'TK-AAA111')
  })

  it('การค้นหาไม่กระทบการ์ดสถิติรวม', () => {
    cy.get('input[placeholder^="ค้นหา"]').type('สมหญิง')
    cy.contains('p', 'ผู้ลงทะเบียนทั้งหมด').next().should('contain', '3')
  })

  it('กรองตามสถานะ', () => {
    cy.get('select').select('CHECKED_IN')
    cy.get('tbody tr').should('have.length', 1).and('contain', 'TK-BBB222')

    cy.get('select').select('CONFIRMED')
    cy.get('tbody tr').should('have.length', 2)

    cy.get('select').select('ALL')
    cy.get('tbody tr').should('have.length', 3)
  })

  it('ค้นหาไม่เจอ → แสดงข้อความว่าง', () => {
    cy.get('input[placeholder^="ค้นหา"]').type('zzzzzz')
    cy.contains('ไม่พบรายชื่อผู้ลงทะเบียน').should('be.visible')
    cy.get('table').should('not.exist')
  })

  it('ค้นหา + กรองสถานะพร้อมกัน', () => {
    cy.get('select').select('CHECKED_IN')
    cy.get('input[placeholder^="ค้นหา"]').type('สมชาย')
    cy.contains('ไม่พบรายชื่อผู้ลงทะเบียน').should('be.visible')
  })
})

describe('Organizer dashboard (error)', () => {
  it('ไม่พบกิจกรรม → แสดงข้อความและลิงก์กลับ', () => {
    cy.intercept('GET', '**/api/events/nope/dashboard', { statusCode: 404, body: {} })
    cy.visit('/manage-event/nope')
    cy.contains('ไม่พบข้อมูลกิจกรรมนี้').should('be.visible')
    cy.contains('a', 'กลับไปหน้ากิจกรรมของฉัน').should('have.attr', 'href', '/my-events')
  })
})