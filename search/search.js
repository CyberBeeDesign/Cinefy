document.addEventListener("DOMContentLoaded", function () {
    const searchQueryElement = document.getElementById("search-query");
    if (!searchQueryElement) return; // Stop execution if the search bar doesn't exist

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
            const resultsList = document.getElementById("results-list");
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




