-- Drop existing MV
DROP MATERIALIZED VIEW IF EXISTS "mv_student_risk";

-- Recreate MV with current_semester
CREATE MATERIALIZED VIEW "mv_student_risk" AS
SELECT 
    s.id, 
    s.nim_hash, -- Use Hash for joining/filtering
    s.ipk, 
    s.current_semester, -- Added for filtering
    s.status
FROM "Student" s
WHERE s.deleted_at IS NULL AND s.ipk < 3.00;

-- Indexes
CREATE INDEX "idx_mv_risk_ipk" ON "mv_student_risk"("ipk");
CREATE INDEX "idx_mv_risk_semester" ON "mv_student_risk"("current_semester");
