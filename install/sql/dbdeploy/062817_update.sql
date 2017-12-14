
ALTER TABLE `melis_cms_prospects` 
CHANGE `pros_id` `pros_id` INT(11) NOT NULL AUTO_INCREMENT, 
CHANGE `pros_site_id` `pros_site_id` INT(11) NULL, 
CHANGE `pros_type` `pros_type` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL, 
CHANGE `pros_theme` `pros_theme` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL, 
CHANGE `pros_name` `pros_name` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL, 
CHANGE `pros_email` `pros_email` VARCHAR(150) CHARACTER SET utf8 COLLATE utf8_general_ci NULL, 
CHANGE `pros_telephone` `pros_telephone` VARCHAR(20) CHARACTER SET utf8 COLLATE utf8_general_ci NULL, 
CHANGE `pros_societe` `pros_societe` VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL, 
CHANGE `pros_message` `pros_message` TEXT CHARACTER SET utf8 COLLATE utf8_general_ci NULL;

ALTER TABLE `melis_cms_prospects` 
ADD `pros_company` VARCHAR(45) NULL AFTER `pros_message`, 
ADD `pros_country` VARCHAR(45) NULL AFTER `pros_company`;