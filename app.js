const generateBtn = document.getElementById("generateBtn");
const factCard = document.getElementById("factCard");
const factText = document.getElementById("factText");
const catImage = document.getElementById("catImage");
const saveBtn = document.getElementById("saveBtn");
const savedFactsContainer = document.getElementById("savedFacts");
const themeToggle = document.getElementById("themeToggle");
const meowBtn = document.getElementById("meowBtn");
const meowSound = document.getElementById("meowSound");

const FACT_API = "https://catfact.ninja/fact";
const IMAGE_API = "https://api.thecatapi.com/v1/images/search";

let currentFact = "";

generateBtn.addEventListener("click", async () => {
  generateBtn.innerText = "Loading 😺...";
  const factRes = await fetch(FACT_API);
  const factData = await factRes.json();

  const imgRes = await fetch(IMAGE_API);
  const imgData = await imgRes.json();

  currentFact = factData.fact;
  factText.innerText = currentFact;
  catImage.src = imgData[0].url;

  factCard.classList.remove("hidden");

  generateBtn.innerText = "🐱 Show Another Fact";
});

saveBtn.addEventListener("click", () => {
  if (!currentFact) return;

  const saved = JSON.parse(localStorage.getItem("catFacts")) || [];
  saved.push(currentFact);
  localStorage.setItem("catFacts", JSON.stringify(saved));
  renderSavedFacts();
});

function renderSavedFacts() {
  const saved = JSON.parse(localStorage.getItem("catFacts")) || [];
  savedFactsContainer.innerHTML = "";

  saved.forEach(fact => {
    const div = document.createElement("div");
    div.classList.add("saved-card");
    div.innerText = fact;
    savedFactsContainer.appendChild(div);
  });
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

meowBtn.addEventListener("click", () => {
  meowSound.play();
});

renderSavedFacts();
