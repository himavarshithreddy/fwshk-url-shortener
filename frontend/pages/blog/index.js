import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import Link from 'next/link';

export default function BlogIndex({ posts }) {
  return (
    <>
      <Head>
        <title>brnk.in Blog - URL Shortening Tips & Guides</title>
        <meta name="description" content="Learn everything about URL shorteners, link tracking, QR codes, and marketing strategies on the brnk.in blog." />
      </Head>
      <div className="form-container" style={{ marginTop: '24px', maxWidth: '800px', width: '100%' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 className="title">brnk.in Blog</h1>
          <p className="subtitle" style={{ marginTop: '10px' }}>Tips, guides, and tutorials for mastering your links.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
          {posts.map((post) => (
            <article key={post.slug} className="blog-index-card" style={{ 
              padding: '25px', 
              border: '2px solid #333', 
              backgroundColor: '#1a1a1a', 
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}>
              <p style={{ color: '#ff6600', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>{post.date}</p>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '15px', lineHeight: '1.4' }}>
                <Link href={`/blog/${post.slug}`} style={{ color: '#FFFDF7', textDecoration: 'none' }}>
                  {post.title}
                </Link>
              </h2>
              <p style={{ color: '#a8a8a8', lineHeight: '1.5', flexGrow: 1, marginBottom: '20px' }}>{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`} style={{ color: '#ff6600', fontWeight: 'bold', textDecoration: 'none', textTransform: 'uppercase', fontSize: '0.9rem', borderBottom: '2px solid transparent', display: 'inline-block' }}>
                Read More &rarr;
              </Link>
            </article>
          ))}
          {posts.length === 0 && (
            <p style={{ textAlign: 'center', color: '#a8a8a8', gridColumn: '1 / -1' }}>Coming soon...</p>
          )}
        </div>
      </div>
      <style jsx>{`
        .blog-index-card:hover {
          border-color: #ff6600 !important;
          transform: translateY(-5px);
          box-shadow: 6px 6px 0px rgba(255, 102, 0, 0.2);
        }
        .blog-index-card a:hover {
          border-bottom-color: #ff6600 !important;
        }
      `}</style>
    </>
  );
}

export async function getStaticProps() {
  const postsDir = path.join(process.cwd(), 'data', 'posts');
  let posts = [];
  
  if (fs.existsSync(postsDir)) {
    const files = fs.readdirSync(postsDir);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        // Import the module
        try {
          const modPath = path.join(postsDir, file);
          // dynamically require the file using eval to avoid next.js webpack issues
          const mod = require('../../data/posts/' + file);
          if (mod && mod.post) {
            posts.push({
              title: mod.post.title,
              slug: mod.post.slug,
              date: mod.post.date,
              excerpt: mod.post.excerpt
            });
          }
        } catch (e) {
          console.error("Error loading post:", file, e);
        }
      }
    }
  }

  // Sort by date descending
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return {
    props: {
      posts
    }
  };
}
