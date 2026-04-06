// ─── FREE API TOOL DEFINITIONS ────────────────────────────────────────────────
// All APIs here are completely free with no credit card required.

export const TOOLS = [
  {
    name: "get_weather",
    description: "Get current weather for any city. Use when user asks about weather, temperature, or conditions.",
    input_schema: {
      type: "object",
      properties: {
        city: { type: "string", description: "City name, e.g. 'London' or 'New York'" },
        country_code: { type: "string", description: "2-letter country code, e.g. 'GB' or 'US'" }
      },
      required: ["city"]
    }
  },
  {
    name: "search_youtube",
    description: "Search YouTube videos by query. Returns video titles, IDs, and channel info.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query for YouTube" },
        max_results: { type: "number", description: "Number of results, max 10", default: 5 }
      },
      required: ["query"]
    }
  },
  {
    name: "get_country_info",
    description: "Get information about any country: population, capital, currency, languages, etc.",
    input_schema: {
      type: "object",
      properties: {
        country: { type: "string", description: "Country name or code" }
      },
      required: ["country"]
    }
  },
  {
    name: "get_exchange_rates",
    description: "Get current currency exchange rates. Use when user asks about currency conversion or exchange rates.",
    input_schema: {
      type: "object",
      properties: {
        base: { type: "string", description: "Base currency code (e.g. USD, EUR, GBP)" },
        targets: {
          type: "array",
          items: { type: "string" },
          description: "Target currency codes to convert to"
        }
      },
      required: ["base"]
    }
  },
  {
    name: "calculate",
    description: "Perform mathematical calculations. Evaluates math expressions.",
    input_schema: {
      type: "object",
      properties: {
        expression: { type: "string", description: "Math expression to evaluate, e.g. '2 + 2 * 10'" }
      },
      required: ["expression"]
    }
  },
  {
    name: "get_random_fact",
    description: "Get a random interesting fact. Use when user wants to learn something new or asks for a fun fact.",
    input_schema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["science", "history", "geography", "animals", "general"],
          description: "Category of fact"
        }
      },
      required: []
    }
  }
];

// ─── TOOL EXECUTORS ────────────────────────────────────────────────────────────

export async function executeTool(name, input, apiKeys = {}) {
  switch (name) {
    case "get_weather":
      return await getWeather(input);
    case "search_youtube":
      return await searchYouTube(input, apiKeys.youtube);
    case "get_country_info":
      return await getCountryInfo(input);
    case "get_exchange_rates":
      return await getExchangeRates(input);
    case "calculate":
      return calculate(input);
    case "get_random_fact":
      return getRandomFact(input);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// Open-Meteo: 100% free, no API key needed
async function getWeather({ city, country_code }) {
  try {
    // Step 1: geocode
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();
    if (!geoData.results?.length) return { error: `City "${city}" not found` };

    const { latitude, longitude, name, country } = geoData.results[0];

    // Step 2: weather
    const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&wind_speed_unit=kmh&timezone=auto`;
    const wRes = await fetch(wUrl);
    const wData = await wRes.json();
    const c = wData.current;

    const codes = {
      0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Icy fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
      61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
      71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
      80: 'Slight showers', 81: 'Moderate showers', 82: 'Heavy showers',
      95: 'Thunderstorm', 99: 'Thunderstorm with hail'
    };

    return {
      city: name, country,
      temperature: `${c.temperature_2m}°C`,
      feels_like: `${c.apparent_temperature}°C`,
      condition: codes[c.weather_code] || 'Unknown',
      humidity: `${c.relative_humidity_2m}%`,
      wind: `${c.wind_speed_10m} km/h`
    };
  } catch (e) {
    return { error: `Weather fetch failed: ${e.message}` };
  }
}

// YouTube Data API v3: free quota 10,000 units/day
async function searchYouTube({ query, max_results = 5 }, apiKey) {
  if (!apiKey) {
    return {
      note: "YouTube API key not configured. Add your free YouTube Data API v3 key in Tool Panel settings.",
      demo_results: [
        { title: "Agentic AI Tutorial - Build Your First AI Agent", videoId: "dQw4w9WgXcQ", channel: "AI Dev Channel" },
        { title: "LangChain Full Course for Beginners", videoId: "dQw4w9WgXcQ", channel: "Tech With Tim" },
        { title: "AutoGPT Explained - Autonomous AI Agents", videoId: "dQw4w9WgXcQ", channel: "Fireship" }
      ]
    };
  }
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&maxResults=${max_results}&type=video&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) return { error: data.error.message };
    return {
      results: data.items.map(item => ({
        title: item.snippet.title,
        videoId: item.id.videoId,
        channel: item.snippet.channelTitle,
        description: item.snippet.description.slice(0, 120) + '...',
        thumbnail: item.snippet.thumbnails.medium.url
      }))
    };
  } catch (e) {
    return { error: `YouTube search failed: ${e.message}` };
  }
}

// RestCountries: completely free, no API key
async function getCountryInfo({ country }) {
  try {
    const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=false`);
    if (!res.ok) return { error: `Country "${country}" not found` };
    const [data] = await res.json();
    return {
      name: data.name.common,
      official_name: data.name.official,
      capital: data.capital?.[0] || 'N/A',
      population: data.population.toLocaleString(),
      region: data.region,
      subregion: data.subregion,
      languages: Object.values(data.languages || {}).join(', '),
      currencies: Object.entries(data.currencies || {}).map(([code, c]) => `${c.name} (${code})`).join(', '),
      area: `${data.area?.toLocaleString()} km²`,
      flag: data.flag
    };
  } catch (e) {
    return { error: `Country lookup failed: ${e.message}` };
  }
}

// ExchangeRate-API free tier: 1,500 requests/month free
async function getExchangeRates({ base, targets }) {
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base.toUpperCase()}`);
    const data = await res.json();
    if (data.result === 'error') return { error: data['error-type'] };
    const rates = {};
    if (targets?.length) {
      targets.forEach(t => { if (data.rates[t.toUpperCase()]) rates[t.toUpperCase()] = data.rates[t.toUpperCase()]; });
    } else {
      ['USD','EUR','GBP','JPY','AUD','CAD','CHF','INR','CNY','BRL'].forEach(t => {
        if (data.rates[t]) rates[t] = data.rates[t];
      });
    }
    return { base: base.toUpperCase(), rates, updated: data.time_last_update_utc };
  } catch (e) {
    return { error: `Exchange rate fetch failed: ${e.message}` };
  }
}

// Local calculation - no API needed
function calculate({ expression }) {
  try {
    // Safely evaluate math expressions
    const sanitized = expression.replace(/[^0-9+\-*/().%\s^]/g, '');
    if (!sanitized.trim()) return { error: 'Invalid expression' };
    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${sanitized})`)();
    if (typeof result !== 'number' || !isFinite(result)) return { error: 'Invalid result' };
    return { expression, result: result.toString(), formatted: result.toLocaleString() };
  } catch (e) {
    return { error: `Calculation failed: ${e.message}` };
  }
}

// Local facts database
function getRandomFact({ category = 'general' } = {}) {
  const facts = {
    science: [
      "A teaspoon of a neutron star weighs about 10 million tons.",
      "The human brain produces about 70,000 thoughts per day.",
      "Light takes 8 minutes 20 seconds to travel from the Sun to Earth.",
      "DNA contains about 3 billion base pairs in human cells.",
      "The speed of light in a vacuum is exactly 299,792,458 m/s."
    ],
    history: [
      "The Great Wall of China took over 1,000 years to build.",
      "Cleopatra lived closer in time to the Moon landing than to the construction of the Great Pyramid.",
      "Oxford University is older than the Aztec Empire.",
      "Woolly mammoths were alive when the Great Pyramid was being built.",
      "Nintendo was founded in 1889, originally making playing cards."
    ],
    geography: [
      "Canada has the most lakes of any country, with over 60% of the world's lakes.",
      "Russia spans 11 time zones.",
      "Australia is wider than the Moon.",
      "Mount Everest grows about 4mm taller every year.",
      "The Pacific Ocean is larger than all of Earth's land combined."
    ],
    animals: [
      "Octopuses have three hearts and blue blood.",
      "A group of flamingos is called a 'flamboyance'.",
      "Crows can recognize and remember human faces.",
      "Mantis shrimp can punch with the force of a bullet.",
      "A snail can sleep for up to 3 years."
    ],
    general: [
      "Honey never spoils — 3,000-year-old honey found in Egyptian tombs is still edible.",
      "The shortest war in history lasted 38–45 minutes (Anglo-Zanzibar War, 1896).",
      "A 'jiffy' is an actual unit of time: 1/100th of a second.",
      "The total weight of all ants on Earth equals the weight of all humans.",
      "Bananas are slightly radioactive due to naturally occurring potassium-40."
    ]
  };
  const list = facts[category] || facts.general;
  return { fact: list[Math.floor(Math.random() * list.length)], category };
}
