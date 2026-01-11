-- Create Materialized View for Course Statistics
CREATE MATERIALIZED VIEW "mv_course_stats" AS
SELECT 
    course_code,
    MAX(course_name) as course_name, -- Take one name if variations exist
    COUNT(*) as total_students,
    AVG(grade_point) as avg_grade,
    SUM(CASE WHEN grade_point < 2.00 THEN 1 ELSE 0 END) as fail_count
FROM "AcademicRecord"
GROUP BY course_code;

-- Index for sorting by difficulty (avg_grade)
CREATE INDEX "idx_mv_course_avg" ON "mv_course_stats"("avg_grade");
