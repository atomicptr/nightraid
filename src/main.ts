import process from "process"
import path from "path";
import chokidar from "chokidar";
import { parseFilename, type Episode } from "./filename";
import { isFiller } from "./filler-detect";
import fs from "fs/promises";

type FilterMode = "do-nothing" | "quarantine" | "delete";

interface ConfigFile {
    "filler-mode"?: FilterMode;
    "quarantine-directory"?: string;
    directory: {
        "filler-mode"?: FilterMode;
        "quarantine-directory"?: string;
        path: string;
    }[];
}

const isSubdir = (parent: string, p: string): boolean => {
    const relative = path.relative(parent, p);
    return Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative);
}

const makeQuarantineDir = async (quarantineBaseDir: string, episode: Episode): Promise<string | null> => {
    const dirPath = path.join(quarantineBaseDir, episode.name);

    if (await fs.exists(dirPath)) {
        return dirPath;
    }

    const dir = await fs.mkdir(dirPath, { recursive: true });

    if (dir) {
        return dir;
    }

    return null;
}

const main = async () => {
    const defaultFile = path.join(process.cwd(), "nightraid.toml");

    const config: ConfigFile = (await import(Bun.env.NR_CONFIG_FILE ?? defaultFile)).default;

    const determineFilterSettings = (p: string) => {
        const dir = config.directory.find(d => isSubdir(d.path, p));

        if (dir) {
            return {
                "filler-mode": dir["filler-mode"] ?? config["filler-mode"] ?? "do-nothing",
                "quarantine-directory": dir["quarantine-directory"] ?? config["quarantine-directory"],
            }
        }

        return {
            "filler-mode": config["filler-mode"] ?? "do-nothing",
            "quarantine-directory": config["quarantine-directory"],
        }
    }

    chokidar.watch((config.directory ?? []).map(dir => dir.path)).on("add", async (file, stats) => {
        const episode = parseFilename(file);
        if (!episode) {
            console.error(`Path: ${file} could not be parsed.`);
            return;
        }

        const isEpisodeFiller = await isFiller(episode);

        if (!isEpisodeFiller) {
            return;
        }

        const fillerSettings = determineFilterSettings(file);

        // this file is already in quarantine so dont acknowledge its existance
        if (fillerSettings["filler-mode"] === "quarantine" && fillerSettings["quarantine-directory"] && isSubdir(fillerSettings["quarantine-directory"], file)) {
            return;
        }

        console.log(`Filler Episode Found: ${JSON.stringify(episode)} at ${file} filler mode: ${fillerSettings["filler-mode"]}`);

        switch (fillerSettings["filler-mode"]) {
            case "do-nothing":
                // well do nothing!
                break;
            case "quarantine":
                if (!fillerSettings["quarantine-directory"]) {
                    console.error(`Quaratine directory is unset for ${file}`);
                    return;
                }

                const quarantineDir = await makeQuarantineDir(fillerSettings["quarantine-directory"], episode);

                if (!quarantineDir) {
                    console.error(`Could not create quaratine directory for ${file}`);
                    return;
                }

                const newPath = path.join(quarantineDir, path.basename(file));

                await fs.rename(file, newPath);
                console.log(`Quarantined filler episode: ${file}`);
                break;
            case "delete":
                await fs.unlink(file);
                console.log(`Deleted filler episode: ${file}`);
                break;
            default:
                console.error(`Unknown filler mode: ${fillerSettings["filler-mode"]}`);
                process.exit(1);
        }
    });
};

main();
