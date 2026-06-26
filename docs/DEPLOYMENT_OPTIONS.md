# Deployment Options Evaluation

**AP CS Practice Lab - Beta Deployment Decision**

This document evaluates deployment options for the first small-scale beta trial, with focus on the Java runner constraint.

---

## Current Architecture Summary

The AP CS Practice Lab consists of the following components:

**Application Stack:**
- **Frontend:** Next.js (React) - Server-side rendering and static generation
- **Backend:** FastAPI (Python) - REST API with JWT authentication
- **Database:** PostgreSQL 16+ - Relational database for all application data
- **Java Runner:** Docker-based sandbox - Isolated code execution environment
- **Local Orchestration:** docker-compose - Multi-container coordination

**Key Dependency Graph:**
```
Frontend → Backend API
Backend → PostgreSQL (data)
Backend → Java Runner (code execution)
Java Runner → Docker Socket (container management)
```

**Critical Constraint:**

⚠️ **The Java runner is the key deployment constraint.**

The beta deployment environment must support **secure Docker-based code execution** or an equivalent runner strategy. Specifically:

- Java code execution happens in isolated Docker containers
- Backend needs access to Docker socket (`/var/run/docker.sock`)
- Each code submission spawns a temporary container
- Containers are limited in CPU, memory, timeout, and process count
- Containers must be cleaned up after execution

**Why This Matters:**

Many modern Platform-as-a-Service (PaaS) offerings:
- Restrict or disable Docker socket access for security reasons
- Do not support nested containerization
- Block arbitrary code execution sandboxing

**Before choosing a deployment platform, verify it supports the Java runner requirements.**

---

## Deployment Option A: Local Demo Only

**Description:**

Run the platform entirely on your local machine (laptop/desktop). Access is limited to the machine owner and anyone physically present.

**Suitable For:**
- Recording demo videos for Xiaohongshu (小红书)
- Showing colleagues in-person demonstrations
- Internal exploration and testing
- Development and debugging

**Not Suitable For:**
- External teachers trying the platform remotely
- Real beta trial with 3-5 teachers
- Student access from home

**Pros:**
- ✅ **Safest** - No public network exposure
- ✅ **Easiest** - No server setup, just `docker compose up`
- ✅ **Zero hosting cost** - Uses your own computer
- ✅ **No security hardening needed** - Not accessible from internet
- ✅ **Quick iteration** - Code changes immediately testable
- ✅ **Full control** - Complete access to logs, database, containers

**Cons:**
- ❌ **External teachers cannot try it** - Must rely on you for demos
- ❌ **Limited feedback** - Teachers can't experience the platform firsthand
- ❌ **Scheduling overhead** - Must coordinate demo times
- ❌ **Not true beta testing** - No real-world usage patterns
- ❌ **Computer must stay on** - If demoing over Zoom/video call
- ❌ **No persistence** - Data lost if computer restarts (unless volumes configured)

**Recommendation:**

Use this for:
- Recording polished demo videos
- Internal team presentations
- Initial feedback from colleagues

**Do NOT use this as the only beta trial method** if you want external teachers to try the platform themselves.

---

## Deployment Option B: Single VPS + Docker Compose

**Description:**

Deploy frontend, backend, PostgreSQL, and Java runner all on **one Virtual Private Server (VPS)** using the same `docker-compose.yml` structure as local development.

**Suitable For:**
- First real beta trial with 3-5 teachers
- 5-20 students per teacher
- Short trial period (2-4 weeks)
- Small-scale validation before scaling

**Architecture:**
```
[VPS Server]
  ├── Frontend Container (Next.js)
  ├── Backend Container (FastAPI)
  ├── PostgreSQL Container
  └── Java Runner Image (used by backend)
  └── Docker Socket (shared)
```

**Pros:**
- ✅ **Supports Docker Compose** - Minimal changes from local dev
- ✅ **Java runner works** - Direct Docker socket access
- ✅ **Single machine to manage** - Simpler operations
- ✅ **Good enough for beta** - Handles 3-5 teachers easily
- ✅ **Easier debugging** - All logs on one machine
- ✅ **Lower complexity** - No distributed systems issues
- ✅ **Cost-effective** - One server fee (~$20-50/month)

**Cons:**
- ❌ **Requires server management** - Must set up, secure, and monitor VPS
- ❌ **Must secure properly** - Firewall, SSH keys, environment variables
- ❌ **Single point of failure** - If server goes down, platform is down
- ❌ **Limited scalability** - Cannot easily scale beyond beta size
- ❌ **Must monitor resources** - CPU, memory, disk usage
- ❌ **Backup responsibility** - Must set up database backups manually

**Security Requirements:**
- Close all unused ports (only 22, 80, 443)
- Use SSH keys, disable password login
- Never commit `.env` files with real credentials
- Set `SECRET_KEY` to secure random value
- Set `ENABLE_PUBLIC_REGISTER=false`
- Regular security updates (`apt update && apt upgrade`)

**Resource Recommendations:**
- **Minimum:** 2 CPU cores, 4GB RAM, 40GB disk
- **Recommended:** 4 CPU cores, 8GB RAM, 80GB disk
- **OS:** Ubuntu 22.04 LTS or similar

**VPS Providers (Examples):**
- DigitalOcean Droplets
- Linode VPS
- Vultr Cloud Compute
- AWS EC2 (more complex but flexible)
- Tencent Cloud CVM (for China deployments)
- Aliyun ECS (for China deployments)

**Recommendation:**

🎯 **This is the recommended first real beta deployment path.**

Why:
- Proven to work (local development uses same setup)
- Java runner constraint is satisfied
- Simple enough for one person to manage
- Adequate for 3-5 teacher beta trial
- Can collect meaningful feedback before scaling

**Important:** Do not scale beyond 3-5 teachers until you've validated security, backups, monitoring, and runner stability.

---

## Deployment Option C: Frontend Hosted Separately + Backend on VPS

**Description:**

Deploy frontend on a frontend-specific hosting platform (Vercel, Netlify, etc.), while keeping backend and Java runner on a VPS.

**Architecture:**
```
[Frontend Hosting]        [VPS Server]
  Frontend (Next.js) ---→ Backend (FastAPI)
                            ├── PostgreSQL
                            └── Java Runner
```

**Suitable For:**
- After single VPS deployment is working smoothly
- When frontend needs CDN or better global performance
- When separating concerns for frontend vs. backend teams

**Pros:**
- ✅ **Cleaner frontend hosting** - Optimized for static/SSR content
- ✅ **Better frontend performance** - CDN, edge functions, etc.
- ✅ **Easier frontend updates** - Deploy frontend independently
- ✅ **Professional frontend URL** - e.g., `app.yourplatform.com`
- ✅ **Potentially cheaper frontend** - Some platforms have free tiers

**Cons:**
- ❌ **More deployment pieces** - Two systems to manage instead of one
- ❌ **CORS complexity** - Must configure `CORS_ORIGINS` correctly
- ❌ **API URL configuration** - `NEXT_PUBLIC_API_URL` must point to VPS
- ❌ **Backend still needs VPS** - Because of Java runner constraint
- ❌ **Networking complexity** - Frontend → Backend API calls over internet
- ❌ **Debugging harder** - Issues could be in frontend, backend, or network

**Configuration Requirements:**
```bash
# Backend VPS
CORS_ORIGINS=https://your-frontend-domain.com

# Frontend Hosting
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

**Recommendation:**

🟡 **Good after single VPS deployment works.**

Consider this:
- After completing a successful beta trial on single VPS
- When frontend performance becomes a bottleneck
- When you want to improve frontend deployment workflow

**Do NOT start with this** for first beta. Keep it simple with Option B first.

---

## Deployment Option D: Platform-as-a-Service (PaaS)

**Description:**

Deploy on a managed Platform-as-a-Service like Heroku, Railway, Render, Fly.io, or similar.

**Typical PaaS Features:**
- Managed application hosting
- Automatic scaling (sometimes)
- Built-in monitoring
- Easier deployment (git push or similar)
- Managed databases available

**Critical Issue:**

⚠️ **Most PaaS platforms restrict Docker-based code execution.**

This platform requires:
- Docker socket access (`/var/run/docker.sock`)
- Spawning temporary containers for each submission
- Arbitrary code execution sandboxing

Many PaaS platforms:
- Disable Docker-in-Docker for security
- Restrict arbitrary code execution
- Run applications in their own containers (no socket access)

**Pros (if runner constraint can be solved):**
- ✅ **Easier app deployment** - Less infrastructure management
- ✅ **Managed services** - Database, monitoring, logs often included
- ✅ **Automatic scaling** - Some platforms auto-scale (though not needed for beta)
- ✅ **Better DX** - Developer experience often smoother

**Cons:**
- ❌ **May not support Java runner** - Critical blocker
- ❌ **Docker socket access restricted** - Common security policy
- ❌ **Debugging runner failures hard** - Less control over environment
- ❌ **Potentially more expensive** - Managed services have premium pricing
- ❌ **Vendor lock-in** - Platform-specific deployment configs

**Investigation Required:**

Before choosing a PaaS platform:

1. **Check Docker Support:**
   - Does it allow Docker socket access?
   - Can you spawn temporary containers?
   - Are there sandboxing alternatives?

2. **Test Java Runner:**
   - Deploy a minimal test
   - Try running a simple Java code submission
   - Verify containers can be created and destroyed

3. **Review Pricing:**
   - Beta usage: 3-5 teachers, 5-20 students each
   - Estimate submissions: ~100-500 per week
   - Calculate costs vs. simple VPS

**Known Platform Examples:**

| Platform | Likely Java Runner Support? |
|----------|----------------------------|
| Heroku | ❌ No (restricted container access) |
| Railway | ⚠️ Maybe (needs investigation) |
| Render | ⚠️ Maybe (needs investigation) |
| Fly.io | ⚠️ Maybe (needs investigation) |
| Google Cloud Run | ❌ No (stateless containers) |
| AWS Elastic Beanstalk | ⚠️ Maybe (with custom config) |

**Recommendation:**

🔴 **Do not choose this first unless the runner constraint is verified.**

Why:
- High risk of discovering runner incompatibility after deployment
- Time wasted on investigation and workarounds
- Simpler to start with VPS where Docker is guaranteed

**Exception:** If you find a PaaS that explicitly supports your use case (e.g., "We support Docker-based code execution sandboxes"), then investigate further.

---

## Deployment Option E: Remote Runner Service

**Description:**

Future architecture where backend sends code to a separate, isolated runner service instead of running Java directly on the same machine.

**Architecture:**
```
[Frontend] → [Backend API] → [Remote Runner Service]
              [PostgreSQL]      (handles all code execution)
```

**How It Would Work:**
1. Student submits code to backend API
2. Backend sends code + test cases to remote runner via HTTP/gRPC
3. Remote runner executes code in isolated environment
4. Remote runner returns results to backend
5. Backend stores results and returns to frontend

**Pros:**
- ✅ **Cleaner separation** - Backend doesn't need Docker access
- ✅ **Safer scaling path** - Runner service can scale independently
- ✅ **Better security** - Code execution isolated from main app
- ✅ **Could support more languages** - Runner service could support Python, C++, etc.
- ✅ **Easier PaaS deployment** - Backend no longer constrained by Docker

**Cons:**
- ❌ **Requires new architecture** - Significant backend refactoring
- ❌ **Not needed for beta** - Overkill for 3-5 teachers
- ❌ **Adds complexity** - Network calls, retry logic, error handling
- ❌ **More deployment pieces** - Yet another service to manage
- ❌ **Development overhead** - Months of work for unknown benefit

**When to Consider:**

Only after:
- Successful beta trial with current architecture
- Need to scale beyond single VPS
- Backend deployment constraints become blocking issue
- Have engineering resources for the refactor

**Recommendation:**

🔴 **Do not build now.**

Why:
- Premature optimization
- Beta trial can succeed without this
- Time better spent on teacher feedback and feature refinement
- Can always refactor later if scaling demands it

**Note for Future:** If post-beta you need to deploy on PaaS that doesn't support Docker, this becomes a viable path. But not today.

---

## Final Recommendation

**For the first real beta trial, use:**

### ✅ Single VPS + Docker Compose (Option B)

**Deployment Stack:**
- VPS with Docker and Docker Compose installed
- Same `docker-compose.yml` as local development (minor env changes)
- Frontend, backend, PostgreSQL, and Java runner on one machine
- HTTPS via reverse proxy (nginx or Caddy) optional but recommended

**Beta Trial Parameters:**
- **Teachers:** 3-5 beta participants
- **Students:** 5-20 per teacher (max ~100 total)
- **Scope:** AP CSA array FRQ only
- **Duration:** 2-4 weeks
- **Assignments:** 1-2 assignments per teacher

**Why This Is the Right Choice:**
1. **Proven to work** - Same setup as local development
2. **Java runner constraint satisfied** - Direct Docker socket access
3. **Simple operations** - One machine to manage
4. **Adequate scale** - Handles beta load easily
5. **Low cost** - ~$20-50/month VPS
6. **Fast iteration** - Easy to deploy fixes and updates
7. **Good learning** - Understand production issues before scaling

**Do Not Scale Beyond This Until:**
- ✅ Runner security hardening is validated
- ✅ Database backup strategy is tested
- ✅ Monitoring and alerting are in place
- ✅ Beta feedback is collected and prioritized
- ✅ Known issues are documented or fixed
- ✅ Cost and resource usage are understood

**After Successful Beta:**

Based on feedback and lessons learned, consider:
1. **If scaling is needed:** Evaluate remote runner service (Option E)
2. **If frontend performance matters:** Separate frontend hosting (Option C)
3. **If operations are hard:** Re-evaluate PaaS with runner constraints addressed
4. **If beta was successful:** Keep the same setup and expand teacher count gradually

---

## Decision Matrix

| Criterion | Local Demo | VPS + Docker | Frontend Sep | PaaS | Remote Runner |
|-----------|------------|--------------|--------------|------|---------------|
| External teacher access | ❌ No | ✅ Yes | ✅ Yes | ⚠️ Maybe | ✅ Yes |
| Java runner support | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Maybe | ✅ Yes |
| Setup complexity | ✅ Simple | 🟡 Medium | 🟡 Medium | 🟡 Medium | 🔴 Complex |
| Operational complexity | ✅ Simple | 🟡 Medium | 🔴 Complex | ✅ Simple | 🔴 Complex |
| Cost | ✅ Free | ✅ Low | 🟡 Medium | 🔴 High | 🔴 High |
| Beta ready | 🟡 Partial | ✅ Yes | ✅ Yes | ⚠️ Maybe | ❌ No |
| Scaling path | ❌ No | 🟡 Limited | 🟡 Limited | ✅ Yes | ✅ Yes |
| **Recommendation** | Demo only | **✅ Beta** | Post-beta | Verify first | Post-beta |

---

## Next Steps

1. **Review this document** with stakeholders
2. **Confirm decision:** Single VPS + Docker Compose for beta
3. **Read:** `VPS_BETA_DEPLOYMENT_PLAN.md` for deployment steps
4. **Prepare:** Select VPS provider and create account
5. **Deploy:** Follow deployment plan
6. **Verify:** Run smoke tests on deployed environment
7. **Invite:** Reach out to beta teachers
8. **Monitor:** Watch server resources during trial
9. **Iterate:** Deploy fixes quickly based on feedback
10. **Review:** After beta, reassess architecture needs

---

## Questions or Concerns?

**Q: What if the VPS goes down during beta?**
A: This is a risk. Mitigate with:
- Choosing reputable VPS provider
- Setting up monitoring/alerts
- Having a maintenance window plan
- Keeping beta small so impact is limited

**Q: What if 100 students all submit at once?**
A: Unlikely in beta (different time zones, assignments over weeks). But:
- Monitor CPU and memory usage
- Set rate limits if needed
- Current architecture can handle ~10 concurrent submissions

**Q: What if a teacher wants more than 20 students?**
A: For beta, kindly ask to start with a pilot group (5-10). Can expand after pilot success.

**Q: What if I don't know how to manage a VPS?**
A: `VPS_BETA_DEPLOYMENT_PLAN.md` has high-level steps. Also:
- Follow VPS provider documentation
- Many tutorials exist for Docker on Ubuntu
- Beta trial is a learning opportunity
- Start small, iterate

**Q: What if backend needs to scale independently from Java runner?**
A: That's a sign to consider remote runner service (Option E). But not needed for beta.

---

**Version:** Beta v0.1  
**Last Updated:** June 2026  
**Decision:** Single VPS + Docker Compose for first beta trial
