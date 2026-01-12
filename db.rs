// src-tauri/src/db.rs

use rusqlite::{params, Connection, Result};
use serde::{Serialize, Deserialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: Option<i32>,
    pub username: String,
    pub total_points: i32,
    pub currency: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Progress {
    pub id: Option<i32>,
    pub user_id: i32,
    pub level_id: String,
    pub status: String, // 'LOCKED', 'OPEN', 'MASTERED'
    pub best_streak: i32,
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn init<P: AsRef<Path>>(path: P) -> Result<Self> {
        let conn = Connection::open(path)?;
        
        conn.execute(
            "CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                total_points INTEGER DEFAULT 0,
                currency INTEGER DEFAULT 0
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS progress (
                id INTEGER PRIMARY KEY,
                user_id INTEGER NOT NULL,
                level_id TEXT NOT NULL,
                status TEXT DEFAULT 'LOCKED',
                best_streak INTEGER DEFAULT 0,
                completed_at DATETIME,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )",
            [],
        )?;

        Ok(Database { conn })
    }

    pub fn add_user(&self, username: &str) -> Result<()> {
        self.conn.execute(
            "INSERT INTO users (username) VALUES (?1)",
            params![username],
        )?;
        Ok(())
    }

    pub fn update_progress(&self, user_id: i32, level_id: &str, status: &str) -> Result<()> {
        self.conn.execute(
            "INSERT INTO progress (user_id, level_id, status) VALUES (?1, ?2, ?3)
             ON CONFLICT(id) DO UPDATE SET status = excluded.status",
             // Note: Real upsert requires unique constraint on (user_id, level_id)
             // For this schema, we assume simple insert for now or add constraint.
            params![user_id, level_id, status],
        )?;
        Ok(())
    }
}
