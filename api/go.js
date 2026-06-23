// Affiliate redirect. Page links are assigned to fixed /go/* paths for an even split.
const A = 'https://www.rr95k.com/?ch=0cf28df51e';
const B = 'https://www.mm38aa.com/m/home?affiliateCode=lu0001';

module.exports = (req, res) => {
  const queryValue = req.query && req.query.to;
  const queryTo = Array.isArray(queryValue) ? queryValue[0] : queryValue;
  const urlTo = new URL(req.url || '/', 'https://local.invalid').searchParams.get('to');
  const to = queryTo || urlTo;
  const dest = to === 'mm38' ? B : A;

  res.writeHead(302, {
    Location: dest,
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  });
  res.end();
};
