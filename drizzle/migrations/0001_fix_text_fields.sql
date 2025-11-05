-- Migração para corrigir campos TEXT que precisam suportar mais dados
-- Alterando de TEXT (65KB) para MEDIUMTEXT (16MB)

-- Alterar campo hotelPhotos
ALTER TABLE `proposals` MODIFY COLUMN `hotelPhotos` MEDIUMTEXT;

-- Alterar campo childrenAges
ALTER TABLE `proposals` MODIFY COLUMN `childrenAges` MEDIUMTEXT;

-- Alterar campo includedItems
ALTER TABLE `proposals` MODIFY COLUMN `includedItems` MEDIUMTEXT NOT NULL;

-- Alterar campo installmentDates
ALTER TABLE `proposals` MODIFY COLUMN `installmentDates` MEDIUMTEXT NOT NULL;
