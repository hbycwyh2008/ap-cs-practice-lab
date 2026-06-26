# Reverse Proxy Notes

**AP CS Practice Lab - HTTPS Setup with Caddy or Nginx**

This guide provides reference configurations for setting up HTTPS access to your production deployment using a reverse proxy.

---

## Why Use a Reverse Proxy?

**Benefits:**

1. **HTTPS/TLS Termination**
   - Automatic SSL certificate management (Caddy)
   - Secure communication between users and server
   - Required for production deployment

2. **Domain Mapping**
   - Map `app.yourschool.com` to frontend (port 3000)
   - Map `api.yourschool.com` to backend (port 8000)
   - Professional URLs instead of `http://123.45.67.89:3000`

3. **Security**
   - Hide internal ports from public internet
   - Add rate limiting and access control
   - Protect against common attacks

4. **Performance**
   - Static file caching
   - Gzip compression
   - Load balancing (future)

**For small beta trial:**
- ✅ HTTPS is **required** (do not expose http-only to external users)
- ✅ Reverse proxy is **recommended** (Caddy preferred for automatic HTTPS)
- ✅ Can start without reverse proxy for initial testing (localhost access only)

---

## Recommended Options

### Option 1: Caddy (Recommended)

**Why Caddy:**
- ✅ Automatic HTTPS with Let's Encrypt
- ✅ Zero configuration TLS
- ✅ Simple configuration file
- ✅ Built-in HTTPS redirects
- ✅ Auto-renewal of certificates

**Best for:**
- Small beta deployments
- Quick setup with minimal configuration
- Teams without Nginx experience

### Option 2: Nginx

**Why Nginx:**
- ✅ Industry standard, well-documented
- ✅ High performance and stability
- ✅ Extensive customization options
- ✅ More VPS providers have pre-configured Nginx

**Best for:**
- Teams already familiar with Nginx
- Need advanced configuration (rate limiting, caching, etc.)
- Long-term production deployments

**Note:** Nginx requires manual Certbot setup for Let's Encrypt certificates.

---

## Caddy Configuration

### Installation

**On Ubuntu/Debian:**

```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

**Verify installation:**

```bash
caddy version
```

### Caddyfile Configuration

**Create `/etc/caddy/Caddyfile`:**

```caddy
# Frontend - Main application
your-domain.com, www.your-domain.com {
    reverse_proxy localhost:3000
}

# Backend - API
api.your-domain.com {
    reverse_proxy localhost:8000
}
```

**Replace placeholders:**
- `your-domain.com` → your actual frontend domain
- `api.your-domain.com` → your actual backend domain

**What this does:**
- Listens on ports 80 (HTTP) and 443 (HTTPS)
- Automatically obtains Let's Encrypt certificates
- Redirects HTTP to HTTPS automatically
- Proxies requests to frontend (port 3000) and backend (port 8000)

### Advanced Caddyfile (with logging and headers)

```caddy
# Frontend
your-domain.com, www.your-domain.com {
    reverse_proxy localhost:3000
    
    # Logging
    log {
        output file /var/log/caddy/frontend.log
        format json
    }
    
    # Security headers
    header {
        # Enable HSTS
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        # Prevent clickjacking
        X-Frame-Options "SAMEORIGIN"
        # XSS protection
        X-Content-Type-Options "nosniff"
    }
}

# Backend API
api.your-domain.com {
    reverse_proxy localhost:8000
    
    # Logging
    log {
        output file /var/log/caddy/backend.log
        format json
    }
    
    # CORS headers (handled by FastAPI, but can add here if needed)
    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    }
}
```

### Start Caddy

```bash
# Reload configuration
sudo systemctl reload caddy

# Check status
sudo systemctl status caddy

# View logs
sudo journalctl -u caddy -f
```

### Update Application Configuration

**Update `.env.production`:**

```bash
# Frontend should use HTTPS backend URL
NEXT_PUBLIC_API_URL=https://api.your-domain.com

# Backend should allow frontend domain in CORS
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

**Restart application:**

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production restart backend frontend
```

### Verify HTTPS

```bash
# Test frontend
curl -I https://your-domain.com

# Test backend
curl https://api.your-domain.com/health

# Should return: {"status":"ok"}
```

**Check browser:**
1. Open `https://your-domain.com` in browser
2. Verify green padlock icon in address bar
3. Click padlock → Certificate should be from "Let's Encrypt"

---

## Nginx Configuration

### Installation

**On Ubuntu/Debian:**

```bash
# Install Nginx
sudo apt update
sudo apt install nginx

# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx
```

**Verify installation:**

```bash
nginx -v
```

### Nginx Configuration File

**Create `/etc/nginx/sites-available/ap-cs-practice-lab`:**

```nginx
# Frontend - HTTP (will redirect to HTTPS after Certbot)
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend API - HTTP (will redirect to HTTPS after Certbot)
server {
    listen 80;
    listen [::]:80;
    server_name api.your-domain.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers (if not handled by FastAPI)
        # add_header 'Access-Control-Allow-Origin' 'https://your-domain.com' always;
    }
}
```

**Enable site:**

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/ap-cs-practice-lab /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Obtain SSL Certificates with Certbot

```bash
# Obtain certificates for both domains
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com

# Follow prompts:
# - Enter email address
# - Agree to Terms of Service
# - Choose whether to redirect HTTP to HTTPS (recommend: Yes)
```

**What Certbot does:**
- Obtains Let's Encrypt certificates
- Modifies Nginx config to use HTTPS
- Sets up automatic renewal (cron job)

**Verify certificates:**

```bash
# Check Certbot renewal
sudo certbot renew --dry-run

# Certificate should auto-renew every 60 days
```

### Advanced Nginx Configuration (with rate limiting)

**Add to `/etc/nginx/sites-available/ap-cs-practice-lab`:**

```nginx
# Rate limiting zone (outside server block)
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

# Backend API with rate limiting
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.your-domain.com;
    
    # SSL certificates (added by Certbot)
    ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    location / {
        # Rate limiting: 10 requests per second per IP
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check endpoint (no rate limit)
    location /health {
        proxy_pass http://localhost:8000/health;
        access_log off;
    }
}
```

**Reload Nginx:**

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## DNS Configuration

**Before configuring reverse proxy, set up DNS records:**

### Required DNS Records

**For Caddy/Nginx to work, create A records:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `your-vps-ip` | 3600 |
| A | `www` | `your-vps-ip` | 3600 |
| A | `api` | `your-vps-ip` | 3600 |

**Example:**
- `your-domain.com` → `123.45.67.89`
- `www.your-domain.com` → `123.45.67.89`
- `api.your-domain.com` → `123.45.67.89`

**DNS propagation:**
- Can take 1-48 hours (typically <1 hour)
- Check with: `dig your-domain.com` or `nslookup your-domain.com`

**Test before Caddy/Nginx:**

```bash
# Should resolve to VPS IP
ping your-domain.com
ping api.your-domain.com
```

---

## Port Configuration

### With Reverse Proxy (Recommended)

**Update `docker-compose.prod.yml` to bind to localhost only:**

```yaml
backend:
  ports:
    - "127.0.0.1:8000:8000"  # Only accessible from localhost

frontend:
  ports:
    - "127.0.0.1:3000:3000"  # Only accessible from localhost
```

**Why:**
- Backend/frontend not directly accessible from internet
- All traffic goes through reverse proxy (port 80/443)
- More secure

**Firewall rules:**

```bash
# Allow only SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Without Reverse Proxy (Testing Only)

**For initial testing without reverse proxy:**

```yaml
backend:
  ports:
    - "8000:8000"  # Accessible from public IP

frontend:
  ports:
    - "3000:3000"  # Accessible from public IP
```

**⚠️ WARNING:** Do NOT use this for beta trial. HTTP-only connections are insecure.

---

## Troubleshooting

### Problem: Caddy fails to obtain certificate

**Error:**
```
failed to obtain certificate: acme: error: 403
```

**Common causes:**
- DNS not pointing to VPS IP
- Firewall blocking port 80/443
- Domain already has certificate (rate limit)

**Solution:**
```bash
# Check DNS
dig your-domain.com

# Check firewall
sudo ufw status

# Check Caddy logs
sudo journalctl -u caddy -n 50
```

### Problem: Frontend can't reach backend (CORS error)

**Error in browser console:**
```
Access to fetch at 'https://api.your-domain.com/...' has been blocked by CORS policy
```

**Solution:**
- Verify `CORS_ORIGINS` in `.env.production` includes frontend domain
- Verify `NEXT_PUBLIC_API_URL` points to backend domain
- Restart backend: `docker compose -f docker-compose.prod.yml restart backend`

### Problem: 502 Bad Gateway

**Error:**
```
502 Bad Gateway
nginx/1.18.0 (Ubuntu)
```

**Common causes:**
- Backend container not running
- Backend crashed
- Wrong proxy_pass port

**Solution:**
```bash
# Check if backend is running
docker compose -f docker-compose.prod.yml ps backend

# Check backend logs
docker compose -f docker-compose.prod.yml logs backend

# Restart backend
docker compose -f docker-compose.prod.yml restart backend
```

### Problem: Certificate renewal fails

**Caddy:**
```bash
# Check certificate status
curl -vI https://your-domain.com 2>&1 | grep expire

# Force renewal (if needed)
sudo systemctl restart caddy
```

**Nginx/Certbot:**
```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal (if needed)
sudo certbot renew --force-renewal
```

---

## Security Best Practices

### HTTPS Only

**⚠️ CRITICAL for beta trial:**
- Never expose backend without HTTPS
- Never ask users to access `http://` URLs
- Always redirect HTTP to HTTPS

**Why:**
- Passwords transmitted in clear text over HTTP
- JWT tokens visible to network observers
- Student code submissions visible

### Rate Limiting

**Recommended limits:**
- Login endpoint: 5 requests/minute per IP
- Submission endpoint: 10 requests/minute per IP
- General API: 100 requests/minute per IP

**Caddy example:**
```caddy
api.your-domain.com {
    reverse_proxy localhost:8000
    
    # Rate limiting (requires caddy-rate-limit plugin)
    # See: https://github.com/mholt/caddy-ratelimit
}
```

**Nginx example:**
```nginx
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

location /auth/login {
    limit_req zone=login_limit burst=2 nodelay;
    proxy_pass http://localhost:8000;
}
```

### Security Headers

**Recommended headers (add to reverse proxy):**

```nginx
# Nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

```caddy
# Caddy
header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains"
    X-Frame-Options "SAMEORIGIN"
    X-Content-Type-Options "nosniff"
}
```

---

## Monitoring and Logs

### Caddy Logs

```bash
# View Caddy service logs
sudo journalctl -u caddy -f

# View access logs (if configured)
sudo tail -f /var/log/caddy/frontend.log
sudo tail -f /var/log/caddy/backend.log
```

### Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log

# Site-specific logs (if configured)
sudo tail -f /var/log/nginx/ap-cs-frontend.log
```

### Check Certificate Expiry

```bash
# Caddy
curl -vI https://your-domain.com 2>&1 | grep "expire date"

# Nginx/Certbot
sudo certbot certificates
```

---

## Alternative: No Reverse Proxy (Not Recommended)

**If you must deploy without reverse proxy:**

1. **Use Cloudflare Tunnel** (free HTTPS without VPS setup)
   - See: https://www.cloudflare.com/products/tunnel/
   - Provides HTTPS even without reverse proxy

2. **Use Let's Encrypt directly in Docker**
   - Add HTTPS container (Traefik, etc.)
   - More complex setup

3. **Accept HTTP-only for internal testing**
   - ⚠️ **ONLY for localhost access or private network**
   - **NEVER for beta trial with external teachers**

---

## Next Steps

**After setting up reverse proxy:**

1. **Verify HTTPS:**
   - Open `https://your-domain.com` in browser
   - Check for green padlock
   - Test teacher login

2. **Update documentation:**
   - Share `https://your-domain.com` with beta teachers
   - Update `BETA_TRIAL_INVITE.md` with actual URL

3. **Monitor logs:**
   - Watch for 502 errors
   - Check certificate renewal
   - Monitor rate limiting effectiveness

4. **Test full flow:**
   - Teacher creates assignment
   - Student submits code
   - Java runner executes successfully
   - Analytics work correctly

---

## Additional Resources

**Caddy:**
- Official docs: https://caddyserver.com/docs/
- Let's Encrypt integration: https://caddyserver.com/docs/automatic-https

**Nginx:**
- Official docs: https://nginx.org/en/docs/
- Certbot docs: https://certbot.eff.org/

**Let's Encrypt:**
- Home: https://letsencrypt.org/
- Rate limits: https://letsencrypt.org/docs/rate-limits/

**Security headers:**
- OWASP guide: https://owasp.org/www-project-secure-headers/

---

**Remember:**
- HTTPS is required for production beta
- Caddy is easier for small deployments
- Nginx offers more control for advanced needs
- Always test certificate renewal
- Monitor logs during beta trial

---

**Version:** Reverse Proxy Guide v1.0  
**Last Updated:** June 2026  
**Recommended:** Caddy with automatic HTTPS
