document.addEventListener("DOMContentLoaded", function () {
    const apiKey = "3e438c22468d9f184bc856928eece3b2";
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get("id");
    const itemType = urlParams.get("type");

    if (!itemId || !itemType) {
        document.getElementById("details-container").innerHTML = "<p>Invalid request.</p>";
        return;
    }

    const apiUrl = `https://api.themoviedb.org/3/${itemType}/${itemId}?api_key=${apiKey}&append_to_response=videos,credits,movie_credits,tv_credits`;

    console.log("Fetching data from:", apiUrl); // Debugging: Check API URL

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("API Response Data:", data); // Debugging: Check API response

            if (!data || data.success === false) {
                document.getElementById("details-container").innerHTML = "<p>No data found.</p>";
                return;
            }

            // Set Title & Overview
            const title = data.name || data.title || "No Title Available";
            const displayTitle = itemType === "tv" ? `${title} (TV-show)` : title;
            document.getElementById("title").textContent = displayTitle;
            document.getElementById("overview").textContent = data.overview || "No description available.";

            // Set Poster
            const posterUrl = data.poster_path 
                ? `https://image.tmdb.org/t/p/w300${data.poster_path}` 
                : data.profile_path 
                ? `https://image.tmdb.org/t/p/w300${data.profile_path}` 
                : itemType === "person" 
                ? "../ressources/placeholder-person.svg" 
                : "../ressources/placeholder-movie.svg";

            const posterElement = document.getElementById("poster");
            if (posterElement) posterElement.src = posterUrl;

            if (itemType === "movie" || itemType === "tv") {
                // Display Review
                const reviewElement = document.getElementById("review");
                if (reviewElement) {
                    reviewElement.textContent = data.vote_average 
                        ? `⭐ ${data.vote_average.toFixed(1)}/10` 
                        : "No rating available";
                }

                // Handle Trailer Button
                const trailerBtn = document.getElementById("trailer-btn");
                if (trailerBtn) {
                    const trailer = data.videos?.results?.find(video => video.type === "Trailer");
                    if (trailer) {
                        trailerBtn.onclick = () => window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank");
                    } else {
                        trailerBtn.style.display = "none";
                    }
                }

                // **CAST SECTION**
                const castList = document.getElementById("cast-list");
                if (castList) {
                    castList.innerHTML = ""; // Clear any previous content

                    if (data.credits?.cast?.length > 0) {
                        const defaultPersonImage = "../ressources/placeholder-person.svg";

                        data.credits.cast.slice(0, 6).forEach(actor => {
                            const actorImage = actor.profile_path
                                ? `https://image.tmdb.org/t/p/w92${actor.profile_path}`
                                : defaultPersonImage;

                            const li = document.createElement("li");

                            // Wrap everything in a clickable <a> tag
                            li.innerHTML = `
                                <a href="details.html?id=${actor.id}&type=person" class="cast-item">
                                    <img src="${actorImage}" alt="${actor.name}" class="cast-photo">
                                    <div class="cast-info">
                                        <span class="cast-name">${actor.name}</span><br>
                                        <span class="cast-character">${actor.character}</span>
                                    </div>
                                </a>
                            `;

                            castList.appendChild(li);
                        });
                    } else {
                        castList.innerHTML = "<p>No cast information available.</p>";
                    }
                }

                // Hide filmography section for movies and tv shows
                const filmographySection = document.getElementById("filmography-title");
                if (filmographySection) filmographySection.style.display = "none";


            } else if (itemType === "person") {
                // Display Biography for persons
                const bioElement = document.getElementById("overview");
                if (bioElement) bioElement.textContent = data.biography || "No biography available.";

                const trailerBtn = document.getElementById("trailer-btn");
                if (trailerBtn) trailerBtn.style.display = "none";

                // Display Filmography (Movies + TV Shows)
                const filmographyList = document.getElementById("filmography");
                if (filmographyList) {

                    const defaultMovieImage = "../ressources/placeholder-movie.svg";

                    // Combine Movies & TV Shows
                    let allCredits = [];
                    if (data.movie_credits?.cast?.length > 0) {
                        allCredits = allCredits.concat(data.movie_credits.cast);
                    }
                    if (data.tv_credits?.cast?.length > 0) {
                        allCredits = allCredits.concat(data.tv_credits.cast);
                    }

                    // Sort by Release Date (newest first)
                    const sortedCredits = allCredits
                        .filter(item => item.release_date || item.first_air_date) // Ensure it has a date
                        .sort((a, b) => {
                            const dateA = new Date(a.release_date || a.first_air_date);
                            const dateB = new Date(b.release_date || b.first_air_date);
                            return dateB - dateA;
                        });

                    if (sortedCredits.length > 0) {
                        sortedCredits.forEach(item => {
                            const posterUrl = item.poster_path
                                ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
                                : defaultMovieImage;

                            const releaseYear = item.release_date
                                ? item.release_date.split("-")[0]
                                : item.first_air_date
                                ? item.first_air_date.split("-")[0]
                                : "N/A";

                            const type = item.media_type || (item.first_air_date ? "tv" : "movie");
                            const title = item.title || item.name; // Movies use 'title', TV shows use 'name'
                            const markedTitle = type === "tv" ? `${title} (TV-show)` : title;

                            const li = document.createElement("li");

                            // Wrap everything in a clickable <a> tag
                            li.innerHTML = `
                                <a href="details.html?id=${item.id}&type=${type}" class="filmography-item">
                                    <img src="${posterUrl}" alt="${title}" class="filmography-poster">
                                    <div class="filmography-info">
                                        <span class="filmography-title">${markedTitle}</span><br>
                                        <span class="filmography-release">${releaseYear}</span><br>
                                        <span class="filmography-rating">⭐ ${item.vote_average ? item.vote_average.toFixed(1) : "N/A"}</span>
                                    </div>
                                </a>
                            `;
                            filmographyList.appendChild(li);
                        });
                    } else {
                        filmographyList.innerHTML += "<p>No filmography available.</p>";
                    }
                }

                // Hide cast section for persons
                const castSection = document.getElementById("cast-title");
                if (castSection) castSection.style.display = "none";
            }
        })
        .catch(error => {
            console.error("Error fetching details:", error);
            document.getElementById("details-container").innerHTML = `<p>Error loading details. ${error.message}</p>`;
        });
});
