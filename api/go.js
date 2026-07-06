// Affiliate redirect. All partner CTA routes currently use the primary RR95K line.
const TARGET = 'https://www.myan99.me/m/home?affiliateCode=seom202';

module.exports = (req, res) => {
  res.writeHead(302, {
    Location: TARGET,
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  });
  res.end();
};
