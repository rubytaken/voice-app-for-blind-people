# Deployment Guide

This guide covers deploying the Voice Recorder app to various hosting platforms.

## Prerequisites

Before deploying, ensure:

- All tests pass: `npm test`
- Build succeeds: `npm run build`
- No linter errors: Check console during build

## Deployment Options

### 1. Vercel (Recommended)

**Why Vercel?**

- Free tier available
- Automatic HTTPS
- Easy setup
- Good for React apps

**Steps:**

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy:

```bash
vercel
```

3. Follow the prompts to deploy

**Or use Vercel Dashboard:**

1. Go to [vercel.com](https://vercel.com)
2. Import your Git repository
3. Vercel will auto-detect React and build settings
4. Click "Deploy"

### 2. Netlify

**Steps:**

1. Install Netlify CLI:

```bash
npm install -g netlify-cli
```

2. Build the project:

```bash
npm run build
```

3. Deploy:

```bash
netlify deploy --prod --dir=build
```

**Or use Netlify Dashboard:**

1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `build` folder
3. Site is live!

### 3. GitHub Pages

**Steps:**

1. Install gh-pages:

```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:

```json
{
  "homepage": "https://yourusername.github.io/project_for_blinds",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

3. Deploy:

```bash
npm run deploy
```

### 4. Firebase Hosting

**Steps:**

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login and initialize:

```bash
firebase login
firebase init hosting
```

3. Build and deploy:

```bash
npm run build
firebase deploy
```

### 5. AWS S3 + CloudFront

**Steps:**

1. Build the project:

```bash
npm run build
```

2. Create an S3 bucket
3. Enable static website hosting
4. Upload `build` folder contents
5. (Optional) Set up CloudFront for CDN

### 6. Custom Server (Node.js)

**Using serve:**

```bash
npm install -g serve
npm run build
serve -s build -l 3000
```

**Using nginx:**

1. Build the project:

```bash
npm run build
```

2. Copy `build` folder to server:

```bash
scp -r build/* user@server:/var/www/html/
```

3. Configure nginx to serve static files

## Environment Variables

If using Supabase (future):

1. Add environment variables in your hosting platform:

   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`

2. Or create `.env.production`:

```env
REACT_APP_SUPABASE_URL=your-url
REACT_APP_SUPABASE_ANON_KEY=your-key
```

## HTTPS Requirements

**Important:** This app requires HTTPS in production because:

- Web Speech API requires secure context
- MediaRecorder API requires HTTPS
- getUserMedia requires secure connection

All recommended platforms (Vercel, Netlify, etc.) provide free HTTPS.

## Browser Compatibility

Ensure your deployment includes:

- Modern browser support
- HTTPS enabled
- Proper MIME types for static files

## Post-Deployment Checklist

After deploying, test:

- ✅ Microphone permissions work
- ✅ Voice commands are recognized
- ✅ Recording functions properly
- ✅ Playback works correctly
- ✅ Language switching works
- ✅ Responsive design on mobile
- ✅ HTTPS is enabled
- ✅ No console errors

## Performance Optimization

### Before deploying:

1. **Optimize images** (if any added later)
2. **Enable compression** (handled by most platforms)
3. **Set cache headers** (automatic on most platforms)
4. **Monitor bundle size**: Check `build` output

### After deploying:

1. Test with Lighthouse
2. Check Core Web Vitals
3. Monitor loading speed
4. Test on different devices

## Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: "18"
      - name: Install
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy
        # Add your deployment step here
```

## Monitoring

After deployment, monitor:

- **Uptime**: Use services like UptimeRobot
- **Performance**: Use Google Analytics or similar
- **Errors**: Set up error tracking (e.g., Sentry)
- **Usage**: Monitor API calls (when Supabase is integrated)

## Troubleshooting

### Build Fails

- Check Node.js version (use v18+)
- Clear node_modules and reinstall
- Check for TypeScript errors

### HTTPS Issues

- Ensure hosting platform supports HTTPS
- Check browser console for mixed content warnings

### API Not Working

- Verify browser supports Web Speech API
- Check microphone permissions
- Test on different browsers

## Rollback

If issues occur:

1. **Vercel/Netlify**: Use dashboard to rollback to previous deployment
2. **GitHub Pages**: Revert commit and redeploy
3. **Custom server**: Keep previous build as backup

## Support

For deployment issues:

- Check hosting platform documentation
- Review build logs
- Test locally first with production build
- Contact hosting support if needed

---

**Your app is ready for the world!** 🚀
