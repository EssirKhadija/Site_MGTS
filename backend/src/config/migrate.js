// =============================================
// MGTS - Database Migration
// Run: node src/config/migrate.js
// =============================================
require("dotenv").config();
const mysql = require("mysql2/promise");

const run = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  console.log("✅ Connected to MySQL");

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${
      process.env.DB_NAME || "mgts_db"
    }\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
  );
  await connection.query(`USE \`${process.env.DB_NAME || "mgts_db"}\`;`);
  console.log(`✅ Database ready`);

  const queries = `
  SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS bank_transfer_proofs;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS email_verifications;
DROP TABLE IF EXISTS order_totals;
DROP TABLE IF EXISTS transitaire_quotes;
DROP TABLE IF EXISTS transport_quotes;
DROP TABLE IF EXISTS supplier_quotes;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS transitaires;
DROP TABLE IF EXISTS transporteurs;
DROP TABLE IF EXISTS fournisseurs;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================
-- ENUMERATIONS (stored as VARCHAR with CHECK in MySQL 8+)
-- ============================================================

-- ============================================================
-- TABLE: users  (abstract base)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fullName      VARCHAR(150)    NOT NULL,
  email         VARCHAR(191)    NOT NULL UNIQUE,
  phone         VARCHAR(30)     NOT NULL,
  password      VARCHAR(255)    NOT NULL,
  role          ENUM('admin','client','supplier','transport','transitaire') NOT NULL,
  isVerified    BOOLEAN         NOT NULL DEFAULT FALSE,
  status        ENUM('pending','active','suspended') NOT NULL DEFAULT 'pending',
  twofa_secret  VARCHAR(255)    NULL,
  twofa_enabled BOOLEAN         NOT NULL DEFAULT FALSE,
  createdAt     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: email_verifications
-- ============================================================
CREATE TABLE IF NOT EXISTS email_verifications (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  token      VARCHAR(255)    NOT NULL UNIQUE,
  expiresAt  DATETIME        NOT NULL,
  createdAt  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: password_resets
-- ============================================================
CREATE TABLE IF NOT EXISTS password_resets (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  token      VARCHAR(255)    NOT NULL UNIQUE,
  expiresAt  DATETIME        NOT NULL,
  usedAt     DATETIME        NULL,
  createdAt  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: fournisseurs  (extends users WHERE role='supplier')
-- ============================================================
CREATE TABLE IF NOT EXISTS fournisseurs (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id       BIGINT UNSIGNED NOT NULL UNIQUE,
  factoryName   VARCHAR(200)    NOT NULL,
  productTypes  TEXT            NULL,
  createdAt     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: transporteurs  (extends users WHERE role='transport')
-- ============================================================
CREATE TABLE IF NOT EXISTS transporteurs (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL UNIQUE,
  companyName VARCHAR(200) NOT NULL,
  createdAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: transitaires  (extends users WHERE role='transitaire')
-- ============================================================
CREATE TABLE IF NOT EXISTS transitaires (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT UNSIGNED NOT NULL UNIQUE,
  companyName VARCHAR(200) NOT NULL,
  createdAt   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: products  (published by suppliers)
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  supplier_id      BIGINT UNSIGNED NOT NULL,
  name             VARCHAR(200)    NOT NULL,
  description      TEXT            NULL,
  priceIndicatif   DECIMAL(12,2)   NOT NULL DEFAULT 0,
  minQuantity      INT UNSIGNED    NOT NULL DEFAULT 1,
  images           JSON            NULL,
  status           ENUM('active','inactive','pending') NOT NULL DEFAULT 'pending',
  createdAt        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: orders  (core entity)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  client_id        BIGINT UNSIGNED NOT NULL,
  supplier_id      BIGINT UNSIGNED NULL,
  transport_id     BIGINT UNSIGNED NULL,
  transitaire_id   BIGINT UNSIGNED NULL,
  product_id       BIGINT UNSIGNED NULL,
  type             ENUM('existing_product','custom') NOT NULL,
  description      TEXT            NULL,
  quantity         INT UNSIGNED    NOT NULL DEFAULT 1,
  dimensions       VARCHAR(100)    NULL,
  material         VARCHAR(150)    NULL,
  estimatedBudget  DECIMAL(12,2)   NULL,
  incoterm         ENUM('EXW','FOB','CIF','DDP','DAP','FCA','CPT','CIP') NULL,
  attachmentPdf    VARCHAR(255)    NULL,
  status           ENUM(
                     'pending',
                     'pending_supplier',
                     'pending_transport',
                     'pending_transitaire',
                     'final_calculation',
                     'pending_payment',
                     'waiting_validation',
                     'paid',
                     'rejected'
                   ) NOT NULL DEFAULT 'pending',
  createdAt        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id)      REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (supplier_id)    REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (transport_id)   REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (transitaire_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id)     REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: supplier_quotes
-- ============================================================
CREATE TABLE IF NOT EXISTS supplier_quotes (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id        BIGINT UNSIGNED NOT NULL UNIQUE,
  supplier_id     BIGINT UNSIGNED NOT NULL,
  productionCost  DECIMAL(12,2)   NOT NULL,
  comment         TEXT            NULL,
  createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)    REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES users(id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: transport_quotes
-- ============================================================
CREATE TABLE IF NOT EXISTS transport_quotes (
  id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id       BIGINT UNSIGNED NOT NULL UNIQUE,
  transport_id   BIGINT UNSIGNED NOT NULL,
  transportCost  DECIMAL(12,2)   NOT NULL,
  createdAt      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)     REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (transport_id) REFERENCES users(id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: transitaire_quotes
-- ============================================================
CREATE TABLE IF NOT EXISTS transitaire_quotes (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id        BIGINT UNSIGNED NOT NULL UNIQUE,
  transitaire_id  BIGINT UNSIGNED NOT NULL,
  customsCost     DECIMAL(12,2)   NOT NULL,
  createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)       REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (transitaire_id) REFERENCES users(id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
 
-- ============================================================
-- TABLE: order_totals  (final calculated quote shown to client)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_totals (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id        BIGINT UNSIGNED NOT NULL UNIQUE,
  productionCost  DECIMAL(12,2)   NOT NULL DEFAULT 0,
  transportCost   DECIMAL(12,2)   NOT NULL DEFAULT 0,
  customsCost     DECIMAL(12,2)   NOT NULL DEFAULT 0,
  mgtsMargin      DECIMAL(12,2)   NOT NULL DEFAULT 0,
  totalAmount     DECIMAL(12,2)   NOT NULL DEFAULT 0,
  createdAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id          BIGINT UNSIGNED NOT NULL UNIQUE,
  client_id         BIGINT UNSIGNED NOT NULL,
  amount            DECIMAL(12,2)   NOT NULL,
  paymentMethod     VARCHAR(50)     NOT NULL DEFAULT 'virement',
  currency          VARCHAR(10)     NOT NULL DEFAULT 'MAD',
  bankName          VARCHAR(150)    NULL,
  accountHolder     VARCHAR(150)    NULL,
  iban              VARCHAR(50)     NULL,
  swiftCode         VARCHAR(20)     NULL,
  transferReference VARCHAR(100)    NULL,
  status            ENUM('pending','waiting_validation','validated','rejected') NOT NULL DEFAULT 'pending',
  createdAt         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)  REFERENCES orders(id) ON DELETE RESTRICT,
  FOREIGN KEY (client_id) REFERENCES users(id)  ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: bank_transfer_proofs
-- ============================================================
CREATE TABLE IF NOT EXISTS bank_transfer_proofs (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  payment_id    BIGINT UNSIGNED NOT NULL,
  proofFilePath VARCHAR(255)    NOT NULL,
  uploadedAt    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: messages  (per order, internal messaging)
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id   BIGINT UNSIGNED NOT NULL,
  sender_id  BIGINT UNSIGNED NOT NULL,
  content    TEXT            NOT NULL,
  isRead     BOOLEAN         NOT NULL DEFAULT FALSE,
  createdAt  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id)  REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  title      VARCHAR(255)    NOT NULL,
  content    TEXT            NOT NULL,
  isRead     BOOLEAN         NOT NULL DEFAULT FALSE,
  createdAt  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: refresh_tokens  (JWT refresh token store)
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  token      VARCHAR(512)    NOT NULL UNIQUE,
  expiresAt  DATETIME        NOT NULL,
  createdAt  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

`;

  await connection.query(queries);
  console.log("✅ All tables created successfully!");
  await connection.end();
};

run().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
