// Affiliate redirect. All partner CTA routes currently use the primary RR95K line.
const TARGET = 'https://www.rr95k.com/?ch=0cf28df51e';

module.exports = (req, res) => {
  res.writeHead(302, {
    Location: TARGET,
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  });
  res.end();
};
