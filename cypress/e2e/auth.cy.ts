import { TOKEN_KEY } from '../support/constants'

const token = () => cy.window().then((win) => win.localStorage.getItem(TOKEN_KEY))

describe('Route guard', () => {
  it('ยังไม่ล็อกอิน → เข้าหน้าที่ต้องล็อกอินแล้วถูกพาไป /login', () => {
    cy.logout()
    cy.visit('/explore-events')
    cy.location('pathname').should('eq', '/login')
    cy.contains('h1', 'เข้าสู่ระบบ').should('be.visible')
    // หน้า login ไม่มี Sidebar
    cy.contains('ภาพรวม').should('not.exist')
  })

  it('ล็อกอินแล้วเข้า /login → ถูกพากลับหน้าหลัก', () => {
    cy.intercept('GET', '**/api/**', { body: [] })
    cy.visit('/login')
    cy.location('pathname').should('eq', '/')
  })
})

describe('Login', () => {
  beforeEach(() => {
    cy.logout()
    cy.intercept('GET', '**/api/**', { body: [] })
  })

  it('กรอกข้อมูลไม่ครบ → แสดงข้อความตรวจสอบและไม่ยิง API', () => {
    cy.intercept('POST', '**/api/auth/login', { body: {} }).as('login')
    cy.visit('/login')
    cy.contains('button', /^เข้าสู่ระบบ$/).click()
    cy.contains('กรุณากรอกอีเมล').should('be.visible')
    cy.contains('กรุณากรอกรหัสผ่าน').should('be.visible')
    cy.get('@login.all').should('have.length', 0)
  })

  it('รูปแบบอีเมลผิด → แสดงข้อความ', () => {
    cy.visit('/login')
    cy.get('input[name="emailAddress"]').type('not-an-email')
    cy.get('input[name="password"]').type('x')
    cy.contains('button', /^เข้าสู่ระบบ$/).click()
    cy.contains('รูปแบบอีเมลไม่ถูกต้อง').should('be.visible')
  })

  it('ล็อกอินสำเร็จ → เก็บ token และกลับไปหน้าที่ตั้งใจจะเข้า', () => {
    cy.intercept('POST', '**/api/auth/login', {
      body: { message: 'ok', token: 'jwt-123', user: { userId: 'u1', firstName: 'สมชาย', lastName: 'ใจดี', emailAddress: 'a@b.com' } },
    }).as('login')
    cy.visit('/my-events') // ถูกดีดมา /login พร้อมจำหน้าที่ตั้งใจจะเข้า
    cy.location('pathname').should('eq', '/login')

    cy.get('input[name="emailAddress"]').type('a@b.com')
    cy.get('input[name="password"]').type('secret123')
    cy.contains('button', /^เข้าสู่ระบบ$/).click()

    cy.wait('@login').its('request.body').should('deep.equal', { emailAddress: 'a@b.com', password: 'secret123' })
    cy.location('pathname').should('eq', '/my-events')
    token().should('eq', 'jwt-123')
  })

  it('รหัสผ่านผิด (401) → แสดงข้อความจาก backend และไม่ล้างหน้า', () => {
    cy.intercept('POST', '**/api/auth/login', { statusCode: 401, body: { message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' } })
    cy.visit('/login')
    cy.get('input[name="emailAddress"]').type('a@b.com')
    cy.get('input[name="password"]').type('wrong')
    cy.contains('button', /^เข้าสู่ระบบ$/).click()
    cy.contains('อีเมลหรือรหัสผ่านไม่ถูกต้อง').should('be.visible')
    cy.location('pathname').should('eq', '/login')
    token().should('be.null')
  })

  it('กดปุ่ม CMU OAuth → ไปเริ่ม flow ที่ backend /api/auth/cmu', () => {
    cy.intercept('GET', '**/api/auth/cmu', { statusCode: 200, body: 'redirected', headers: { 'content-type': 'text/html' } }).as('oauth')
    cy.visit('/login')
    cy.contains('button', 'เข้าสู่ระบบด้วย CMU OAuth').click()
    cy.wait('@oauth')
  })

  it('OAuth ล้มเหลว (?error=) → แสดงข้อความภาษาไทย', () => {
    cy.visit('/login?error=oauth_no_email')
    cy.contains('ไม่ได้รับอีเมลจาก CMU OAuth').should('be.visible')
  })
})

describe('Register', () => {
  beforeEach(() => {
    cy.logout()
    cy.intercept('GET', '**/api/**', { body: [] })
  })

  it('รหัสผ่านสั้นและไม่ตรงกัน → แสดงข้อความ', () => {
    cy.visit('/register')
    cy.get('input[name="password"]').type('short')
    cy.get('input[name="confirmPassword"]').type('different')
    cy.contains('button', /^สมัครสมาชิก$/).click()
    cy.contains('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร').should('be.visible')
    cy.contains('รหัสผ่านไม่ตรงกัน').should('be.visible')
  })

  it('เบอร์โทรไม่ครบ 10 หลัก → แสดงข้อความ', () => {
    cy.visit('/register')
    cy.get('input[name="phoneNumber"]').type('081')
    cy.contains('button', /^สมัครสมาชิก$/).click()
    cy.contains('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก').should('be.visible')
  })

  it('สมัครสำเร็จ → ไม่ส่ง confirmPassword, เก็บ token และเข้าหน้าหลัก', () => {
    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 201,
      body: { token: 'jwt-new', user: { userId: 'u2', firstName: 'ใหม่', lastName: 'ทดสอบ', emailAddress: 'new@b.com' } },
    }).as('register')
    cy.visit('/register')
    cy.get('input[name="firstName"]').type('ใหม่')
    cy.get('input[name="lastName"]').type('ทดสอบ')
    cy.get('input[name="emailAddress"]').type('new@b.com')
    cy.get('input[name="password"]').type('longenough1')
    cy.get('input[name="confirmPassword"]').type('longenough1')
    cy.contains('button', /^สมัครสมาชิก$/).click()

    cy.wait('@register').its('request.body').should('deep.equal', {
      firstName: 'ใหม่',
      lastName: 'ทดสอบ',
      emailAddress: 'new@b.com',
      password: 'longenough1',
    })
    cy.location('pathname').should('eq', '/')
    token().should('eq', 'jwt-new')
  })

  it('อีเมลซ้ำ (409) → แสดงข้อความจาก backend', () => {
    cy.intercept('POST', '**/api/auth/register', { statusCode: 409, body: { message: 'อีเมลหรือเบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' } })
    cy.visit('/register')
    cy.get('input[name="firstName"]').type('a')
    cy.get('input[name="lastName"]').type('b')
    cy.get('input[name="emailAddress"]').type('dup@b.com')
    cy.get('input[name="password"]').type('longenough1')
    cy.get('input[name="confirmPassword"]').type('longenough1')
    cy.contains('button', /^สมัครสมาชิก$/).click()
    cy.contains('อีเมลหรือเบอร์โทรศัพท์นี้ถูกใช้งานแล้ว').should('be.visible')
  })
})

describe('OAuth callback', () => {
  beforeEach(() => {
    cy.logout()
    cy.intercept('GET', '**/api/**', { body: [] })
  })

  it('มี token ใน fragment → เก็บ token, ลบออกจาก URL และเข้าหน้าหลัก', () => {
    cy.visit('/auth/callback#token=oauth-jwt')
    cy.location('pathname').should('eq', '/')
    cy.location('hash').should('eq', '')
    token().should('eq', 'oauth-jwt')
  })

  it('ไม่มี token → กลับไป /login พร้อมข้อความ error', () => {
    cy.visit('/auth/callback')
    cy.location('pathname').should('eq', '/login')
    cy.contains('เข้าสู่ระบบด้วย CMU OAuth ไม่สำเร็จ').should('be.visible')
  })
})

describe('Session handling', () => {
  it('แนบ Authorization: Bearer ไปกับทุก request', () => {
    cy.intercept('GET', '**/api/events', { body: [] }).as('events')
    cy.visit('/explore-events')
    cy.wait('@events').its('request.headers.authorization').should('eq', 'Bearer cypress-token')
  })

  it('backend ตอบ 401 (token หมดอายุ) → ล้าง token แล้วพากลับ /login', () => {
    cy.intercept('GET', '**/api/**', { statusCode: 401, body: { message: 'กรุณาเข้าสู่ระบบ' } })
    cy.visit('/my-events')
    cy.location('pathname').should('eq', '/login')
    token().should('be.null')
  })

  it('กดออกจากระบบ → ล้าง token และกลับ /login', () => {
    cy.intercept('GET', '**/api/**', { body: [] })
    cy.visit('/')
    cy.contains('ออกจากระบบ').click()
    cy.location('pathname').should('eq', '/login')
    token().should('be.null')
  })
})
