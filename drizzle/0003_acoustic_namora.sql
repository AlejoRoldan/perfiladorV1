ALTER TABLE `users` MODIFY COLUMN `role` enum('collaborator','manager','people_ops','admin') NOT NULL DEFAULT 'collaborator';--> statement-breakpoint
ALTER TABLE `users` ADD `accessStatus` enum('invited','active','suspended') DEFAULT 'invited' NOT NULL;
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','collaborator','manager','people_ops','admin') NOT NULL DEFAULT 'collaborator';
--> statement-breakpoint
UPDATE `users` SET `role` = 'collaborator' WHERE `role` = 'user';
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('collaborator','manager','people_ops','admin') NOT NULL DEFAULT 'collaborator';
--> statement-breakpoint
UPDATE `users` SET `accessStatus` = CASE WHEN `role` = 'admin' THEN 'active' ELSE 'invited' END;
