ALTER TABLE `melis_cms_prospects` ADD COLUMN `pros_gdpr_lastdate` DATETIME NULL DEFAULT CURRENT_TIMESTAMP AFTER `pros_contact_date`;
ALTER TABLE `melis_cms_prospects` ADD `pros_anonymized` INT NOT NULL DEFAULT "0"  AFTER `pros_gdpr_lastdate`;
