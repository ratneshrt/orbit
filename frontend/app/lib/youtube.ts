export function extractYouTubeId(input: string): string | null {
  const idRegex =
    /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:v\/|embed\/|watch(?:\/|\?v=|\/)|live\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&]\S+)?$/
  const m = input.match(idRegex)
  if (!m) return null
  return m[1] || input
}
