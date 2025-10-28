
#!/bin/bash
set -e
echo "Restaurando backup..."
pg_restore -U $POSTGRES_USER -d $POSTGRES_DB /docker-entrypoint-initdb.d/med_check_api.backup
