#!/bin/bash
LOG=/c/Users/LENOVO/Downloads/esim-free-redirect/cert_progress.log
for i in $(seq 1 48); do
  STATE=$(gh api repos/s11158/esim-free/pages --jq '.https_certificate.state' 2>/dev/null)
  echo "$(date +%H:%M) state=$STATE" >> "$LOG"
  if [ "$STATE" = "approved" ] || [ "$STATE" = "authorized" ] || [ "$STATE" = "issued" ]; then
    gh api -X PUT repos/s11158/esim-free/pages -F https_enforced=true >> "$LOG" 2>&1
    echo "$(date +%H:%M) HTTPS enforced" >> "$LOG"
    exit 0
  fi
  sleep 300
done
echo "timeout" >> "$LOG"
