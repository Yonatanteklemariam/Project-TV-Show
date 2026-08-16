//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
  state.allEpisodes = allEpisodes;
  render();
}

const state = {
  allEpisodes: [],
  searchTerm: "",
};

function render() {
  const filteredEpisodes = state.allEpisodes.filter(function (episode) {
    return episode.name.toLowerCase().includes(state.searchTerm.toLowerCase());
  });

  document.getElementById("episode-count").textContent =
    `Displaying ${filteredEpisodes.length}/${state.allEpisodes.length} episodes`;
  makePageForEpisodes(filteredEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  episodeList.forEach((episode) => {
    const episodeDiv = document.createElement("div");
    episodeDiv.className = "episode-card";

    const code = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;

    const title = document.createElement("h2");
    title.textContent = `${episode.name} (${code})`;

    const img = document.createElement("img");
    img.src = episode.image.medium;
    img.alt = episode.name;

    const summary = document.createElement("p");
    summary.innerHTML = episode.summary;

    const link = document.createElement("a");
    link.href = episode.url;
    link.textContent = "View on TVMaze";
    link.target = "_blank";

    episodeDiv.appendChild(title);
    episodeDiv.appendChild(img);
    episodeDiv.appendChild(summary);
    episodeDiv.appendChild(link);

    rootElem.appendChild(episodeDiv);
  });
}

const input = document.querySelector("input");
input.addEventListener("keyup", function () {
  state.searchTerm = input.value;
  render();
});

window.onload = setup;

// yay
