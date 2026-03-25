CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_social_pages_updated_at ON social_pages;
CREATE TRIGGER update_social_pages_updated_at BEFORE UPDATE ON social_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_page_metrics_updated_at ON social_page_metrics;
CREATE TRIGGER update_social_page_metrics_updated_at BEFORE UPDATE ON social_page_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
