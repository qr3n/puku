import { getFilter } from "@base-ui/react/internals/filter"

const { contains } = getFilter()
let labels: string[] = []

self.onmessage = ({ data }: MessageEvent<string[] | string>) => {
  if (Array.isArray(data)) {
    labels = data
    return
  }

  const indexes: number[] = []
  for (let index = 0; index < labels.length; index++) {
    if (contains(labels[index]!, data)) indexes.push(index)
  }
  self.postMessage({ query: data, indexes })
}
