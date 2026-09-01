#!/bin/bash
set -e

echo "Configurando Postgres..."

sudo -u postgres psql <<EOF
CREATE DATABASE dashboard_financeiro;
CREATE USER dashboard_user WITH ENCRYPTED PASSWORD 'dashboard_password';
GRANT ALL PRIVILEGES ON DATABASE dashboard_financeiro TO dashboard_user;
\c dashboard_financeiro
GRANT ALL ON SCHEMA public TO dashboard_user;
EOF

echo "Importando schema..."
sudo -u postgres psql -d dashboard_financeiro -f /home/ubuntu/supabase-schema.sql

echo "Configurando pg_hba.conf para permitir conexão do Docker..."
# Allows connections from the Docker bridge network (172.17.0.0/16)
echo "host    dashboard_financeiro    dashboard_user    172.17.0.0/16    scram-sha-256" | sudo tee -a /etc/postgresql/18/main/pg_hba.conf
# Also configure postgresql.conf to listen on docker interface or all interfaces
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/18/main/postgresql.conf

sudo systemctl restart postgresql
echo "Banco configurado com sucesso!"
