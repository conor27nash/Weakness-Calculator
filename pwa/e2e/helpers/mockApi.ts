import type { Page } from "@playwright/test";
import {
  TYPE_RESPONSES,
  POKEMON_RESPONSES,
  SPECIES_RESPONSES,
  ABILITY_RESPONSES,
  EVOLUTION_CHAIN_RESPONSES,
} from "./fixtures";

// 1x1 transparent PNG for sprite requests
const PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAB" +
  "Nl7BcQAAAABJRU5ErkJggg==",
  "base64",
);

/**
 * Intercept all PokeAPI + sprite requests, serving from fixtures.
 * Call this before navigating to the page.
 */
export async function mockPokeApi(page: Page) {
  // Clear localStorage cache so the app always hits our mocked endpoints
  await page.addInitScript(() => {
    localStorage.removeItem("pokeapi_pokemon_list_v1");
  });

  await page.route("**://pokeapi.co/api/v2/**", async (route) => {
    const url = route.request().url();
    const path = new URL(url).pathname.replace(/\/$/, ""); // strip trailing slash

    // /api/v2/type/{name}
    const typeMatch = path.match(/\/api\/v2\/type\/(\w+)$/);
    if (typeMatch) {
      const data = TYPE_RESPONSES[typeMatch[1]];
      if (data) return route.fulfill({ json: data });
      return route.fulfill({ json: { pokemon: [] } });
    }

    // /api/v2/pokemon/{name}
    const pokemonMatch = path.match(/\/api\/v2\/pokemon\/([\w-]+)$/);
    if (pokemonMatch) {
      const data = POKEMON_RESPONSES[pokemonMatch[1]];
      if (data) return route.fulfill({ json: data });
      return route.abort("connectionrefused");
    }

    // /api/v2/pokemon-species/{name}
    const speciesMatch = path.match(/\/api\/v2\/pokemon-species\/([\w-]+)$/);
    if (speciesMatch) {
      const data = SPECIES_RESPONSES[speciesMatch[1]];
      if (data) return route.fulfill({ json: data });
      return route.abort("connectionrefused");
    }

    // /api/v2/ability/{id}
    const abilityMatch = path.match(/\/api\/v2\/ability\/(\d+)$/);
    if (abilityMatch) {
      const data = ABILITY_RESPONSES[abilityMatch[1]];
      if (data) return route.fulfill({ json: data });
      return route.fulfill({ json: { effect_entries: [] } });
    }

    // /api/v2/evolution-chain/{id}
    const evoMatch = path.match(/\/api\/v2\/evolution-chain\/(\d+)$/);
    if (evoMatch) {
      const data = EVOLUTION_CHAIN_RESPONSES[evoMatch[1]];
      if (data) return route.fulfill({ json: data });
      return route.abort("connectionrefused");
    }

    // Fallback: unknown endpoint
    return route.abort("connectionrefused");
  });

  // Mock sprite images
  await page.route("**://raw.githubusercontent.com/PokeAPI/sprites/**", async (route) => {
    return route.fulfill({
      contentType: "image/png",
      body: PIXEL_PNG,
    });
  });
}
