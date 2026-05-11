// MalluFlix Addon Client-side Logic

document.addEventListener("DOMContentLoaded", () => {
    // Generate the Stremio install URL dynamically
    const installUrl = "stremio://" + window.location.host + "/manifest.json";
    const installLink = document.getElementById("installLink");
    
    if (installLink) {
        installLink.href = installUrl;
    }
    
    console.log("MalluFlix Addon UI initialized");
    console.log("Install URL:", installUrl);
});
