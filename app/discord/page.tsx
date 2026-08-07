"use client"

import { useEffect, useState } from "react"

interface DiscordUser {
  id: string
  username: string
  avatar: string | null
}

export default function DiscordSignInPage() {
  const [status, setStatus] = useState("Completing Discord sign-in...")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")

    if (!code) {
      setStatus("Discord sign-in failed: no authorization code received.")
      return
    }

    const redirectHome = () => {
      window.location.replace("/")
    }

    fetch("/api/discord/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        redirectUri: `${window.location.origin}/discord`,
      }),
    })
      .then((result) => {
        if (!result.ok) {
          return result.json().then((payload) => {
            throw new Error(JSON.stringify(payload))
          })
        }
        return result.json()
      })
      .then((tokenResponse) => {
        console.log("Discord token response", tokenResponse)
        const accessToken = tokenResponse.access_token

        if (!accessToken) {
          throw new Error("No access token returned from Discord")
        }

        window.localStorage.setItem("discordAccessToken", accessToken)
        window.localStorage.setItem("discordTokenResponse", JSON.stringify(tokenResponse))

        return fetch("https://discord.com/api/users/@me", {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        })
      })
      .then((result) => {
        if (!result.ok) {
          return result.json().then((payload) => {
            throw new Error(JSON.stringify(payload))
          })
        }
        return result.json()
      })
      .then((response) => {
        const user: DiscordUser = {
          id: response.id,
          username: response.username,
          avatar: response.avatar,
        }

        window.localStorage.setItem("discordUser", JSON.stringify(user))
        redirectHome()
      })
      .catch((error) => {
        console.error(error)
        setStatus(error instanceof Error ? error.message : "Discord sign-in failed. Please try again.")
      })
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <div className="w-full max-w-md rounded-xl border border-border bg-card px-8 py-10 shadow-sm">
        <div className="mb-6 inline-flex items-center justify-center rounded-full bg-muted p-4">
          <img src="/discord-icon-svgrepo-com.svg" alt="Discord logo" className="h-8 w-8" />
        </div>
        <h1 className="mb-3 text-2xl font-semibold">Discord Sign-In</h1>
        <p className="text-sm text-muted-foreground">{status}</p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to home
          </a>
        </div>
      </div>
    </main>
  )
}
