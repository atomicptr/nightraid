# night-raid

A service that monitors directories for filler episodes of anime, powered by animefillerlist.com, made with [Bun](https://bun.sh).

## Setup

First you need to create a config file

```toml
filler-mode = "quarantine"

[[directory]]
path = "/home/username/Downloads"
quarantine-directory = "/home/username/Downloads/_quarantine"
```

There are three filler modes available:

- do-nothing, which as the name suggests does nothing but log the file
- quarantine, which moves the file into a specified quarantine directory
- delete, which deletes the file

It's recommended to use Docker:

```bash
$ docker run --rm -v nightraid.toml:/app/nightraid.toml ghcr.io/atomicptr/night-raid:latest
```

## License

AGPLv3

[![](https://www.gnu.org/graphics/agplv3-155x51.png)](<https://tldrlegal.com/license/gnu-affero-general-public-license-v3-(agpl-3.0)>)
