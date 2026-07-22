# LICHTREICH Audio Head of Module

## Status

MVP launcher and control-center integration for daedalOS.

## Immediate SoundCloud diagnosis

The uploaded MP3 files are not too large and not too long. SoundCloud supports MP3, up to 4 GB per file and up to 24 hours per track. The limiting factor for a Basic account is the total catalogue allowance of 120 minutes. The set visible in the screenshot already exceeds this allowance. Uploading one file at a time can work only while enough total minutes remain; it does not remove the account-wide limit.

Operational decision:

- Do not use SoundCloud Basic as the primary archive.
- Check remaining minutes at `https://soundcloud.com/you/tracks`.
- Keep at most selected short tracks there, or leave the channel optional.
- Publish long-form assets through YouTube, Audius and selected Mixcloud shows.

## Desktop integration

The branch adds:

- `Audio Head of Module.url` on the daedalOS desktop.
- A `LICHTREICH Audio` folder in the Start Menu.
- One shortcut per external platform, each launched as the existing daedalOS `Browser` process.
- A local control-center page at `/Program Files/LICHTREICH Audio/index.html`.
- A machine-readable registry at `/Program Files/LICHTREICH Audio/modules.json`.

This deliberately uses the existing process and shortcut architecture instead of adding another parallel window manager. daedalOS already opens process instances from `.url` files using `BaseURL` as the process ID and `URL` as the process argument.

## Target operating model

```text
TAKTØR / Mixxx / external DJ tool
              |
              v
Copyparty / project Drive intake
              |
              v
checksum -> audio QC -> rights gate -> derivatives -> approval
              |
              +--> YouTube visualizer
              +--> Audius audio release
              +--> Mixcloud selected DJ set
              +--> SoundCloud optional excerpt
              |
              v
       audio.lichtreich.info
              |
              v
Directus asset record + Metabase KPI view
```

## Storage policy

GitHub stores only code, manifests, workflow definitions, schemas and documentation. Audio and video binaries stay outside the repository.

Recommended roles:

| Storage | Free allowance | Role |
|---|---:|---|
| Google account | 15 GB shared by Drive, Gmail and Photos | Project intake or temporary workspace |
| Box Individual | 10 GB, max. 250 MB per file | Suitable for 30–50 MB MP3 intake |
| Dropbox Basic | 2 GB | Small sync/drop folder only |
| Copyparty | Limited by attached storage | Primary ingest and controlled file access |

A separate Google account per project is technically possible, but it is not a free 5-GB Drive tenant. It is a full Google identity with 15 GB shared across services. Account ownership, recovery, 2FA, credentials and offboarding must therefore be managed in the LICHTREICH identity layer.

## Head-of-Module responsibilities

The Head of Module is not another AI chat window. It is an operator service with explicit state:

- asset queue
- rights status
- target selection
- publish readiness
- workflow run state
- platform URLs
- failed jobs and retries
- storage use
- KPI snapshot

Planned states:

`draft -> ingested -> qc_passed -> rights_cleared -> approved -> publishing -> published -> monitored -> archived`

## Next implementation slice

1. Connect the dashboard to a Directus `audio_assets` collection.
2. Add n8n webhook actions for ingest, render, publish and retry.
3. Mount Copyparty volumes from local disk or rclone-backed storage.
4. Add FFmpeg visualizer generation for YouTube.
5. Add platform adapter status and normalized analytics.
6. Replace generic browser icons with LICHTREICH module icons.
7. Add SSO and role checks before write actions.
