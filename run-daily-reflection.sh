#!/bin/bash
# RITA's Personal Toolkit - Daily Run
# Runs at 11 PM UTC (end of day reflection)

TOOLKIT_DIR="/root/.openclaw/workspace/rita-toolkit"
LOG_FILE="$TOOLKIT_DIR/logs/daily-$(date +%Y-%m-%d).log"
DATE=$(date +%Y-%m-%d)

echo "========================================" >> "$LOG_FILE"
echo "🤖 RITA'S DAILY REFLECTION - $DATE" >> "$LOG_FILE"
echo "Started: $(date)" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

cd "$TOOLKIT_DIR"

# Run all toolkit components
echo "[$(date)] Running self-monitor..." >> "$LOG_FILE"
node self-monitor/src/performance.js >> "$LOG_FILE" 2>&1

echo "[$(date)] Running memory curator..." >> "$LOG_FILE"
node memory-curator/src/organizer.js >> "$LOG_FILE" 2>&1

echo "[$(date)] Running recommendation tracker..." >> "$LOG_FILE"
node recommendation-tracker/src/followup.js >> "$LOG_FILE" 2>&1

echo "[$(date)] Running learning log..." >> "$LOG_FILE"
node learning-log/src/insights.js >> "$LOG_FILE" 2>&1

# Commit to GitHub
echo "[$(date)] Committing to GitHub..." >> "$LOG_FILE"
git add . >> "$LOG_FILE" 2>&1
git commit -m "📊 Daily reflection - $DATE" >> "$LOG_FILE" 2>&1 || true
git push >> "$LOG_FILE" 2>&1 || true

echo "[$(date)] Daily reflection complete!" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# Optional: Send summary notification (can integrate with Telegram, etc.)
# curl -X POST ...