# Deploy su Raspberry Pi 3 (dietpi)

La build di default (Cloudflare Workers) non gira su Pi: è un formato serverless.
Per il Pi usiamo un **build Node** standalone, che gira con un normale `node`.

## Pre-requisiti sul Pi
- dietpi installato e aggiornato
- Node.js 20+ (dietpi lo fornisce via `dietpi-software install Node.js`)

## 1. Prepara il Pi
```bash
sudo dietpi-software install Node.js
sudo apt-get update && sudo apt-get install -y nginx
```

## 2. Copia i file sul Pi
```bash
# Dal tuo PC (Windows), usa scp o copia la cartella intera
scp -r C:\Users\andre\Documents\Luridiamo\extracted\luridiamo-main pi@<indirizzo-pi>:/opt/luridiamo
```

## 3. Crea l'environment file
```bash
sudo mkdir -p /opt/luridiamo
sudo chown pi:pi /opt/luridiamo
cd /opt/luridiamo
```
Crea `luridiamo.env`:
```
SUPABASE_URL=https://kdxenqerlbpypinupzmq.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_3e76awQFJFklYgm1oljRYA_CzN4jVuj
PORT=3000
```

## 4. Installa dipendenze e fai il build Node
```bash
cd /opt/luridiamo
npm install
npm run build:pi      # oppure: bash scripts/build-for-pi.sh
```
> Lo script `scripts/build-for-pi.sh` fa automaticamente la build Node in `.output-node/`
> e ripristina il config originale per il deploy Cloudflare.

## 5. Avvia il server (metodo consigliato: systemd)
```bash
sudo cp deploy/pi/luridiamo.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable luridiamo
sudo systemctl start luridiamo
sudo systemctl status luridiamo
```

## 6. (Opzionale) Nginx come reverse proxy
```bash
sudo cp deploy/pi/nginx-luridiamo.conf /etc/nginx/sites-available/luridiamo
sudo ln -s /etc/nginx/sites-available/luridiamo /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```
Poi nel DNS: `luridiamo.dietpi` → indirizzo del Pi, porta 80.

## 7. Verifica
```bash
curl http://localhost:3000/ | grep -o '<title>[^<]*</title>'
curl http://localhost:3000/lista | head -c 50
```

## Note importanti
- **Porta in ascolto**: 3000 (configurabile con `PORT`).
- **Database**: l'app legge Supabase remoto, niente DB locale sul Pi.
- **SSL**: se vuoi HTTPS, metti un certificato Let's Encrypt davanti a nginx
  (`sudo apt-get install certbot python3-certbot-nginx`).
- **Aggiornamenti**: `cd /opt/luridiamo && npm install && npm run build:pi && sudo systemctl restart luridiamo`.