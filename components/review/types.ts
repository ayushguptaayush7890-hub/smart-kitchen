export type CommunityVideoItem = {
  id: string
  username: string
  rating: number
  submittedAt: number
  /** blob: or data URL for preview */
  videoUrl: string
}
