ALTER TABLE `melis_cms_prospects` ADD COLUMN `pros_gdpr_lastdate` DATETIME NULL DEFAULT CURRENT_TIMESTAMP AFTER `pros_contact_date`;