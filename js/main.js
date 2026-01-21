function MainModule(listingsID = "#listings") {
  const me = {};

  const listingsElement = document.querySelector(listingsID);

  const qInput = document.querySelector("#q");
  const onlyFavSelect = document.querySelector("#onlyFav");
  const statusText = document.querySelector("#statusText");

  const modalEl = document.querySelector("#imagePreviewModal");
  const modalTitleEl = document.querySelector("#imagePreviewModalLabel");
  const modalImageEl = document.querySelector("#modalImage");
  const modalCaptionEl = document.querySelector("#modalCaption");

  let previewModal = null;

  let allListings = [];
  let favorites = new Set();

  const FALLBACK_IMG =
    "https://a0.muscache.com/pictures/b7c2a199-4c17-4ba6-b81d-751719d2dac6.jpg";

  // Favorites storage key
  const FAV_KEY = "airbnb_fav_ids_v1";

  function getListingId(listing) {
    if (listing && (listing.id || listing.id === 0)) return String(listing.id);
    const name = listing?.name ? String(listing.name) : "unknown";
    const host = listing?.host_id ? String(listing.host_id) : "nohost";
    return `${name}__${host}`;
  }

  function loadFavorites() {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (!raw) return new Set();
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return new Set();
      return new Set(arr.map(String));
    } catch {
      return new Set();
    }
  }

  function saveFavorites() {
    localStorage.setItem(FAV_KEY, JSON.stringify([...favorites]));
  }

  function toggleFavoriteById(id) {
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);
    saveFavorites();
  }

  function safeText(value, fallback = "") {
    if (value === null || value === undefined) return fallback;
    return String(value);
  }

  function parseAmenities(listing) {
    try {
      if (Array.isArray(listing.amenities)) return listing.amenities;
      if (typeof listing.amenities === "string") return JSON.parse(listing.amenities);
      return [];
    } catch {
      return [];
    }
  }

  function pickThumbnail(listing) {
    return listing.thumbnail_url || listing.picture_url || FALLBACK_IMG;
  }

  function pickHostPhoto(listing) {
    return listing.host_thumbnail_url || listing.host_picture_url || "https://via.placeholder.com/64?text=Host";
  }

  function shortDesc(text, maxLen = 160) {
    const t = safeText(text, "");
    return t.length <= maxLen ? t : t.slice(0, maxLen) + "...";
  }

  function escapeAttr(str) {
    return safeText(str, "")
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function escapeHtml(str) {
  return safeText(str, "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

  function getListingCode(listing) {
    const id = getListingId(listing);
    const isFav = favorites.has(id);

    const name = safeText(listing.name, "Untitled");
    const price = safeText(listing.price, "N/A");
    const descRaw = safeText(listing.description, "");
    const descSafeWithBreaks = escapeHtml(descRaw).replaceAll("\n", "<br>");
    const hostName = safeText(listing.host_name, "Unknown host");

    const img = pickThumbnail(listing);
    const hostImg = pickHostPhoto(listing);

    const amenities = parseAmenities(listing);
    const topAmenities = amenities.slice(0, 6);
    const moreCount = Math.max(0, amenities.length - topAmenities.length);

    const link = listing.listing_url ? String(listing.listing_url) : "";

    // Store preview data in data-* attributes for the modal
    const imgAttr = escapeAttr(img);
    const titleAttr = escapeAttr(name);
    const captionAttr = escapeAttr(`${price} • Host: ${hostName}`);

    return `
      <div class="col-12 col-md-6 col-lg-4 mb-3">
        <div class="listing card h-100" data-id="${escapeAttr(id)}">
          <img
            src="${imgAttr}"
            class="card-img-top listingThumb"
            alt="AirBNB Listing"
            role="button"
            tabindex="0"
            data-preview-src="${imgAttr}"
            data-preview-title="${titleAttr}"
            data-preview-caption="${captionAttr}"
            onerror="this.onerror=null; this.src='${FALLBACK_IMG}';"
          />

          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start gap-2">
              <h5 class="card-title" style="margin:0;">${name}</h5>

              <button
                class="btn btn-sm ${isFav ? "btn-danger" : "btn-outline-danger"} favBtn"
                type="button"
                data-id="${escapeAttr(id)}"
                aria-label="favorite"
                title="Toggle favorite"
              >
                ${isFav ? "♥" : "♡"}
              </button>
            </div>

            <div class="mt-2 d-flex justify-content-between">
              <div class="fw-bold">${price}</div>
              <div class="text-muted small">id: ${escapeAttr(id)}</div>
            </div>

            <div class="mt-2 d-flex align-items-center gap-2">
              <img
                src="${escapeAttr(hostImg)}"
                alt="Host"
                class="hostAvatar"
                onerror="this.onerror=null; this.src='https://via.placeholder.com/64?text=Host';"
              />
              <div class="small">Host: <b>${hostName}</b></div>
            </div>

            <div class="mt-2">
            <details>
            <summary>${
              descRaw
              ? escapeHtml(shortDesc(descRaw))
              : "No description provided."
            }</summary>
            
            <div class="small mt-2">${
              descRaw
              ? descSafeWithBreaks
              : "No description provided."
            }</div>
            </details>
            </div>

            <div class="mt-2 d-flex flex-wrap gap-1">
              ${topAmenities.map(a => `<span class="badge text-bg-light border">${safeText(a)}</span>`).join("")}
              ${moreCount > 0 ? `<span class="badge text-bg-light border">+${moreCount} more</span>` : ""}
            </div>

            <div class="mt-auto pt-3">
              <a
                href="${escapeAttr(link) || "#"}"
                target="_blank"
                class="btn btn-primary w-100 ${link ? "" : "disabled"}"
              >
                ${link ? "Open listing" : "No link available"}
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function redraw(listings) {
    listingsElement.innerHTML = listings.map(getListingCode).join("\n");
  }

  function applyAndRender() {
    const q = (qInput?.value || "").trim().toLowerCase();
    const mode = onlyFavSelect?.value || "all";

    let filtered = allListings;

    if (q) {
      filtered = filtered.filter((l) => {
        const name = safeText(l.name, "").toLowerCase();
        const desc = safeText(l.description, "").toLowerCase();
        return name.includes(q) || desc.includes(q);
      });
    }

    if (mode === "fav") {
      filtered = filtered.filter((l) => favorites.has(getListingId(l)));
    }

    const first50 = filtered.slice(0, 50);
    redraw(first50);

    if (statusText) {
      statusText.textContent = `Showing ${first50.length} / ${filtered.length} (max 50 displayed) • Favorites: ${favorites.size}`;
    }
  }

  function openPreviewModal({ src, title, caption }) {
    if (!modalEl || !modalImageEl || !modalTitleEl || !modalCaptionEl) return;

    modalTitleEl.textContent = title || "Preview";
    modalCaptionEl.textContent = caption || "";
    modalImageEl.src = src || FALLBACK_IMG;

    // Safety fallback if the preview src is broken
    modalImageEl.onerror = () => {
      modalImageEl.onerror = null;
      modalImageEl.src = FALLBACK_IMG;
    };

    if (!previewModal) {
      previewModal = new bootstrap.Modal(modalEl);
    }
    previewModal.show();
  }

  function wireEvents() {
    if (qInput) qInput.addEventListener("input", applyAndRender);
    if (onlyFavSelect) onlyFavSelect.addEventListener("change", applyAndRender);

    // Event delegation for favorites and image preview
    listingsElement.addEventListener("click", (e) => {
      const favBtn = e.target.closest(".favBtn");
      if (favBtn) {
        const id = favBtn.getAttribute("data-id");
        if (!id) return;
        toggleFavoriteById(id);
        applyAndRender();
        return;
      }

      const thumb = e.target.closest(".listingThumb");
      if (thumb) {
        const src = thumb.getAttribute("data-preview-src");
        const title = thumb.getAttribute("data-preview-title");
        const caption = thumb.getAttribute("data-preview-caption");
        openPreviewModal({ src, title, caption });
      }
    });

    // Keyboard support: Enter/Space on the thumbnail opens the modal
    listingsElement.addEventListener("keydown", (e) => {
      const thumb = e.target.closest(".listingThumb");
      if (!thumb) return;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const src = thumb.getAttribute("data-preview-src");
        const title = thumb.getAttribute("data-preview-title");
        const caption = thumb.getAttribute("data-preview-caption");
        openPreviewModal({ src, title, caption });
      }
    });
  }

  async function loadData() {
    favorites = loadFavorites();
    if (statusText) statusText.textContent = "Loading data...";

    try {
      const res = await fetch("./airbnb_sf_listings_500.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const listings = await res.json();

      allListings = listings;

      wireEvents();
      applyAndRender();
    } catch (err) {
      console.error(err);
      if (statusText) statusText.textContent = "Failed to load JSON. Use a local server (e.g., Live Server).";
    }
  }

  me.redraw = redraw;
  me.loadData = loadData;

  return me;
}

const main = MainModule();
main.loadData();