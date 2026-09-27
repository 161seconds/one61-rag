import { useApiPost } from "@/shared/hooks"
import { type LoginSchema, type SignUpSchema } from "@aqua-calendar/constants"
import { useNavigate } from "@tanstack/react-router"
import { queryClient } from "@/libs"
import { authQueryKeys } from "./query-key"
import { useAuthUIStore } from "../stores"
import { ENDPOINT_PATH, mapErrors } from "@/shared/constants"
import { getApiErrorCode, useCustomToast } from "@/shared/hooks"
import { useState } from "react"

export const useLogin = () => {
  const navigate = useNavigate()
  const { redirectAfterLogin, clearRedirectAfterLogin } = useAuthUIStore()
  const { showErrorToast } = useCustomToast()
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(
    null
  )
  const { mutate, isPending } = useApiPost<void, LoginSchema>(
    `/${ENDPOINT_PATH.AUTH}/login`,
    {
      onMutate: () => {
        setLoginErrorMessage(null)
      },
      onSuccess: () => {
        setLoginErrorMessage(null)
        queryClient.invalidateQueries({ queryKey: authQueryKeys.session() })
        if (redirectAfterLogin) {
          navigate({ to: redirectAfterLogin })
        } else {
          navigate({ to: "/" })
        }
        clearRedirectAfterLogin()
      },
      onError: (error) => {
        const errorCode = getApiErrorCode(error)
        const errorMessage = mapErrors(errorCode)
        setLoginErrorMessage(errorMessage)
        showErrorToast({
          title: "Login failed",
          description: errorMessage,
        })
      },
    }
  )
  const handleLogin = async (body: LoginSchema) => {
    const response = await mutate(body)
    return response
  }
  return { isPending, handleLogin, loginErrorMessage }
}

export const useSignUp = () => {
  const navigate = useNavigate()
  const { redirectAfterLogin, clearRedirectAfterLogin } = useAuthUIStore()

  const { mutate, isPending } = useApiPost<void, SignUpSchema>(
    `/${ENDPOINT_PATH.AUTH}/sign-up`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: authQueryKeys.session() })
        if (redirectAfterLogin) {
          navigate({ to: redirectAfterLogin })
        } else {
          navigate({ to: "/" })
        }
        clearRedirectAfterLogin()
      },
    }
  )
  const handleSignUp = async (body: SignUpSchema) => {
    const response = await mutate(body)
    return response
  }
  return { isPending, handleSignUp }
}

export const useSignOut = () => {
  const navigate = useNavigate()
  const { mutate, isPending } = useApiPost<void>(
    `/${ENDPOINT_PATH.AUTH}/sign-out`,
    {
      onSuccess: () => {
        queryClient.removeQueries({ queryKey: authQueryKeys.session() })
        navigate({ to: "/about" })
      },
    }
  )
  const handleSignOut = async () => {
    const response = await mutate({})
    return response
  }
  return { isPending, handleSignOut }
}
