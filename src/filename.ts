import path from "path";

const formats: [RegExp, string[]][] = [
    // [GroupName] Episode Name - 01 [hash].mkv
    // [GroupName] Episode Name S01 - 01 [hash].mkv
    [/\[.+\] (.+?) (S\d* )?- (\d+) \[.+\]/gi, ["name", "season", "episode"]],
    // [ReinForce] Suki na Ko ga Megane 01 (BDRip 1920x1080 x264 FLAC).mkv
    [/\[.+\] (.+?) (\d+).*/gi, ["name", "episode"]],
    // [HorribleSubs] One Piece - 932 [720p]
    [/\[.+\] (.+?) - (\d+).*/gi, ["name", "episode"]],

    // the extremely greedy match as long as we have SxxEyy or Exx it matches
    [/^(.*?)S(\d{2})E(\d{2})/gi, ["name", "season", "episode"]],
    [/^(.*?)E(\d{2})/gi, ["name", "season", "episode"]],
]

export interface Episode {
    name: string;
    season: number | null;
    episode: number;
}

export const parseFilename = (filename: string): Episode | null => {
    filename = path.basename(filename);

    for (const [format, fields] of formats) {
        const match = new RegExp(format).exec(filename);
        if (!match) {
            continue;
        }

        const episode: Episode = { name: "", season: null, episode: -1 };

        const nameIndex = fields.indexOf("name");
        const seasonIndex = fields.indexOf("season");
        const episodeIndex = fields.indexOf("episode");

        if (nameIndex >= 0) {
            episode.name = match[nameIndex + 1];

            episode.name = episode.name.replaceAll("-", " ").replaceAll("_", " ").trim();
        }

        if (seasonIndex >= 0) {
            let season = match[seasonIndex + 1];

            if (season) {
                if (season.startsWith("S")) {
                    season = season.substring(1);
                }

                episode.season = isNaN(Number(season)) ? null : Number(season);
            }
        }

        if (episodeIndex >= 0) {
            episode.episode = Number(match[episodeIndex + 1]);
        }

        if (!episode.name || episode.episode === -1) {
            continue;
        }

        return episode;
    }

    return null;
}
