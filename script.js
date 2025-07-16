document.addEventListener("DOMContentLoaded", () => {
  // --- Sökmotorer ---
  const engines = {
    ddg: { name: "DuckDuckGo", icon: "img/ddg.png", url: "https://duckduckgo.com/?q=" },
    google: { name: "Google", icon: "img/google.png", url: "https://www.google.com/search?q=" },
    searx: { name: "Searx", icon: "img/searx.png", url: "https://searx.be/search?q=" }
  };

  let currentEngine = engines.ddg;

  const searchInput = document.getElementById("search");
  const engineIcon = document.getElementById("engine-icon");

  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      window.location.href = currentEngine.url + encodeURIComponent(searchInput.value);
    }
  });

  engineIcon.addEventListener("click", () => {
    const keys = Object.keys(engines);
    const currentIndex = keys.findIndex(key => engines[key] === currentEngine);
    const nextKey = keys[(currentIndex + 1) % keys.length];
    currentEngine = engines[nextKey];
    engineIcon.src = currentEngine.icon;
  });

  // --- Inställningar toggle ---
  const settingsToggle = document.getElementById("settings-toggle");
  const settingsPanel = document.getElementById("settings");

  settingsToggle.addEventListener("click", () => {
    settingsPanel.classList.toggle("active");
  });

  // --- Bakgrundsbild: uppladdning ---
  const uploadInput = document.getElementById("upload");

  uploadInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      setBackground(e.target.result);
      localStorage.setItem("hauklabBackground", e.target.result);
    };
    reader.readAsDataURL(file);
  });

  // --- Bakgrundsbild: välj från mapp ---
  const folderPicker = document.getElementById("folder-picker");
  const gallery = document.getElementById("image-gallery");

  folderPicker.addEventListener("change", e => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
    gallery.innerHTML = "";

    files.forEach(file => {
      const img = document.createElement("img");
      const reader = new FileReader();
      reader.onload = e => {
        img.src = e.target.result;
        img.style.cursor = "pointer";
        img.addEventListener("click", () => {
          setBackground(e.target.result);
          localStorage.setItem("hauklabBackground", e.target.result);
        });
        gallery.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });

  // --- Sätt bakgrund ---
  function setBackground(imageData) {
    document.body.style.backgroundImage = `url('${imageData}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
  }

  // --- Ladda sparad bakgrund ---
  const savedBg = localStorage.getItem("hauklabBackground");
  if (savedBg) setBackground(savedBg);

  // --- Favoriter ---
  const favForm = document.getElementById("add-fav-form");
  const favList = document.getElementById("fav-list");

  // Hämta favicon via Google service baserat på URL
  function getFaviconUrl(url) {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?sz=32&domain=${domain}`;
    } catch {
      return "img/default-favicon.png"; // fallback om URL är ogiltig
    }
  }

  function renderFavs() {
    const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
    favList.innerHTML = "";

    favs.forEach((fav, i) => {
      const item = document.createElement("div");
      item.className = "fav-item";

      const favicon = document.createElement("img");
      favicon.src = getFaviconUrl(fav.url);
      favicon.alt = "";
      favicon.className = "fav-icon";

      const link = document.createElement("a");
      link.href = fav.url;
      link.textContent = fav.name;
      link.className = "favorite-link";
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "✕";
      removeBtn.className = "remove-fav";
      removeBtn.title = "Ta bort";
      removeBtn.onclick = () => {
        favs.splice(i, 1);
        localStorage.setItem("favorites", JSON.stringify(favs));
        renderFavs();
      };

      item.appendChild(favicon);
      item.appendChild(link);
      item.appendChild(removeBtn);
      favList.appendChild(item);
    });
  }

  if (favForm && favList) {
    favForm.addEventListener("submit", e => {
      e.preventDefault();
      const name = document.getElementById("fav-name").value.trim();
      const url = document.getElementById("fav-url").value.trim();
      if (!name || !url) return;

      const favs = JSON.parse(localStorage.getItem("favorites") || "[]");
      favs.push({ name, url });
      localStorage.setItem("favorites", JSON.stringify(favs));
      favForm.reset();
      renderFavs();
    });

    renderFavs();
  }
});
