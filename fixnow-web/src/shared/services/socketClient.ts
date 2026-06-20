import { io, type Socket } from 'socket.io-client'
import { API_BASE_URL } from '../constants/api'

let socket: Socket | null = null
let currentToken: string | null = null

export function getAuthenticatedSocket(accessToken: string) {
  if (!socket || currentToken !== accessToken) {
    socket?.disconnect()
    currentToken = accessToken
    socket = io(API_BASE_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    })
  }

  return socket
}

export function disconnectAuthenticatedSocket() {
  socket?.disconnect()
  socket = null
  currentToken = null
}
