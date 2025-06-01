document.addEventListener("DOMContentLoaded", function () {
    // Handle search form submission globally
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");
    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const newQuery = searchInput.value.trim();
            if (newQuery) {
                // Detect current folder and build correct relative path
                let searchPage = "search/search.html";
                if (window.location.pathname.includes("/search/")) {
                    searchPage = "search.html";
                } else if (window.location.pathname.includes("/details/")) {
                    searchPage = "../search/search.html";
                }
                window.location.href = searchPage + "?q=" + encodeURIComponent(newQuery);
            }
        });
    }

    // Only run the search results logic if on the search results page
    const searchQueryElement = document.getElementById("search-query");
    const resultsList = document.getElementById("results-list");
    if (!searchQueryElement || !resultsList) return;

    const apiKey = "3e438c22468d9f184bc856928eece3b2";
    const urlParams = new URLSearchParams(window.location.search);
    let query = urlParams.get("q");

    if (!query || query.trim() === "") {
        searchQueryElement.textContent = "No search query entered.";
        return;
    }

    searchQueryElement.textContent = query;

    fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            resultsList.innerHTML = "";

            if (data.results.length > 0) {
                data.results.forEach(item => {
                    const li = document.createElement("li");
                    const title = item.title || item.name;
                    const rating = item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}` : "No rating";
                    const defaultPersonImage = "../ressources/placeholder-person.svg";
                    const defaultMovieImage = "../ressources/placeholder-movie.svg";
                    
                    let imageUrl = item.poster_path || item.profile_path 
                        ? `https://image.tmdb.org/t/p/w200${item.poster_path || item.profile_path}` 
                        : item.media_type === "person" ? defaultPersonImage : defaultMovieImage;
                    
                    let type = item.media_type;

                    const displayRating = type !== "person" ? `<br>${rating}` : "";
                    
                    li.innerHTML = `
                        <a href="../details/details.html?id=${item.id}&type=${type}">
                        <img src="${imageUrl}" alt="${title}">
                        </a>
                        <br>
                        <a href="../details/details.html?id=${item.id}&type=${type}">${title}${displayRating}</a>
                        `;

                    resultsList.appendChild(li);
                });
            } else {
                resultsList.innerHTML = "<p>No results found.</p>";
            }
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        });
});




