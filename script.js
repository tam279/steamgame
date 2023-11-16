// Constants
const apiUrl =
  "https://steam-api-dot-cs-platform-306304.et.r.appspot.com/games";
const genresUrl =
  "https://steam-api-dot-cs-platform-306304.et.r.appspot.com/genres";
const featuredGamesUrl =
  "https://steam-api-dot-cs-platform-306304.et.r.appspot.com/features";

// Event Listeners
document
  .getElementById("gamesContainer")
  .addEventListener("click", handleGameCardClick);
document
  .getElementById("searchInput")
  .addEventListener("keyup", handleSearchInput);

document
  .getElementById("searchButton")
  .addEventListener("click", performSearch);

document.getElementById("viewAllButton").addEventListener("click", getAllGames);
document
  .getElementById("loadMoreButton") // Changed the button ID here
  .addEventListener("click", loadMoreGames);
document
  .getElementById("featuredGamesButton")
  .addEventListener("click", getFeaturedGames);

// Variables
let currentPage = 1;
const gamesPerPage = 20;
let totalGames = 0;
let searchTerm = "";
// Initial Load
(async () => {
  try {
    // Fetch the total number of games to set up the correct totalGames value
    const totalGamesResponse = await fetchData(apiUrl);
    totalGames = totalGamesResponse.total;

    // Load the first set of games
    await loadMoreGames();

    // Fetch genres
    await getAllGenres();
  } catch (error) {
    console.error("Error during initial load:", error);
  }
})();

// Functions
async function loadMoreGames() {
  try {
    // Fetch the next set of games using the current page, gamesPerPage, and search term values
    const games = await fetchData(
      `${apiUrl}?search=${searchTerm}&page=${currentPage}&per_page=${gamesPerPage}`
    );

    // Update the totalGames value based on the fetched data
    totalGames = games.total;

    // Display the games
    displayGames(games.data);

    // Increment the currentPage for future requests
    currentPage++;
  } catch (error) {
    console.error("Error fetching game data:", error);
  }
}

async function getAllGames() {
  try {
    const games = await fetchData(apiUrl);
    totalGames = games.total;
    displayGames(games.data);
  } catch (error) {
    console.error("Error fetching game data:", error);
  }
}

async function getAllGenres() {
  try {
    const genres = await fetchData(genresUrl);
    displayGenres(genres.data);
  } catch (error) {
    console.error("Error fetching genre data:", error);
  }
}

async function getFeaturedGames() {
  try {
    const featuredGames = await fetchData(featuredGamesUrl);
    displayFeaturedGames(featuredGames.data);
  } catch (error) {
    console.error("Error fetching featured games:", error);
  }
}

async function filterByGenre(selectedGenre) {
  try {
    const games = await fetchData(`${apiUrl}?genres=${selectedGenre}`);
    displayGames(games.data);
  } catch (error) {
    console.error("Error fetching game data:", error);
  }
}

async function performSearch() {
  searchTerm = document.getElementById("searchInput").value.toLowerCase();

  try {
    // Fetch games based on the search term
    const searchResult = await fetchData(
      `${apiUrl}?q=${searchTerm}&limit=${gamesPerPage}`
    );

    // Update the totalGames value based on the fetched data
    totalGames = searchResult.total;

    // Display the games
    displayGames(searchResult.data);
  } catch (error) {
    console.error("Error fetching game data:", error);
  }
}

async function fetchAndDisplayRemainingPages(searchTerm, remainingPages) {
  if (remainingPages > 0) {
    // Fetch the next page of search results
    const games = await fetchData(
      `${apiUrl}?search=${searchTerm}&page=${currentPage}&per_page=${gamesPerPage}`
    );

    // Display the games from the next page
    displayGames(games.data);

    // Increment the currentPage for future requests
    currentPage++;

    // Recursively call the function for the next page
    await fetchAndDisplayRemainingPages(searchTerm, remainingPages - 1);
  }
}

function handleGameCardClick(event) {
  const clickedElement = event.target;
  if (clickedElement.classList.contains("gameCard")) {
    const appid = clickedElement.dataset.appid;
    getSingleGameDetails(appid);
  }
}

function handleSearchInput(event) {
  if (event.key === "Enter") {
    performSearch();
  }
}

async function fetchData(url) {
  console.log("Fetching data from:", url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

async function getSingleGameDetails(appid) {
  const url = `https://steam-api-dot-cs-platform-306304.et.r.appspot.com/single-game/${appid}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const gameDetails = await response.json();
    displaySingleGameDetails(gameDetails);
  } catch (error) {
    console.error("Error fetching single game details:", error);
  }
}

function displaySingleGameDetails(input) {
  const gamesContainer = document.getElementById("gamesContainer");
  const gameDetails = input.data;
  gamesContainer.innerHTML = "";

  const gameDetailsDiv = document.createElement("div");
  gameDetailsDiv.innerHTML = `
    <h2>${gameDetails.name}</h2>
    <p>Release Date: ${new Date(gameDetails.release_date).toDateString()}</p>
    <p>Genres: ${
      Array.isArray(gameDetails.genres) ? gameDetails.genres.join(", ") : ""
    }</p>
    <p>Categories: ${
      Array.isArray(gameDetails.categories)
        ? gameDetails.categories.join(", ")
        : ""
    }</p>
    <p>Steamspy Tags: ${
      Array.isArray(gameDetails.steamspy_tags)
        ? gameDetails.steamspy_tags.join(", ")
        : ""
    }</p>
    <p>Price: $${gameDetails.price}</p>
    <p>Description: ${gameDetails.description}</p>
  `;
  gamesContainer.appendChild(gameDetailsDiv);
}
function displayGames(games) {
  const gamesContainer = document.getElementById("gamesContainer");
  gamesContainer.innerHTML = ""; // Clear the previous content

  games.forEach((gameCard) => {
    const gameDiv = document.createElement("div");
    gameDiv.className = "gameCard";
    gameDiv.dataset.appid = gameCard.appid;
    gameDiv.innerHTML = `
      <img src="${gameCard.header_image}" alt="${gameCard.name}">
      <h2>${gameCard.name}</h2>
      <p>Price: $${gameCard.price}</p>
    `;
    gameDiv.addEventListener("click", () =>
      getSingleGameDetails(gameCard.appid)
    );
    gamesContainer.appendChild(gameDiv);
  });

  if (games.length < totalGames) {
    // If not all games are displayed, consider fetching more or all games
    // You might implement pagination or infinite scroll based on your requirements
  }
}

function displayGenres(genres) {
  const genresContainer = document.getElementById("genresContainer");
  genresContainer.innerHTML = "";

  genres.forEach((genre) => {
    const genreButton = document.createElement("button");
    genreButton.textContent = genre.name;
    genreButton.addEventListener("click", () => filterByGenre(genre.name));
    genresContainer.appendChild(genreButton);
  });
}

function displayFeaturedGames(featuredGames) {
  const gamesContainer = document.getElementById("gamesContainer");
  gamesContainer.innerHTML = "";

  featuredGames.forEach((game) => {
    const gameDiv = document.createElement("div");
    gameDiv.className = "gameCard";
    gameDiv.innerHTML = `
      <img src="${game.header_image}" alt="${game.name}">
      <h2>${game.name}</h2>
      <p>Release Date: ${new Date(game.release_date).toDateString()}</p>
      <p>Genres: ${game.genres.join(", ")}</p>
    `;

    gameDiv.addEventListener("click", () => getSingleGameDetails(game.appid));
    gamesContainer.appendChild(gameDiv);
  });
}

const genresContainer = document.getElementById("genresContainer");

const genres = [
  "Action",
  "Free to Play",
  "Strategy",
  "Adventure",
  "Indie",
  "RPG",
  "Animation & Modeling",
  "Video Production",
  "Casual",
  "Simulation"
];

genres.forEach((genre) => {
  const genreButton = document.createElement("button");
  genreButton.textContent = genre;
  genreButton.classList.add("genreButton");

  genreButton.addEventListener("click", () => {
    // Reset color for all buttons
    document.querySelectorAll(".genreButton").forEach((button) => {
      button.style.backgroundColor = "#007bff";
    });

    // Change color for the clicked button
    genreButton.style.backgroundColor = "#e0a800";

    // Call your filterByGenre function with the selected genre
    filterByGenre(genre);
  });

  genresContainer.appendChild(genreButton);
});
