export interface SubmitFormReqBody {
  [key: string]: string
}
export interface FormDetailReqBody {
  id: string
  index: string
  content: string
}

export interface AddNewFormReqBody {
  name: string
  description: string
  total: number
  form_details: FormDetailReqBody[]
  users: string[]
}

export interface UpdateFormReqBody {
  name: string
  description: string
  total: number
  form_details: FormDetailReqBody[]
}
