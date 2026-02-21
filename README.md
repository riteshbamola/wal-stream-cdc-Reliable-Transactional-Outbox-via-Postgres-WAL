# wal-stream-cdc — Reliable Transactional Outbox via Postgres WAL

A production-ready **Change Data Capture (CDC)** pipeline implementing the **Transactional Outbox Pattern** using PostgreSQL logical replication (`pgoutput`) and Kafka.

This project ensures **at-least-once delivery**, crash recovery, and strong data consistency across distributed systems without relying on distributed transactions (2PC).

---

## 🏗️ Architecture Overview

![Architecture Diagram](images/CDC-KAFKA.png)

### Flow

1. Application writes business data + outbox event in the **same database transaction**.
2. PostgreSQL WAL records the change.
3. A logical replication slot streams WAL changes using `pgoutput`.
4. CDC service filters `outbox` inserts.
5. Events are published to Kafka.
6. Downstream services consume asynchronously.

---

## 🎯 Problem Addressed

Directly publishing to Kafka after a database write can cause the **dual-write problem**:

- Database commit succeeds  
- Kafka publish fails  
→ System becomes inconsistent

This solution eliminates that risk by:

- Storing events in an outbox table within the same DB transaction
- Streaming changes from WAL instead of polling
- Acknowledging LSN only after successful Kafka publish

---

## ⚙️ Core Components

### 1️⃣ Outbox Table

```sql
CREATE TABLE IF NOT EXISTS outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
## 2️⃣ Logical Replication

- Uses `pgoutput` plugin  
- Dedicated replication slot  
- Manual LSN acknowledgment  
- WAL retained until safely processed  

---

## 3️⃣ Kafka Producer

- Dynamic topic routing  
- Manual offset handling  
- Dead-letter topic for invalid events  
- At-least-once delivery guarantee  

---

## 🔐 Delivery Guarantees

- ✅ No dual-write inconsistency  
- ✅ Crash-safe recovery  
- ✅ WAL replay support  
- ✅ At-least-once event delivery  
- ⏳ Idempotency (consumer-side) recommended  

---

## 🚨 Failure Scenarios Handled

### Kafka Down

- CDC does not acknowledge LSN  
- WAL retains unprocessed changes  
- Events replay automatically once Kafka recovers  

### CDC Crash

- Replication resumes from last acknowledged LSN  
- No event loss  

### Invalid Event

- Routed to dead-letter topic  
- LSN acknowledged safely  

---

## 📊 Operational Considerations

- Monitor replication slot lag  
- Track WAL disk usage  
- Alert on producer failures  
- Implement idempotent consumers  

---

## 🛠️ Tech Stack

- PostgreSQL (Logical Replication)  
- `pgoutput`  
- TypeScript  
- Kafka (KafkaJS)  
- Docker  

---

## 🚀 How To Run

1. Start PostgreSQL with logical replication enabled  
2. Start Kafka and Zookeeper via Docker  
3. Create publication for the `outbox` table  
4. Start CDC service  
5. Start consumer services  

---

## 🧠 Design Philosophy

This architecture favors:

- Eventual consistency over distributed transactions  
- Replayability over fragile retries  
- Observability over silent failure  
- Explicit acknowledgment over blind success assumptions  

---

## 📌 Status

- ✔ End-to-end WAL → Outbox → Kafka streaming working  
- ⏳ Idempotent consumer handling in progress  

---

## 📄 License

MIT
