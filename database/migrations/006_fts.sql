-- 006_fts.sql
-- Full-text search for contacts + deals
-- trigger-maintained tsvector + GIN index
-- immutable unaccent wrapper handles Vietnamese diacritics

CREATE EXTENSION IF NOT EXISTS unaccent;

-- Immutable unaccent wrapper (required for use in indexes & triggers)
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
  RETURNS text LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS
$$SELECT public.unaccent('unaccent'::regdictionary, $1)$$;

-- ---- Contacts FTS (name + email + title) ----
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS search_vector tsvector;

UPDATE contacts SET search_vector =
  to_tsvector('simple',
    immutable_unaccent(COALESCE(name,  '')) || ' ' ||
    immutable_unaccent(COALESCE(email, '')) || ' ' ||
    immutable_unaccent(COALESCE(title, ''))
  );

CREATE INDEX IF NOT EXISTS contacts_search_idx ON contacts USING GIN (search_vector);

CREATE OR REPLACE FUNCTION contacts_search_vector_update() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    to_tsvector('simple',
      immutable_unaccent(COALESCE(NEW.name,  '')) || ' ' ||
      immutable_unaccent(COALESCE(NEW.email, '')) || ' ' ||
      immutable_unaccent(COALESCE(NEW.title, ''))
    );
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS contacts_search_vector_trig ON contacts;
CREATE TRIGGER contacts_search_vector_trig
  BEFORE INSERT OR UPDATE OF name, email, title
  ON contacts FOR EACH ROW EXECUTE FUNCTION contacts_search_vector_update();

-- ---- Deals FTS (name + stage) ----
-- NOTE: deals column is "name", not "title"
ALTER TABLE deals ADD COLUMN IF NOT EXISTS search_vector tsvector;

UPDATE deals SET search_vector =
  to_tsvector('simple',
    immutable_unaccent(COALESCE(name,  '')) || ' ' ||
    immutable_unaccent(COALESCE(stage, ''))
  );

CREATE INDEX IF NOT EXISTS deals_search_idx ON deals USING GIN (search_vector);

CREATE OR REPLACE FUNCTION deals_search_vector_update() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    to_tsvector('simple',
      immutable_unaccent(COALESCE(NEW.name,  '')) || ' ' ||
      immutable_unaccent(COALESCE(NEW.stage, ''))
    );
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS deals_search_vector_trig ON deals;
CREATE TRIGGER deals_search_vector_trig
  BEFORE INSERT OR UPDATE OF name, stage
  ON deals FOR EACH ROW EXECUTE FUNCTION deals_search_vector_update();
