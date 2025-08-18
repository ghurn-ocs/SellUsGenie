# Custom Domain Setup Guide

## Overview
SellUsGenie allows Professional and Enterprise plan users to connect their own custom domains to their stores for a branded shopping experience.

## Plan Requirements

| Plan | Custom Domain | Max Domains | SSL Included |
|------|--------------|-------------|--------------|
| Trial | ❌ | 0 | - |
| Starter | ❌ | 0 | - |
| Professional | ✅ | 3 | ✅ |
| Enterprise | ✅ | Unlimited | ✅ |

## Step-by-Step Setup Process

### 1. Purchase a Domain Name

Before you can use a custom domain, you need to own one. Here are recommended registrars:

**Recommended Domain Registrars:**
- **Namecheap** - User-friendly interface, competitive pricing
- **Google Domains** - Simple management, integrates with Google services
- **Cloudflare Registrar** - At-cost pricing, excellent performance
- **GoDaddy** - Popular option with extensive features

**Domain Selection Tips:**
- Choose something memorable and brandable
- .com domains have the highest trust factor
- .shop, .store, .online are good alternatives
- Keep it short and easy to spell

### 2. Add Your Domain to SellUsGenie

1. Go to **Settings → Domain** in your dashboard
2. Click **"Add Domain"**
3. Enter your domain information:
   - **Domain Name**: `yourbrand.com`
   - **Subdomain** (optional): `shop` for `shop.yourbrand.com`

### 3. Configure DNS Records

After adding your domain, you'll receive specific DNS records to configure:

#### TXT Record (Verification)
- **Name**: `@` or your domain
- **Value**: `sellusgenie-verification=abc123...`
- **TTL**: 3600 (1 hour)

#### CNAME Record (Traffic Routing)
- **Name**: `@` or your domain
- **Value**: `your-store-id.sellusgenie.com`
- **TTL**: 3600 (1 hour)

### 4. DNS Configuration by Provider

#### Namecheap
1. Login to Namecheap account
2. Go to "Domain List" → "Manage" next to your domain
3. Click "Advanced DNS"
4. Add the TXT and CNAME records provided
5. Save changes

#### Google Domains
1. Login to Google Domains
2. Select your domain
3. Go to "DNS" tab
4. Scroll to "Custom resource records"
5. Add the TXT and CNAME records
6. Save

#### Cloudflare
1. Login to Cloudflare
2. Select your domain
3. Go to "DNS" tab
4. Click "Add record"
5. Add the TXT record first, then CNAME
6. Ensure "Proxy status" is **disabled** (gray cloud) for the CNAME
7. Save

#### GoDaddy
1. Login to GoDaddy
2. Go to "My Products" → "Domain"
3. Click "DNS" next to your domain
4. Scroll to "Records"
5. Add the TXT and CNAME records
6. Save

### 5. Verification Process

1. After configuring DNS, click **"Check DNS"** in SellUsGenie
2. Verification typically takes 5-30 minutes
3. DNS changes can take up to 24 hours to propagate globally
4. Once verified, SSL certificate will be automatically provisioned

## Common Issues & Solutions

### Domain Not Verifying
**Symptoms**: DNS check fails, domain stays in "pending" status
**Solutions**:
- Wait 2-4 hours for DNS propagation
- Double-check TXT record value matches exactly
- Ensure there are no typos in DNS configuration
- Contact your registrar's support if needed

### CNAME Conflicts
**Symptoms**: Cannot add CNAME record
**Solutions**:
- Remove any existing A, AAAA, or CNAME records for the same name
- If using root domain (@), you may need to use ALIAS record instead
- Contact SellUsGenie support for advanced configuration

### SSL Certificate Issues
**Symptoms**: "Not Secure" warning, SSL status shows "failed"
**Solutions**:
- SSL certificates are automatically provisioned after domain verification
- Wait 10-15 minutes after verification completes
- Ensure domain is properly pointing to our servers
- Contact support if SSL doesn't activate within 24 hours

### Subdomain vs Root Domain
- **Root Domain**: `yourbrand.com` - Points entire domain to your store
- **Subdomain**: `shop.yourbrand.com` - Points only subdomain to your store
- You can use your main website at `yourbrand.com` and store at `shop.yourbrand.com`

## Best Practices

### SEO Considerations
- Use your custom domain for all marketing materials
- Set up proper redirects from old URLs
- Submit new sitemap to Google Search Console
- Update social media profiles with new domain

### Performance Optimization
- Our CDN automatically serves your store globally
- SSL certificates are managed automatically
- Cache headers are optimized for fast loading

### Security Features
- Free SSL certificates included
- Automatic HTTPS redirect
- DDoS protection through our infrastructure
- Regular security monitoring

## Domain Management

### Setting Primary Domain
- Only one domain can be set as "Primary"
- Primary domain is used for:
  - SEO canonical URLs
  - Email notifications
  - Social media sharing
  - Default redirects

### Multiple Domains
- Professional: Up to 3 domains
- Enterprise: Unlimited domains
- All non-primary domains redirect to primary
- Useful for protecting brand variations

### Removing Domains
- Can be removed at any time
- All traffic will return 404 errors
- SSL certificates are automatically deactivated
- Consider redirects before removing

## Advanced Configuration

### Email Setup
Custom domains don't include email hosting. For `contact@yourbrand.com`:
- Use Google Workspace
- Use Microsoft 365
- Use your domain registrar's email service

### Subdirectories
- Store appears at root: `yourbrand.com`
- All store pages: `yourbrand.com/products`, `yourbrand.com/cart`
- Cannot serve store at subdirectory like `yourbrand.com/store/`

### International Domains
- All international domain extensions supported
- IDN (internationalized domain names) supported
- Unicode domains automatically converted to punycode

## Troubleshooting Checklist

Before contacting support, verify:

- [ ] Domain ownership confirmed
- [ ] DNS records added exactly as provided
- [ ] TTL set to 3600 seconds or less
- [ ] No conflicting DNS records
- [ ] Waited at least 2 hours for propagation
- [ ] Domain not using CDN proxy (like Cloudflare orange cloud)

## Support & Help

### Self-Service Tools
- Built-in DNS checker in SellUsGenie dashboard
- Real-time status updates
- Detailed error messages

### Contacting Support
Include this information when contacting support:
- Domain name attempting to configure
- Screenshot of DNS configuration
- Error messages received
- Steps already attempted

### Response Times
- Standard support: 24-48 hours
- Professional plan: 12-24 hours  
- Enterprise plan: 4-8 hours priority support

## Pricing & Plans

Custom domains are included in Professional and Enterprise plans:
- No additional setup fees
- SSL certificates included at no cost
- Global CDN included
- Unlimited bandwidth

Ready to set up your custom domain? Head to **Settings → Domain** in your SellUsGenie dashboard to get started!