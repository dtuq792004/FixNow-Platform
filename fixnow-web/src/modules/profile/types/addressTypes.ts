export type Address = {
  _id: string
  label: string
  addressLine: string
  ward: string
  district: string
  city: string
  latitude?: number
  longitude?: number
  isDefault: boolean
}

export type AddressPayload = Omit<Address, '_id'>
