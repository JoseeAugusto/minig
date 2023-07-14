interface Image {
  id: string
  url: string

  // FIXME: userId should be required, change after model User is created
  userId?: string

  // FIXME: change any[] to Post[] after model and entity Post is created
  posts?: any[]
}

export { Image }
