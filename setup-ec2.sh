#!/bin/bash
set -e

echo "Atualizando pacotes..."
export DEBIAN_FRONTEND=noninteractive
sudo apt update -y
sudo apt upgrade -y

echo "Instalando PostgreSQL e Nginx..."
sudo apt install postgresql postgresql-contrib nginx certbot python3-certbot-nginx -y

echo "Instalando Docker e Docker Compose..."
sudo apt install docker.io docker-compose -y

echo "Habilitando serviços..."
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo systemctl enable docker
sudo systemctl start docker
sudo systemctl enable nginx
sudo systemctl start nginx

echo "Configurando Firewall (UFW)..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

echo "Instalação concluída com sucesso."
