const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })

export function splitGraphemes(text: string) {
  return Array.from(segmenter.segment(text), ({ segment }) => segment)
}
