# Production notes

## Story and revisions

The project began as **Before the Goal**, focused on football, replay and tactical exploration. Following committee feedback, the story broadened to accessible sport, Al Ain, People of Determination and an imagined future practice environment. The final title, **More Ways to Play**, reflects that broader idea.

The main editing challenge was integrating the new chapter into the same story. The final treatment preserves the football opening, uses coaching choices as the bridge into adaptive practice, and returns to a human closing. The juggling shot carries the title before the conference closing card.

Final delivery: **118.08 seconds**, **1920 × 1080**, **24 fps**, English narration and **26 Arabic subtitle cues**.

## What the technology does

| Element | Contribution |
| --- | --- |
| OpenCV Zoo YOLOX | Anonymous person detection in football footage |
| Original tactical graphics | Authored projective pitch, movement paths and alternative passes |
| ElevenLabs Savvy | English narration generated under a paid subscription |
| Veo 3.1 through ElevenLabs | Fictional future-training cinematics exploring adaptive practice |
| Topaz / Real-ESRGAN | Selected documentary picture enhancement |
| OpenAI Codex | Research, script and Arabic review, programmed graphics, editing and checks under the entrant's direction |
| Faster-whisper | Timing checks |
| Google Gemini | Closing-design references |

## Showcase images

All five film images displayed in the README are direct, full-frame JPEG extractions from the final 1920 × 1080 master, retaining its text, Arabic subtitles, grading and composition.

| Image | Final-film timestamp |
| --- | --- |
| Title over juggling footage | 1:42.00 |
| Player detection | 0:27.50 |
| Earlier arrival | 0:47.00 |
| Al Ain | 1:02.00 |
| Adaptive practice | 1:17.00 |

## Portable renderer

`src/render-tactics.cjs` is a self-contained adaptation of the original tactical drawing component. It uses one projective camera for pitch lines, player tokens and routes, with eased motion and a consistent palette. It requires only Node.js and `@napi-rs/canvas`; it has no account, service or model dependency.

```sh
node src/render-tactics.cjs --out renders
node src/render-tactics.cjs --sequence --fps 24 --start 40.8 --duration 12 --out renders/sequence
```

Supported component times are **30–59.5 seconds**, with sequence rates of **1–60 fps**. The renderer has its own internal timeline. The three default stills show an earlier run, a wider pass and the decision remaining with coaches and players.

The component focuses on the original tactical graphics. The completed film combines these with footage editing, bilingual typography, narration and sound design.

## Delivery reference

Final master filename: `MORE_WAYS_TO_PLAY_ICAIS2026_FINAL.mp4`.

SHA-256: `bf5b1cb896b8d167578b728f12f4c7a215d3d35a204a97b95466d570eda939ff`.

The [watch link](https://drive.google.com/file/d/1Dan57P498kJB_SiNYuy8Uqsq48UVTwYS/view) points to the submitted film. Hosting-service previews can be compressed; the master remains a separate file and is not checked into Git.
