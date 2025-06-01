//Search Bar
document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("search-form");

    searchForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent page reload

        const searchInput = document.getElementById("search-input").value.trim();

        if (searchInput) {
            // Redirect to search.html with query parameter
            window.location.href = `./search/search.html?q=${encodeURIComponent(searchInput)}`;
        }
    });
});


// Fetch and display trending movies & TV shows
document.addEventListener("DOMContentLoaded", function () {
    const apiKey = "3e438c22468d9f184bc856928eece3b2";

    // Fetch and display trending movies & TV shows
    fetchTrending("movie", "trend-movie");
    fetchTrending("tv", "trend-tvshows");

    // Fetch and display what's popular (Streaming & In Theater)
    fetchPopular("streaming", "streaming");
    fetchPopular("inTheaters", "inTheaters");

    function fetchTrending(type, containerId) {
        fetch(`https://api.themoviedb.org/3/trending/${type}/week?api_key=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                if (data.results.length === 0) return;
                const trendingItems = data.results.slice(0, 27); // <-- get up to 27 items
                createCarousel(trendingItems, containerId, type);
            })
            .catch(error => console.error(`Error fetching trending ${type}:`, error));
    }

    function fetchPopular(type, containerId) {
        let url;
        if (type === "streaming") {
            url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&watch_region=US&with_watch_monetization_types=flatrate`;
        } else if (type === "inTheaters") {
            url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}`;
        }
    
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.results.length === 0) return;
                const popularItems = data.results.slice(0, 27); // <-- get up to 27 items
                createCarousel(popularItems, containerId, "movie");  // <-- Pass "movie" as type
            })
            .catch(error => console.error(`Error fetching popular ${type}:`, error));
    }
    

    function createCarousel(items, containerId, type) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Always use 18 cards, fill with empty slots if needed
        const totalCards = 18;
        const cardsPerSlide = 6;
        const totalSlides = 3;

        // Ensure we have exactly 18 items (fill with null if less)
        const filledItems = items.slice(0, totalCards);
        while (filledItems.length < totalCards) {
            filledItems.push(null);
        }

        container.innerHTML = `
            <div class="carousel">
                <button class="prev-btn">&lt;</button>
                <div class="carousel-track"></div>
                <button class="next-btn">&gt;</button>
            </div>
        `;

        const track = container.querySelector(".carousel-track");
        let slides = [];

        for (let i = 0; i < totalSlides; i++) {
            const slide = document.createElement("div");
            slide.classList.add("carousel-slide");
            filledItems.slice(i * cardsPerSlide, (i + 1) * cardsPerSlide).forEach(item => {
                if (item) {
                    const card = createCard(item, type);
                    slide.appendChild(card);
                } else {
                    // Optional: add an empty placeholder for missing cards
                    const empty = document.createElement("div");
                    empty.classList.add("trend-card", "empty-card");
                    slide.appendChild(empty);
                }
            });
            slides.push(slide);
            track.appendChild(slide);
        }

        let currentIndex = 0;
        const prevBtn = container.querySelector(".prev-btn");
        const nextBtn = container.querySelector(".next-btn");

        function updateCarousel() {
            track.style.transform = `translateX(-${currentIndex * (100 / totalSlides)}%)`;
        }

        nextBtn.addEventListener("click", () => {
            if (currentIndex < slides.length - 1) {
                currentIndex++;
                updateCarousel();
            }
        });

        prevBtn.addEventListener("click", () => {
            if (currentIndex > 0) {  
                currentIndex--;
                updateCarousel();
            }
        });
    }

    function createCard(item, type) {
        const card = document.createElement('div');
        card.classList.add("trend-card");
    
        const posterUrl = item.poster_path
            ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
            : "./ressources/placeholder-movie.svg";
    
        const rating = item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}` : "No rating";
    
        const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(item.title || item.name + " trailer")}`;
    
        // Detect if it's a movie or TV show
        const detectedType = item.hasOwnProperty("title") ? "movie" : "tv";  
    
        const detailsUrl = `details/details.html?id=${item.id}&type=${encodeURIComponent(detectedType)}`;
    
        card.innerHTML = `
            <img src="${posterUrl}" alt="${item.title || item.name}">
            <div class="title-rating">
                <h3>${item.title || item.name}</h3>
                <p>${rating}</p>
            </div>
            <a href="${trailerUrl}" target="_blank" class="trailer-btn" onclick="event.stopPropagation();">
                <img src="./ressources/play-button-arrowhead.png" alt="play">Trailer
            </a>
        `;
    
        card.addEventListener("click", function () {
            window.location.href = detailsUrl;
        });
    
        return card;
    }          
});

