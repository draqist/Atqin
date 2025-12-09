ALTER TABLE resources DROP COLUMN reviewer_id;
ALTER TABLE resources DROP COLUMN status;

ALTER TABLE books DROP COLUMN reviewer_id;
ALTER TABLE books DROP COLUMN status;

DROP TYPE content_status;