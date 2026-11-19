import { MediaImage, MediaVideo } from "@workspace/ui/components/media"
import {
  MediaSkeleton,
  type MediaMask,
} from "@workspace/ui/components/media-frame"

const photo = "/ui-media/coast.webp"
const video = "/ui-media/coast.mp4"
const arch = "/ui-media/arch.svg"
const pebble = {
  viewBox: [0, 0, 240, 160],
  path: "M12 36C32 8 83 4 124 9c38 5 89 16 105 42 15 25 10 62-20 82-31 21-76 26-112 20-42-7-74-13-88-41-11-22-12-55 3-76Z",
} satisfies MediaMask

export function MediaExamples() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <figure className="grid content-start gap-2">
        <MediaImage
          src={photo}
          alt="Ocean waves breaking on a sandy coast"
          width={600}
          height={400}
          className="rounded-xl"
        />
        <figcaption className="text-sm text-muted-foreground">
          MediaImage
        </figcaption>
      </figure>
      <figure className="grid content-start gap-2">
        <MediaImage
          src={photo}
          alt="Ocean waves breaking on a sandy coast"
          mask={pebble}
        />
        <figcaption className="text-sm text-muted-foreground">
          MediaImage · SVG path
        </figcaption>
      </figure>
      <figure className="grid content-start gap-2">
        <MediaVideo
          src={video}
          width={480}
          height={320}
          className="rounded-xl"
          aria-label="A moving view of the coast"
          controls
          muted
        />
        <figcaption className="text-sm text-muted-foreground">
          MediaVideo
        </figcaption>
      </figure>
      <figure className="grid content-start gap-2">
        <MediaVideo
          src={video}
          mask={arch}
          aspectRatio="3 / 2"
          aria-label="A moving view of the coast"
          controls
          muted
        />
        <figcaption className="text-sm text-muted-foreground">
          MediaVideo · SVG file
        </figcaption>
      </figure>
      <figure className="grid content-start gap-2">
        <MediaSkeleton aspectRatio="3 / 2" className="rounded-xl" />
        <figcaption className="text-sm text-muted-foreground">
          MediaSkeleton
        </figcaption>
      </figure>
      <figure className="grid content-start gap-2">
        <MediaSkeleton mask={pebble} />
        <figcaption className="text-sm text-muted-foreground">
          MediaSkeleton · SVG path
        </figcaption>
      </figure>
    </div>
  )
}
