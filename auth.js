export async function authorizeWithGitHub() {
    const clientId = "your_client_id_here";
    const redirectUri = chrome.identity.getRedirectURL();

    const authUrl = `https://github.com/login/oauth/authorize` +
        `?client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=repo`;

    return new Promise((resolve, reject) => {
        chrome.identity.launchWebAuthFlow(
            {
                url: authUrl,
                interactive: true
            },
            function (redirectUrl) {
                if (chrome.runtime.lastError || !redirectUrl) {
                    return reject(new Error("Authorization failed"));
                }

                const params = new URL(redirectUrl).searchParams;
                const code = params.get("code");
                if (!code) return reject(new Error("No code returned"));

                // GitHub не поддерживает implicit flow, так что нужен промежуточный сервер или GH CLI токен
                // Здесь подмена: используем персональный токен напрямую (только для разработки)
                reject(new Error("GitHub OAuth requires server exchange. Use personal token in dev."));
            }
        );
    });
}
