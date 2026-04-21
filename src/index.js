const form = document.getElementById("searchForm");
const input = document.getElementById("wordInput");
const results = document.getElementById("results");
const message = document.getElementById("message");
const favoritesList = document.getElementById("favoritesList");
const themeBtn = document.getElementById("themeBtn");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

renderFavorites();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const word = input.value.trim();

  if (!word) {
    showMessage("Please enter a word.", "error");
    return;
  }

  fetchWord(word);
});

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

async function fetchWord(word) {
  results.innerHTML = "";
  showMessage("Loading...", "success");

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );

    if (!response.ok) {
      throw new Error("Word not found.");
    }

    const data = await response.json();

    displayWord(data[0]);
    input.value = "";
    showMessage("Word loaded successfully.", "success");

  } catch (error) {
    showMessage(error.message, "error");
  }
}

function displayWord(data) {
  results.innerHTML = "";

  const word = data.word;
  const phonetic = data.phonetic || "No pronunciation available";

  const meaning = data.meanings[0];
  const partOfSpeech = meaning.partOfSpeech;
  const definition = meaning.definitions[0].definition;
  const example =
    meaning.definitions[0].example || "No example available.";

  const synonyms = meaning.synonyms || [];

  const audio = data.phonetics.find(item => item.audio)?.audio;

  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <h2>${word}</h2>
    <p><strong>Pronunciation:</strong> ${phonetic}</p>
    <p><strong>Part of Speech:</strong> ${partOfSpeech}</p>
    <p><strong>Definition:</strong> ${definition}</p>
    <p><strong>Example:</strong> ${example}</p>

    <div class="synonyms">
      <strong>Synonyms:</strong>
      ${
        synonyms.length
          ? synonyms.map(syn => `<span>${syn}</span>`).join("")
          : " None available"
      }
    </div>

    ${
      audio
        ? `
        <audio controls>
          <source src="${audio}" type="audio/mpeg">
        </audio>
        `
        : "<p>No audio available.</p>"
    }

    <br><br>
    <button id="saveBtn">Save Favorite</button>
  `;

  results.appendChild(card);

  document.getElementById("saveBtn").addEventListener("click", () => {
    saveFavorite(word);
  });
}

function showMessage(text, type) {
  message.innerHTML = `<p class="${type}">${text}</p>`;
}

function saveFavorite(word) {
  if (!favorites.includes(word)) {
    favorites.push(word);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
  }
}

function renderFavorites() {
  favoritesList.innerHTML = "";

  favorites.forEach((word) => {
    const li = document.createElement("li");
    li.className = "favorite-item";

    li.innerHTML = `
      <span class="favorite-word">${word}</span>
      <button onclick="removeFavorite('${word}')">Remove</button>
    `;

    li.querySelector(".favorite-word").addEventListener("click", () => {
      fetchWord(word);
    });

    favoritesList.appendChild(li);
  });
}

function removeFavorite(word) {
  favorites = favorites.filter(item => item !== word);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

window.removeFavorite = removeFavorite;