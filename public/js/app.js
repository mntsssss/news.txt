// Получаем элементы со страницы
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const newsContainer = document.getElementById("newsContainer");
const savedContainer = document.getElementById("savedContainer");
const newsTab = document.getElementById("newsTab");
const favoritesTab = document.getElementById("favoritesTab");
const newsSection = document.getElementById("newsSection");
const favoritesSection = document.getElementById("favoritesSection");

newsTab.addEventListener("click", () => {
    newsSection.style.display = "block";
    favoritesSection.style.display = "none";
    newsTab.classList.add("active");
    favoritesTab.classList.remove("active");
});

favoritesTab.addEventListener("click", () => {
    newsSection.style.display = "none";
    favoritesSection.style.display = "block";
    favoritesTab.classList.add("active");
    newsTab.classList.remove("active");
    renderSavedNews(); 
});


function getSavedNews() {
    const saved = localStorage.getItem("savedNews");
    return saved ? JSON.parse(saved) : [];
}

window.saveNews = function(articleJson) {
    let article;
    if (typeof articleJson === 'string') {
        article = JSON.parse(articleJson);
    } else {
        article = articleJson;
    }
    
    const saved = getSavedNews();
    
    const exists = saved.some(item => item.title === article.title);
    if (exists) {
        alert("Эта новость уже в избранном");
        return;
    }
    
    saved.push(article);
    localStorage.setItem("savedNews", JSON.stringify(saved));
    renderSavedNews();
    
    const msg = document.createElement("div");
    msg.textContent = "Сохранено в избранное";
    msg.style.position = "fixed";
    msg.style.bottom = "20px";
    msg.style.right = "20px";
    msg.style.background = "#00aa00";
    msg.style.color = "white";
    msg.style.padding = "10px 20px";
    msg.style.fontFamily = "monospace";
    msg.style.zIndex = "9999";
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
};

window.deleteNews = function(index) {
    const saved = getSavedNews();
    saved.splice(index, 1);
    localStorage.setItem("savedNews", JSON.stringify(saved));
    renderSavedNews();
};

function renderSavedNews() {
    const saved = getSavedNews();
    
    if (saved.length === 0) {
        savedContainer.innerHTML = '<div class="empty-state">⟲ NO SAVED ARTICLES YET</div>';
        return;
    }
    
    savedContainer.innerHTML = saved.map((article, index) => `
        <div class="article">
            <h3>${escapeHtml(article.title)}</h3>
            <p>${escapeHtml(article.description || "⤷ NO DESCRIPTION")}</p>
            <button class="delete-btn" onclick="deleteNews(${index})">🗑 DELETE</button>
        </div>
    `).join("");
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

searchBtn.addEventListener("click", async () => {
    const query = searchInput.value.trim();
    
    if (!query) {
        alert("⟡ ENTER SEARCH QUERY ⟡");
        return;
    }
    
    newsContainer.innerHTML = '<div class="loading">⟳ FETCHING NEWS...</div>';
    
    try {
        const res = await fetch(`/api/news?q=${encodeURIComponent(query)}`);
        
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }
        
        const articles = await res.json();
        
        if (!articles || articles.length === 0) {
            newsContainer.innerHTML = '<div class="empty-state">⟲ NO ARTICLES FOUND</div>';
            return;
        }
        
        newsContainer.innerHTML = articles.map(article => {
            const safeArticle = {
                title: article.title || "UNTITLED",
                description: article.description || "⤷ NO DESCRIPTION",
                url: article.url || "#"
            };
            return `
                <div class="article">
                    <h3>${escapeHtml(safeArticle.title)}</h3>
                    <p>${escapeHtml(safeArticle.description)}</p>
                    <button class="save-btn" onclick='saveNews(${JSON.stringify(safeArticle)})'>SAVE</button>
                    ${safeArticle.url !== "#" ? `<a href="${safeArticle.url}" target="_blank" style="color:#aaa; margin-left:10px; text-decoration:none;">READ</a>` : ''}
                </div>
            `;
        }).join("");
        
    } catch (error) {
        console.error(error);
        newsContainer.innerHTML = '<div class="empty-state">⚠ ERROR: CHECK CONSOLE OR API LIMIT</div>';
    }
});

searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchBtn.click();
    }
});

renderSavedNews();