import process from "process"
import path from "path";
import chokidar from "chokidar";
import { parseFilename } from "./filename";

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

const main = async () => {
    const defaultFile = path.join(process.cwd(), "nightraid.toml");

    const config: ConfigFile = (await import(Bun.env.NR_CONFIG_FILE ?? defaultFile)).default;

    chokidar.watch((config.directory ?? []).map(dir => dir.path)).on("add", (path, stats) => {
        const episode = parseFilename(path);
        if (!episode) {
            console.error(`Path: ${path} could not be parsed.`);
            return;
        }

        console.log(episode)
    });
};

main();
