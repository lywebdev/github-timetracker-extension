export function parseIssueUrl(url) {
    const match = url.match(/^\/([^/]+)\/([^/]+)\/issues\/(\d+)/)
    if (!match) throw new Error("Invalid issue URL")
    return {
        owner: match[1],
        repo: match[2],
        issueNumber: match[3]
    }
}

export async function postComment(owner, repo, issueNumber, seconds, token) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    const timeString =
        minutes > 0
            ? `${minutes} min${remainingSeconds > 0 ? ` ${remainingSeconds} sec` : ""}`
            : `${remainingSeconds} sec`

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
        method: "POST",
        headers: {
            "Authorization": `token ${token}`,
            "Accept": "application/vnd.github+json"
        },
        body: JSON.stringify({
            body: `⏱️ Tracked time: **${timeString}** via GitHub Time Tracker extension.`
        })
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(`GitHub API error: ${error.message}`)
    }

    console.log("Комментарий успешно отправлен.")
}