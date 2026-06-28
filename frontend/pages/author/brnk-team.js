import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import Link from 'next/link';

export default function AuthorPage({ posts }) {
  return (
    <>
      <Head>
        <title>brnk Team - Author Profile</title>
        <meta name="description" content="Articles and guides written by the brnk Team, experts in URL shortening, link management, and QR codes." />
      </Head>
      <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', padding: '40px 0' }}>
        
        {/* Author Bio Header - Premium Neo-Brutalist Layout */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          gap: '30px', 
          alignItems: 'center', 
          backgroundColor: '#111', 
          padding: '40px', 
          border: '4px solid #ff6600', 
          boxShadow: '10px 10px 0px #000',
          marginBottom: '60px',
          flexWrap: 'wrap'
        }}>
          <img 
            src="/logo512.png" 
            alt="brnk Team" 
            style={{ width: '150px', height: '150px', objectFit: 'contain', backgroundColor: '#FFFDF7', borderRadius: '50%', padding: '10px', border: '4px solid #333' }} 
          />
          <div style={{ flex: '1 1 300px' }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem', color: '#FFFDF7' }}>The brnk Team</h1>
            <p style={{ color: '#ff6600', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '15px' }}>Product & Engineering</p>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#e0e0e0', margin: 0 }}>
              We are a passionate collective of web developers, SEO specialists, and digital marketers dedicated to building fast, privacy-first tools for the modern web. The brnk team believes that link management should be elegant, frictionless, and free. We write actionable guides on URL routing, digital marketing, and QR code strategies to help creators and businesses maximize their reach.
            </p>
          </div>
        </div>

        {/* Authored Posts Grid */}
        <h2 style={{ fontSize: '2rem', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
          Latest Articles by brnk Team ({posts.length})
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
          {posts.map((post) => (
            <article key={post.slug} className="author-post-card" style={{ 
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#1a1a1a', 
              border: '2px solid #333',
              padding: '25px',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              height: '100%'
            }}>
              <p style={{ color: '#ff6600', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>{post.date}</p>
              <h3 style={{ fontSize: '1.3rem', margin: '0 0 15px 0', lineHeight: '1.4' }}>
                <Link href={`/blog/${post.slug}`} style={{ color: '#FFFDF7', textDecoration: 'none' }}>
                  {post.title}
                </Link>
              </h3>
              <p style={{ color: '#a8a8a8', lineHeight: '1.5', flexGrow: 1, marginBottom: '20px' }}>
                {post.excerpt.length > 120 ? post.excerpt.substring(0, 120) + '...' : post.excerpt}
              </p>
              <Link href={`/blog/${post.slug}`} style={{ color: '#ff6600', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', borderBottom: '2px solid transparent' }}>
                Read Article &rarr;
              </Link>
            </article>
          ))}
        </div>
      </div>

      <style jsx>{`
        .author-post-card:hover {
          border-color: #ff6600 !important;
          transform: translateY(-5px);
          box-shadow: 6px 6px 0px rgba(255, 102, 0, 0.2);
        }
        .author-post-card a:hover {
          border-bottom-color: #ff6600 !important;
        }
      `}</style>
    </>
  );
}

export async function getStaticProps() {
  const postsDir = path.join(process.cwd(), 'data', 'posts');
  let posts = [];

  try {
    if (fs.existsSync(postsDir)) {
      const files = fs.readdirSync(postsDir);
      for (const file of files) {
        if (file.endsWith('.js')) {
          try {
            const mod = require(`../../data/posts/${file}`);
            if (mod && mod.post) {
              posts.push({
                slug: mod.post.slug,
                title: mod.post.title,
                date: mod.post.date,
                excerpt: mod.post.excerpt
              });
            }
          } catch (e) {
            console.error(`Failed to load ${file}`, e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error reading posts directory:', error);
  }

  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    props: {
      posts,
    },
  };
}
