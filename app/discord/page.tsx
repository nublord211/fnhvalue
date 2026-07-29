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
          username: `${response.username}#${response.discriminator}`,
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
      <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 shadow-xl shadow-black/10">
        <div className="mb-6 inline-flex items-center justify-center rounded-full bg-indigo-500/10 p-4">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-indigo-300" fill="currentColor" aria-hidden="true">
            <path d="M7.7 7.4C4.2 8.1 1.7 10.9 1.7 14.1c0 3.5 2.7 6.4 6 6.4 1.5 0 2.8-.5 3.9-1.4l.4-.3.3.3c1 .8 2.3 1.4 3.8 1.4 3.4 0 6-2.9 6-6.4 0-3.1-2.4-6-5.9-6.7l-.2-.1-.1.2c-.3.9-.6 1.8-1 2.6 1.1.2 2.1.8 2.8 1.6.2.2.4.1.4-.1.2-.6.4-1 .6-1.6l.1-.1c.1-.2-.1-.4-.3-.4-1.5-.5-3.2-.8-4.9-.8-.7 0-1.3.1-1.9.2-.2 0-.3.2-.3.4l.1.1c.2.6.4 1 .7 1.6.1.2.3.2.4.1.7-.7 1.7-1.2 2.8-1.4-.4-.8-.8-1.8-1-2.7-.7.1-1.3.1-2.1.1s-1.4 0-2.1-.1c-.2.9-.6 1.9-1 2.7 1.1.2 2.1.8 2.8 1.5.1.2.3.1.4-.1.3-.6.5-1 .7-1.6l.1-.2-.2-.1z" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold mb-3">Discord Sign-In</h1>
        <p className="text-sm text-muted-foreground">{status}</p>
        <div className="mt-6">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to home
          </a>
        </div>
      </div>
    </main>
  )
}
