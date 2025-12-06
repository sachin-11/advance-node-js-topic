# Contact Form Email Setup Guide

## Current Status
Contact form submissions are currently logged to console. To receive emails, you need to set up an email service.

## Option 1: Resend (Recommended - Easy & Free)

### Step 1: Install Resend
```bash
npm install resend
```

### Step 2: Get API Key
1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Get your API key from dashboard

### Step 3: Add Environment Variable
Create `.env.local` file:
```
RESEND_API_KEY=re_your_api_key_here
```

### Step 4: Update API Route
Update `src/app/api/contact/route.ts`:

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// In POST function, replace the email sending part:
await resend.emails.send({
  from: 'contact@yourdomain.com', // Or use onboarding@resend.dev for testing
  to: 'thejdfilmer@gmail.com',
  subject: `New Contact Form: ${service || 'General Inquiry'}`,
  html: `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Event Date:</strong> ${eventDate || 'N/A'}</p>
    <p><strong>Service:</strong> ${service || 'N/A'}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `,
})
```

### Step 5: Add to Vercel (if deploying)
In Vercel dashboard → Settings → Environment Variables:
- Add `RESEND_API_KEY` with your key

---

## Option 2: Web3Forms (No Setup Required)

### Step 1: Get Access Key
1. Go to [web3forms.com](https://web3forms.com)
2. Enter your email: `thejdfilmer@gmail.com`
3. Get your access key

### Step 2: Update API Route
```typescript
const response = await fetch('https://api.web3forms.com/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    access_key: process.env.WEB3FORMS_ACCESS_KEY,
    subject: `New Contact Form: ${service || 'General Inquiry'}`,
    from_name: name,
    email: email,
    phone: phone,
    message: `
Name: ${name}
Email: ${email}
Phone: ${phone}
Event Date: ${eventDate || 'N/A'}
Service: ${service || 'N/A'}

Message: ${message}
    `,
  }),
})
```

Add to `.env.local`:
```
WEB3FORMS_ACCESS_KEY=your_access_key_here
```

---

## Option 3: Formspree (Free Tier Available)

### Step 1: Sign Up
1. Go to [formspree.io](https://formspree.io)
2. Create free account
3. Create new form
4. Get form endpoint

### Step 2: Update API Route
```typescript
const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name,
    email,
    phone,
    eventDate,
    service,
    message,
  }),
})
```

---

## Option 4: EmailJS (Client-Side)

Update contact form to send directly from browser:

```typescript
// Install: npm install @emailjs/browser
import emailjs from '@emailjs/browser'

// In handleSubmit:
await emailjs.send(
  'YOUR_SERVICE_ID',
  'YOUR_TEMPLATE_ID',
  {
    name,
    email,
    phone,
    eventDate,
    service,
    message,
  },
  'YOUR_PUBLIC_KEY'
)
```

---

## Quick Setup (Resend - Recommended)

1. **Install:**
   ```bash
   npm install resend
   ```

2. **Get API Key from resend.com**

3. **Add to `.env.local`:**
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

4. **Update `src/app/api/contact/route.ts`** - I'll provide the complete code

5. **Test locally:**
   ```bash
   npm run dev
   ```

6. **For production:** Add `RESEND_API_KEY` to Vercel environment variables

---

## Current Fallback

Right now, form submissions are logged to console. To see them:
1. Check browser console (F12)
2. Check server logs when running `npm run dev`
3. Check Vercel function logs after deployment

---

## Which One to Choose?

- **Resend**: Best for production, free tier, easy setup
- **Web3Forms**: Easiest, no signup needed, free
- **Formspree**: Good free tier, reliable
- **EmailJS**: Client-side, no backend needed

**Recommendation: Use Resend for production**

