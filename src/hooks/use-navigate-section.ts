import { useQueryState, parseAsString, parseAsInteger } from "nuqs" 

export const sectionNameArr = [
  "index",
  "information",
  "engineer",
  "service",
  "media",
  "more"
]

export const useNavigateSection = () => {
  const [currentSection, setCurrentSection] = useQueryState(
    "current",
    parseAsString
    .withDefault('index')
    .withOptions({ clearOnDefault: true })
  )

  const [prevIndex, setPrevIndex] = useQueryState(
    "prev",
    parseAsInteger
    .withDefault(1)
    .withOptions({ clearOnDefault: true }),
  )

  const setSection = (section:number) => setCurrentSection(sectionNameArr[section])

  return {
    currentSection,
    setSection,
    prevIndex,
    setPrevIndex,
  }
}
