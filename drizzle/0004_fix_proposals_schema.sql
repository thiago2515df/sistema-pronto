-- Adicionar novos campos
ALTER TABLE `proposals` ADD COLUMN `adults` int NOT NULL DEFAULT 2;
ALTER TABLE `proposals` ADD COLUMN `children` int NOT NULL DEFAULT 0;
ALTER TABLE `proposals` ADD COLUMN `childrenAges` text;
ALTER TABLE `proposals` ADD COLUMN `days` int;
ALTER TABLE `proposals` ADD COLUMN `nights` int;
ALTER TABLE `proposals` ADD COLUMN `hotelName` varchar(255);
ALTER TABLE `proposals` ADD COLUMN `firstInstallmentDate` varchar(20);

-- Remover campo obsoleto passengers
ALTER TABLE `proposals` DROP COLUMN `passengers`;
