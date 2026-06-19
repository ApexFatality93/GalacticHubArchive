const body = document.body;
const pageType = body.dataset.page;
const jsonPath = body.dataset.jsonPath;
const PAGE_SIZE = 50;
const hideGlyphs = true;
const GALAXY_FILTER_MAP = {
  "Galactic Hub Project": "Euclid",
  "Galactic Hub Eissentam": "Eissentam",
  "Galactic Hub Calypso": "Calypso",
};

const IMAGE_PLACEHOLDER =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c6ddd8" />
          <stop offset="100%" stop-color="#ecd4bd" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill="url(#g)" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        fill="#34504c" font-family="Georgia, serif" font-size="38">
        No archive image
      </text>
    </svg>
  `);

document.addEventListener("DOMContentLoaded", async () => {
  renderSharedHeaderEmblem();
  renderSharedFooter();

  try {
    if (pageType === "home") {
      await renderHome();
      return;
    }

    if (pageType === "about") {
      await renderAbout();
      return;
    }

    if (pageType === "stats") {
      await renderStats();
      return;
    }

    if (!jsonPath) {
      return;
    }

    const payload = await loadJson(jsonPath);

    if (pageType === "creatures") {
      renderCreatures(payload);
    }
    if (pageType === "starships") {
      renderStarships(payload);
    }
    if (pageType === "bases") {
      renderBases(payload);
    }
    if (pageType === "flora") {
      renderFlora(payload);
    }
    if (pageType === "planets") {
      renderPlanets(payload);
    }
    if (pageType === "minerals") {
      renderMinerals(payload);
    }
    if (pageType === "multitools") {
      renderMultitools(payload);
    }
    if (pageType === "systems") {
      renderSystems(payload);
    }
    if (pageType === "colonies") {
      renderColonies(payload);
    }
    if (pageType === "businesses") {
      renderBusinesses(payload);
    }
  } catch (error) {
    console.error(error);
    renderError(error);
  }
});

function renderSharedHeaderEmblem() {
  const heroContent = document.querySelector(".hero > div:first-child");
  if (!heroContent || heroContent.querySelector(".hero-emblem")) {
    return;
  }

  const image = document.createElement("img");
  image.className = "hero-emblem";
  image.src = body.dataset.page === "home"
    ? "./assets/favicon/apple-touch-icon.png"
    : "../assets/favicon/apple-touch-icon.png";
  image.alt = "Galactic Hub Archives emblem";
  image.width = 96;
  image.height = 96;

  heroContent.prepend(image);
}

function renderSharedFooter() {
  const shell = document.querySelector(".site-shell");
  if (!shell || shell.querySelector(".site-footer")) {
    return;
  }

  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="site-footer-copy">
      <p class="eyebrow">Galactic Hub Archives</p>
      <p class="site-footer-text">
        Player documented data generated from the Galactic Hub wiki.
      </p>
    </div>
    <nav class="site-footer-nav" aria-label="Footer">
      <a href="${body.dataset.page === "home" ? "./" : "../"}">Home</a>
      <a href="${body.dataset.page === "home" ? "./about/" : "../about/"}">About</a>
      <a href="${body.dataset.page === "home" ? "./stats/" : "../stats/"}">Stats</a>
      <a href="https://nmsgalactichub.miraheze.org/wiki/Main_Page" target="_blank" rel="noreferrer">
        Wiki
      </a>
    </nav>
  `;

  shell.append(footer);
}

async function renderHome() {
  const creaturesPath = body.dataset.creaturesJsonPath;
  const starshipsPath = body.dataset.starshipsJsonPath;
  const basesPath = body.dataset.basesJsonPath;
  const floraPath = body.dataset.floraJsonPath;
  const planetsPath = body.dataset.planetsJsonPath;
  const mineralsPath = body.dataset.mineralsJsonPath;
  const multitoolsPath = body.dataset.multitoolsJsonPath;
  const systemsPath = body.dataset.systemsJsonPath;
  const coloniesPath = body.dataset.coloniesJsonPath;
  const businessesPath = body.dataset.businessesJsonPath;
  const tasks = [];

  if (creaturesPath) {
    tasks.push(
      loadJson(creaturesPath).then((payload) => {
        const items = getVisibleItems(payload);
        setHomeStat("creatures", items.length);
      })
    );
  }

  if (starshipsPath) {
    tasks.push(
      loadJson(starshipsPath).then((payload) => {
        const items = getVisibleItems(payload);
        setHomeStat("starships", items.length);
      })
    );
  }

  if (basesPath) {
    tasks.push(
      loadJson(basesPath).then((payload) => {
        const items = getVisibleItems(payload);
        setHomeStat("bases", items.length);
      })
    );
  }

  if (floraPath) {
    tasks.push(
      loadJson(floraPath).then((payload) => {
        const items = getVisibleItems(payload);
        setHomeStat("flora", items.length);
      })
    );
  }

  if (planetsPath) {
    tasks.push(
      loadJson(planetsPath).then((payload) => {
        const items = getVisibleItems(payload);
        setHomeStat("planets", items.length);
      })
    );
  }

  if (mineralsPath) {
    tasks.push(
      loadJson(mineralsPath).then((payload) => {
        const items = getVisibleItems(payload);
        setHomeStat("minerals", items.length);
      })
    );
  }

  if (multitoolsPath) {
    tasks.push(
      loadJson(multitoolsPath).then((payload) => {
        const items = getVisibleItems(payload);
        setHomeStat("multitools", items.length);
      })
    );
  }

  if (systemsPath) {
    tasks.push(
      loadJson(systemsPath).then((payload) => {
        const items = getVisibleItems(payload);
        setHomeStat("systems", items.length);
      })
    );
  }

  if (coloniesPath) {
    tasks.push(
      loadJson(coloniesPath).then((payload) => {
        const items = getVisibleItems(payload);
        setHomeStat("colonies", items.length);
      })
    );
  }

  if (businessesPath) {
    tasks.push(
      loadJson(businessesPath).then((payload) => {
        const items = getVisibleItems(payload);
        setHomeStat("businesses", items.length);
      })
    );
  }

  await Promise.all(tasks);
  await renderArchiveFreshness("home");
}

async function renderAbout() {
  await renderArchiveFreshness("about");
}

async function renderStats() {
  const sources = getArchiveSources();
  const dashboard = document.querySelector("#stats-dashboard");
  const summary = document.querySelector("#stats-summary");
  const meta = document.querySelector("#stats-meta");

  if (!dashboard) {
    return;
  }

  const entries = await Promise.all(
    Object.entries(sources).map(async ([key, path]) => {
      const payload = await loadJson(path);
      return [key, getVisibleItems(payload), payload];
    })
  );

  const datasets = Object.fromEntries(entries.map(([key, items]) => [key, items]));
  const payloads = Object.fromEntries(entries.map(([key, , payload]) => [key, payload]));
  const generatedAt = Object.values(payloads)
    .map((payload) => payload?.meta?.generated_at)
    .filter(Boolean)
    .sort()
    .at(-1);

  const allItems = Object.values(datasets).flat();
  const overviewMetrics = buildOverviewMetrics(datasets, allItems);
  const sections = buildStatsSections(datasets);

  summary.textContent = `${formatNumber(allItems.length)} visible records across ${Object.keys(datasets).length} categories`;
  meta.textContent = `Latest export in dashboard: ${generatedAt ? formatTimestamp(generatedAt) : "unknown"}`;
  dashboard.innerHTML = "";

  const fragment = document.createDocumentFragment();
  fragment.append(buildOverviewPanel(overviewMetrics));
  sections.forEach((section) => {
    fragment.append(buildStatsSection(section));
  });
  dashboard.append(fragment);
}

function getArchiveSources() {
  return {
    creatures: body.dataset.creaturesJsonPath,
    starships: body.dataset.starshipsJsonPath,
    bases: body.dataset.basesJsonPath,
    flora: body.dataset.floraJsonPath,
    planets: body.dataset.planetsJsonPath,
    minerals: body.dataset.mineralsJsonPath,
    multitools: body.dataset.multitoolsJsonPath,
    systems: body.dataset.systemsJsonPath,
    colonies: body.dataset.coloniesJsonPath,
    businesses: body.dataset.businessesJsonPath,
  };
}

async function renderArchiveFreshness(target) {
  const targets = {
    home: document.querySelector("#last-updated-home"),
    about: document.querySelector("#last-updated-about"),
  };
  const element = targets[target];
  if (!element) {
    return;
  }

  const sources = Object.values(getArchiveSources()).filter(Boolean);
  if (!sources.length) {
    element.textContent = "Archive freshness unavailable.";
    return;
  }

  try {
    const payloads = await Promise.all(sources.map((path) => loadJson(path)));
    const generatedAt = payloads
      .map((payload) => payload?.meta?.generated_at)
      .filter(Boolean)
      .sort()
      .at(-1);

    if (!generatedAt) {
      element.textContent = "Archive freshness unavailable.";
      return;
    }

    const totalRecords = payloads.reduce((sum, payload) => sum + getVisibleItems(payload).length, 0);
    element.textContent = `Last archive export: ${formatTimestamp(generatedAt)}. Current visible records: ${formatNumber(totalRecords)}.`;
  } catch (error) {
    console.error(error);
    element.textContent = "Archive freshness unavailable right now.";
  }
}

function setHomeStat(key, total) {
  const stat = document.querySelector(`[data-home-stat='${key}']`);
  if (!stat) {
    return;
  }
  stat.textContent = `${formatNumber(total)} records`;
}

function buildOverviewMetrics(datasets, allItems) {
  const contributors = new Set([
    ...collectNamesFromItems(datasets.creatures, ["discovered_by", "discoverer_page"]),
    ...collectNamesFromItems(datasets.starships, ["discovered_by", "discoverer_page"]),
    ...collectNamesFromItems(datasets.bases, ["builder", "builder_link"]),
    ...collectNamesFromItems(datasets.flora, ["discovered_by", "discoverer_page"]),
    ...collectNamesFromItems(datasets.planets, ["discovered_by", "discoverer_page"]),
    ...collectNamesFromItems(datasets.minerals, ["discovered_by", "discoverer_page"]),
    ...collectNamesFromItems(datasets.multitools, ["discovered_by", "discoverer_page"]),
    ...collectNamesFromItems(datasets.systems, ["discovered_by", "discoverer_page"]),
    ...collectNamesFromItems(datasets.businesses, ["owner"]),
  ]);

  return [
    {
      label: "Visible Records",
      value: formatNumber(allItems.length),
      note: "Legacy-tagged entries are excluded from every count.",
    },
    {
      label: "Archive Categories",
      value: formatNumber(Object.keys(datasets).length),
      note: "Creatures, planets, systems, ships, and more.",
    },
    {
      label: "Contributors",
      value: formatNumber(contributors.size),
      note: "Total unique discoverers, builders, etc.",
    },
  ];
}

function buildStatsSections(datasets) {
  const creatures = datasets.creatures || [];
  const starships = datasets.starships || [];
  const bases = datasets.bases || [];
  const flora = datasets.flora || [];
  const planets = datasets.planets || [];
  const minerals = datasets.minerals || [];
  const multitools = datasets.multitools || [];
  const systems = datasets.systems || [];
  const colonies = datasets.colonies || [];
  const businesses = datasets.businesses || [];

  const creatureHeights = creatures
    .map((item) => ({ item, value: parseRangeMaximum(item.height) }))
    .filter((entry) => entry.value != null)
    .sort((left, right) => right.value - left.value);
  const creatureWeights = creatures
    .map((item) => ({ item, value: parseRangeMaximum(item.weight) }))
    .filter((entry) => entry.value != null)
    .sort((left, right) => right.value - left.value);

  return [
    {
      title: "Category Totals",
      metrics: Object.entries(datasets).map(([key, items]) => ({
        label: startCase(key),
        value: formatNumber(items.length),
        note: `${formatPercent(items.length, Object.values(datasets).flat().length)} of all visible records`,
      })),
    },
    {
      title: "Creatures",
      metrics: [
        { label: "Creature Records", value: formatNumber(creatures.length), note: "Excludes legacy fauna entries." },
        { label: "Unique Genus", value: formatNumber(uniqueCount(creatures, "genus")), note: "Distinct genus labels." },
        { label: "Tallest Creature", value: creatureHeights[0] ? `${creatureHeights[0].value.toFixed(1)} m` : "N/A", note: creatureHeights[0]?.item?.name || "No height data" },
        { label: "Heaviest Creature", value: creatureWeights[0] ? `${creatureWeights[0].value.toFixed(1)} kg` : "N/A", note: creatureWeights[0]?.item?.name || "No weight data" },
      ],
      lists: [
        { title: "Top Genus", items: buildTopList(creatures, "genus") },
        { title: "Combat Ratings", items: buildTopList(creatures, "combat_effectiveness", 6, compareRankValues) },
        { title: "Health Ratings", items: buildTopList(creatures, "health", 6, compareRankValues) },
      ],
    },
    {
      title: "Starships",
      metrics: [
        { label: "Starship Records", value: formatNumber(starships.length), note: "Excludes legacy ship entries." },
        { label: "Ship Types", value: formatNumber(uniqueCount(starships, "type")), note: "Distinct type labels." },
        { label: "Named Releases", value: formatNumber(uniqueCount(starships, "game_release")), note: "Unique Game Update values." },
      ],
      lists: [
        { title: "Ship Types", items: buildTopList(starships, "type") },
        { title: "Acquisition", items: buildTopList(starships, "acquisition") },
        { title: "Top Contributors", items: buildTopNameCounts(starships, ["discovered_by", "discoverer_page"]) },
      ],
    },
    {
      title: "Bases",
      metrics: [
        { label: "Base Records", value: formatNumber(bases.length), note: "Excludes legacy base entries." },
        { label: "Base Types", value: formatNumber(uniqueCount(bases, "type")), note: "Distinct type labels." },
        { label: "Builders", value: formatNumber(collectNamesFromItems(bases, ["builder", "builder_link"]).size), note: "Unique builder names." },
      ],
      lists: [
        { title: "Base Types", items: buildTopList(bases, "type") },
        { title: "Builders", items: buildTopNameCounts(bases, ["builder", "builder_link"]) },
        { title: "Civilizations", items: buildTopList(bases, "civilization") },
      ],
    },
    {
      title: "Flora",
      metrics: [
        { label: "Flora Records", value: formatNumber(flora.length), note: "Excludes legacy flora entries." },
        { label: "Biomes", value: formatNumber(uniqueCount(flora, "biome")), note: "Distinct biome labels." },
        { label: "Plant Types", value: formatNumber(uniqueCount(flora, "type")), note: "Distinct type labels." },
        { label: "Discoverers", value: formatNumber(collectNamesFromItems(flora, ["discovered_by", "discoverer_page"]).size), note: "Unique discoverer names." },
      ],
      lists: [
        { title: "Biomes", items: buildTopList(flora, "biome") },
        { title: "Plant Types", items: buildTopList(flora, "type") },
        { title: "Civilizations", items: buildTopList(flora, "civilization") },
      ],
    },
    {
      title: "Planets And Moons",
      metrics: [
        { label: "World Records", value: formatNumber(planets.length), note: "Planets and moons combined." },
        { label: "Planets", value: formatNumber(planets.filter((item) => item.body_type === "Planet").length), note: "Entries labeled as planets." },
        { label: "Moons", value: formatNumber(planets.filter((item) => item.body_type === "Moon").length), note: "Entries labeled as moons." },
        { label: "Biomes", value: formatNumber(uniqueCount(planets, "biome")), note: "Distinct biomes across planets and moons." },
      ],
      lists: [
        { title: "Body Type", items: buildTopList(planets, "body_type") },
        { title: "Biomes", items: buildTopList(planets, "biome") },
        { title: "Weather", items: buildTopList(planets, "weather") },
        { title: "Sentinel", items: buildTopList(planets, "sentinel") },
        { title: "Sky Colors", items: buildTopList(planets, "sky_color") },
        { title: "Grass Colors", items: buildTopList(planets, "grass_color") },
      ],
    },
    {
      title: "Minerals",
      metrics: [
        { label: "Mineral Records", value: formatNumber(minerals.length), note: "Excludes legacy mineral entries." },
        { label: "Discoverers", value: formatNumber(collectNamesFromItems(minerals, ["discovered_by", "discoverer_page"]).size), note: "Unique discoverer names." },
      ],
      lists: [
        { title: "Civilizations", items: buildTopList(minerals, "civilization") },
        { title: "Discoverers", items: buildTopNameCounts(minerals, ["discovered_by", "discoverer_page"]) },
      ],
    },
    {
      title: "Multitools",
      metrics: [
        { label: "Multitool Records", value: formatNumber(multitools.length), note: "Excludes legacy multitool entries." },
        { label: "Tool Types", value: formatNumber(uniqueCount(multitools, "type")), note: "Distinct multitool type labels." },
        { label: "Discoverers", value: formatNumber(collectNamesFromItems(multitools, ["discovered_by", "discoverer_page"]).size), note: "Unique multitool discoverer names." },
      ],
      lists: [
        { title: "Tool Types", items: buildTopList(multitools, "type") },
        { title: "Tool Classes", items: buildTopList(multitools, "mt_class") },
        { title: "Top Discoverers", items: buildTopNameCounts(multitools, ["discovered_by", "discoverer_page"]) },
      ],
    },
    {
      title: "Systems",
      metrics: [
        { label: "System Records", value: formatNumber(systems.length), note: "Excludes legacy system entries." },
        { label: "Discoverers", value: formatNumber(collectNamesFromItems(systems, ["discovered_by"]).size), note: "Unique discoverer names from the systems table." },
        { label: "Documenters", value: formatNumber(collectNamesFromItems(systems, ["discoverer_page"]).size), note: "Unique linked documenter names from the systems table." },
        { label: "Regions", value: formatNumber(uniqueCount(systems, "region")), note: "Distinct region labels." },
      ],
      lists: [
        { title: "Factions", items: buildTopList(systems, "faction") },
        { title: "Economies", items: buildTopList(systems, "economy") },
        { title: "Wealth", items: buildTopList(systems, "wealth") },
        { title: "Conflict", items: buildTopList(systems, "conflict") },
        { title: "Water", items: buildTopList(systems, "water") },
        { title: "Dissonant", items: buildTopList(systems, "dissonant") },
      ],
    },
    {
      title: "Colonies",
      metrics: [
        { label: "Colony Records", value: formatNumber(colonies.length), note: "Visible colony entries." },
        { label: "Statuses", value: formatNumber(uniqueCount(colonies, "status")), note: "Distinct status labels." },
        { label: "Restricted Values", value: formatNumber(uniqueCount(colonies, "restricted")), note: "Distinct restriction labels." },
        { label: "Civilizations", value: formatNumber(uniqueCount(colonies, "civilization")), note: "Distinct civilization labels." },
      ],
      lists: [
        { title: "Status", items: buildTopList(colonies, "status") },
        { title: "Restricted", items: buildTopList(colonies, "restricted") },
        { title: "Civilizations", items: buildTopList(colonies, "civilization") },
      ],
    },
    {
      title: "Businesses",
      metrics: [
        { label: "Business Records", value: formatNumber(businesses.length), note: "Hidden pages are excluded." },
        { label: "Owners", value: formatNumber(collectNamesFromItems(businesses, ["owner"]).size), note: "Unique owner names." },
        { label: "Vanilla Yes", value: formatNumber(businesses.filter((item) => equalsIgnoreCase(item.vanilla, "yes")).length), note: "Entries explicitly marked vanilla." },
        { label: "Civilizations", value: formatNumber(uniqueCount(businesses, "civilization")), note: "Distinct civilization labels." },
      ],
      lists: [
        { title: "Services", items: buildTopList(businesses, "services") },
        { title: "Vanilla", items: buildTopList(businesses, "vanilla") },
        { title: "Civilizations", items: buildTopList(businesses, "civilization") },
      ],
    },
  ];
}

function renderCreatures(payload) {
  const items = getVisibleItems(payload);
  const state = {
    items,
    filteredItems: items,
    visibleCount: PAGE_SIZE,
  };

  const controls = {
    galaxy: document.querySelector("#galaxy-filter"),
    genus: document.querySelector("#genus-filter"),
    combat: document.querySelector("#combat-filter"),
    agility: document.querySelector("#agility-filter"),
    health: document.querySelector("#health-filter"),
    sort: document.querySelector("#sort-select"),
    reset: document.querySelector("#reset-filters"),
    loadMore: document.querySelector("#load-more-button"),
    copyLink: document.querySelector("#copy-link-button"),
  };

  populateMappedSelect(controls.galaxy, items, "civilization", GALAXY_FILTER_MAP);
  populateSelect(controls.genus, items, "genus");
  populateSelect(controls.combat, items, "combat_effectiveness", compareRankValues);
  populateSelect(controls.agility, items, "agility", compareRankValues);
  populateSelect(controls.health, items, "health", compareRankValues);
  applyQueryParamsToControls(controls, ["galaxy", "genus", "combat", "agility", "health", "sort"]);

  bindControlEvents(controls, () => applyCreatureFilters(state, controls, payload));

  controls.reset?.addEventListener("click", () => {
    resetSelects(controls, ["galaxy", "genus", "combat", "agility", "health"], "name-asc");
    applyCreatureFilters(state, controls, payload);
  });

  controls.loadMore?.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderCreatureCards(state.filteredItems, state.visibleCount);
    updateLoadMoreButton(state.filteredItems.length, state.visibleCount, controls.loadMore);
  });

  controls.copyLink?.addEventListener("click", async () => {
    await copyCurrentLink(controls.copyLink);
  });

  applyCreatureFilters(state, controls, payload);
}

function renderStarships(payload) {
  const items = getVisibleItems(payload);
  const state = {
    items,
    filteredItems: items,
    visibleCount: PAGE_SIZE,
  };

  const controls = {
    galaxy: document.querySelector("#galaxy-filter"),
    type: document.querySelector("#type-filter"),
    acquisition: document.querySelector("#acquisition-filter"),
    sort: document.querySelector("#sort-select"),
    reset: document.querySelector("#reset-filters"),
    loadMore: document.querySelector("#load-more-button"),
    copyLink: document.querySelector("#copy-link-button"),
  };

  populateMappedSelect(controls.galaxy, items, "civilization", GALAXY_FILTER_MAP);
  populateSelect(controls.type, items, "type");
  populateSelect(controls.acquisition, items, "acquisition");
  applyQueryParamsToControls(controls, ["galaxy", "type", "acquisition", "sort"]);

  bindControlEvents(controls, () => applyStarshipFilters(state, controls, payload));

  controls.reset?.addEventListener("click", () => {
    resetSelects(controls, ["galaxy", "type", "acquisition"], "name-asc");
    applyStarshipFilters(state, controls, payload);
  });

  controls.loadMore?.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderStarshipCards(state.filteredItems, state.visibleCount);
    updateLoadMoreButton(state.filteredItems.length, state.visibleCount, controls.loadMore);
  });

  controls.copyLink?.addEventListener("click", async () => {
    await copyCurrentLink(controls.copyLink);
  });

  applyStarshipFilters(state, controls, payload);
}

function renderBases(payload) {
  const items = getVisibleItems(payload);
  const state = {
    items,
    filteredItems: items,
    visibleCount: PAGE_SIZE,
  };

  const controls = {
    galaxy: document.querySelector("#galaxy-filter"),
    type: document.querySelector("#type-filter"),
    sort: document.querySelector("#sort-select"),
    reset: document.querySelector("#reset-filters"),
    loadMore: document.querySelector("#load-more-button"),
    copyLink: document.querySelector("#copy-link-button"),
  };

  populateMappedSelect(controls.galaxy, items, "civilization", GALAXY_FILTER_MAP);
  populateSelect(controls.type, items, "type");
  applyQueryParamsToControls(controls, ["galaxy", "type", "sort"]);

  bindControlEvents(controls, () => applyBaseFilters(state, controls, payload));

  controls.reset?.addEventListener("click", () => {
    resetSelects(controls, ["galaxy", "type"], "name-asc");
    applyBaseFilters(state, controls, payload);
  });

  controls.loadMore?.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderBaseCards(state.filteredItems, state.visibleCount);
    updateLoadMoreButton(state.filteredItems.length, state.visibleCount, controls.loadMore);
  });

  controls.copyLink?.addEventListener("click", async () => {
    await copyCurrentLink(controls.copyLink);
  });

  applyBaseFilters(state, controls, payload);
}

function renderFlora(payload) {
  const items = getVisibleItems(payload);
  const state = {
    items,
    filteredItems: items,
    visibleCount: PAGE_SIZE,
  };

  const controls = {
    galaxy: document.querySelector("#galaxy-filter"),
    biome: document.querySelector("#biome-filter"),
    type: document.querySelector("#type-filter"),
    sort: document.querySelector("#sort-select"),
    reset: document.querySelector("#reset-filters"),
    loadMore: document.querySelector("#load-more-button"),
    copyLink: document.querySelector("#copy-link-button"),
  };

  populateMappedSelect(controls.galaxy, items, "civilization", GALAXY_FILTER_MAP);
  populateSelect(controls.biome, items, "biome");
  populateSelect(controls.type, items, "type");
  applyQueryParamsToControls(controls, ["galaxy", "biome", "type", "sort"]);

  bindControlEvents(controls, () => applyFloraFilters(state, controls, payload));

  controls.reset?.addEventListener("click", () => {
    resetSelects(controls, ["galaxy", "biome", "type"], "name-asc");
    applyFloraFilters(state, controls, payload);
  });

  controls.loadMore?.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderFloraCards(state.filteredItems, state.visibleCount);
    updateLoadMoreButton(state.filteredItems.length, state.visibleCount, controls.loadMore);
  });

  controls.copyLink?.addEventListener("click", async () => {
    await copyCurrentLink(controls.copyLink);
  });

  applyFloraFilters(state, controls, payload);
}

function renderPlanets(payload) {
  const items = getVisibleItems(payload);
  const state = {
    items,
    filteredItems: items,
    visibleCount: PAGE_SIZE,
  };

  const controls = {
    bodyType: document.querySelector("#body-type-filter"),
    galaxy: document.querySelector("#galaxy-filter"),
    biome: document.querySelector("#biome-filter"),
    description: document.querySelector("#description-filter"),
    weather: document.querySelector("#weather-filter"),
    skyColor: document.querySelector("#sky-color-filter"),
    grassColor: document.querySelector("#grass-color-filter"),
    sentinel: document.querySelector("#sentinel-filter"),
    sort: document.querySelector("#sort-select"),
    reset: document.querySelector("#reset-filters"),
    loadMore: document.querySelector("#load-more-button"),
    copyLink: document.querySelector("#copy-link-button"),
  };

  populateSelect(controls.bodyType, items, "body_type");
  populateMappedSelect(controls.galaxy, items, "civilization", GALAXY_FILTER_MAP);
  populateSelect(controls.biome, items, "biome");
  populateSelect(controls.description, items, "description");
  populateSelect(controls.weather, items, "weather");
  populateSelect(controls.skyColor, items, "sky_color");
  populateSelect(controls.grassColor, items, "grass_color");
  populateSelect(controls.sentinel, items, "sentinel");
  applyQueryParamsToControls(
    controls,
    ["bodyType", "galaxy", "biome", "description", "weather", "skyColor", "grassColor", "sentinel", "sort"]
  );

  bindControlEvents(controls, () => applyPlanetFilters(state, controls, payload));

  controls.reset?.addEventListener("click", () => {
    resetSelects(
      controls,
      ["bodyType", "galaxy", "biome", "description", "weather", "skyColor", "grassColor", "sentinel"],
      "name-asc"
    );
    applyPlanetFilters(state, controls, payload);
  });

  controls.loadMore?.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderPlanetCards(state.filteredItems, state.visibleCount);
    updateLoadMoreButton(state.filteredItems.length, state.visibleCount, controls.loadMore);
  });

  controls.copyLink?.addEventListener("click", async () => {
    await copyCurrentLink(controls.copyLink);
  });

  applyPlanetFilters(state, controls, payload);
}

function renderMinerals(payload) {
  const items = getVisibleItems(payload);
  const state = {
    items,
    filteredItems: items,
    visibleCount: PAGE_SIZE,
  };

  const controls = {
    galaxy: document.querySelector("#galaxy-filter"),
    sort: document.querySelector("#sort-select"),
    reset: document.querySelector("#reset-filters"),
    loadMore: document.querySelector("#load-more-button"),
    copyLink: document.querySelector("#copy-link-button"),
  };

  populateMappedSelect(controls.galaxy, items, "civilization", GALAXY_FILTER_MAP);
  applyQueryParamsToControls(controls, ["galaxy", "sort"]);

  bindControlEvents(controls, () => applyMineralFilters(state, controls, payload));

  controls.reset?.addEventListener("click", () => {
    resetSelects(controls, ["galaxy"], "name-asc");
    applyMineralFilters(state, controls, payload);
  });

  controls.loadMore?.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderMineralCards(state.filteredItems, state.visibleCount);
    updateLoadMoreButton(state.filteredItems.length, state.visibleCount, controls.loadMore);
  });

  controls.copyLink?.addEventListener("click", async () => {
    await copyCurrentLink(controls.copyLink);
  });

  applyMineralFilters(state, controls, payload);
}

function renderMultitools(payload) {
  const items = getVisibleItems(payload);
  const state = {
    items,
    filteredItems: items,
    visibleCount: PAGE_SIZE,
  };

  const controls = {
    galaxy: document.querySelector("#galaxy-filter"),
    type: document.querySelector("#type-filter"),
    mtClass: document.querySelector("#class-filter"),
    slots: document.querySelector("#slots-filter"),
    sort: document.querySelector("#sort-select"),
    reset: document.querySelector("#reset-filters"),
    loadMore: document.querySelector("#load-more-button"),
    copyLink: document.querySelector("#copy-link-button"),
  };

  populateMappedSelect(controls.galaxy, items, "civilization", GALAXY_FILTER_MAP);
  populateSelect(controls.type, items, "type");
  populateSelect(controls.mtClass, items, "mt_class");
  populateSelect(controls.slots, items, "slots", compareSlotValues);
  applyQueryParamsToControls(controls, ["galaxy", "type", "mtClass", "slots", "sort"]);

  bindControlEvents(controls, () => applyMultitoolFilters(state, controls, payload));

  controls.reset?.addEventListener("click", () => {
    resetSelects(controls, ["galaxy", "type", "mtClass", "slots"], "name-asc");
    applyMultitoolFilters(state, controls, payload);
  });

  controls.loadMore?.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderMultitoolCards(state.filteredItems, state.visibleCount);
    updateLoadMoreButton(state.filteredItems.length, state.visibleCount, controls.loadMore);
  });

  controls.copyLink?.addEventListener("click", async () => {
    await copyCurrentLink(controls.copyLink);
  });

  applyMultitoolFilters(state, controls, payload);
}

function renderSystems(payload) {
  const items = getVisibleItems(payload);
  const state = {
    items,
    filteredItems: items,
    visibleCount: PAGE_SIZE,
  };

  const controls = {
    galaxy: document.querySelector("#galaxy-filter"),
    region: document.querySelector("#region-filter"),
    stars: document.querySelector("#stars-filter"),
    planets: document.querySelector("#planets-filter"),
    moons: document.querySelector("#moons-filter"),
    color: document.querySelector("#color-filter"),
    spectralClass: document.querySelector("#spectral-class-filter"),
    water: document.querySelector("#water-filter"),
    dissonant: document.querySelector("#dissonant-filter"),
    faction: document.querySelector("#faction-filter"),
    economy: document.querySelector("#economy-filter"),
    wealth: document.querySelector("#wealth-filter"),
    conflict: document.querySelector("#conflict-filter"),
    sort: document.querySelector("#sort-select"),
    reset: document.querySelector("#reset-filters"),
    loadMore: document.querySelector("#load-more-button"),
    copyLink: document.querySelector("#copy-link-button"),
  };

  populateMappedSelect(controls.galaxy, items, "civilization", GALAXY_FILTER_MAP);
  populateSelect(controls.region, items, "region");
  populateSelect(controls.stars, items, "stars", compareCountValues);
  populateSelect(controls.planets, items, "planets", compareCountValues);
  populateSelect(controls.moons, items, "moons", compareCountValues);
  populateSelect(controls.color, items, "color");
  populateSelect(controls.spectralClass, items, "spectral_class");
  populateSelect(controls.water, items, "water");
  populateSelect(controls.dissonant, items, "dissonant");
  populateSelect(controls.faction, items, "faction");
  populateSelect(controls.economy, items, "economy");
  populateSelect(controls.wealth, items, "wealth");
  populateSelect(controls.conflict, items, "conflict");
  applyQueryParamsToControls(
    controls,
    [
      "galaxy",
      "region",
      "stars",
      "planets",
      "moons",
      "color",
      "spectralClass",
      "water",
      "dissonant",
      "faction",
      "economy",
      "wealth",
      "conflict",
      "sort",
    ]
  );

  bindControlEvents(controls, () => applySystemFilters(state, controls, payload));

  controls.reset?.addEventListener("click", () => {
    resetSelects(
      controls,
      ["galaxy", "region", "stars", "planets", "moons", "color", "spectralClass", "water", "dissonant", "faction", "economy", "wealth", "conflict"],
      "name-asc"
    );
    applySystemFilters(state, controls, payload);
  });

  controls.loadMore?.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderSystemCards(state.filteredItems, state.visibleCount);
    updateLoadMoreButton(state.filteredItems.length, state.visibleCount, controls.loadMore);
  });

  controls.copyLink?.addEventListener("click", async () => {
    await copyCurrentLink(controls.copyLink);
  });

  applySystemFilters(state, controls, payload);
}

function renderColonies(payload) {
  const items = getVisibleItems(payload);
  const state = {
    items,
    filteredItems: items,
    visibleCount: PAGE_SIZE,
  };

  const controls = {
    galaxy: document.querySelector("#galaxy-filter"),
    restricted: document.querySelector("#restricted-filter"),
    status: document.querySelector("#status-filter"),
    sort: document.querySelector("#sort-select"),
    reset: document.querySelector("#reset-filters"),
    loadMore: document.querySelector("#load-more-button"),
    copyLink: document.querySelector("#copy-link-button"),
  };

  populateMappedSelect(controls.galaxy, items, "civilization", GALAXY_FILTER_MAP);
  populateSelect(controls.restricted, items, "restricted");
  populateSelect(controls.status, items, "status");
  applyQueryParamsToControls(controls, ["galaxy", "restricted", "status", "sort"]);

  bindControlEvents(controls, () => applyColonyFilters(state, controls, payload));

  controls.reset?.addEventListener("click", () => {
    resetSelects(controls, ["galaxy", "restricted", "status"], "name-asc");
    applyColonyFilters(state, controls, payload);
  });

  controls.loadMore?.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderColonyCards(state.filteredItems, state.visibleCount);
    updateLoadMoreButton(state.filteredItems.length, state.visibleCount, controls.loadMore);
  });

  controls.copyLink?.addEventListener("click", async () => {
    await copyCurrentLink(controls.copyLink);
  });

  applyColonyFilters(state, controls, payload);
}

function renderBusinesses(payload) {
  const items = getVisibleItems(payload);
  const state = {
    items,
    filteredItems: items,
    visibleCount: PAGE_SIZE,
  };

  const controls = {
    civilization: document.querySelector("#civilization-filter"),
    vanilla: document.querySelector("#vanilla-filter"),
    owner: document.querySelector("#owner-filter"),
    sort: document.querySelector("#sort-select"),
    reset: document.querySelector("#reset-filters"),
    loadMore: document.querySelector("#load-more-button"),
    copyLink: document.querySelector("#copy-link-button"),
  };

  populateSelect(controls.civilization, items, "civilization");
  populateSelect(controls.vanilla, items, "vanilla");
  populateSelect(controls.owner, items, "owner");
  applyQueryParamsToControls(controls, ["civilization", "vanilla", "owner", "sort"]);

  bindControlEvents(controls, () => applyBusinessFilters(state, controls, payload));

  controls.reset?.addEventListener("click", () => {
    resetSelects(controls, ["civilization", "vanilla", "owner"], "name-asc");
    applyBusinessFilters(state, controls, payload);
  });

  controls.loadMore?.addEventListener("click", () => {
    state.visibleCount += PAGE_SIZE;
    renderBusinessCards(state.filteredItems, state.visibleCount);
    updateLoadMoreButton(state.filteredItems.length, state.visibleCount, controls.loadMore);
  });

  controls.copyLink?.addEventListener("click", async () => {
    await copyCurrentLink(controls.copyLink);
  });

  applyBusinessFilters(state, controls, payload);
}

function bindControlEvents(controls, onChange) {
  Object.values(controls).forEach((control) => {
    if (!control || !(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) {
      return;
    }
    control.addEventListener("input", onChange);
    control.addEventListener("change", onChange);
  });
}

function resetSelects(controls, keys, sortValue) {
  keys.forEach((key) => {
    if (controls[key]) {
      controls[key].value = "";
    }
  });
  if (controls.sort) {
    controls.sort.value = sortValue;
  }
}

function applyCreatureFilters(state, controls, payload) {
  syncUrlFromControls(controls, ["galaxy", "genus", "combat", "agility", "health", "sort"], { sort: "name-asc" });
  const filtered = sortCreatures(
    state.items.filter((item) =>
      matchesFilter(item.civilization, controls.galaxy.value) &&
      matchesFilter(item.genus, controls.genus.value) &&
      matchesFilter(item.combat_effectiveness, controls.combat.value) &&
      matchesFilter(item.agility, controls.agility.value) &&
      matchesFilter(item.health, controls.health.value)
    ),
    controls.sort.value
  );

  state.filteredItems = filtered;
  state.visibleCount = PAGE_SIZE;
  renderCreatureCards(filtered, state.visibleCount);
  updateSummary("creatures", filtered.length, state.items.length, payload?.meta?.generated_at);
  updateLoadMoreButton(filtered.length, state.visibleCount, controls.loadMore);
}

function applyStarshipFilters(state, controls, payload) {
  syncUrlFromControls(controls, ["galaxy", "type", "acquisition", "sort"], { sort: "name-asc" });
  const filtered = sortStarships(
    state.items.filter((item) =>
      matchesFilter(item.civilization, controls.galaxy.value) &&
      matchesFilter(item.type, controls.type.value) &&
      matchesFilter(item.acquisition, controls.acquisition.value)
    ),
    controls.sort.value
  );

  state.filteredItems = filtered;
  state.visibleCount = PAGE_SIZE;
  renderStarshipCards(filtered, state.visibleCount);
  updateSummary("starships", filtered.length, state.items.length, payload?.meta?.generated_at);
  updateLoadMoreButton(filtered.length, state.visibleCount, controls.loadMore);
}

function applyBaseFilters(state, controls, payload) {
  syncUrlFromControls(controls, ["galaxy", "type", "sort"], { sort: "name-asc" });
  const filtered = sortBases(
    state.items.filter((item) =>
      matchesFilter(item.civilization, controls.galaxy.value) &&
      matchesFilter(item.type, controls.type.value)
    ),
    controls.sort.value
  );

  state.filteredItems = filtered;
  state.visibleCount = PAGE_SIZE;
  renderBaseCards(filtered, state.visibleCount);
  updateSummary("bases", filtered.length, state.items.length, payload?.meta?.generated_at);
  updateLoadMoreButton(filtered.length, state.visibleCount, controls.loadMore);
}

function applyFloraFilters(state, controls, payload) {
  syncUrlFromControls(controls, ["galaxy", "biome", "type", "sort"], { sort: "name-asc" });
  const filtered = sortFlora(
    state.items.filter((item) =>
      matchesFilter(item.civilization, controls.galaxy.value) &&
      matchesFilter(item.biome, controls.biome.value) &&
      matchesFilter(item.type, controls.type.value)
    ),
    controls.sort.value
  );

  state.filteredItems = filtered;
  state.visibleCount = PAGE_SIZE;
  renderFloraCards(filtered, state.visibleCount);
  updateSummary("flora", filtered.length, state.items.length, payload?.meta?.generated_at);
  updateLoadMoreButton(filtered.length, state.visibleCount, controls.loadMore);
}

function applyPlanetFilters(state, controls, payload) {
  syncUrlFromControls(
    controls,
    ["bodyType", "galaxy", "biome", "description", "weather", "skyColor", "grassColor", "sentinel", "sort"],
    { sort: "name-asc" }
  );
  const filtered = sortPlanets(
    state.items.filter((item) =>
      matchesFilter(item.body_type, controls.bodyType.value) &&
      matchesFilter(item.civilization, controls.galaxy.value) &&
      matchesFilter(item.biome, controls.biome.value) &&
      matchesFilter(item.description, controls.description.value) &&
      matchesFilter(item.weather, controls.weather.value) &&
      matchesFilter(item.sky_color, controls.skyColor.value) &&
      matchesFilter(item.grass_color, controls.grassColor.value) &&
      matchesFilter(item.sentinel, controls.sentinel.value)
    ),
    controls.sort.value
  );

  state.filteredItems = filtered;
  state.visibleCount = PAGE_SIZE;
  renderPlanetCards(filtered, state.visibleCount);
  updateSummary("planets", filtered.length, state.items.length, payload?.meta?.generated_at);
  updateLoadMoreButton(filtered.length, state.visibleCount, controls.loadMore);
}

function applyMineralFilters(state, controls, payload) {
  syncUrlFromControls(controls, ["galaxy", "sort"], { sort: "name-asc" });
  const filtered = sortSimpleByName(
    state.items.filter((item) => matchesFilter(item.civilization, controls.galaxy.value)),
    controls.sort.value
  );

  state.filteredItems = filtered;
  state.visibleCount = PAGE_SIZE;
  renderMineralCards(filtered, state.visibleCount);
  updateSummary("minerals", filtered.length, state.items.length, payload?.meta?.generated_at);
  updateLoadMoreButton(filtered.length, state.visibleCount, controls.loadMore);
}

function applyMultitoolFilters(state, controls, payload) {
  syncUrlFromControls(controls, ["galaxy", "type", "mtClass", "slots", "sort"], { sort: "name-asc" });
  const filtered = sortMultitools(
    state.items.filter((item) =>
      matchesFilter(item.civilization, controls.galaxy.value) &&
      matchesFilter(item.type, controls.type.value) &&
      matchesFilter(item.mt_class, controls.mtClass.value) &&
      matchesFilter(item.slots, controls.slots.value)
    ),
    controls.sort.value
  );

  state.filteredItems = filtered;
  state.visibleCount = PAGE_SIZE;
  renderMultitoolCards(filtered, state.visibleCount);
  updateSummary("multitools", filtered.length, state.items.length, payload?.meta?.generated_at);
  updateLoadMoreButton(filtered.length, state.visibleCount, controls.loadMore);
}

function applySystemFilters(state, controls, payload) {
  syncUrlFromControls(
    controls,
    ["galaxy", "region", "stars", "planets", "moons", "color", "spectralClass", "water", "dissonant", "faction", "economy", "wealth", "conflict", "sort"],
    { sort: "name-asc" }
  );
  const filtered = sortSystems(
    state.items.filter((item) =>
      matchesFilter(item.civilization, controls.galaxy.value) &&
      matchesFilter(item.region, controls.region.value) &&
      matchesFilter(item.stars, controls.stars.value) &&
      matchesFilter(item.planets, controls.planets.value) &&
      matchesFilter(item.moons, controls.moons.value) &&
      matchesFilter(item.color, controls.color.value) &&
      matchesFilter(item.spectral_class, controls.spectralClass.value) &&
      matchesFilter(item.water, controls.water.value) &&
      matchesFilter(item.dissonant, controls.dissonant.value) &&
      matchesFilter(item.faction, controls.faction.value) &&
      matchesFilter(item.economy, controls.economy.value) &&
      matchesFilter(item.wealth, controls.wealth.value) &&
      matchesFilter(item.conflict, controls.conflict.value)
    ),
    controls.sort.value
  );

  state.filteredItems = filtered;
  state.visibleCount = PAGE_SIZE;
  renderSystemCards(filtered, state.visibleCount);
  updateSummary("systems", filtered.length, state.items.length, payload?.meta?.generated_at);
  updateLoadMoreButton(filtered.length, state.visibleCount, controls.loadMore);
}

function applyColonyFilters(state, controls, payload) {
  syncUrlFromControls(controls, ["galaxy", "restricted", "status", "sort"], { sort: "name-asc" });
  const filtered = sortColonies(
    state.items.filter((item) =>
      matchesFilter(item.civilization, controls.galaxy.value) &&
      matchesFilter(item.restricted, controls.restricted.value) &&
      matchesFilter(item.status, controls.status.value)
    ),
    controls.sort.value
  );

  state.filteredItems = filtered;
  state.visibleCount = PAGE_SIZE;
  renderColonyCards(filtered, state.visibleCount);
  updateSummary("colonies", filtered.length, state.items.length, payload?.meta?.generated_at);
  updateLoadMoreButton(filtered.length, state.visibleCount, controls.loadMore);
}

function applyBusinessFilters(state, controls, payload) {
  syncUrlFromControls(controls, ["civilization", "vanilla", "owner", "sort"], { sort: "name-asc" });
  const filtered = sortBusinesses(
    state.items.filter((item) =>
      matchesFilter(item.civilization, controls.civilization.value) &&
      matchesFilter(item.vanilla, controls.vanilla.value) &&
      matchesFilter(item.owner, controls.owner.value)
    ),
    controls.sort.value
  );

  state.filteredItems = filtered;
  state.visibleCount = PAGE_SIZE;
  renderBusinessCards(filtered, state.visibleCount);
  updateSummary("businesses", filtered.length, state.items.length, payload?.meta?.generated_at);
  updateLoadMoreButton(filtered.length, state.visibleCount, controls.loadMore);
}

function sortCreatures(items, sort) {
  const sorted = [...items];

  sorted.sort((left, right) => {
    if (sort === "name-desc") {
      return compareText(right.name, left.name);
    }
    if (sort === "release-asc") {
      return compareText(left.game_release, right.game_release) || compareText(left.name, right.name);
    }
    if (sort === "height-asc") {
      return compareNumericRange(left.height, right.height) || compareText(left.name, right.name);
    }
    if (sort === "height-desc") {
      return compareNumericRangeDescending(left.height, right.height) || compareText(left.name, right.name);
    }
    if (sort === "weight-asc") {
      return compareNumericRange(left.weight, right.weight) || compareText(left.name, right.name);
    }
    if (sort === "weight-desc") {
      return compareNumericRangeDescending(left.weight, right.weight) || compareText(left.name, right.name);
    }
    return compareText(left.name, right.name);
  });

  return sorted;
}

function sortStarships(items, sort) {
  const sorted = [...items];

  sorted.sort((left, right) => {
    if (sort === "name-desc") {
      return compareText(right.name, left.name);
    }
    if (sort === "release-asc") {
      return compareText(left.game_release, right.game_release) || compareText(left.name, right.name);
    }
    if (sort === "release-desc") {
      return compareText(right.game_release, left.game_release) || compareText(left.name, right.name);
    }
    if (sort === "type-asc") {
      return compareText(left.type, right.type) || compareText(left.name, right.name);
    }
    return compareText(left.name, right.name);
  });

  return sorted;
}

function sortBases(items, sort) {
  const sorted = [...items];

  sorted.sort((left, right) => {
    if (sort === "name-desc") {
      return compareText(right.name, left.name);
    }
    if (sort === "release-asc") {
      return compareText(left.game_release, right.game_release) || compareText(left.name, right.name);
    }
    if (sort === "release-desc") {
      return compareText(right.game_release, left.game_release) || compareText(left.name, right.name);
    }
    if (sort === "type-asc") {
      return compareText(left.type, right.type) || compareText(left.name, right.name);
    }
    if (sort === "builder-asc") {
      return compareText(left.builder, right.builder) || compareText(left.name, right.name);
    }
    return compareText(left.name, right.name);
  });

  return sorted;
}

function sortFlora(items, sort) {
  const sorted = [...items];

  sorted.sort((left, right) => {
    if (sort === "name-desc") {
      return compareText(right.name, left.name);
    }
    if (sort === "biome-asc") {
      return compareText(left.biome, right.biome) || compareText(left.name, right.name);
    }
    if (sort === "type-asc") {
      return compareText(left.type, right.type) || compareText(left.name, right.name);
    }
    return compareText(left.name, right.name);
  });

  return sorted;
}

function sortPlanets(items, sort) {
  const sorted = [...items];

  sorted.sort((left, right) => {
    if (sort === "name-desc") {
      return compareText(right.name, left.name);
    }
    if (sort === "biome-asc") {
      return compareText(left.biome, right.biome) || compareText(left.name, right.name);
    }
    if (sort === "weather-asc") {
      return compareText(left.weather, right.weather) || compareText(left.name, right.name);
    }
    return compareText(left.name, right.name);
  });

  return sorted;
}

function sortSimpleByName(items, sort) {
  const sorted = [...items];

  sorted.sort((left, right) => {
    if (sort === "name-desc") {
      return compareText(right.name, left.name);
    }
    return compareText(left.name, right.name);
  });

  return sorted;
}

function sortMultitools(items, sort) {
  const sorted = [...items];

  sorted.sort((left, right) => {
    if (sort === "name-desc") {
      return compareText(right.name, left.name);
    }
    if (sort === "type-asc") {
      return compareText(left.type, right.type) || compareText(left.name, right.name);
    }
    if (sort === "class-asc") {
      return compareText(left.mt_class, right.mt_class) || compareText(left.name, right.name);
    }
    if (sort === "slots-asc") {
      return compareSlotValues(left.slots, right.slots) || compareText(left.name, right.name);
    }
    if (sort === "slots-desc") {
      return compareSlotValues(right.slots, left.slots) || compareText(left.name, right.name);
    }
    return compareText(left.name, right.name);
  });

  return sorted;
}

function sortSystems(items, sort) {
  const sorted = [...items];

  sorted.sort((left, right) => {
    if (sort === "name-desc") {
      return compareText(right.name, left.name);
    }
    if (sort === "region-asc") {
      return compareText(left.region, right.region) || compareText(left.name, right.name);
    }
    if (sort === "planets-desc") {
      return compareCountValues(right.planets, left.planets) || compareText(left.name, right.name);
    }
    if (sort === "moons-desc") {
      return compareCountValues(right.moons, left.moons) || compareText(left.name, right.name);
    }
    return compareText(left.name, right.name);
  });

  return sorted;
}

function sortColonies(items, sort) {
  const sorted = [...items];

  sorted.sort((left, right) => {
    if (sort === "name-desc") {
      return compareText(right.name, left.name);
    }
    if (sort === "status-asc") {
      return compareText(left.status, right.status) || compareText(left.name, right.name);
    }
    return compareText(left.name, right.name);
  });

  return sorted;
}

function sortBusinesses(items, sort) {
  const sorted = [...items];

  sorted.sort((left, right) => {
    if (sort === "name-desc") {
      return compareText(right.name, left.name);
    }
    if (sort === "owner-asc") {
      return compareText(formatDiscoverer(left.owner), formatDiscoverer(right.owner)) || compareText(left.name, right.name);
    }
    if (sort === "vanilla-asc") {
      return compareText(left.vanilla, right.vanilla) || compareText(left.name, right.name);
    }
    return compareText(left.name, right.name);
  });

  return sorted;
}

function renderCreatureCards(items, visibleCount) {
  const grid = document.querySelector("#cards-grid");
  const template = document.querySelector("#creature-card-template");
  renderCards(grid, template, items, visibleCount, {
    altSuffix: "creature image",
    emptyText: "No creature records matched the current filters.",
    detailBuilder(item) {
      return [
        ["Galaxy", item.galaxy],
        ["Glyphs", item.glyphs],
        ["Height", formatMeasurement(item.height, "m")],
        ["Weight", formatMeasurement(item.weight, "kg")],
        ["Discoverer", formatDiscoverer(item.discovered_by || item.discoverer_page)],
      ];
    },
  });
}

function renderStarshipCards(items, visibleCount) {
  const grid = document.querySelector("#cards-grid");
  const template = document.querySelector("#starship-card-template");
  renderCards(grid, template, items, visibleCount, {
    altSuffix: "starship image",
    emptyText: "No starship records matched the current filters.",
    detailBuilder(item) {
      return [
        ["Galaxy", item.galaxy],
        ["Glyphs", item.glyphs],
        ["Type", item.type],
        ["Acquisition", item.acquisition],
        ["Release", item.game_release],
        ["Discoverer", formatDiscoverer(item.discovered_by || item.discoverer_page)],
      ];
    },
  });
}

function renderBaseCards(items, visibleCount) {
  const grid = document.querySelector("#cards-grid");
  const template = document.querySelector("#bases-card-template");
  renderCards(grid, template, items, visibleCount, {
    altSuffix: "base image",
    emptyText: "No base records matched the current filters.",
    detailBuilder(item) {
      return [
        ["Galaxy", item.galaxy],
        ["Glyphs", item.glyphs],
        ["Builder", formatDiscoverer(item.builder || item.builder_link)],
        ["Type", item.type],
      ];
    },
  });
}

function renderFloraCards(items, visibleCount) {
  const grid = document.querySelector("#cards-grid");
  const template = document.querySelector("#flora-card-template");
  renderCards(grid, template, items, visibleCount, {
    altSuffix: "flora image",
    emptyText: "No flora records matched the current filters.",
    detailBuilder(item) {
      return [
        ["Type", item.body_type],
        ["Galaxy", item.galaxy],
        ["Glyphs", item.glyphs],
        ["Biome", item.biome],
        ["Type", item.type],
        ["Discoverer", formatDiscoverer(item.discovered_by || item.discoverer_page)],
      ];
    },
  });
}

function renderPlanetCards(items, visibleCount) {
  const grid = document.querySelector("#cards-grid");
  const template = document.querySelector("#planets-card-template");
  renderCards(grid, template, items, visibleCount, {
    altSuffix: "planet image",
    emptyText: "No planet records matched the current filters.",
    detailBuilder(item) {
      return [
        ["Galaxy", item.galaxy],
        ["Glyphs", item.glyphs],
        ["Biome", item.biome],
        ["Weather", item.weather],
        ["Sentinel", item.sentinel],
        ["Discoverer", formatDiscoverer(item.discovered_by || item.discoverer_page)],
      ];
    },
  });
}

function renderMineralCards(items, visibleCount) {
  const grid = document.querySelector("#cards-grid");
  const template = document.querySelector("#minerals-card-template");
  renderCards(grid, template, items, visibleCount, {
    altSuffix: "mineral image",
    emptyText: "No mineral records matched the current filters.",
    detailBuilder(item) {
      return [
        ["Galaxy", item.galaxy],
        ["Glyphs", item.glyphs],
        ["Discoverer", formatDiscoverer(item.discovered_by || item.discoverer_page)],
      ];
    },
  });
}

function renderMultitoolCards(items, visibleCount) {
  const grid = document.querySelector("#cards-grid");
  const template = document.querySelector("#multitools-card-template");
  renderCards(grid, template, items, visibleCount, {
    altSuffix: "multitool image",
    emptyText: "No multitool records matched the current filters.",
    detailBuilder(item) {
      return [
        ["Galaxy", item.galaxy],
        ["Glyphs", item.glyphs],
        ["Type", item.type],
        ["Class", item.mt_class],
        ["Slots", item.slots],
        ["Discoverer", formatDiscoverer(item.discovered_by || item.discoverer_page)],
      ];
    },
  });
}

function renderSystemCards(items, visibleCount) {
  const grid = document.querySelector("#cards-grid");
  const template = document.querySelector("#systems-card-template");
  renderCards(grid, template, items, visibleCount, {
    altSuffix: "system image",
    emptyText: "No system records matched the current filters.",
    detailBuilder(item) {
      return [
        ["Galaxy", item.galaxy],
        ["Glyphs", item.glyphs],
        ["Region", item.region],
        ["Stars", item.stars],
        ["Planets", item.planets],
        ["Moons", item.moons],
        ["Faction", formatDiscoverer(item.faction)],
        ["Economy", item.economy],
        ["Conflict", item.conflict],
        ["Discoverer", formatDiscoverer(item.discovered_by || item.discoverer_page)],
      ];
    },
  });
}

function renderColonyCards(items, visibleCount) {
  const grid = document.querySelector("#cards-grid");
  const template = document.querySelector("#colonies-card-template");
  renderCards(grid, template, items, visibleCount, {
    altSuffix: "colony image",
    emptyText: "No colony records matched the current filters.",
    detailBuilder(item) {
      return [
        ["Galaxy", item.galaxy],
        ["Glyphs", item.glyphs],
        ["Restricted", item.restricted],
        ["Status", item.status],
      ];
    },
  });
}

function renderBusinessCards(items, visibleCount) {
  const grid = document.querySelector("#cards-grid");
  const template = document.querySelector("#businesses-card-template");
  renderCards(grid, template, items, visibleCount, {
    altSuffix: "business image",
    emptyText: "No business records matched the current filters.",
    detailBuilder(item) {
      return [
        ["Description", item.description],
        ["Services", formatDiscoverer(item.services)],
        ["Vanilla", item.vanilla],
        ["Owner", formatDiscoverer(item.owner)],
        ["Civilized", item.civilization],
      ];
    },
  });
}

function buildOverviewPanel(metrics) {
  const panel = document.createElement("section");
  panel.className = "stats-panel";

  const header = document.createElement("div");
  header.className = "stats-panel-header";

  const titleWrap = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Dashboard";
  const title = document.createElement("h3");
  title.textContent = "Archive Overview";
  titleWrap.append(eyebrow, title);

  const copy = document.createElement("p");
  copy.className = "stats-panel-copy";
  copy.textContent = "High-level totals and coverage across every category currently published.";
  header.append(titleWrap, copy);

  const grid = document.createElement("div");
  grid.className = "stats-overview-grid";
  metrics.forEach((metric) => grid.append(buildMetricCard(metric)));

  panel.append(header, grid);
  return panel;
}

function buildStatsSection(section) {
  const panel = document.createElement("section");
  panel.className = "stats-panel";

  const header = document.createElement("div");
  header.className = "stats-panel-header";

  const titleWrap = document.createElement("div");
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = "Section";
  const title = document.createElement("h3");
  title.textContent = section.title;
  titleWrap.append(eyebrow, title);
  header.append(titleWrap);
  panel.append(header);

  if (section.metrics?.length) {
    const metricsGrid = document.createElement("div");
    metricsGrid.className = "stats-section-grid";
    section.metrics.forEach((metric) => metricsGrid.append(buildMetricCard(metric)));
    panel.append(metricsGrid);
  }

  if (section.lists?.length) {
    const listsGrid = document.createElement("div");
    listsGrid.className = "stats-stacks";
    section.lists.forEach((list) => listsGrid.append(buildStatsList(list)));
    panel.append(listsGrid);
  }

  return panel;
}

function buildMetricCard(metric) {
  const card = document.createElement("article");
  card.className = "stats-metric";

  const label = document.createElement("p");
  label.className = "stats-metric-label";
  label.textContent = metric.label;

  const value = document.createElement("p");
  value.className = "stats-metric-value";
  value.textContent = metric.value;

  const note = document.createElement("p");
  note.className = "stats-metric-note";
  note.textContent = metric.note || "";

  card.append(label, value, note);
  return card;
}

function buildStatsList(list) {
  const card = document.createElement("article");
  card.className = "stats-list";

  const title = document.createElement("h4");
  title.textContent = list.title;
  card.append(title);

  const items = document.createElement("ol");
  items.className = "stats-list-items";

  const sourceItems = list.items?.length ? list.items : [{ label: "No data", value: "" }];
  sourceItems.forEach((entry) => {
    const item = document.createElement("li");
    const label = document.createElement("span");
    label.className = "stats-list-label";
    label.textContent = entry.label;
    const value = document.createElement("span");
    value.className = "stats-list-value";
    value.textContent = entry.value;
    item.append(label, value);
    items.append(item);
  });

  card.append(items);
  return card;
}

function renderCards(grid, template, items, visibleCount, config) {
  if (!grid || !template) {
    return;
  }

  grid.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = config.emptyText;
    grid.append(empty);
    return;
  }

  const fragment = document.createDocumentFragment();

  items.slice(0, visibleCount).forEach((item) => {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector(".data-card");
    const image = clone.querySelector(".card-image");
    const kicker = clone.querySelector(".card-kicker");
    const title = clone.querySelector(".card-title");
    const details = clone.querySelector(".card-details");

    card.href = item.page_url || "#";
    image.src = item.image_url || IMAGE_PLACEHOLDER;
    image.alt = item.name ? `${item.name} ${config.altSuffix}` : config.altSuffix;
    image.onerror = () => {
      image.onerror = null;
      image.src = IMAGE_PLACEHOLDER;
    };

    kicker.textContent = "";
    title.textContent = item.name || item.page || "Untitled record";

    config.detailBuilder(item)
      .filter(([label, value]) => value && !(hideGlyphs && label === "Glyphs"))
      .forEach(([label, value]) => {
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");

        dt.textContent = label;

        if (label === "Discoverer" && item.discoverer_url) {
          const anchor = document.createElement("a");
          anchor.href = item.discoverer_url;
          anchor.target = "_blank";
          anchor.rel = "noreferrer";
          anchor.textContent = value;
          dd.append(anchor);
        } else if (label === "Builder" && item.builder_url) {
          const anchor = document.createElement("a");
          anchor.href = item.builder_url;
          anchor.target = "_blank";
          anchor.rel = "noreferrer";
          anchor.textContent = value;
          dd.append(anchor);
        } else if (label === "Owner" && item.owner_url) {
          const anchor = document.createElement("a");
          anchor.href = item.owner_url;
          anchor.target = "_blank";
          anchor.rel = "noreferrer";
          anchor.textContent = value;
          dd.append(anchor);
        } else {
          dd.textContent = value;
        }

        if (label === "Glyphs") {
          dd.classList.add("glyph-value");
        }

        details.append(dt, dd);
      });

    fragment.append(clone);
  });

  grid.append(fragment);
}

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

function getVisibleItems(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  return items.filter((item) => !hasLegacyCivilization(item));
}

function matchesFilter(value, selected) {
  return !selected || (value || "") === selected;
}

function compareText(left, right) {
  return (left || "").localeCompare(right || "", undefined, { sensitivity: "base" });
}

function compareNumericRange(left, right) {
  return compareParsedNumbers(parseRangeAverage(left), parseRangeAverage(right));
}

function compareParsedNumbers(leftValue, rightValue) {
  if (leftValue == null && rightValue == null) {
    return 0;
  }
  if (leftValue == null) {
    return 1;
  }
  if (rightValue == null) {
    return -1;
  }

  return leftValue - rightValue;
}

function compareNumericRangeDescending(left, right) {
  const leftValue = parseRangeAverage(left);
  const rightValue = parseRangeAverage(right);

  if (leftValue == null && rightValue == null) {
    return 0;
  }
  if (leftValue == null) {
    return 1;
  }
  if (rightValue == null) {
    return -1;
  }

  return rightValue - leftValue;
}

function parseRangeAverage(value) {
  if (!value) {
    return null;
  }

  const numbers = extractRangeNumbers(value);
  if (!numbers.length) {
    return null;
  }

  const total = numbers.reduce((sum, number) => sum + number, 0);
  return total / numbers.length;
}

function parseRangeMaximum(value) {
  if (!value) {
    return null;
  }

  const numbers = extractRangeNumbers(value);
  if (!numbers.length) {
    return null;
  }

  return Math.max(...numbers);
}

function extractRangeNumbers(value) {
  const matches = String(value).match(/(?:\d+\.\d+|\.\d+|\d+)/g);
  if (!matches || !matches.length) {
    return [];
  }

  return matches
    .map((part) => (part.startsWith(".") ? `0${part}` : part))
    .map(Number)
    .filter((number) => Number.isFinite(number));
}

function parseInteger(value) {
  const number = parseInt(value, 10);
  return Number.isFinite(number) ? number : null;
}

function sumIntegerField(items, key) {
  return items.reduce((sum, item) => {
    const value = parseInteger(item[key]);
    return sum + (value ?? 0);
  }, 0);
}

function populateSelect(select, items, key, compareFn = compareText) {
  if (!select) {
    return;
  }

  const values = [...new Set(items.map((item) => item[key]).filter(Boolean))].sort(compareFn);
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}

function populateMappedSelect(select, items, key, labelMap) {
  if (!select) {
    return;
  }

  const values = [...new Set(items.map((item) => item[key]).filter(Boolean))].sort(compareText);
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = labelMap[value] || value;
    select.append(option);
  });
}

function compareRankValues(left, right) {
  const rankOrder = ["S", "A", "B", "C", "D", "E"];
  const leftIndex = rankOrder.indexOf((left || "").toUpperCase());
  const rightIndex = rankOrder.indexOf((right || "").toUpperCase());

  if (leftIndex !== -1 && rightIndex !== -1) {
    return leftIndex - rightIndex;
  }
  if (leftIndex !== -1) {
    return -1;
  }
  if (rightIndex !== -1) {
    return 1;
  }

  return compareText(left, right);
}

function compareSlotValues(left, right) {
  const leftNumber = parseInt(left, 10);
  const rightNumber = parseInt(right, 10);

  if (!Number.isFinite(leftNumber) && !Number.isFinite(rightNumber)) {
    return compareText(left, right);
  }
  if (!Number.isFinite(leftNumber)) {
    return 1;
  }
  if (!Number.isFinite(rightNumber)) {
    return -1;
  }

  return leftNumber - rightNumber;
}

function compareCountValues(left, right) {
  const leftNumber = parseInt(left, 10);
  const rightNumber = parseInt(right, 10);

  if (!Number.isFinite(leftNumber) && !Number.isFinite(rightNumber)) {
    return compareText(left, right);
  }
  if (!Number.isFinite(leftNumber)) {
    return 1;
  }
  if (!Number.isFinite(rightNumber)) {
    return -1;
  }

  return leftNumber - rightNumber;
}

function updateLoadMoreButton(totalItems, visibleCount, button) {
  if (!button) {
    return;
  }

  const hasMore = totalItems > visibleCount;
  button.hidden = !hasMore;
  button.textContent = hasMore
    ? `Load more (${formatNumber(Math.min(PAGE_SIZE, totalItems - visibleCount))} more)`
    : "All results loaded";
}

function formatDiscoverer(value) {
  if (!value) {
    return "";
  }

  return extractContributorNames(value).join(" & ");
}

function formatDiscovererPart(value) {
  const trimmed = value.trim();
  const wikiLinkMatch = trimmed.match(/^\[\[([^|\]]+)(?:\|([^\]]+))?\]\]$/);
  const externalLinkMatch = trimmed.match(/^\[(https?:\/\/[^\s\]]+)\s+([^\]]+)\]$/i);

  if (wikiLinkMatch) {
    const displayText = (wikiLinkMatch[2] || wikiLinkMatch[1]).trim();
    return stripUserPrefix(displayText);
  }

  if (externalLinkMatch) {
    return stripUserPrefix(externalLinkMatch[2].trim());
  }

  return stripUserPrefix(trimmed);
}

function stripUserPrefix(value) {
  return value.replace(/^(?:User|Userprofile):/i, "").split(":").pop().trim();
}

function extractContributorNames(value) {
  if (!value) {
    return [];
  }

  const text = String(value).trim();
  const wikiMatches = [...text.matchAll(/\[\[([^|\]]+)(?:\|([^\]]+))?\]\]/g)].map((match) =>
    stripUserPrefix((match[2] || match[1]).trim())
  );
  const externalMatches = [...text.matchAll(/\[(https?:\/\/[^\s\]]+)\s+([^\]]+)\]/gi)].map((match) =>
    stripUserPrefix(match[2].trim())
  );
  const linkedNames = [...wikiMatches, ...externalMatches].filter(Boolean);

  if (linkedNames.length) {
    return [...new Set(linkedNames)];
  }

  const formatted = formatDiscovererPart(text);
  return formatted ? [formatted] : [];
}

function formatMeasurement(value, unit) {
  if (!value) {
    return "";
  }

  return `${value} ${unit}`;
}

function uniqueCount(items, key) {
  return new Set(items.map((item) => item[key]).filter(Boolean)).size;
}

function startCase(value) {
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function collectNamesFromItems(items, keys) {
  const names = new Set();

  items.forEach((item) => {
    keys.forEach((key) => {
      extractContributorNames(item[key]).forEach((name) => names.add(name));
    });
  });

  return names;
}

function countNamesFromItems(items, keys) {
  const counts = new Map();

  items.forEach((item) => {
    keys.forEach((key) => {
      extractContributorNames(item[key]).forEach((name) =>
        counts.set(name, (counts.get(name) || 0) + 1)
      );
    });
  });

  return counts;
}

function buildTopList(items, key, limit = 7, compareFn = compareText) {
  const counts = new Map();

  items.forEach((item) => {
    const value = item[key];
    if (!value) {
      return;
    }
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return [...counts.entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }
      return compareFn(left[0], right[0]);
    })
    .slice(0, limit)
    .map(([label, count]) => ({ label, value: formatNumber(count) }));
}

function buildTopNameCounts(items, keys, limit = 7) {
  return [...countNamesFromItems(items, keys).entries()]
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }
      return compareText(left[0], right[0]);
    })
    .slice(0, limit)
    .map(([name, count]) => ({ label: name, value: formatNumber(count) }));
}

function formatPercent(value, total) {
  if (!total) {
    return "0%";
  }

  return `${Math.round((value / total) * 100)}%`;
}

function equalsIgnoreCase(left, right) {
  return String(left || "").toLowerCase() === String(right || "").toLowerCase();
}

function updateSummary(label, filteredItems, totalItems, generatedAt) {
  const summary = document.querySelector("#results-summary");
  const meta = document.querySelector("#results-meta");

  if (summary) {
    summary.textContent = `${formatNumber(filteredItems)} of ${formatNumber(totalItems)} ${label}`;
  }

  if (meta) {
    const generatedLabel = generatedAt ? formatTimestamp(generatedAt) : "unknown";
    meta.textContent = `Data export: ${generatedLabel}`;
  }
}

function renderError(error) {
  const target = document.querySelector("#cards-grid") || document.querySelector(".page-section");
  if (!target) {
    return;
  }

  const message = document.createElement("div");
  message.className = "empty-state";
  message.textContent = `Unable to load data: ${error.message}`;
  target.append(message);
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(value);
}

function formatTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

function hasLegacyCivilization(item) {
  return (item?.civilization || "").toLowerCase().includes("legacy");
}

function applyQueryParamsToControls(controls, keys) {
  const params = new URLSearchParams(window.location.search);

  keys.forEach((key) => {
    const control = controls[key];
    const value = params.get(key);
    if (!control || value == null) {
      return;
    }

    const hasOption = [...control.options].some((option) => option.value === value);
    if (hasOption) {
      control.value = value;
    }
  });
}

function syncUrlFromControls(controls, keys, defaults = {}) {
  const params = new URLSearchParams(window.location.search);

  keys.forEach((key) => {
    const control = controls[key];
    if (!control) {
      return;
    }

    const value = control.value;
    const defaultValue = defaults[key] ?? "";

    if (!value || value === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });

  const nextQuery = params.toString();
  const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", nextUrl);
}

async function copyCurrentLink(button) {
  const originalText = button.textContent;

  try {
    await navigator.clipboard.writeText(window.location.href);
    button.textContent = "Copied";
  } catch (error) {
    console.error(error);
    button.textContent = "Copy failed";
  }

  window.setTimeout(() => {
    button.textContent = originalText;
  }, 1400);
}
