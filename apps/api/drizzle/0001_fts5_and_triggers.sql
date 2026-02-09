-- FTS5 virtual table for full-text search on wines
CREATE VIRTUAL TABLE IF NOT EXISTS wines_fts USING fts5(
    name, producer, region, sub_region, country, varietal, notes,
    content='wines',
    content_rowid='id'
);

-- Triggers to keep FTS index in sync with wines table
CREATE TRIGGER IF NOT EXISTS wines_ai AFTER INSERT ON wines BEGIN
    INSERT INTO wines_fts(rowid, name, producer, region, sub_region, country, varietal, notes)
    VALUES (new.id, new.name, new.producer, new.region, new.sub_region, new.country, new.varietal, new.notes);
END;

CREATE TRIGGER IF NOT EXISTS wines_ad AFTER DELETE ON wines BEGIN
    INSERT INTO wines_fts(wines_fts, rowid, name, producer, region, sub_region, country, varietal, notes)
    VALUES ('delete', old.id, old.name, old.producer, old.region, old.sub_region, old.country, old.varietal, old.notes);
END;

CREATE TRIGGER IF NOT EXISTS wines_au AFTER UPDATE ON wines BEGIN
    INSERT INTO wines_fts(wines_fts, rowid, name, producer, region, sub_region, country, varietal, notes)
    VALUES ('delete', old.id, old.name, old.producer, old.region, old.sub_region, old.country, old.varietal, old.notes);
    INSERT INTO wines_fts(rowid, name, producer, region, sub_region, country, varietal, notes)
    VALUES (new.id, new.name, new.producer, new.region, new.sub_region, new.country, new.varietal, new.notes);
END;
