-- Rolecall — Base Schema
-- Basic email/password authentication (plaintext, no hashing) lives directly
-- on users.password for now. Session-based login/logout only — no route
-- protection yet.

CREATE DATABASE IF NOT EXISTS rolecall;
USE rolecall;

CREATE TABLE organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  org_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'member',   -- super_admin | org_admin | manager | member
  password VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id)
);

CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  org_id INT NOT NULL,
  manager_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (manager_id) REFERENCES users(id)
);

CREATE TABLE project_members (
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (project_id, user_id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  assigned_to INT,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'todo',   -- todo | in_progress | done
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Dummy seed data

INSERT INTO organizations (id, name) VALUES
  (1, 'Acme Org'),
  (2, 'Globex Corp'),
  (3, 'Initech');

INSERT INTO users (id, org_id, name, email, role, password) VALUES
  (1, 1, 'Jane Manager', 'jane@acme.com', 'manager', 'password123'),
  (2, 1, 'Sam Admin', 'sam@acme.com', 'org_admin', 'password123'),
  (3, 2, 'Priya Manager', 'priya@globex.com', 'manager', 'password123'),
  (4, 3, 'Diego Manager', 'diego@initech.com', 'manager', 'password123'),
  (5, 1, 'Alex Member', 'alex@acme.com', 'member', 'password123'),
  (6, 1, 'Sarah Admin', 'sarah@rolecall.dev', 'super_admin', 'password123');

INSERT INTO projects (id, org_id, manager_id, title, description) VALUES
  (1, 1, 1, 'Rolecall Launch', 'Ship the auth learning app'),
  (2, 1, 1, 'Auth Playground', 'Sandbox for comparing auth strategies'),
  (3, 2, 3, 'Globex Migration', 'Migrate Globex legacy tasks into Rolecall'),
  (4, 3, 4, 'Initech TPS Tracker', 'Track TPS report tasks across teams');

INSERT INTO project_members (project_id, user_id) VALUES
  (1, 1), (1, 2), (1, 5),
  (2, 1), (2, 5),
  (3, 3),
  (4, 4);

INSERT INTO tasks (project_id, assigned_to, title, status) VALUES
  (1, 5, 'Set up backend scaffold', 'done'),
  (1, 5, 'Set up frontend scaffold', 'done'),
  (1, 1, 'Wire up project CRUD API', 'in_progress'),
  (2, 1, 'Implement JWT auth branch', 'todo'),
  (3, 3, 'Export Globex task data', 'todo'),
  (4, 4, 'Build TPS report view', 'todo');