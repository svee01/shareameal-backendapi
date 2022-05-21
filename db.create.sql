DROP DATABASE IF EXISTS `share-a-meal`;
CREATE DATABASE `share-a-meal`;
DROP DATABASE IF EXISTS `share-a-meal-testdb`;
CREATE DATABASE `share-a-meal-testdb`;
-- share-a-meal-user aanmaken
CREATE USER IF NOT EXISTS 'share-a-meal-user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'secret';
CREATE USER IF NOT EXISTS 'share-a-meal-user'@'%' IDENTIFIED WITH mysql_native_password BY 'secret';
-- geef rechten aan deze user
GRANT SELECT, INSERT, DELETE, UPDATE ON `share-a-meal`.* TO 'share-a-meal-user'@'%';
GRANT SELECT, INSERT, DELETE, UPDATE ON `share-a-meal`.* TO 'share-a-meal-user'@'localhost';
GRANT SELECT, INSERT, DELETE, UPDATE ON `share-a-meal-testdb`.* TO 'share-a-meal-user'@'localhost';
GRANT SELECT, INSERT, DELETE, UPDATE ON `share-a-meal-testdb`.* TO 'share-a-meal-user'@'localhost';

USE `share-a-meal`;