-- =============================================================================
-- FitCore / Arcfit — Full Multi-Tenant Schema (Reference DDL)
-- Generated: 2026-03-10
-- Target: PostgreSQL 15+
-- =============================================================================

-- -----------------------------------------------------------------------------
-- customers
--   Top-level tenant. One customer = one fitness studio business (may have
--   multiple branches).
-- -----------------------------------------------------------------------------
CREATE TABLE customers (
    id           TEXT        PRIMARY KEY,
    name         TEXT        NOT NULL,
    email        TEXT        NOT NULL UNIQUE,
    phone        TEXT,
    address      TEXT,
    address2     TEXT,
    city         TEXT,
    state        TEXT,
    country      TEXT,
    postal_code  TEXT,
    is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
    is_deleted   BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_customers_email ON customers (email);


-- -----------------------------------------------------------------------------
-- branches
--   A physical location belonging to a customer (e.g. "강남점", "홍대점").
-- -----------------------------------------------------------------------------
CREATE TABLE branches (
    id           TEXT        PRIMARY KEY,
    customer_id  TEXT        REFERENCES customers (id) ON DELETE SET NULL,
    name         TEXT        NOT NULL,
    address      TEXT        NOT NULL,
    address2     TEXT,
    city         TEXT,
    state        TEXT,
    country      TEXT,
    postal_code  TEXT,
    phone        TEXT,
    description  TEXT,
    is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
    is_deleted   BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_branches_customer_id ON branches (customer_id);


-- -----------------------------------------------------------------------------
-- trainers
--   Staff members (PT trainers, instructors) assigned to a branch.
--   auth_user_id links to the users table when the trainer has a login account.
-- -----------------------------------------------------------------------------
CREATE TABLE trainers (
    id             TEXT        PRIMARY KEY,
    branch_id      TEXT        NOT NULL REFERENCES branches (id) ON DELETE CASCADE,
    auth_user_id   TEXT,                        -- soft FK → users.id
    first_name     TEXT        NOT NULL,
    last_name      TEXT        NOT NULL,
    email          TEXT        NOT NULL,
    phone          TEXT,
    trainer_level  TEXT        NOT NULL DEFAULT 'junior',  -- junior | senior | master
    is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
    is_deleted     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_trainers_branch_id    ON trainers (branch_id);
CREATE INDEX ix_trainers_email        ON trainers (email);
CREATE INDEX ix_trainers_auth_user_id ON trainers (auth_user_id);


-- -----------------------------------------------------------------------------
-- members
--   Gym members (clients) who receive PT sessions.
--   Assigned to a branch and optionally to a specific trainer.
-- -----------------------------------------------------------------------------
CREATE TABLE members (
    id          TEXT        PRIMARY KEY,
    trainer_id  TEXT        REFERENCES trainers (id) ON DELETE SET NULL,
    branch_id   TEXT        NOT NULL REFERENCES branches (id) ON DELETE CASCADE,
    first_name  TEXT        NOT NULL,
    last_name   TEXT        NOT NULL,
    email       TEXT        NOT NULL,
    phone       TEXT,
    status      TEXT        NOT NULL DEFAULT 'active',  -- active | inactive | suspended
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    is_deleted  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_members_trainer_id ON members (trainer_id);
CREATE INDEX ix_members_branch_id  ON members (branch_id);
CREATE INDEX ix_members_email      ON members (email);


-- -----------------------------------------------------------------------------
-- pt_sessions
--   Individual personal-training sessions between a trainer and a member.
-- -----------------------------------------------------------------------------
CREATE TABLE pt_sessions (
    id             TEXT        PRIMARY KEY,
    trainer_id     TEXT        NOT NULL REFERENCES trainers (id) ON DELETE CASCADE,
    member_id      TEXT        NOT NULL REFERENCES members  (id) ON DELETE CASCADE,
    branch_id      TEXT        NOT NULL REFERENCES branches (id) ON DELETE CASCADE,
    session_title  TEXT        NOT NULL,
    start_time     TIMESTAMPTZ NOT NULL,
    end_time       TIMESTAMPTZ NOT NULL,
    status         TEXT        NOT NULL DEFAULT 'scheduled',
    --   scheduled | completed | cancelled | no_show
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_pt_sessions_trainer_id ON pt_sessions (trainer_id);
CREATE INDEX ix_pt_sessions_member_id  ON pt_sessions (member_id);
CREATE INDEX ix_pt_sessions_branch_id  ON pt_sessions (branch_id);
CREATE INDEX ix_pt_sessions_start_time ON pt_sessions (start_time);


-- -----------------------------------------------------------------------------
-- users
--   Authentication / login accounts.
--   customer_id / branch_id / trainer_id are soft FK references (no DB
--   constraint) so users and domain tables can live in the same DB without
--   circular dependency issues.
--
--   Roles:
--     super-admin — platform owner, full access
--     admin       — customer-level admin, manages one customer's branches
--     trainer     — branch-level trainer, sees their own members/sessions
--     user        — basic account (default)
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id               TEXT        PRIMARY KEY,
    email            TEXT        NOT NULL UNIQUE,
    name             TEXT,
    phone            TEXT,
    role             TEXT        NOT NULL DEFAULT 'user',
    --   super-admin | admin | trainer | user
    customer_id      TEXT,       -- soft FK → customers.id
    branch_id        TEXT,       -- soft FK → branches.id
    trainer_id       TEXT,       -- soft FK → trainers.id
    hashed_password  TEXT,       -- NULL for OAuth-only accounts
    provider         TEXT        NOT NULL DEFAULT 'local',
    --   local | google | kakao
    provider_id      TEXT,       -- OAuth subject ID
    is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
    is_deleted       BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ix_users_email       ON users (email);
CREATE        INDEX ix_users_customer_id ON users (customer_id);
CREATE        INDEX ix_users_branch_id   ON users (branch_id);
CREATE        INDEX ix_users_trainer_id  ON users (trainer_id);


-- -----------------------------------------------------------------------------
-- roles
--   Lookup table for valid roles. Seeded on first startup.
--   Actual role enforcement is done via users.role (plain string check).
-- -----------------------------------------------------------------------------
CREATE TABLE roles (
    id           TEXT        PRIMARY KEY,
    name         TEXT        NOT NULL UNIQUE,   -- super-admin | admin | trainer | user
    description  TEXT,
    is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ix_roles_name ON roles (name);

-- Default seed data (inserted by migration 002 / startup _ensure_roles)
-- INSERT INTO roles (id, name, description) VALUES
--   (gen_random_uuid(), 'super-admin', 'Platform owner — full access to everything'),
--   (gen_random_uuid(), 'admin',       'Customer-level admin — manages branches and staff'),
--   (gen_random_uuid(), 'trainer',     'Branch trainer — manages own members and sessions'),
--   (gen_random_uuid(), 'user',        'Basic account — default role on signup');


-- =============================================================================
-- Teardown (reverse FK order)
-- =============================================================================
-- DROP TABLE IF EXISTS pt_sessions;
-- DROP TABLE IF EXISTS members;
-- DROP TABLE IF EXISTS trainers;
-- DROP TABLE IF EXISTS branches;
-- DROP TABLE IF EXISTS customers;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS roles;
