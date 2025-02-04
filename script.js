
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


//caroussel Trending
document.addEventListener("DOMContentLoaded", function () {
    const apiKey = "3e438c22468d9f184bc856928eece3b2";

    // Fetch and display trending movies & TV shows
    fetchTrending("movie", "trend-movie");
    fetchTrending("tv", "trend-tvshows");

    function fetchTrending(type, containerId) {
        fetch(`https://api.themoviedb.org/3/trending/${type}/week?api_key=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                if (data.results.length === 0) return;

                // Get only the first 18 items
                const trendingItems = data.results.slice(0, 18);
                createCarousel(trendingItems, containerId, type);
            })
            .catch(error => console.error(`Error fetching trending ${type}:`, error));
    }

    function createCarousel(items, containerId, type) {
        const container = document.getElementById(containerId);
        if (!container) return;
    
        // Create carousel structure
        container.innerHTML = `
            <div class="carousel">
                <button class="prev-btn">&lt;</button>
                <div class="carousel-track"></div>
                <button class="next-btn">&gt;</button>
            </div>
        `;
    
        const track = container.querySelector(".carousel-track");
        let slides = [];
    
        // Create 3 slides with 6 items each
        for (let i = 0; i < 3; i++) {
            const slide = document.createElement("div");
            slide.classList.add("carousel-slide");
            items.slice(i * 6, (i + 1) * 6).forEach(item => {
                const card = createCard(item, type); // Get the card DOM element
                slide.appendChild(card); // Append the card to the slide
            });
            slides.push(slide);
            track.appendChild(slide);
        }
    
        // Handle carousel navigation
        let currentIndex = 0;
        const prevBtn = container.querySelector(".prev-btn");
        const nextBtn = container.querySelector(".next-btn");
    
        function updateCarousel() {
            track.style.transform = `translateX(-${currentIndex * (100 / 3 - 0.35)}%)`; 
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
    
        function createCard(item, type) {
            const card = document.createElement('div');
            card.classList.add("trend-card");
            const posterUrl = item.poster_path
                ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                : "./ressources/placeholder-movie.svg";
    
            const rating = item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}` : "No rating";
    
            const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(item.title || item.name + " trailer")}`;
    
            const detailsUrl = `details/details.html?id=${item.id}&type=${encodeURIComponent(type)}`;
    
            card.innerHTML = `
                <img src="${posterUrl}" alt="${item.title || item.name}">
                <div class="title-rating">
                    <h3>${item.title || item.name}</h3>
                    <p>${rating}</p>
                </div>
                <a href="${trailerUrl}" target="_blank" class="trailer-btn" onclick="event.stopPropagation();"><img src="./ressources/play-button-arrowhead.png" alt="play">Trailer</a>
            `;
    
            // Handle redirection when card is clicked
            card.addEventListener("click", function() {
                window.location.href = detailsUrl;
            });
    
            return card; // Return the actual DOM element
        }        
    }
    
    
});
