# Deploying Iqraa Backend to AWS EC2 (Free Tier)

This guide will walk you through migrating your Go backend from Render to a free-tier AWS EC2 instance. This eliminates cold starts and gives you full control over your server.

**Prerequisites:**

- An AWS Account
- A domain name (e.g., `iqraa.space`) managed somewhere you can edit DNS records (e.g., Namecheap, Cloudflare, Route53)

---

## 1. Launch a Free Tier EC2 Instance

1. Go to the AWS Management Console and search for **EC2**.
2. Click **Launch Instance**.
3. **Name:** `iqraa-backend-prod`
4. **AMI:** Select **Ubuntu** (Ubuntu Server 24.04 LTS is fine). Look for the "Free tier eligible" label.
5. **Instance Type:** Select `t2.micro` or `t3.micro` (whichever says "Free tier eligible").
6. **Key Pair:** Click **Create new key pair**.
   - Name it `iqraa-prod-key`. Ensure `RSA` and `.pem` format are selected. Save it securely on your local computer (e.g. in `~/.ssh/`).
7. **Network Settings:**
   - Allow **SSH traffic from** -> "My IP" or "Anywhere" (My IP is more secure).
   - Allow **HTTPS traffic from the internet**.
   - Allow **HTTP traffic from the internet**.
8. **Storage:** Free tier allows up to 30GB. You can increase it to `20GB` gp3 to be safe.
9. Click **Launch Instance**.

## 2. Allocate an Elastic IP

AWS changes the public IP of instances whenever they restart. To prevent DNS issues, assign a fixed IP.

1. On the left EC2 sidebar, click **Elastic IPs** (under Network & Security).
2. Click **Allocate Elastic IP address** -> **Allocate**.
3. Select the newly created IP, click **Actions** -> **Associate Elastic IP address**.
4. Choose your `iqraa-backend-prod` instance and click **Associate**.
5. Copy the **Allocated IPv4 address**; you will need it for DNS.

## 3. Configure DNS

Go to where you manage your domain (`iqraa.space`) DNS records.

1. Create an **A Record**.
2. **Name/Host:** `api` (which makes the full domain `api.iqraa.space`).
3. **Value/Target:** Paste the **Elastic IP** you allocated above.
4. Set TTL to automatic or highest priority, and Save.

_(It may take 5-15 minutes for the DNS propagation to take effect)_

## 4. SSH into the Server and Install Docker

Open your local terminal. Ensure you find the `.pem` file you downloaded.

1. restrict key permissions:
   `chmod 400 path/to/iqraa-prod-key.pem`

2. Connect to server (Replace with your Elastic IP):
   `ssh -i path/to/iqraa-prod-key.pem ubuntu@YOUR_ELASTIC_IP`

3. Once in the server, run the following commands one by one to install Docker:

```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# Install Docker packages:
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Make Docker manageable without using sudo every time
sudo usermod -aG docker $USER
```

4. **Log out and log back in** (type `exit` then run the `ssh` command again) to apply the Docker group changes.

## 5. Upload Codebase and Environment Variables

You need to put your Go backend code on the server. There are two ways:

**Option A (Easier): Clone from GitHub**
If your repository is on GitHub:

1. `git clone https://github.com/your-username/iqraa-backend.git`
2. `cd iqraa-backend`

**Option B: Copy files via SCP (from your local machine terminal)**
Run this on your local computer where the code currently lives:

```bash
# We sync the entire backend folder except node_modules/git/tmp
rsync -avz -e "ssh -i path/to/iqraa-prod-key.pem" --exclude '.git' --exclude 'tmp' /home/draq/Documents/Work/iqraa/backend/ ubuntu@YOUR_ELASTIC_IP:~/backend/
```

### Create the `.env` file on the server

Once the code is on the server, go to the project directory:
`cd ~/backend` (or whatever the folder is named)

Create the `.env` file using the nano editor:
`nano .env`

Paste in your production environment variables.
**Crucial modifications for production:**

- Make sure `DB_DSN` points to your Supabase PostgreSQL connection string.
- `REDIS_URL` should be `redis://redis:6379/0` (this connects to the Dockerized Redis we set up).
- Ensure your `R2_*`, `SUPABASE_*`, and `SMTP_*` variables are correct.
- **Do not** specify `PORT` unless you want to change it (it defaults to 8080 which `docker-compose.prod.yml` expects).

Save the file (`Ctrl+O`, `Enter`, `Ctrl+X`).

## 6. Start the Application

On the EC2 server, inside the directory where `docker-compose.prod.yml` is located:

1. Build and run the containers in detached mode:
   `docker compose -f docker-compose.prod.yml up -d --build`

Docker will:

1. Compile your Go application heavily localized and optimized.
2. Spin up Redis.
3. Spin up Caddy, which will automatically contact Let's Encrypt to get a free SSL certificate for `api.iqraa.space` and route secure traffic to your Go app.

Verify it's running:
`docker logs -f iqraa-api` (Check for successfully connected database/started logs)
`docker logs caddy` (Check if SSL certificate generation succeeded)

## 7. Update Frontend Requests

Your API is now live at `https://api.iqraa.space`.

Go back to your Next.js/React frontend codebase and change the `NEXT_PUBLIC_API_URL` (or whatever variable you use to query the backend) from the Render URL to `https://api.iqraa.space`.

Deploy your frontend to update the endpoints.

**Congratulations!** Your backend will now respond instantly without sleeping, remaining on the AWS Free Tier!
