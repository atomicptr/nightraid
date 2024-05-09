
import { expect, test } from "bun:test";
import {isFiller} from "../src/filler-detect";

test("parse filenames", async () => {
    expect(await isFiller({
        name: "Gintama",
        season: null,
        episode: 1,
    })).toBeTrue();

    expect(await isFiller({
        name: "Naruto Shippuden",
        season: null,
        episode: 58,
    })).toBeTrue();

    expect(await isFiller({
        name: "One Piece",
        season: null,
        episode: 42,
    })).toBeFalse();
});
