import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export const authKeys = {
  profile: ['auth', 'profile'] as const,
}

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: ({
      email,
      password,
    }: {
      email: string
      password: string
      remember: boolean
    }) => authService.login({ email, password }),
    onSuccess: (response, variables) => {
      setSession(response.accessToken, response.user, variables.remember)
    },
  })
}

export function useRegisterMutation() {
  return useMutation({ mutationFn: authService.register })
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authService.verifyEmail(email, otp),
  })
}

export function useResendVerificationOtpMutation() {
  return useMutation({ mutationFn: authService.resendVerificationOtp })
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: authService.forgotPassword })
}

export function useVerifyOtpMutation() {
  return useMutation({ mutationFn: authService.verifyOtp })
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: {
      resetToken: string
      newPassword: string
      confirmPassword: string
    }) => authService.resetPassword(
      payload.resetToken,
      payload.newPassword,
      payload.confirmPassword,
    ),
  })
}

export function useProfileQuery() {
  const user = useAuthStore((state) => state.user)

  return useQuery({
    queryKey: authKeys.profile,
    queryFn: async () => {
      const response = await authService.getProfile()
      return response.user
    },
    initialData: user ?? undefined,
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (response) => {
      setUser(response.data)
      queryClient.setQueryData(authKeys.profile, response.data)
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => queryClient.clear(),
  })
}
