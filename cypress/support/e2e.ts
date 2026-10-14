import { TOKEN_KEY } from './constants'

// ทุกสเปกเริ่มต้นในสถานะ "ล็อกอินแล้ว" เพื่อไม่ให้ route guard ดีดไปหน้า /login
// สเปกที่ต้องการทดสอบสถานะยังไม่ล็อกอินให้เรียก cy.logout() ก่อน cy.visit()
beforeEach(() => {
  // ใส่ token เฉพาะการโหลดหน้าครั้งแรกของแต่ละเทสต์ เพราะถ้าใส่ทุกครั้งที่โหลด เทสต์ที่จำลอง 401
  // (แอปล้าง token แล้วรีไดเรกต์) จะถูกใส่ token กลับมาและรีไดเรกต์วนไม่จบ
  let seeded = false
  cy.on('window:before:load', (win) => {
    if (seeded) return
    seeded = true
    win.localStorage.setItem(TOKEN_KEY, 'cypress-token')
  })
  cy.intercept('GET', '**/api/auth/me', {
    body: { userId: 'u1', firstName: 'สมชาย', lastName: 'ใจดี', emailAddress: 'somchai@example.com' },
  })
})

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** ล้าง token ก่อนโหลดหน้า (จำลองผู้ใช้ที่ยังไม่ล็อกอิน) */
      logout(): Chainable<void>
    }
  }
}

Cypress.Commands.add('logout', () => {
  // listener นี้ถูกลงทะเบียนหลังตัวใน beforeEach จึงทำงานทีหลังและล้าง token ที่ถูกตั้งไว้
  cy.on('window:before:load', (win) => {
    win.localStorage.removeItem(TOKEN_KEY)
  })
})
