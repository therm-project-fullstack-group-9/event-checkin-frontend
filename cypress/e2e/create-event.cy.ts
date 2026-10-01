describe("Create event", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/**", { body: [] });
    cy.visit("/create-event");
  });

  const fillForm = () => {
    cy.get('input[placeholder^="เช่น เวิร์กชอป"]').type("งานทดสอบ Cypress");
    cy.get("select").select("Workshop");
    cy.get('input[type="date"]').type("2026-11-20");
    cy.get('input[placeholder^="เช่น อาคารนวัตกรรม"]').type("ห้องประชุม A");
    cy.get('input[placeholder^="สรุปความน่าสนใจ"]').type("คำโปรยทดสอบ");
    cy.get("textarea").type("รายละเอียดทดสอบ");
  };

  it("แสดงฟอร์มพร้อมค่าเริ่มต้น 1 รอบเวลา", () => {
    cy.contains("h1", "สร้างกิจกรรมใหม่").should("be.visible");
    cy.get("select").should("have.value", "Technology");
    cy.get('input[type="time"]').should("have.length", 2);
    cy.get('input[type="number"]').should("have.value", "100");
    cy.contains("button", "ลบ").should("not.exist");
  });

  it("ฟอร์มว่าง → ถูกบล็อกและไม่ยิง POST", () => {
    cy.intercept("POST", "**/api/events", { statusCode: 201, body: {} }).as(
      "create",
    );
    cy.contains("button", "บันทึกและสร้างกิจกรรม").click();
    cy.get("input:invalid, textarea:invalid").should(
      "have.length.greaterThan",
      0,
    );
    cy.get("@create.all").should("have.length", 0);
    cy.location("pathname").should("eq", "/create-event");
  });

  it("เพิ่ม/ลบรอบเวลาได้ และลบไม่ได้เมื่อเหลือรอบเดียว", () => {
    cy.contains("button", "+ เพิ่มรอบเวลา").click();
    cy.get('input[type="time"]').should("have.length", 4);
    cy.get("button").filter(':contains("ลบ")').should("have.length", 2);

    cy.get("button").filter(':contains("ลบ")').first().click();
    cy.get('input[type="time"]').should("have.length", 2);
    cy.get("button").filter(':contains("ลบ")').should("have.length", 0);
  });

  it("กรอกครบ → POST ด้วย body ถูกต้อง แล้วไปหน้า /my-events", () => {
    cy.intercept("POST", "**/api/events", {
      statusCode: 201,
      body: { ok: true },
    }).as("create");
    fillForm();
    cy.contains("button", "+ เพิ่มรอบเวลา").click();

    cy.contains("button", "บันทึกและสร้างกิจกรรม").click();

    cy.wait("@create")
      .its("request.body")
      .should("deep.equal", {
        eventName: "งานทดสอบ Cypress",
        category: "Workshop",
        eventDate: "2026-11-20",
        venue: "ห้องประชุม A",
        imageUrl: "",
        shortDescription: "คำโปรยทดสอบ",
        description: "รายละเอียดทดสอบ",
        sessions: [
          { startTime: "09:00", endTime: "12:00", capacity: 100 },
          { startTime: "13:00", endTime: "16:00", capacity: 100 },
        ],
      });
    cy.location("pathname").should("eq", "/my-events");
  });

  it("backend ตอบ error → แสดงข้อความและอยู่หน้าเดิม", () => {
    cy.intercept("POST", "**/api/events", {
      statusCode: 400,
      body: { message: "ชื่อกิจกรรมซ้ำ" },
    });
    fillForm();
    cy.contains("button", "บันทึกและสร้างกิจกรรม").click();
    cy.contains("ชื่อกิจกรรมซ้ำ").should("be.visible");
    cy.location("pathname").should("eq", "/create-event");
  });

  it("ระหว่างบันทึก ปุ่มถูก disable และเปลี่ยนข้อความ", () => {
    cy.intercept("POST", "**/api/events", {
      delay: 1000,
      statusCode: 201,
      body: {},
    });
    fillForm();
    cy.contains("button", "บันทึกและสร้างกิจกรรม").click();
    cy.contains("button", "กำลังบันทึกข้อมูล...").should("be.disabled");
  });
});
