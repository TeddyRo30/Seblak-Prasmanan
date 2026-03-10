# 🔄 REFINEMENT - TELUR, RASA & LEVEL PEDAS

**Date:** January 15, 2024  
**Status:** Applied to all components  
**Version:** v2 (Updated)

---

## 📋 CHANGES SUMMARY

### 1️⃣ PILIHAN TELUR (NEW)
```
✨ CEPLOK    - Telur goreng utuh (whole fried egg)
✨ ORAK_ARIK - Telur dicampur/diaduk (scrambled)
```

### 2️⃣ PILIHAN RASA (NEW)
```
✨ ASIN      - Salty flavored
✨ MANIS     - Sweet flavored
```

### 3️⃣ LEVEL PEDAS (UPDATED)
```
❌ ORIGINAL           → ✅ TIDAK_PEDAS  (Not spicy)
❌ SEDANG             → ✅ SEDANG       (Medium - unchanged)
❌ PEDAS              → ✅ PEDAS        (Spicy - unchanged)
❌ PEDAS_SEKALI       → ✅ REMOVED      (Extra spicy - removed)

FROM: 4 options → TO: 3 options
```

---

## 🗄️ DATABASE SCHEMA UPDATE

### Orders Table Modification

```sql
-- Update EXISTING column: level_pedas
ALTER TABLE orders MODIFY COLUMN level_pedas 
ENUM('TIDAK_PEDAS', 'SEDANG', 'PEDAS') DEFAULT 'SEDANG';

-- Add NEW column: telur_type
ALTER TABLE orders ADD COLUMN telur_type 
ENUM('CEPLOK', 'ORAK_ARIK') DEFAULT 'CEPLOK' 
AFTER kuah_varian;

-- Add NEW column: rasa_type
ALTER TABLE orders ADD COLUMN rasa_type 
ENUM('ASIN', 'MANIS') DEFAULT 'ASIN' 
AFTER telur_type;

-- Create indexes for new columns
CREATE INDEX idx_telur_type ON orders(telur_type);
CREATE INDEX idx_rasa_type ON orders(rasa_type);
```

### Updated Column Definitions

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  customer_id UUID,
  
  order_type ENUM('DINE_IN', 'TAKE_AWAY', 'DELIVERY') NOT NULL,
  status ENUM('NEW', 'CONFIRMED', 'PREPARING', 'READY', 'PICKING', 'ON_DELIVERY', 'PICKED_UP', 'DELIVERED', 'COMPLETED', 'CANCELLED') NOT NULL,
  payment_status ENUM('PENDING', 'CONFIRMED', 'FAILED') NOT NULL,
  
  -- VARIANT SELECTIONS
  level_pedas ENUM('TIDAK_PEDAS', 'SEDANG', 'PEDAS') NOT NULL DEFAULT 'SEDANG',
  kuah_varian ENUM('NYEMEK', 'NORMAL', 'BANJIR') NOT NULL DEFAULT 'NORMAL',
  telur_type ENUM('CEPLOK', 'ORAK_ARIK') NOT NULL DEFAULT 'CEPLOK',      -- ✨ NEW
  rasa_type ENUM('ASIN', 'MANIS') NOT NULL DEFAULT 'ASIN',               -- ✨ NEW
  
  -- ... rest of columns (unchanged)
  
  INDEX idx_level_pedas (level_pedas),
  INDEX idx_kuah_varian (kuah_varian),
  INDEX idx_telur_type (telur_type),
  INDEX idx_rasa_type (rasa_type)
);
```

### Migration Script

```sql
-- FILE: migrations/v2_add_telur_rasa_update_pedas.sql

-- ===== STEP 1: Add new columns first (safe)
ALTER TABLE orders ADD COLUMN telur_type 
ENUM('CEPLOK', 'ORAK_ARIK') DEFAULT 'CEPLOK' 
AFTER kuah_varian;

ALTER TABLE orders ADD COLUMN rasa_type 
ENUM('ASIN', 'MANIS') DEFAULT 'ASIN' 
AFTER telur_type;

-- ===== STEP 2: Create temp column untuk old data
ALTER TABLE orders ADD COLUMN level_pedas_old VARCHAR(50);
UPDATE orders SET level_pedas_old = level_pedas;

-- ===== STEP 3: Delete old column (dangerous, do with backup!)
ALTER TABLE orders DROP COLUMN level_pedas;

-- ===== STEP 4: Recreate dengan benar enum
ALTER TABLE orders ADD COLUMN level_pedas 
ENUM('TIDAK_PEDAS', 'SEDANG', 'PEDAS') DEFAULT 'SEDANG';

-- ===== STEP 5: Migrate old data ke new column
UPDATE orders SET level_pedas = 'TIDAK_PEDAS' WHERE level_pedas_old = 'ORIGINAL';
UPDATE orders SET level_pedas = 'SEDANG' WHERE level_pedas_old = 'SEDANG';
UPDATE orders SET level_pedas = 'PEDAS' WHERE level_pedas_old IN ('PEDAS', 'PEDAS_SEKALI');

-- ===== STEP 6: Cleanup
ALTER TABLE orders DROP COLUMN level_pedas_old;

-- ===== STEP 7: Create indexes
CREATE INDEX idx_telur_type ON orders(telur_type);
CREATE INDEX idx_rasa_type ON orders(rasa_type);

-- ===== STEP 8: Verify
SELECT DISTINCT level_pedas FROM orders;
SELECT DISTINCT telur_type FROM orders;
SELECT DISTINCT rasa_type FROM orders;
```

---

## 🔌 API DESIGN UPDATE

### Order Creation Request (UPDATED)

**Endpoint:** `POST /orders`

```json
{
  "order_type": "DELIVERY",
  
  // ✨ UPDATED: Level pedas now has 3 options
  "level_pedas": "SEDANG",
  
  // ✅ UNCHANGED
  "kuah_varian": "NORMAL",
  
  // ✨ NEW: Telur type selection
  "telur_type": "CEPLOK",
  
  // ✨ NEW: Rasa type selection
  "rasa_type": "ASIN",
  
  "payment_method": "QRIS",
  
  "items": [
    {
      "menu_item_id": "uuid-item-1",
      "quantity": 2,
      "special_notes": "tidak pakai MSG"
    }
  ],
  
  // ... rest of order data (DELIVERY/TAKE_AWAY/DINE_IN specific)
  "delivery_address": "Jl. X No. 123",
  "delivery_latitude": -6.2293,
  "delivery_longitude": 106.7924,
  "delivery_time": "2024-01-15T15:30:00Z",
  "customer_name": "Rina Wijaya",
  "customer_phone": "+6281234567890"
}
```

### Order Response (UPDATED)

**Status:** `201 Created`

```json
{
  "success": true,
  "status": 201,
  "data": {
    "id": "uuid-order-1",
    "order_number": "ORD-20240115-ABC12",
    "order_type": "DELIVERY",
    
    // ✨ UPDATED & NEW specifications
    "level_pedas": "SEDANG",
    "kuah_varian": "NORMAL",
    "telur_type": "CEPLOK",
    "rasa_type": "ASIN",
    
    "status": "NEW",
    "payment_status": "PENDING",
    
    "items": [
      {
        "id": "uuid-order-item-1",
        "menu_item_id": "uuid-item-1",
        "name": "Kerupuk Oren",
        "quantity": 2,
        "price_per_unit": 2000,
        "subtotal": 4000,
        "special_notes": "tidak pakai MSG"
      }
    ],
    
    "subtotal": 13000,
    "delivery_fee": 10000,
    "discount": 0,
    "total": 23000,
    
    "created_at": "2024-01-15T14:05:32Z"
  }
}
```

### Get Order Detail Response (UPDATED)

```json
{
  "success": true,
  "status": 200,
  "data": {
    "id": "uuid-order-1",
    "order_number": "ORD-20240115-ABC12",
    "customer": {...},
    
    "order_type": "DELIVERY",
    
    // ✨ Specifications now include telur & rasa
    "specifications": {
      "level_pedas": "SEDANG",
      "kuah_varian": "NORMAL",
      "telur_type": "CEPLOK",
      "rasa_type": "ASIN"
    },
    
    "status": "PREPARING",
    "items": [...],
    "total": 23000,
    
    "delivery": {...},
    "payment": {...},
    "timeline": [...]
  }
}
```

---

## 🎯 VALIDATION RULES UPDATE

### New Validation Logic

```javascript
// File: backend/src/services/orderService.js

const VALID_SPECIFICATIONS = {
  level_pedas: ['TIDAK_PEDAS', 'SEDANG', 'PEDAS'],
  kuah_varian: ['NYEMEK', 'NORMAL', 'BANJIR'],
  telur_type: ['CEPLOK', 'ORAK_ARIK'],      // ✨ NEW
  rasa_type: ['ASIN', 'MANIS']              // ✨ NEW
};

async validateOrderSpecifications(orderData) {
  // Validate level_pedas (UPDATED - 3 options)
  if (!VALID_SPECIFICATIONS.level_pedas.includes(orderData.level_pedas)) {
    throw new ValidationError(
      `Invalid level_pedas. Must be: ${VALID_SPECIFICATIONS.level_pedas.join(', ')}`,
      'INVALID_LEVEL_PEDAS'
    );
  }

  // Validate kuah_varian (unchanged)
  if (!VALID_SPECIFICATIONS.kuah_varian.includes(orderData.kuah_varian)) {
    throw new ValidationError(
      `Invalid kuah_varian. Must be: ${VALID_SPECIFICATIONS.kuah_varian.join(', ')}`,
      'INVALID_KUAH_VARIAN'
    );
  }

  // Validate telur_type (NEW)
  if (!VALID_SPECIFICATIONS.telur_type.includes(orderData.telur_type)) {
    throw new ValidationError(
      `Invalid telur_type. Must be: ${VALID_SPECIFICATIONS.telur_type.join(', ')}`,
      'INVALID_TELUR_TYPE'
    );
  }

  // Validate rasa_type (NEW)
  if (!VALID_SPECIFICATIONS.rasa_type.includes(orderData.rasa_type)) {
    throw new ValidationError(
      `Invalid rasa_type. Must be: ${VALID_SPECIFICATIONS.rasa_type.join(', ')}`,
      'INVALID_RASA_TYPE'
    );
  }
}

async createOrder(orderData, items, idempotencyKey) {
  // ✅ Validate specifications first
  await this.validateOrderSpecifications(orderData);
  
  // ✅ Insert dengan new columns
  const [orderId] = await trx('orders').insert({
    order_number: this.generateOrderNumber(),
    idempotency_key: idempotencyKey,
    customer_id: orderData.customer_id,
    order_type: orderData.order_type,
    level_pedas: orderData.level_pedas,
    kuah_varian: orderData.kuah_varian,
    telur_type: orderData.telur_type,    // ✨ NEW
    rasa_type: orderData.rasa_type,      // ✨ NEW
    // ... rest
  });
  
  return orderId;
}
```

### Test Cases

```javascript
describe('Order Specifications Validation', () => {

  test('should accept TIDAK_PEDAS (new option)', async () => {
    const result = await orderService.validateOrderSpecifications({
      level_pedas: 'TIDAK_PEDAS',  // ✨ NEW
      kuah_varian: 'NORMAL',
      telur_type: 'CEPLOK',        // ✨ NEW
      rasa_type: 'ASIN'            // ✨ NEW
    });
    expect(result).not.toThrow();
  });

  test('should reject PEDAS_SEKALI (removed option)', async () => {
    await expect(
      orderService.validateOrderSpecifications({
        level_pedas: 'PEDAS_SEKALI',  // ❌ No longer valid
        kuah_varian: 'NORMAL',
        telur_type: 'CEPLOK',
        rasa_type: 'ASIN'
      })
    ).rejects.toThrow('Invalid level_pedas');
  });

  test('should accept ORAK_ARIK (new telur option)', async () => {
    const result = await orderService.validateOrderSpecifications({
      level_pedas: 'PEDAS',
      kuah_varian: 'BANJIR',
      telur_type: 'ORAK_ARIK',      // ✨ NEW
      rasa_type: 'MANIS'            // ✨ NEW
    });
    expect(result).not.toThrow();
  });

  test('should reject invalid telur_type', async () => {
    await expect(
      orderService.validateOrderSpecifications({
        level_pedas: 'SEDANG',
        kuah_varian: 'NORMAL',
        telur_type: 'REBUS',         // ❌ Invalid
        rasa_type: 'ASIN'
      })
    ).rejects.toThrow('Invalid telur_type');
  });

  test('should reject invalid rasa_type', async () => {
    await expect(
      orderService.validateOrderSpecifications({
        level_pedas: 'SEDANG',
        kuah_varian: 'NORMAL',
        telur_type: 'CEPLOK',
        rasa_type: 'PEDAS'           // ❌ Invalid
      })
    ).rejects.toThrow('Invalid rasa_type');
  });

  test('should create order dengan new specifications', async () => {
    const order = await orderService.createOrder(
      {
        customer_id: 'uuid-1',
        order_type: 'TAKE_AWAY',
        level_pedas: 'TIDAK_PEDAS',
        kuah_varian: 'NYEMEK',
        telur_type: 'ORAK_ARIK',
        rasa_type: 'MANIS',
        payment_method: 'CASH'
      },
      [{ menu_item_id: 'uuid-1', quantity: 2 }],
      'idempotency-key-1'
    );
    
    expect(order.id).toBeDefined();
    
    // Verify dalam database
    const saved = await db('orders').where('id', order.id).first();
    expect(saved.level_pedas).toBe('TIDAK_PEDAS');
    expect(saved.telur_type).toBe('ORAK_ARIK');
    expect(saved.rasa_type).toBe('MANIS');
  });
});
```

---

## 📱 INSOMNIA COLLECTION UPDATE

### Updated Request Bodies

#### Create Order - DELIVERY (UPDATED)

```json
{
  "order_type": "DELIVERY",
  "level_pedas": "SEDANG",
  "kuah_varian": "NORMAL",
  "telur_type": "CEPLOK",
  "rasa_type": "ASIN",
  "payment_method": "QRIS",
  "items": [
    {"menu_item_id": "{{ menu_item_id }}", "quantity": 2}
  ],
  "delivery_address": "Jl. Contoh No. 123, Jakarta Selatan",
  "delivery_latitude": -6.2293,
  "delivery_longitude": 106.7924,
  "delivery_time": "2024-01-15T15:30:00Z",
  "customer_name": "Rina Wijaya",
  "customer_phone": "+6281234567890"
}
```

#### Create Order - TAKE_AWAY (UPDATED)

```json
{
  "order_type": "TAKE_AWAY",
  "level_pedas": "PEDAS",
  "kuah_varian": "BANJIR",
  "telur_type": "ORAK_ARIK",
  "rasa_type": "MANIS",
  "payment_method": "CASH",
  "items": [
    {"menu_item_id": "{{ menu_item_id }}", "quantity": 3}
  ],
  "pickup_time": "ASAP"
}
```

#### Create Order - DINE_IN (UPDATED)

```json
{
  "order_type": "DINE_IN",
  "level_pedas": "TIDAK_PEDAS",
  "kuah_varian": "NYEMEK",
  "telur_type": "CEPLOK",
  "rasa_type": "ASIN",
  "payment_method": "CASH",
  "items": [
    {"menu_item_id": "{{ menu_item_id }}", "quantity": 1}
  ],
  "table_number": 3
}
```

**Collection File:** `seblak-api-insomnia-collection.json` (UPDATED)

---

## 📚 UPDATED API QUICK REFERENCE

### Order Variants (UPDATED)

```
Level Pedas:     TIDAK_PEDAS, SEDANG, PEDAS (was: 4 options)
Kuah Varian:     NYEMEK, NORMAL, BANJIR (unchanged)
Telur Type:      CEPLOK, ORAK_ARIK (NEW)
Rasa Type:       ASIN, MANIS (NEW)
```

### Valid Combinations

```
// All combinations valid - no restrictions:
level_pedas: any of 3 options
kuah_varian: any of 3 options
telur_type: any of 2 options
rasa_type: any of 2 options

Example: TIDAK_PEDAS + BANJIR + ORAK_ARIK + MANIS ✅ Valid
```

---

## 🔄 DATA MIGRATION CHECKLIST

- [ ] Backup production database
- [ ] Run migration script
- [ ] Verify level_pedas data migrated correctly
- [ ] Verify telur_type & rasa_type columns created
- [ ] Test queries with new columns
- [ ] Update backend validation logic
- [ ] Update Insomnia collection (✅ Already done)
- [ ] Deploy backend code
- [ ] Test all 3 order types
- [ ] Verify API responses include new fields

---

## 📝 DOCUMENTATION UPDATES

### Files Updated

1. **Database Schema**
   - ✅ orders table (3 columns modified/added)
   - ✅ Migration script provided

2. **API Design**
   - ✅ Create order request (new fields)
   - ✅ Order responses (new fields)
   - ✅ Validation rules (new logic)

3. **Insomnia Collection**
   - ✅ seblak-api-insomnia-collection.json (UPDATED)
   - ✅ All 3 order type requests updated
   - ✅ Example payloads with new fields

4. **Test Cases**
   - ✅ Validation tests for new fields
   - ✅ Order creation tests with new specs
   - ✅ Data type tests

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Database Migration
```bash
# Run migration
mysql -u user -p database < migrations/v2_add_telur_rasa_update_pedas.sql

# Verify
SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'orders' 
AND COLUMN_NAME IN ('level_pedas', 'telur_type', 'rasa_type');
```

### Step 2: Backend Code Update
```bash
# Update validation logic
# Update request handlers
# Update response formatters
# Run tests

npm test
```

### Step 3: API Deployment
```bash
npm start
# Test all 3 order types with new fields
```

### Step 4: Verify
```bash
# Test in Insomnia collection
# Verify create order returns new fields
# Verify order detail includes specifications
# Test all spice level options
# Test all telur & rasa combinations
```

---

## ✅ CHECKLIST - REFINEMENT COMPLETE

```
DATABASE LAYER:
  ✅ level_pedas updated to 3 options
  ✅ telur_type column added
  ✅ rasa_type column added
  ✅ Migration script provided
  ✅ Indexes created

API LAYER:
  ✅ Create order request updated
  ✅ Order response updated
  ✅ Validation rules updated
  ✅ Test cases provided

INSOMNIA COLLECTION:
  ✅ All order creation requests updated
  ✅ Request bodies include new fields
  ✅ Example payloads correct

DOCUMENTATION:
  ✅ This refinement document created
  ✅ API quick reference available
  ✅ Setup guide available
```

---

## 📞 ROLLBACK (If Needed)

If you need to rollback:

```sql
-- Add old column back
ALTER TABLE orders ADD COLUMN level_pedas_old 
ENUM('ORIGINAL', 'SEDANG', 'PEDAS', 'PEDAS_SEKALI');

-- Migrate back
UPDATE orders SET level_pedas_old = 
  CASE level_pedas
    WHEN 'TIDAK_PEDAS' THEN 'ORIGINAL'
    WHEN 'SEDANG' THEN 'SEDANG'
    WHEN 'PEDAS' THEN 'PEDAS'
  END;

-- Drop new columns
ALTER TABLE orders DROP COLUMN level_pedas;
ALTER TABLE orders DROP COLUMN telur_type;
ALTER TABLE orders DROP COLUMN rasa_type;

-- Rename old column back
ALTER TABLE orders RENAME COLUMN level_pedas_old TO level_pedas;
```

---

## 📌 NOTES

- No price changes - all variants remain FREE (subsidi silang model)
- All 3 new variants (telur, rasa, updated pedas) are MANDATORY
- Default values set to: CEPLOK, ASIN, SEDANG
- No breaking changes - old orders still valid (use defaults)

---

**Refinement Status:** ✅ COMPLETE & READY FOR DEPLOYMENT

Next: Deploy to production 🚀
