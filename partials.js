/* Shared nav + footer + tweaks, injected per page */

const NAV_ITEMS = [
  { href: "Home.html", label: "Home" },
  { href: "Services.html", label: "Services" },
  { href: "About.html", label: "About" },
  { href: "Careers.html", label: "Careers" },
  { href: "Contact.html", label: "Contact" },
];

function renderTopbar() {
  return `
  <div class="topbar">
    <div class="wrap">
      <div><span class="red-dot"></span> 24 / 7 Dispatch Active <span class="sep">|</span> Licensed · Bonded · Insured</div>
      <div>
        <a href="tel:+18005550110">+1 (800) 555-0110</a>
        <span class="sep">|</span>
        <a href="Contact.html">Request a Quote</a>
      </div>
    </div>
  </div>`;
}

function renderNav(active) {
  const links = NAV_ITEMS.map(i =>
    `<a href="${i.href}" class="${i.href === active ? "active" : ""}">${i.label}</a>`
  ).join("");
  return `
  <nav class="nav">
    <div class="wrap">
      <a class="brand" href="Home.html">
        <img src="assets/uss-logo.png" alt="USS Agency crest">
        <div class="brand-text">
          <div class="b1">USS Agency</div>
          <div class="b2">Ultimate Security Services</div>
        </div>
      </a>
      <div class="nav-links">${links}</div>
      <div class="nav-cta">
        <span class="phone">+1 (800) 555-0110</span>
        <a class="btn red" href="Contact.html">Request a Quote
          <svg class="arr" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
        </a>
      </div>
    </div>
  </nav>`;
}

function renderFooter() {
  return `
  <footer>
    <div class="wrap">
      <div class="cols">
        <div>
          <div class="brand" style="margin-bottom:20px">
            <img src="assets/uss-logo.png" alt="">
            <div class="brand-text">
              <div class="b1">USS Agency</div>
              <div class="b2">Ultimate Security Services</div>
            </div>
          </div>
          <p style="max-width:34ch; color:var(--silver); line-height:1.6; margin:0 0 16px">
            Florida's trusted protection partner. Licensed private security, executive protection, and risk advisory across the Sunshine State since 2009.
          </p>
          <div style="display:flex; gap:8px; flex-wrap:wrap">
            <span class="tag dark">FL DACS B 2900142</span>
            <span class="tag dark">A-Licensed</span>
            <span class="tag dark">$5M GL Insured</span>
          </div>
        </div>
        <div>
          <h4>Services</h4>
          <ul>
            <li><a href="Services.html">Armed Guards</a></li>
            <li><a href="Services.html">Executive Protection</a></li>
            <li><a href="Services.html">Event Security</a></li>
            <li><a href="Services.html">Mobile Patrol</a></li>
            <li><a href="Services.html">Risk Consulting</a></li>
            <li><a href="Services.html">Private Investigations</a></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="About.html">About</a></li>
            <li><a href="About.html#leadership">Leadership</a></li>
            <li><a href="About.html#credentials">Credentials</a></li>
            <li><a href="Careers.html">Careers</a></li>
            <li><a href="#">News</a></li>
          </ul>
        </div>
        <div>
          <h4>Contact</h4>
          <ul>
            <li>Central Florida HQ</li>
            <li>215 E Colonial Dr, Suite 400<br>Orlando, FL 32801</li>
            <li style="margin-top:10px"><a href="tel:+18005550110">+1 (800) 555-0110</a></li>
            <li><a href="mailto:dispatch@ussagency.com">dispatch@ussagency.com</a></li>
          </ul>
        </div>
      </div>
      <div class="bot">
        <div>© 2009–2026 USS Agency, LLC · All Rights Reserved</div>
        <div>Orlando · Tampa · Miami · Jacksonville</div>
      </div>
    </div>
  </footer>`;
}

function injectChrome(active) {
  document.body.insertAdjacentHTML("afterbegin", renderTopbar() + renderNav(active));
  document.body.insertAdjacentHTML("beforeend", renderFooter());
}
