import { load } from "cheerio";
import type { Episode } from "./filename";
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 3600 });

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.79 Safari/537.36";

const BASE_SEARCH_URL = "https://www.animefillerlist.com/search/node/"

const searchShowUrl = async (episodeName: string): Promise<string | null> => {
    const cacheKey = `nr::show-url::${episodeName}`;
    const url = cache.get<string | null>(cacheKey);
    if (url) {
        return url;
    }

    const data = await fetch(BASE_SEARCH_URL + encodeURIComponent(episodeName), {
        headers: {
            "User-Agent": USER_AGENT,
        }
    });

    const $ = load(await data.text());
    const link = $(".search-result a");

    if (!link) {
        return null;
    }

    const href = link.attr("href");

    if (href) {
        cache.set(cacheKey, href);
        return href;
    }

    return null;
}

const fetchFillerList = async (showUrl: string): Promise<string | null> => {
    const cacheKey = `nr::filler-list::${showUrl}`;
    const fillerListString = cache.get<string | null>(cacheKey);
    if (fillerListString) {
        return fillerListString;
    }

    const data = await fetch(showUrl, {
        headers: {
            "User-Agent": USER_AGENT,
        }
    });

    const $ = load(await data.text());
    const textElem = $(".filler .Episodes");

    if (!textElem) {
        return null;
    }

    const text = textElem.text();

    if (text) {
        cache.set(cacheKey, text);
        return text;
    }

    return null;
};

const isInFillerList = async (episode: Episode, fillerList: string): Promise<boolean> => {
    if (episode.season !== null && episode.season !== 1) {
        console.error(`Rejected checking ${JSON.stringify(episode)} as season parsing is currently unsupported.`);
        return false;
    }

    const parts = fillerList.split(",");

    for (let part of parts) {
        part = part.trim();

        if (Number(part) === episode.episode) {
            return true;
        }

        const match = /(\d+)-(\d+)/gi.exec(part);

        if (!match) {
            continue;
        }

        const [_, start, end] = match;

        if (episode.episode >= Number(start) && episode.episode <= Number(end)) {
            return true;
        }
    }

    return false;
}

export const isFiller = async (episode: Episode): Promise<boolean> => {
    const showUrl = await searchShowUrl(episode.name);
    if (!showUrl) {
        console.error(`Could not determine show url for: ${episode}`);
        return false;
    }

    const fillerList = await fetchFillerList(showUrl);
    if (!fillerList) {
        console.error(`Could not fetch filler list for: ${JSON.stringify(episode)}, ${showUrl}`);
        return false;
    }

    return isInFillerList(episode, fillerList);
}
