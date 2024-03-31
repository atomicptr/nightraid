import process from "process"
import path from "path";
import chokidar from "chokidar";


interface ConfigFile {
    "filler-mode": "do-nothing" | "quarantine" | "delete";
    directory: {
        path: string;
    }[];
}

const main = async () => {
    const defaultFile = path.join(process.cwd(), "nightraid.toml");

    const config: ConfigFile = (await import(Bun.env.NR_CONFIG_FILE ?? defaultFile)).default;

    chokidar.watch((config.directory ?? []).map(dir => dir.path)).on("add", (path, stats) => {
        console.log(path, stats);
    });
};

main();
