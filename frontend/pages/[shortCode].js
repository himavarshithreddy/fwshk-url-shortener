import RedirectInterstitial from '../components/RedirectInterstitial';

export default function ShortCodePage({ shortCode }) {
  return <RedirectInterstitial shortCode={shortCode} />;
}

export async function getServerSideProps(context) {
  const { shortCode } = context.params;
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://back.brnk.in';
  const apiUrl = backendUrl.replace(/\/+$/, '');

  try {
    const res = await fetch(`${apiUrl}/link-info/${encodeURIComponent(shortCode)}`);
    const data = await res.json();

    if (
      res.ok &&
      data.originalUrl &&
      !data.passwordProtected &&
      !data.showWarning &&
      (data.redirectType === '308' || data.redirectType === '301')
    ) {
      return {
        redirect: {
          destination: data.originalUrl,
          permanent: true,
        },
      };
    }

    return { props: { shortCode } };
  } catch (error) {
    return { props: { shortCode } };
  }
}
