// TV Show Project - script.js

const state = {
  allShows: [],
  allEpisodes: [],
  searchTerm: "",
};

const showsSelector = document.getElementById("shows-selector");
const showsSearch = document.getElementById("q");
const showsCount = document.getElementById("episode-count");
const showControls = document.getElementById("show-controls");
const frontBar = document.querySelector(".control-bar");
const backButton = document.getElementById("back-to-shows");
const episodeSelector = document.getElementById("episode-selector");
const episodeSearch = document.getElementById("episode-search");
const episodeCount2 = document.getElementById("episode-count-2");
const showsTitle = document.getElementById("shows-title");
const rootElem = document.getElementById("root");
const errorOverlay = document.getElementById("error-overlay");
const errorMessage = document.getElementById("error-message");

function showError(message) {
  errorMessage.textContent = message;
  errorOverlay.classList.add("visible");
}

// ===============================
// SHOWS (front page)
// ===============================

function populateShows() {
  fetch("https://api.tvmaze.com/shows")
    .then((response) => response.json())
    .then((shows) => {
      shows.sort((a, b) => a.name.localeCompare(b.name));
      state.allShows = shows;
      renderShowOptions(shows);
      renderShowCards(shows);
    })
    .catch((error) => {
      showError("Failed to load shows list.");
      console.error("Error loading shows:", error);
    });
}

function renderShowOptions(shows) {
  showsSelector.innerHTML = '<option value="">-- Select a show --</option>';
  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showsSelector.appendChild(option);
  });
  showsCount.textContent = `Displaying ${shows.length}/${state.allShows.length} shows`;
}

function renderShowCards(shows) {
  rootElem.innerHTML = "";

  shows.forEach((show) => {
    const card = document.createElement("div");
    card.className = "episode-card show-card";
    card.addEventListener("click", () => loadShow(show.id, show.name));

    const titleBox = document.createElement("div");
    titleBox.className = "episode-title-box";

    const title = document.createElement("h3");
    title.textContent = show.name;
    titleBox.appendChild(title);

    const img = document.createElement("img");
    if (show.image) {
      img.src = show.image.medium;
    }
    img.alt = show.name;

    const summary = document.createElement("p");
    summary.innerHTML = show.summary || "";

    card.appendChild(titleBox);
    card.appendChild(img);
    card.appendChild(summary);

    rootElem.appendChild(card);
  });

  applyScrollAnimation();
}

showsSearch.addEventListener("keyup", (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = state.allShows.filter((show) =>
    show.name.toLowerCase().includes(term),
  );
  renderShowOptions(filtered);
  renderShowCards(filtered);
});

showsSelector.addEventListener("change", () => {
  const showId = showsSelector.value;
  if (showId === "") return;
  const show = state.allShows.find((s) => s.id == showId);
  loadShow(showId, show ? show.name : "");
});

// ===============================
// EPISODES (show detail page)
// ===============================

// Matches episode names that are just a time slot, e.g. "12:00 A.M. - 1:00 A.M."
function isTimeSlotName(name) {
  return /^\d{1,2}:\d{2}\s*[ap]\.?m\.?\s*-\s*\d{1,2}:\d{2}\s*[ap]\.?m\.?$/i.test(
    (name || "").trim(),
  );
}
function removeTimeSlot(name) {
  return (name || "")
    .replace(
      /\d{1,2}:\d{2}\s*[ap]\.?m\.?\s*-\s*\d{1,2}:\d{2}\s*[ap]\.?m\.?/gi,
      "",
    )
    .trim();
}

function loadShow(showId, showName) {
  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => response.json())
    .then((episodes) => {
      state.allEpisodes = episodes.filter((ep) => !isTimeSlotName(ep.name));
      state.searchTerm = "";
      episodeSearch.value = "";
      showsTitle.textContent = showName;
      switchToEpisodeMode();
      render();
    })
    .catch((error) => {
      showError("Failed to load episodes.");
      console.error("Error fetching episodes:", error);
    });
}

function switchToEpisodeMode() {
  frontBar.classList.add("hidden");
  showControls.classList.remove("hidden");
}

function switchToFrontPageMode() {
  showControls.classList.add("hidden");
  frontBar.classList.remove("hidden");
  showsSelector.value = "";
  showsSearch.value = "";
  rootElem.innerHTML = "";
  renderShowOptions(state.allShows);
  renderShowCards(state.allShows);
}

backButton.addEventListener("click", switchToFrontPageMode);

function render() {
  const filteredEpisodes = state.allEpisodes.filter((episode) =>
    episode.name.toLowerCase().includes(state.searchTerm.toLowerCase()),
  );

  episodeCount2.textContent = `Displaying ${filteredEpisodes.length}/${state.allEpisodes.length} episodes`;
  makePageForEpisodes(filteredEpisodes);
  applyScrollAnimation();
  updateEpisodeSelector(filteredEpisodes);
}

function applyScrollAnimation() {
  const cards = document.querySelectorAll(".episode-card");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  });

  cards.forEach((card) => observer.observe(card));
}

function makePageForEpisodes(episodeList) {
  rootElem.innerHTML = "";

  episodeList.forEach((episode) => {
    const episodeDiv = document.createElement("div");
    episodeDiv.className = "episode-card";

    const code = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;

    const titleBox = document.createElement("div");
    titleBox.className = "episode-title-box";

    const title = document.createElement("h3");
    title.textContent = `${episode.name} (${code})`;
    titleBox.appendChild(title);

    const img = document.createElement("img");
    if (episode.image) {
      img.src = episode.image.medium;
    }
    img.alt = episode.name;

    const summary = document.createElement("p");
    summary.innerHTML = episode.summary || "";

    const link = document.createElement("a");
    link.href = episode.url;
    link.textContent = "View on TVMaze";
    link.target = "_blank";

    episodeDiv.appendChild(titleBox);
    episodeDiv.appendChild(img);
    episodeDiv.appendChild(summary);
    episodeDiv.appendChild(link);

    rootElem.appendChild(episodeDiv);
  });
}

// ===============================
// EPISODE SELECTOR (jump to episode)
// ===============================

function updateEpisodeSelector(filteredEpisodes) {
  episodeSelector.innerHTML = '<option value="">--- All Episodes ---</option>';

  filteredEpisodes.forEach((ep) => {
    const opt = document.createElement("option");
    opt.value = ep.id;
    opt.textContent = `${ep.name} (S${String(ep.season).padStart(2, "0")}E${String(ep.number).padStart(2, "0")})`;
    episodeSelector.appendChild(opt);
  });
}

episodeSelector.addEventListener("change", () => {
  const epId = episodeSelector.value;

  if (epId === "") {
    state.searchTerm = "";
    episodeSearch.value = "";
    render();
    return;
  }

  const ep = state.allEpisodes.find((e) => e.id == epId);
  state.searchTerm = ep.name;
  episodeSearch.value = ep.name;
  render();
});

// ===============================
// EPISODE SEARCH FIELD
// ===============================

episodeSearch.addEventListener("keyup", (e) => {
  state.searchTerm = e.target.value;
  render();
});

// ===============================
// LOAD SHOWS ON PAGE LOAD
// ===============================

window.onload = () => {
  populateShows();
};
