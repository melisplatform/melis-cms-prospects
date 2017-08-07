-- -----------------------------------------------------
-- Table `melis_cms_prospects_theme_items`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `melis_cms_prospects_theme_items` (
  `pros_theme_item_id` INT NOT NULL AUTO_INCREMENT,
  `pros_theme_item_code` VARCHAR(45) NOT NULL,
  `pros_theme_item_text` VARCHAR(80) NULL,
  `pros_theme_item_lang_id` INT NOT NULL,
  `pros_theme_id` INT NOT NULL,
  PRIMARY KEY (`pros_theme_item_id`),
  INDEX `fk_pros_subj_id_idx` (`pros_theme_id` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `melis_cms_prospects_themes`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `melis_cms_prospects_themes` (
  `pros_theme_id` INT NOT NULL AUTO_INCREMENT,
  `pros_theme_code` VARCHAR(45) NOT NULL,
  `pros_theme_name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`pros_theme_id`))
ENGINE = InnoDB;

ALTER TABLE `melis_cms_prospects_theme_items` DROP `pros_theme_item_code`;

ALTER TABLE `melis_cms_prospects_themes` DROP `pros_theme_code`;

ALTER TABLE `melis_cms_prospects_theme_items` DROP `pros_theme_item_text`, DROP `pros_theme_item_lang_id`;