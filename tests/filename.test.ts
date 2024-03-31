import { expect, test } from "bun:test";
import { parseFilename, type Episode } from "../src/filename";

test("parse filenames", () => {
    const matrix: [string, Episode | null][] = [
        ["[HorribleSubs] Fate Kaleid Liner PRISMA ILYA - 01 [720p]", { name: "Fate Kaleid Liner PRISMA ILYA", season: null, episode: 1 }],
        ["[HorribleSubs] Akame ga Kill! - 02 [720p].mkv", { name: "Akame ga Kill!", season: null, episode: 2 }],
        ["[HorribleSubs] Aldnoah Zero - 08 [720p]", { name: "Aldnoah Zero", season: null, episode: 8 }],
        ["[HorribleSubs] Deadman Wonderland  - 02 [720p]", { name: "Deadman Wonderland", season: null, episode: 2 }],
        ["[HorribleSubs] Tokyo Ghoul Root A - 01 [720p]", { name: "Tokyo Ghoul Root A", season: null, episode: 1 }],
        ["[HorribleSubs] Sword Art Online II - 02 [1080p]", { name: "Sword Art Online II", season: null, episode: 2 }],
        ["[HorribleSubs] Yahari Ore no Seishun Love Come wa Machigatteiru Zoku - 07 [720p].mkv", { name: "Yahari Ore no Seishun Love Come wa Machigatteiru Zoku", season: null, episode: 7 }],
        ["[HorribleSubs] Love Live! S2 - 02 [720p]", { name: "Love Live!", season: 2, episode: 2 }],
        ["[HorribleSubs] Fairy Tail S2 - 02 [720p].mkv", { name: "Fairy Tail", season: 2, episode: 2 }],
        ["Ninja.Kamui.S01E08.1080p.MAX.WEB-DL.DDP2.0.H.264-VARYG.mkv", { name: "Ninja.Kamui.", season: 1, episode: 8 }],
        ["[ReinForce] Suki na Ko ga Megane 01 (BDRip 1920x1080 x264 FLAC).mkv", { name: "Suki na Ko ga Megane", season: null, episode: 1 }],
        ["[No subs] 声之形.大陆公映版.国语.A.Silent.Voice.The.Shape.Of.Voice.2017.1080P.WEB-DL.AAC.X264.mkv", null],
        ["[Grupa Mirai] Dr. Slump Arale-chan - 054 [DVD 720x540 AAC] [574642AD].mkv", { name: "Dr. Slump Arale-chan", season: null, episode: 54 }],
        ["Detective_Conan-S07E01 0163.mkv", { name: "Detective_Conan-", season: 7, episode: 1 }]
    ];

    matrix.forEach(([input, expected]) => {
        const result = parseFilename(input);

        if (expected === null) {
            expect(result).toBeNull();
            return;
        }

        expect(result?.name).toBe(expected.name);
        expect(result?.season).toBe(expected.season);
        expect(result?.episode).toBe(expected.episode);
    })
});
