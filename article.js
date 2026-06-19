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

function paragraphs(value) {
  return String(value || "")
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `<p>${escapeHtml(item)}</p>`)
    .join("");
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function slugify(value) {
  return String(value || "section")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "section";
}

function sectionId(section, index) {
  return `section-${index + 1}-${slugify(section.heading)}`;
}

function hasSectionContent(section) {
  return Boolean(
    String(section.body || "").trim() ||
      toArray(section.bullets).length ||
      toArray(section.blocks).length ||
      toArray(section.images).length ||
      section.chart?.src
  );
}

function isPartHeading(section) {
  return /^part\s+[ivx]+\b/i.test(section.heading || "");
}

function isStructureSection(section) {
  return /^report structure$/i.test(section.heading || "");
}

function importedOutlineKeepIndex(sections, structureIndex) {
  const firstContentIndex = sections.findIndex(
    (section, index) => index > structureIndex && hasSectionContent(section)
  );
  if (firstContentIndex === -1) return sections.length;
  const previousSection = sections[firstContentIndex - 1];
  if (
    previousSection &&
    isPartHeading(previousSection) &&
    !hasSectionContent(previousSection)
  ) {
    return firstContentIndex - 1;
  }
  return firstContentIndex;
}

function isImportedOutlinePlaceholder(section, index, sections) {
  if (isStructureSection(section) || hasSectionContent(section)) return false;
  const structureIndex = sections.findIndex(isStructureSection);
  if (structureIndex === -1 || index <= structureIndex) return false;
  return index < importedOutlineKeepIndex(sections, structureIndex);
}

function renderInlineStructure(sections, currentIndex) {
  const items = sections
    .map((section, index) => ({ section, index }))
    .filter(
      (item) =>
        item.index > currentIndex &&
        item.section.heading &&
        !isImportedOutlinePlaceholder(item.section, item.index, sections) &&
        (hasSectionContent(item.section) || isPartHeading(item.section))
    );
  if (!items.length) return "";
  return `
    <nav class="article-structure" aria-label="Report structure">
      <ol>
        ${items
          .map(
            ({ section, index }) => `
              <li>
                <a href="#${attr(sectionId(section, index))}">
                  ${escapeHtml(section.heading)}
                </a>
              </li>
            `
          )
          .join("")}
      </ol>
    </nav>
  `;
}

function renderArticleImage(image) {
  return `
    <figure class="article-chart">
      <img src="${attr(image.src)}" alt="${attr(image.alt || image.caption || "Report image")}" />
      <figcaption>${escapeHtml(image.caption || "")}</figcaption>
    </figure>
  `;
}

function tableCellHtml(value) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function renderArticleTable(rows) {
  const cleanRows = toArray(rows)
    .map((row) => toArray(row).map((cell) => String(cell ?? "").trim()))
    .filter((row) => row.some(Boolean));

  if (!cleanRows.length) return "";

  const [header, ...bodyRows] = cleanRows;
  const columnCount = Math.max(...cleanRows.map((row) => row.length));
  const normalizedHeader = Array.from({ length: columnCount }, (_, index) => header[index] || "");
  const normalizedBody = bodyRows.map((row) =>
    Array.from({ length: columnCount }, (_, index) => row[index] || "")
  );

  return `
    <div class="article-table-wrap">
      <table class="article-table">
        <thead>
          <tr>${normalizedHeader.map((cell) => `<th>${tableCellHtml(cell)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${normalizedBody
            .map((row) => `<tr>${row.map((cell) => `<td>${tableCellHtml(cell)}</td>`).join("")}</tr>`)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderSectionContent(section, sections, index) {
  if (isStructureSection(section)) return renderInlineStructure(sections, index);

  if (toArray(section.blocks).length) {
    return section.blocks
      .map((block) => {
        if (block.type === "paragraph") return paragraphs(block.text);
        if (block.type === "subheading") return `<h3 class="article-subheading">${escapeHtml(block.text)}</h3>`;
        if (block.type === "list") {
          const tag = block.kind === "ordered" ? "ol" : "ul";
          return `<${tag}>${toArray(block.items).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</${tag}>`;
        }
        if (block.type === "table") return renderArticleTable(block.rows);
        if (block.type === "image" && block.image?.src) return renderArticleImage(block.image);
        return "";
      })
      .join("");
  }

  const images = [
    ...(section.chart ? [section.chart] : []),
    ...toArray(section.images),
  ];
  return `
    ${section.body ? paragraphs(section.body) : ""}
    ${isStructureSection(section) ? renderInlineStructure(sections, index) : ""}
    ${Array.isArray(section.bullets) ? `<ul>${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
    ${images.map(renderArticleImage).join("")}
  `;
}

function renderSection(section, index, sections = []) {
  if (isImportedOutlinePlaceholder(section, index, sections)) return "";
  const sectionClasses = ["article-section"];
  if (isStructureSection(section)) sectionClasses.push("article-section-structure");
  if (isPartHeading(section) && !hasSectionContent(section)) sectionClasses.push("article-part-divider");
  return `
    <section class="${sectionClasses.join(" ")}" id="${attr(sectionId(section, index))}">
      ${section.heading ? `<h2>${escapeHtml(section.heading)}</h2>` : ""}
      ${renderSectionContent(section, sections, index)}
    </section>
  `;
}

function renderArticle(report, site) {
  const root = document.querySelector("[data-article-root]");
  const tags = toArray(report.tags).length ? report.tags : [report.category, report.badge].filter(Boolean);
  const sections = toArray(report.content?.sections);
  document.title = `${report.title} | ${site?.brandName || "Basketball Analytics Portfolio"}`;
  root.innerHTML = `
    <a class="article-back" href="index.html#reports">Back to reports</a>
    <article>
      <header class="article-hero">
        <div>
          <p class="eyebrow">${escapeHtml(report.badge || "Report")}</p>
          <h1>${escapeHtml(report.title)}</h1>
          ${report.subtitle ? `<p class="article-subtitle">${escapeHtml(report.subtitle)}</p>` : ""}
          ${report.summary ? `<p class="article-summary">${escapeHtml(report.summary)}</p>` : ""}
          <div class="article-meta">
            ${report.date ? `<span>${escapeHtml(formatDate(report.date))}</span>` : ""}
            ${report.readTime ? `<span>${escapeHtml(report.readTime)}</span>` : ""}
            ${report.category ? `<span>${escapeHtml(report.category)}</span>` : ""}
          </div>
          <div class="article-tags">
            ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
          </div>
        </div>
        <aside class="article-sidebar">
          <h2>Report Context</h2>
          <dl>
            <div><dt>Data</dt><dd>${escapeHtml(report.data || "")}</dd></div>
            <div><dt>Skills</dt><dd>${escapeHtml(report.skills || "")}</dd></div>
          </dl>
        </aside>
      </header>
      <div class="article-body">
        ${sections.length ? sections.map((section, index) => renderSection(section, index, sections)).join("") : `<section class="article-section"><p>No article body has been added yet.</p></section>`}
      </div>
    </article>
  `;
}

function renderNotFound() {
  const root = document.querySelector("[data-article-root]");
  root.innerHTML = `
    <section class="article-loading">
      <p class="eyebrow">Report Missing</p>
      <h1>This article was not found.</h1>
      <p class="article-summary">Go back to the reports library and choose an available article.</p>
      <a class="btn primary" href="index.html#reports">Back to Reports</a>
    </section>
  `;
}

async function initArticle() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const response = await fetch("content/site-data.json", { cache: "no-store" });
  const data = await response.json();
  const site = data.site || {};
  const report = toArray(data.reports).find((item) => item.slug === slug);

  const brandName = document.querySelector(".brand strong");
  const brandSubtitle = document.querySelector(".brand small");
  if (brandName && site.brandName) brandName.textContent = site.brandName;
  if (brandSubtitle && site.brandSubtitle) brandSubtitle.textContent = site.brandSubtitle;

  if (!report) {
    renderNotFound();
    return;
  }

  renderArticle(report, site);

  const navToggle = document.querySelector("[data-nav-toggle]");
  const navLinks = document.querySelector("[data-nav-links]");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", isOpen);
    });
  }
}

initArticle().catch(() => renderNotFound());
