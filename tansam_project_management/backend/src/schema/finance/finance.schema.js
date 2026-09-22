// schema/main.schema.js (or separate schema file)

export const createQuotationFollowupsSchema = async (db) => {
  // 💬 QUOTATION FOLLOW-UPS TABLE
  await db.execute(`
    CREATE TABLE IF NOT EXISTS quotation_followups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quotation_id INT NULL,
      project_name VARCHAR(150),
      opportunity_name VARCHAR(150),
      quoteValue DECIMAL(10,2),
      revisedCost DECIMAL(10,2),
      status VARCHAR(50),
      poReceived ENUM('Yes','No'),
      paymentPhase VARCHAR(255),
      paymentAmount VARCHAR(255),
      paymentReceived VARCHAR(255),
      reason VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ensure project_name column exists in existing tables
  try {
    const [cols] = await db.execute("SHOW COLUMNS FROM quotation_followups LIKE 'project_name'");
    if (cols.length === 0) {
      await db.execute("ALTER TABLE quotation_followups ADD COLUMN project_name VARCHAR(150) AFTER id");
    }
  } catch (e) {
    // ignore if table doesn't support or column already added
  }

  // 💬 QUOTATIONS TABLE
await db.execute(`
  CREATE TABLE IF NOT EXISTS quotations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    opportunity_id VARCHAR(50),
    opportunity_name VARCHAR(50),
    quotationNo VARCHAR(50) NOT NULL,
    client_id VARCHAR(20) NOT NULL,
    clientName VARCHAR(100) NOT NULL,
    client_type_id VARCHAR(50),
    client_type_name VARCHAR(50),
    work_category_id VARCHAR(100),
    work_category_name VARCHAR(100),
    lab_id VARCHAR(100),
    lab_name VARCHAR(100),

    description TEXT,
     quotationStatus ENUM('Draft', 'Submitted', 'Approved', 'Rejected')
    NOT NULL DEFAULT 'draft',
    date DATE,
   isGenerated TINYINT(1) DEFAULT 0,
 
    paymentPhase   ENUM('Started', 'Not Started')
    NOT NULL DEFAULT 'Started',
    paymentReceived VARCHAR(10),
    paymentAmount DECIMAL(12,2),
    paymentPendingReason TEXT,    
    itemDetails VARCHAR(255),
    poNumber VARCHAR(100),
    remarks VARCHAR(100),
    paymentReceivedDate DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 
    INDEX idx_client_id (client_id),

    CONSTRAINT fk_quotation_client
      FOREIGN KEY (client_id)
      REFERENCES opportunities_coordinator(client_id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT
  )
`);

  // 💬 TERMS & CONDITIONS TABLE
  await db.execute(`
    CREATE TABLE IF NOT EXISTS terms_conditions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      content LONGTEXT NOT NULL,
      status ENUM('Active','In-Active') DEFAULT 'In-Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // 💬 GENERATED QUOTATIONS TABLE
  await db.execute(`
    CREATE TABLE IF NOT EXISTS generated_quotations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      quotationNo VARCHAR(50),
      date DATE,
      clientName VARCHAR(100),
      kindAttn VARCHAR(100),
      subject VARCHAR(255),
      items LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin CHECK (JSON_VALID(items)),
      terms LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin CHECK (JSON_VALID(terms)),
      signature VARCHAR(255),
      seal VARCHAR(255),
      financeManagerName VARCHAR(100),
      designation VARCHAR(100),
      isGenerated TINYINT(1),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      termsContent LONGTEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      quotationId INT,
      FOREIGN KEY (quotationId) REFERENCES quotations(id)
    )
  `);

    await db.execute(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
       opportunity_id VARCHAR(50) NOT NULL,
      opportunity_name VARCHAR(100) NOT NULL,
      quotation_No VARCHAR(100) NOT NULL,
      old_quotation_value DECIMAL(15,2) DEFAULT NULL,
      new_quotation_value DECIMAL(15,2) DEFAULT NULL,
      old_payment_value DECIMAL(15,2) DEFAULT NULL,
      new_payment_value DECIMAL(15,2) DEFAULT NULL,
     
      action ENUM('Quotation created','Quotation updated','Payment created','Payment updated') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};