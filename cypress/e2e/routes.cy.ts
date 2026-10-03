describe("Routing & Sidebar navigation", () => {
  beforeEach(() => {
    // catch-all ต้องประกาศก่อน เพราะ Cypress ให้ intercept ที่ประกาศทีหลังมีลำดับสูงกว่า
    cy.intercept("GET", "**/api/**", { body: [] });
    cy.intercept("GET", "**/api/profile", { fixture: "profile.json" });
    cy.intercept("GET", "**/api/events", { fixture: "events.json" });
    cy.intercept("GET", "**/api/my-bookings", { fixture: "my-bookings.json" });
    cy.intercept("GET", "**/api/events/*", { fixture: "event-detail.json" });
    cy.intercept("GET", "**/api/tickets/*", { fixture: "ticket.json" });
    cy.intercept('GET', '**/api/events/*/dashboard', { fixture: 'dashboard.json' })
  });

  const staticRoutes = [
    { path: "/", name: "Overview" },
    { path: "/explore-events", name: "ExploreEvents" },
    { path: "/my-events", name: "MyEvents" },
    { path: "/profile", name: "MyAccount" },
    { path: "/create-event", name: "CreateEvent" },
    { path: "/staff/scanner", name: "StaffScanner" },
  ];

  staticRoutes.forEach(({ path, name }) => {
    it(`เปิดหน้า ${name} (${path}) ได้และ sidebar ยังอยู่`, () => {
      cy.visit(path);
      cy.contains("EventsCheckIN").should("be.visible");
      cy.get("main").should("be.visible");
    });
  });

  const dynamicRoutes = [
    "/event/1",
    "/manage-event/1",
    "/edit-event/1",
    "/ticket/ABC123",
  ];

  dynamicRoutes.forEach((path) => {
    it(`เปิดหน้า ${path} แล้วแอปไม่พัง`, () => {
      cy.visit(path);
      cy.contains("EventsCheckIN").should("be.visible");
      cy.get("main").should("exist");
    });
  });

  it("กดเมนู sidebar แล้ว URL เปลี่ยนตามถูกต้อง", () => {
    cy.visit("/");

    cy.contains("สำรวจกิจกรรม").click();
    cy.location("pathname").should("eq", "/explore-events");

    cy.contains("กิจกรรมของฉัน").click();
    cy.location("pathname").should("eq", "/my-events");

    cy.contains("บัญชีของฉัน").click();
    cy.location("pathname").should("eq", "/profile");

    cy.contains("ภาพรวม").click();
    cy.location("pathname").should("eq", "/");
  });

  it('ปุ่ม "สร้างกิจกรรมใหม่" ในหน้าแรกพาไป /create-event', () => {
    cy.visit("/");
    cy.contains("a, button", "สร้างกิจกรรมใหม่").click();
    cy.location("pathname").should("eq", "/create-event");
  });

  it('ปุ่ม "สำรวจกิจกรรม" ในหน้าแรกพาไป /explore-events', () => {
    cy.visit("/");
    cy.get("main").contains("a, button", "สำรวจกิจกรรม").click();
    cy.location("pathname").should("eq", "/explore-events");
  });
});
