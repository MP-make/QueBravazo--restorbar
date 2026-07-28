INSERT INTO site_settings (key, value)
VALUES ('yape_config', '{"qr_url": "", "name": "¡Qué Bravazo! Restobar"}')
ON CONFLICT (key) DO NOTHING;
