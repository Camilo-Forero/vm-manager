CREATE TABLE IF NOT EXISTS `users` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `email` text NOT NULL UNIQUE,
  `password` text NOT NULL,
  `name` text NOT NULL,
  `role` text CHECK(role IN ('admin', 'client')) NOT NULL DEFAULT 'client',
  `created_at` text NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `vms` (
  `id` integer PRIMARY KEY AUTOINCREMENT,
  `name` text NOT NULL,
  `cores` integer NOT NULL,
  `ram` integer NOT NULL,
  `disk` integer NOT NULL,
  `os` text NOT NULL,
  `status` text CHECK(status IN ('active', 'inactive')) NOT NULL DEFAULT 'inactive',
  `created_at` text NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` text NOT NULL DEFAULT CURRENT_TIMESTAMP
);
