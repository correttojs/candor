#!/bin/bash
 

if [[ ! "$VERCEL_GIT_COMMIT_REF" =~ chore\/.* ]]; then
  # Proceed with the build
    echo "✅ - Build can proceed"
  exit 1;

else
  # Don't build
  echo "🛑 - Build cancelled"
  exit 0;
fi