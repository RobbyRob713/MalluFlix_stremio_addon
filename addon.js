const { addonBuilder } = require("stremio-addon-sdk");
const axios = require("axios");

const TMDB_KEY = process.env.TMDB_KEY;
const RPDB_KEY = process.env.RPDB_KEY;

const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 1 day in ms

async function getTmdbData(url, params) {
    try {
        const cacheKey = url + JSON.stringify(params);
        const cached = cache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
            return cached.data;
        }

        const res = await axios.get(url, { params });
        cache.set(cacheKey, { data: res.data, timestamp: Date.now() });
        
        // Cleanup old cache entries occasionally
        if (cache.size > 1000) {
            const now = Date.now();
            for (const [key, value] of cache.entries()) {
                if (now - value.timestamp > CACHE_DURATION) {
                    cache.delete(key);
                }
            }
        }
        
        return res.data;
    } catch (error) {
        console.error(`TMDB API Error: ${error.message}`);
        return null;
    }
}

const manifest = {
    id: "metaverse",
    version: "1.0.0",
    name: "Metaverse",
    description: "The only Metadata addon for stremio",
    logo: "https://forzayt.github.io/Metaverse_Stremio_Addon/images/logo.png",
    resources: ["catalog", "meta"],
    types: ["movie", "series"],
    catalogs: [
        {
            type: "movie",
            id: "popular_movies",
            name: "Metaverse Popular",
            posterShape: "landscape",
            extra: [{ name: "search" }, { name: "skip" }]
        },
        {
            type: "series",
            id: "popular_series",
            name: "Metaverse Popular",
            extra: [{ name: "search" }, { name: "skip" }]
        },
       
        {
            type: "movie",
            id: "netflix_movies",
            name: "Metaverse Netflix",
            extra: [{ name: "search" }, { name: "skip" }]
        },
        {
            type: "series",
            id: "netflix_series",
            name: "Metaverse Netflix",
            extra: [{ name: "search" }, { name: "skip" }]
        },
        {
            type: "movie",
            id: "prime_movies",
            name: "Metaverse Prime Video",
            extra: [{ name: "search" }, { name: "skip" }]
        },
        {
            type: "series",
            id: "prime_series",
            name: "Metaverse Prime Video",
            extra: [{ name: "search" }, { name: "skip" }]
        },
        {
            type: "movie",
            id: "apple_movies",
            name: "Metaverse Apple TV+",
            extra: [{ name: "search" }, { name: "skip" }]
        },
        {
            type: "series",
            id: "apple_series",
            name: "Metaverse Apple TV+",
            extra: [{ name: "search" }, { name: "skip" }]
        },
         {
            type: "movie",
            id: "marvel_movies",
            name: "Metaverse Marvel",
            extra: [{ name: "search" }, { name: "skip" }]
        },
        {
            type: "movie",
            id: "dc_movies",
            name: "Metaverse DC",
            extra: [{ name: "search" }, { name: "skip" }]
        },
        {
            type: "movie",
            id: "hulu_movies",
            name: "Metaverse Hulu",
            extra: [{ name: "search" }, { name: "skip" }]
        },
        {
            type: "series",
            id: "hulu_series",
            name: "Metaverse Hulu",
            extra: [{ name: "search" }, { name: "skip" }]
        },
        {
            type: "movie",
            id: "sony_movies",
            name: "Metaverse SonyLIV",
            extra: [{ name: "search" }, { name: "skip" }]
        },
        {
            type: "series",
            id: "sony_series",
            name: "Metaverse SonyLIV",
            extra: [{ name: "search" }, { name: "skip" }]
        },
        {
            type: "movie",
            id: "zee_movies",
            name: "Metaverse Zee5",
            extra: [{ name: "search" }, { name: "skip" }]
        },
        {
            type: "series",
            id: "zee_series",
            name: "Metaverse Zee5",
            extra: [{ name: "search" }, { name: "skip" }]
        },
        {
            type: "movie",
            id: "metaverse_catalog",
            name: "Metaverse Malayalam",
            extra: [{ name: "search" }, { name: "skip" }]
        },
        {
            type: "movie",
            id: "tamil_movies",
            name: "Metaverse Tamil",
            extra: [{ name: "search" }, { name: "skip" }]
        },
        {
            type: "movie",
            id: "hindi_movies",
            name: "Metaverse Hindi",
            extra: [{ name: "search" }, { name: "skip" }]
        }
    ],
    idPrefixes: ["tt"]
};

const builder = new addonBuilder(manifest);

/* Convert TMDB → Detailed Metadata */
async function getTmdbDetails(tmdbId, type = "movie") {
    try {
        const endpoint = type === "movie" ? "movie" : "tv";
        return await getTmdbData(`https://api.themoviedb.org/3/${endpoint}/${tmdbId}`, {
            api_key: TMDB_KEY,
            append_to_response: "external_ids"
        });
    } catch {
        return null;
    }
}

/* Malayalam Catalog */
builder.defineCatalogHandler(async ({ type, id, extra }) => {
    if (type !== "movie" && type !== "series") return { metas: [] };

    const skip = extra?.skip ? parseInt(extra.skip) : 0;
    const page = Math.round(skip / 20) + 1;
    const today = new Date().toISOString().split('T')[0];

    let results = [];

    if (extra?.search) {
        // Handle search
        const endpoint = type === "movie" ? "movie" : "tv";
        const data = await getTmdbData(`https://api.themoviedb.org/3/search/${endpoint}`, {
            api_key: TMDB_KEY,
            query: extra.search,
            page: 1
        });
        results = data.results || [];
    } else if (id === "popular_movies") {
        // Fetch Popular Movies
        const promises = [page, page + 1].map(p =>
            getTmdbData("https://api.themoviedb.org/3/movie/popular", {
                api_key: TMDB_KEY,
                page: p
            })
        );
        const responses = await Promise.all(promises);
        results = responses.filter(r => r !== null).flatMap(r => r.results || []);
    } else if (id === "popular_series") {
        // Fetch Popular Series
        const promises = [page, page + 1].map(p =>
            getTmdbData("https://api.themoviedb.org/3/tv/popular", {
                api_key: TMDB_KEY,
                page: p
            })
        );
        const responses = await Promise.all(promises);
        results = responses.filter(r => r !== null).flatMap(r => r.results || []);
    } else if (id === "marvel_movies") {
        // Fetch Marvel Movies
        const data = await getTmdbData("https://api.themoviedb.org/3/discover/movie", {
            api_key: TMDB_KEY,
            with_companies: 420,
            sort_by: "primary_release_date.desc",
            page: page
        }) || {};
        results = data.results || [];
    } else if (id === "dc_movies") {
        // Fetch DC Movies
        const data = await getTmdbData("https://api.themoviedb.org/3/discover/movie", {
            api_key: TMDB_KEY,
            with_companies: "9993|128066",
            sort_by: "primary_release_date.desc",
            page: page
        }) || {};
        results = data.results || [];
    } else if (id === "netflix_movies" || id === "netflix_series" || 
               id === "prime_movies" || id === "prime_series" || 
               id === "apple_movies" || id === "apple_series" || 
               id === "hulu_movies" || id === "hulu_series" ||
               id === "sony_movies" || id === "sony_series" ||
               id === "zee_movies" || id === "zee_series") {
        
        const providerIds = {
            netflix: 8,
            prime: "119|9",
            apple: 350,
            hulu: 15,
            sony: 237,
            zee: 232
        };

        const providerKey = id.split("_")[0];
        const providerId = providerIds[providerKey];
        const region = providerKey === "hulu" ? "US" : "IN";
        const endpoint = type === "movie" ? "discover/movie" : "discover/tv";

        const data = await getTmdbData(`https://api.themoviedb.org/3/${endpoint}`, {
            api_key: TMDB_KEY,
            with_watch_providers: providerId,
            watch_region: region,
            with_watch_monetization_types: "flatrate|free|ads",
            sort_by: "popularity.desc",
            page: page
        }) || {};
        results = data.results || [];
    } else if (id === "metaverse_catalog" || id === "tamil_movies" || id === "hindi_movies") {
        const languages = {
            "metaverse_catalog": "ml",
            "tamil_movies": "ta",
            "hindi_movies": "hi"
        };
        const lang = languages[id];
        // Fetch 3 pages to ensure sufficient content
        const promises = [page, page + 1, page + 2].map(p =>
            getTmdbData("https://api.themoviedb.org/3/discover/movie", {
                api_key: TMDB_KEY,
                with_original_language: lang,
                "primary_release_date.lte": today,
                sort_by: "primary_release_date.desc",
                page: p
            })
        );

        const responses = await Promise.all(promises);
        results = responses.filter(r => r !== null).flatMap(r => r.results || []);
    } else {
        return { metas: [] };
    }

    // Process items in chunks to avoid hitting API rate limits (429)
    const batchSize = 5;
    const validMetas = [];

    for (let i = 0; i < results.length; i += batchSize) {
        const chunk = results.slice(i, i + batchSize);
        const chunkPromises = chunk.map(async (m) => {
            const details = await getTmdbDetails(m.id, type);
            if (!details || !details.external_ids || !details.external_ids.imdb_id) return null;

            const imdb = details.external_ids.imdb_id;
            const releaseDate = details.release_date || details.first_air_date || "";
            const year = releaseDate ? releaseDate.split("-")[0] : "";
            const rating = details.vote_average ? details.vote_average.toFixed(1) : null;
            const genres = details.genres ? details.genres.map(g => g.name) : [];
            const runtime = details.runtime || (details.episode_run_time ? details.episode_run_time[0] : null);

            const tmdbPoster = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null;
            const rpdbPoster = imdb ? `https://api.ratingposterdb.com/${RPDB_KEY}/imdb/poster-default/${imdb}.jpg?fallback=true` : tmdbPoster;

            return {
                id: imdb,
                type: type,
                name: details.title || details.name,
                poster: rpdbPoster || tmdbPoster,
                background: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null,
                description: details.overview,
                releaseInfo: year,
                imdbRating: rating,
                genres: genres,
                runtime: runtime ? `${runtime} min` : null,
                links: rating ? [{
                    name: `★ ${rating}`,
                    category: "label",
                    url: `https://www.themoviedb.org/${type === "movie" ? "movie" : "tv"}/${details.id}`
                }] : []
            };
        });

        const chunkResults = await Promise.all(chunkPromises);
        validMetas.push(...chunkResults.filter(m => m !== null));
    }

    return { metas: validMetas };
});

/* Cinemeta Metadata */
builder.defineMetaHandler(async ({ type, id }) => {
    if (type !== "movie" && type !== "series") return { meta: null };

    try {
        const res = await axios.get(
            `https://v3-cinemeta.strem.io/meta/${type}/${id}.json`
        );
        const meta = res.data.meta;
        if (meta && id.startsWith('tt')) {
            const cinemetaPoster = meta.poster;
            meta.poster = `https://api.ratingposterdb.com/${RPDB_KEY}/imdb/poster-default/${id}.jpg?fallback=true`;
            // Fallback to cinemeta poster if RPDB URL generation failed (unlikely given it's a string template)
            meta.poster = meta.poster || cinemetaPoster;
        }
        return { meta };
    } catch (error) {
        console.error(`Meta Handler Error: ${error.message}`);
        return { meta: null };
    }
});

module.exports = builder.getInterface();
