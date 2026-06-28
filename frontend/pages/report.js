import Head from 'next/head';
import { useState } from 'react';

export default function Report() {
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting report...');
    
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setStatus('Report Submitted Successfully. We will investigate immediately.');
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
        <title>Report Abuse - brnk.in</title>
        <meta name="description" content="Report malicious links, spam, or copyright infringement to the brnk.in trust and safety team." />
      </Head>
      <div className="form-container" style={{ marginTop: '24px', maxWidth: '800px', lineHeight: '1.6' }}>
        <header style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h1 className="title">Report Abuse</h1>
          <p className="subtitle" style={{ marginTop: '10px' }}>
            Help us keep the internet safe.
          </p>
        </header>

        <section style={{ marginBottom: '24px' }}>
          <p>
            At brnk.in, we take abuse seriously. We do not allow our platform to be used to shorten links pointing to malicious, illegal, or deceptive content. If you have found a brnk.in link that violates our Terms of Service, please report it immediately using the form below.
          </p>
          <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>What to Report:</h3>
          <ul style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <li>Malware or viruses</li>
            <li>Phishing or deceptive scams</li>
            <li>Adult or explicit content</li>
            <li>Copyright infringement (DMCA)</li>
            <li>Harassment or hate speech</li>
            <li>Spam</li>
          </ul>
        </section>

        <div style={{ padding: '20px', border: '3px solid #ff6600', backgroundColor: '#1a1a1a', marginBottom: '30px' }}>
          <form onSubmit={handleSubmit} className="form">
            <input type="hidden" name="access_key" value={process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY} />
            <input type="hidden" name="subject" value="URGENT: Abuse Report for brnk.in" />
            <input type="checkbox" name="botcheck" id="" style={{ display: 'none' }} />

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="reporterEmail" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Your Email Address (required)</label>
              <input 
                type="email" 
                name="reporterEmail" 
                id="reporterEmail" 
                className="input" 
                required 
                placeholder="you@example.com" 
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="shortUrl" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>The brnk.in URL being reported</label>
              <input 
                type="url" 
                name="shortUrl" 
                id="shortUrl" 
                className="input" 
                required 
                placeholder="https://brnk.in/example" 
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="reason" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Reason for Reporting</label>
              <select 
                name="reason" 
                id="reason" 
                className="input" 
                required
                style={{ cursor: 'pointer', appearance: 'none' }}
              >
                <option value="Phishing / Scam">Phishing / Scam</option>
                <option value="Malware / Virus">Malware / Virus</option>
                <option value="Copyright Infringement (DMCA)">Copyright Infringement (DMCA)</option>
                <option value="Spam">Spam</option>
                <option value="Adult Content">Adult Content</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Additional Details</label>
              <textarea 
                name="description" 
                id="description" 
                className="input" 
                required 
                rows="4" 
                placeholder="Please provide any additional context..."
                style={{ resize: 'vertical' }}
              ></textarea>
            </div>

            <button type="submit" className="submit-btn" style={{ backgroundColor: '#ff3300' }}>Submit Report</button>
            
            {status && (
              <p style={{ marginTop: '15px', textAlign: 'center', fontWeight: 'bold', color: '#FFFDF7' }}>
                {status}
              </p>
            )}
          </form>
        </div>

        <section style={{ marginBottom: '24px' }}>
          <h2>DMCA Notice Instructions</h2>
          <p>
            If you are a copyright holder and believe that a brnk.in link points to content that infringes on your copyright, you may submit a DMCA takedown notice via the form above or by emailing <a href="mailto:hello@brnk.in" style={{ color: '#ff6600', textDecoration: 'none' }}>hello@brnk.in</a>. Please include:
          </p>
          <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Identification of the material that is claimed to be infringing (the specific brnk.in URL).</li>
            <li>Your contact information (name, address, telephone number, and email address).</li>
            <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner.</li>
            <li>A physical or electronic signature.</li>
          </ul>
        </section>

        <section>
          <h2>Response Time</h2>
          <p>
            Abuse reports are our highest priority. We typically review and disable reported links within 24 hours of submission.
          </p>
        </section>
      </div>
    </>
  );
}
