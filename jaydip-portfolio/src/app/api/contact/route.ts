import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, eventDate, service, message } = body

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Option 1: Use Web3Forms (Easiest - No setup required)
    // Get your access key from: https://web3forms.com
    // Just enter your email: thejdfilmer@gmail.com and get the key
    const web3formsKey = process.env.WEB3FORMS_ACCESS_KEY

    if (web3formsKey) {
      try {
        const web3formsResponse = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_key: web3formsKey,
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

Message:
${message}
            `,
          }),
        })

        const web3formsData = await web3formsResponse.json()
        
        if (web3formsData.success) {
          return NextResponse.json(
            { message: 'Message sent successfully' },
            { status: 200 }
          )
        }
      } catch (web3formsError) {
        console.error('Web3Forms error:', web3formsError)
        // Fall through to logging
      }
    }

    // Option 2: Use Resend (Better for production)
    // Uncomment and configure if you have RESEND_API_KEY
    /*
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      
      await resend.emails.send({
        from: 'contact@yourdomain.com', // Or 'onboarding@resend.dev' for testing
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
      
      return NextResponse.json(
        { message: 'Message sent successfully' },
        { status: 200 }
      )
    }
    */

    // Fallback: Log to console (for development)
    // In production, check server logs or Vercel function logs
    console.log('Contact form submission (logged - no email service configured):', {
      name,
      email,
      phone,
      eventDate,
      service,
      message,
      timestamp: new Date().toISOString(),
    })

    // Return success even if email not configured
    // User will see success message, but you need to check logs
    return NextResponse.json(
      { 
        message: 'Message received. We will contact you soon.',
        note: 'Email service not configured. Check server logs for submission details.'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

