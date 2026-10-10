export type LegalSection = {
  title: string
  paragraphs: string[]
}

export type LegalDoc = {
  linkLabel: string
  title: string
  updated: string
  draftNote: string
  agreeLabel: string
  sections: LegalSection[]
}