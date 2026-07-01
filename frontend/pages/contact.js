import Head from 'next/head';
import { useState } from 'react';

export default function Contact() {
  const [status, setStatus] = useState('');
  const web3FormsAccessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!web3FormsAccessKey) {
      setStatus('Contact form is not configured. Please email us directly at hello@brnk.in.');
      return;
    }
    setStatus('Submitting...');
    
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setStatus('Form Submitted Successfully! We will get back to you soon.');
        e.target.reset();
      } else {
        setStatus(`Error: ${data.message}`);
      }
    } catch (err) {
      setStatus('Something went wrong. Please try emailing us directly at hello@brnk.in.');
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us - brnk.in</title>
        <meta name="description" content="Contact the brnk.in team for support, feature requests, or business inquiries." />
      </Head>
      <div className="form-container" style={{ marginTop: '24px' }}>
        <header style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h1 className="title">Contact Us</h1>
          <p className="subtitle" style={{ marginTop: '10px' }}>
            We're here to help. Reach out to us for support, abuse reports, business inquiries, feature suggestions, or data deletion requests.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="form">
          <input type="hidden" name="access_key" value={web3FormsAccessKey} />
          <input type="hidden" name="subject" value="New Contact Submission from brnk.in" />
          <input type="checkbox" name="botcheck" id="" style={{ display: 'none' }} />

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name</label>
            <input 
              type="text" 
              name="name" 
              id="name" 
              className="input" 
              required 
              placeholder="Your Name" 
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email Address</label>
            <input 
              type="email" 
              name="email" 
              id="email" 
              className="input" 
              required 
              placeholder="you@example.com" 
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="inquiryType" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Subject</label>
            <select 
              name="inquiryType" 
              id="inquiryType" 
              className="input" 
              required
              style={{ cursor: 'pointer', appearance: 'none' }}
            >
              <option value="General Inquiry">General Inquiry</option>
              <option value="Abuse Report">Abuse Report</option>
              <option value="Feature Request">Feature Request</option>
              <option value="Business">Business</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="message" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Message</label>
            <textarea 
              name="message" 
              id="message" 
              className="input" 
              required 
              rows="5" 
              placeholder="How can we help you?"
              style={{ resize: 'vertical' }}
            ></textarea>
          </div>

          <button type="submit" className="submit-btn">Send Message</button>
          
          {status && (
            <p style={{ marginTop: '15px', textAlign: 'center', fontWeight: 'bold', color: status.includes('Error') || status.includes('wrong') || status.includes('not configured') ? '#ff6600' : '#FFFDF7' }}>
              {status}
            </p>
          )}
        </form>

        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '0.9rem', padding: '20px', borderTop: '1px solid #333' }}>
          <p>Alternatively, you can email us directly at:</p>
          <a href="mailto:hello@brnk.in" style={{ color: '#ff6600', fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none', display: 'inline-block', margin: '10px 0' }}>hello@brnk.in</a>
          <p style={{ color: '#a8a8a8' }}>Expected response time: 24-48 hours.</p>
        </div>

        <div style={{ marginTop: '50px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', textAlign: 'center' }}>Frequently Asked Questions</h2>
          <div className="contact-faq-item">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#FFFDF7' }}>How do I delete a shortened URL?</h3>
            <p style={{ color: '#a8a8a8', fontSize: '0.9rem', margin: 0 }}>If you lost the deletion password provided during creation, please select "Abuse Report" in the subject above and provide the exact short URL. We will verify and remove it.</p>
          </div>
          <div className="contact-faq-item">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#FFFDF7' }}>Do you offer API access?</h3>
            <p style={{ color: '#a8a8a8', fontSize: '0.9rem', margin: 0 }}>We are currently building a developer API. If you are interested in early access, please select "Business" in the inquiry dropdown.</p>
          </div>
          <div className="contact-faq-item">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#FFFDF7' }}>Can I change the destination of my short link?</h3>
            <p style={{ color: '#a8a8a8', fontSize: '0.9rem', margin: 0 }}>brnk.in does not support editing the destination of a link after it has been created to prevent deceptive redirects. You will need to create a new short link.</p>
          </div>
        </div>
      </div>
    </>
  );
}
