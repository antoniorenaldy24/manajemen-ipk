-- Create Materialized View
CREATE MATERIALIZED VIEW "mv_student_risk" AS
SELECT 
    s.id, 
    s.nim_hash, -- Use Hash for joining/filtering
    s.ipk, 
    s.status
FROM "Student" s
WHERE s.deleted_at IS NULL AND s.ipk < 3.00;

-- Create Index for Performance
CREATE INDEX "idx_mv_risk_ipk" ON "mv_student_risk"("ipk");