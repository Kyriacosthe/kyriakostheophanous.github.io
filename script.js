function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function attr(value) {
  return escapeHtml(value);
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element && value !== undefined && value !== null) element.textContent = value;
}

function setHtml(selector, value) {
  const element = document.querySelector(selector);
  if (element && value !== undefined && value !== null) element.innerHTML = value;
}

function setLink(element, label, href) {
  if (!element) return;
  if (label !== undefined && label !== null) element.textContent = label;
  if (href) element.setAttribute("href", href);
}

function linkTargetAttributes(href) {
  return /^https?:\/\//i.test(href || "") ? ' target="_blank" rel="noreferrer"' : "";
}

function contactEmail(contact = {}) {
  if (contact.email) return contact.email;
  const mailto = toArray(contact.links).find((link) => /^mailto:/i.test(link.href || ""))?.href || "";
  return mailto.replace(/^mailto:/i, "").split("?")[0] || "kyriacosthe@gmail.com";
}

function renderContactForm(contact = {}) {
  return `
    <h3>${escapeHtml(contact.formTitle || "Contact me")}</h3>
    <label>
      <span>Name</span>
      <input name="name" type="text" autocomplete="name" required />
    </label>
    <label>
      <span>Email</span>
      <input name="email" type="email" autocomplete="email" required />
    </label>
    <label>
      <span>What do you need?</span>
      <textarea name="message" rows="5" required></textarea>
    </label>
    <button class="btn primary" type="submit">${escapeHtml(contact.formButton || "Send Message")}</button>
    <p class="form-status" data-contact-status></p>
  `;
}

function articleHref(report) {
  if (report?.slug) return `article.html?slug=${encodeURIComponent(report.slug)}`;
  return report?.href || "#reports";
}

function renderMetricPills(metrics) {
  return toArray(metrics)
    .map((metric) => `<span><b>${escapeHtml(metric.value)}</b> ${escapeHtml(metric.label)}</span>`)
    .join("");
}

function renderHomeStats(stats) {
  const root = document.querySelector(".proof-strip");
  if (!root || !Array.isArray(stats)) return;
  root.innerHTML = stats
    .map(
      (item) => `
        <div>
          <strong data-counter="${attr(item.value)}">0</strong>
          <span>${escapeHtml(item.label)}</span>
        </div>
      `
    )
    .join("");
}

function renderSite(site = {}) {
  const hero = site.hero || {};
  const featuredReport = site.featuredReport || {};
  const siteMap = site.siteMap || {};
  const projectsSection = site.projectsSection || {};
  const featuredProject = projectsSection.featured || {};
  const teamShowcase = site.teamShowcase || {};
  const reportsSection = site.reportsSection || {};
  const methodology = site.methodology || {};
  const validation = methodology.validation || {};
  const skills = site.skills || {};
  const about = site.about || {};
  const contact = site.contact || {};
  const footer = site.footer || {};

  setText(".brand strong", site.brandName);
  setText(".brand small", site.brandSubtitle);

  setText(".hero .eyebrow", hero.eyebrow);
  setText(".hero-copy h1", hero.title);
  setText(".hero-lede", hero.lede);
  setText(".hero-note", hero.note);
  const heroButtons = document.querySelectorAll(".hero-actions a");
  setLink(heroButtons[0], hero.primaryLabel, hero.primaryHref);
  setLink(heroButtons[1], hero.secondaryLabel, hero.secondaryHref);
  setLink(heroButtons[2], hero.tertiaryLabel, hero.tertiaryHref);

  setText(".guide-header span", featuredReport.kicker);
  setText(".guide-header strong", featuredReport.team);
  setText(".report-preview-cover .badge", featuredReport.badge);
  setText(".report-preview-cover h2", featuredReport.title);
  setText(".report-preview-cover p", featuredReport.summary);
  setHtml(".report-preview-cover .mini-metrics", renderMetricPills(featuredReport.metrics));
  setHtml(
    ".report-preview-evidence",
    toArray(featuredReport.evidence)
      .map((item) => `<div><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`)
      .join("")
  );

  setText(".snapshot .section-kicker", siteMap.kicker);
  setText(".snapshot .section-heading h2", siteMap.title);
  setText(".snapshot .section-heading p", siteMap.description);
  setHtml(
    ".site-map-grid",
    toArray(siteMap.cards)
      .map(
        (card) => `
          <article class="profile-card">
            <span>${escapeHtml(card.label)}</span>
            <strong>${escapeHtml(card.title)}</strong>
            <p>${escapeHtml(card.body)}</p>
          </article>
        `
      )
      .join("")
  );

  setText(".featured .section-kicker", projectsSection.kicker);
  setText(".featured .section-heading h2", projectsSection.title);
  setText(".featured .section-heading p", projectsSection.description);
  const caseStudy = document.querySelector(".case-study");
  if (caseStudy && featuredProject.title) {
    caseStudy.innerHTML = `
      <div class="case-copy">
        <span class="badge ${attr(featuredProject.badgeClass || "model")}">${escapeHtml(featuredProject.badge)}</span>
        <h3>${escapeHtml(featuredProject.title)}</h3>
        <p>${escapeHtml(featuredProject.summary)}</p>
        <div class="question-box">
          <span>${escapeHtml(featuredProject.questionLabel)}</span>
          <strong>${escapeHtml(featuredProject.question)}</strong>
        </div>
        <div class="metric-row">
          ${toArray(featuredProject.metrics)
            .map((metric) => `<div><b>${escapeHtml(metric.value)}</b><span>${escapeHtml(metric.label)}</span></div>`)
            .join("")}
        </div>
        <div class="button-row">
          <a class="btn primary" href="${attr(featuredProject.primaryHref || "#methodology")}">${escapeHtml(featuredProject.primaryLabel || "View Methodology")}</a>
          <a class="btn secondary" href="${attr(featuredProject.secondaryHref || "#reports")}">${escapeHtml(featuredProject.secondaryLabel || "See Reports")}</a>
        </div>
      </div>
      <div class="chart-stack" aria-label="Generated chart previews">
        ${toArray(featuredProject.charts)
          .map(
            (chart) => `
              <figure>
                <img src="${attr(chart.src)}" alt="${attr(chart.alt || chart.caption || "Portfolio chart")}" />
                <figcaption>${escapeHtml(chart.caption)}</figcaption>
              </figure>
            `
          )
          .join("")}
      </div>
    `;
  }

  setText(".showcase .section-kicker", teamShowcase.kicker);
  setText(".showcase .section-heading h2", teamShowcase.title);
  setText(".showcase .section-heading p", teamShowcase.description);
  const identityCard = document.querySelector(".identity-card");
  if (identityCard && teamShowcase.team) {
    identityCard.innerHTML = `
      <div>
        <span class="badge team">${escapeHtml(teamShowcase.badge)}</span>
        <h3>${escapeHtml(teamShowcase.team)}</h3>
        <p>${escapeHtml(teamShowcase.subtitle)}</p>
      </div>
      <div class="identity-label">${escapeHtml(teamShowcase.identity)}</div>
      <div class="metric-tiles">
        ${toArray(teamShowcase.metrics)
          .map((metric) => `<div><span>${escapeHtml(metric.label)}</span><strong>${escapeHtml(metric.value)}</strong></div>`)
          .join("")}
      </div>
      <div class="takeaway-grid">
        ${toArray(teamShowcase.takeaways)
          .map((item) => `<div><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong></div>`)
          .join("")}
      </div>
    `;
  }
  const showcaseChart = document.querySelector(".showcase .large-chart");
  if (showcaseChart && teamShowcase.chart?.src) {
    showcaseChart.innerHTML = `
      <img src="${attr(teamShowcase.chart.src)}" alt="${attr(teamShowcase.chart.alt || "Team chart")}" />
      <figcaption>${escapeHtml(teamShowcase.chart.caption)}</figcaption>
    `;
  }

  setText(".reports .section-kicker", reportsSection.kicker);
  setText(".reports .section-heading h2", reportsSection.title);
  setText(".reports .section-heading p", reportsSection.description);

  setText(".methodology .section-kicker", methodology.kicker);
  setText(".methodology .section-heading h2", methodology.title);
  setText(".methodology .section-heading p", methodology.description);
  setHtml(
    ".method-grid",
    toArray(methodology.cards)
      .map((card) => `<article class="method-card reveal"><h3>${escapeHtml(card.title)}</h3><p>${escapeHtml(card.body)}</p></article>`)
      .join("")
  );
  setHtml(
    ".validation-panel",
    `
      <div>
        <span class="badge model">${escapeHtml(validation.badge)}</span>
        <h3>${escapeHtml(validation.title)}</h3>
        <p>${escapeHtml(validation.body)}</p>
      </div>
      <ul>
        ${toArray(validation.items)
          .map((item) => `<li><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.value)}</span></li>`)
          .join("")}
      </ul>
    `
  );

  setText(".skills .section-kicker", skills.kicker);
  setText(".skills .section-heading h2", skills.title);
  setText(".skills .section-heading p", skills.description);
  setHtml(
    ".skill-grid",
    toArray(skills.items)
      .map((item) => `<article><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p></article>`)
      .join("")
  );

  setText(".about .section-kicker", about.kicker);
  setText(".about h2", about.title);
  const aboutCopy = document.querySelector(".about-panel > div:first-child");
  if (aboutCopy && Array.isArray(about.paragraphs)) {
    aboutCopy.querySelectorAll("p").forEach((node) => node.remove());
    about.paragraphs.forEach((paragraph) => {
      const element = document.createElement("p");
      element.textContent = paragraph;
      aboutCopy.appendChild(element);
    });
  }
  const targetList = document.querySelector(".target-list");
  if (targetList) {
    targetList.innerHTML = `
      <h3>${escapeHtml(about.focusTitle || "Current focus")}</h3>
      ${toArray(about.focusItems).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
    `;
  }

  setText(".contact .section-kicker", contact.kicker);
  setText(".contact h2", contact.title);
  setText(".contact-copy", contact.body);
  setHtml(
    ".contact-links",
    toArray(contact.links)
      .map((link) => `<a href="${attr(link.href || "#contact")}"${linkTargetAttributes(link.href)}>${escapeHtml(link.label)}</a>`)
      .join("")
  );
  setHtml(
    ".contact-form",
    renderContactForm(contact)
  );
  document.querySelector(".contact-form")?.setAttribute("data-contact-form", "");
  document.querySelector(".contact-form")?.setAttribute("data-contact-email", contactEmail(contact));

  setText(".site-footer strong", footer.name);
  setText(".site-footer span", footer.label);
  setText(".site-footer p", footer.disclaimer);
}

function renderProjects(projects) {
  const root = document.querySelector(".project-grid");
  if (!root || !Array.isArray(projects)) return;
  root.innerHTML = projects
    .map(
      (project) => `
        <article class="project-card reveal" data-project="${attr(project.category)}">
          <span class="badge ${attr(project.badgeClass || "model")}">${escapeHtml(project.badge)}</span>
          <h3>${escapeHtml(project.title)}</h3>
          <p>${escapeHtml(project.summary)}</p>
          <dl>
            <div><dt>Build</dt><dd>${escapeHtml(project.build)}</dd></div>
            <div><dt>Used for</dt><dd>${escapeHtml(project.usedFor)}</dd></div>
          </dl>
          <strong class="insight">${escapeHtml(project.insight)}</strong>
          ${
            project.codeHref
              ? `<div class="project-actions"><a class="btn ghost" href="${attr(project.codeHref)}"${linkTargetAttributes(project.codeHref)}>${escapeHtml(project.codeLabel || "View Code")}</a></div>`
              : ""
          }
        </article>
      `
    )
    .join("");
}

function renderReports(reports) {
  const root = document.querySelector(".report-grid");
  if (!root || !Array.isArray(reports)) return;
  root.innerHTML = reports
    .map(
      (report) => `
        <article class="report-card reveal" data-report="${attr(report.category)}">
          <span class="badge ${attr(report.badgeClass || "team")}">${escapeHtml(report.badge)}</span>
          <h3>${escapeHtml(report.title)}</h3>
          <p>${escapeHtml(report.summary)}</p>
          <div class="report-meta">
            ${report.date ? `<span>${escapeHtml(report.date)}</span>` : ""}
            ${report.readTime ? `<span>${escapeHtml(report.readTime)}</span>` : ""}
          </div>
          <ul>
            <li>Data: ${escapeHtml(report.data)}</li>
            <li>Skills: ${escapeHtml(report.skills)}</li>
          </ul>
          <a class="article-link" href="${attr(articleHref(report))}">${escapeHtml(report.linkLabel || "Read Article")}</a>
        </article>
      `
    )
    .join("");
}

async function loadPortfolioContent() {
  try {
    const response = await fetch("content/site-data.json", { cache: "no-store" });
    if (!response.ok) return;
    const data = await response.json();
    renderSite(data.site);
    renderHomeStats(data.homeStats);
    renderProjects(data.projects);
    renderReports(data.reports);
  } catch (error) {
    console.info("Using static HTML fallback. Run the local admin server to load editable JSON content.", error);
  }
}

function wireContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form || form.dataset.bound === "true") return;
  form.dataset.bound = "true";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    const status = form.querySelector("[data-contact-status]");

    if (!name || !email || !message) {
      if (status) status.textContent = "Please fill in all fields.";
      return;
    }

    const destination = form.dataset.contactEmail || "kyriacosthe@gmail.com";
    const subject = `Portfolio contact from ${name}`;
    const body = [`Name: ${name}`, `Email: ${email}`, "", "Message:", message].join("\n");
    if (status) status.textContent = "Opening your email app...";
    window.location.href = `mailto:${destination}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

function wireFilter(buttonSelector, cardSelector, buttonDatasetName, cardDatasetName) {
  const buttons = [...document.querySelectorAll(buttonSelector)];
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset[buttonDatasetName];
      buttons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      document.querySelectorAll(cardSelector).forEach((card) => {
        const values = card.dataset[cardDatasetName] || "";
        const show = filter === "all" || values.split(" ").includes(filter);
        card.classList.toggle("is-hidden", !show);
      });
    });
  });
}

async function initPortfolio() {
  await loadPortfolioContent();
  wireContactForm();

  const navToggle = document.querySelector("[data-nav-toggle]");
  const navLinks = document.querySelector("[data-nav-links]");
  const navAnchors = [...document.querySelectorAll(".nav-links a")];
  const sections = [...document.querySelectorAll("main section[id]")];

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", isOpen);
    });

    navAnchors.forEach((anchor) => {
      anchor.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        document.body.classList.remove("nav-open");
      });
    });
  }

  wireFilter("[data-filter]", ".project-card", "filter", "project");
  wireFilter("[data-report-filter]", ".report-card", "reportFilter", "report");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

  const navObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navAnchors.forEach((anchor) => {
        anchor.classList.toggle("active", anchor.getAttribute("href") === `#${visible.target.id}`);
      });
    },
    { rootMargin: "-20% 0px -65% 0px", threshold: [0.1, 0.2, 0.3] }
  );

  sections.forEach((section) => navObserver.observe(section));

  const counters = [...document.querySelectorAll("[data-counter]")];
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const end = Number(element.dataset.counter);
        const duration = 900;
        const startTime = performance.now();
        const step = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          element.textContent = Number.isFinite(end) ? Math.round(end * progress).toLocaleString() : element.dataset.counter;
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        counterObserver.unobserve(element);
      });
    },
    { threshold: 0.8 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

initPortfolio();
