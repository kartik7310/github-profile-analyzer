-- GitHub Profile Analyzer Database Schema
-- Run this script once to set up the database and table.

CREATE DATABASE IF NOT EXISTS github_analyzer;

USE github_analyzer;

CREATE TABLE IF NOT EXISTS profiles (
  id                        INT AUTO_INCREMENT PRIMARY KEY,
  username                  VARCHAR(100) NOT NULL UNIQUE,
  name                      VARCHAR(255),
  bio                       TEXT,
  location                  VARCHAR(255),
  company                   VARCHAR(255),
  followers                 INT NOT NULL DEFAULT 0,
  following                 INT NOT NULL DEFAULT 0,
  public_repos              INT NOT NULL DEFAULT 0,
  public_gists              INT NOT NULL DEFAULT 0,
  avatar_url                VARCHAR(500) NOT NULL,
  profile_url               VARCHAR(500) NOT NULL,
  account_created_at        DATETIME NOT NULL,
  account_age_days          INT NOT NULL DEFAULT 0,
  followers_following_ratio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  popularity_score          INT NOT NULL DEFAULT 0,
  analyzed_at               DATETIME NOT NULL,
  created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
