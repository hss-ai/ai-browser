# Backup And Restore

- Backup approach: JSON snapshot of all data files (conversations.enc.json, templates.json, settings.json, comparisons.enc.json) → zipped to `backups/backup-YYYY-MM-DDTHH-mm-ss.json`
- Backup schedule: On app startup + every 24 hours (setInterval 86400000ms)
- Retention: Keep latest 7 backups, auto-delete older
- Restore approach: Select backup by ID → overwrite current data files with backup content → reload from disk
- Encryption: Conversations and comparisons encrypted via `safeStorage.encryptString()`; templates and settings stored as plain JSON
- Fallback: If safeStorage unavailable, store as plain JSON with console warning
- Manual: Settings → 备份 → 创建备份 / 恢复备份 buttons
