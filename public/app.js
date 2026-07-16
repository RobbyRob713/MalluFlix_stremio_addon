function setButtonState(button, target) {
  button.textContent = target.actionLabel;

  if (target.isAvailable && target.installUrl) {
    button.setAttribute("href", target.installUrl);
    button.setAttribute("aria-disabled", "false");
  } else {
    button.setAttribute("href", "#");
    button.setAttribute("aria-disabled", "true");
  }
}

function setCopyButtonState(button, target) {
  button.textContent = target.copyLabel;
  button.disabled = !target.manifestUrl;
}

async function copyManifestUrl(button, target) {
  if (!target.manifestUrl) {
    return;
  }

  try {
    await navigator.clipboard.writeText(target.manifestUrl);
    button.textContent = "Copied";
  } catch (_error) {
    button.textContent = "Copy Failed";
  }

  window.setTimeout(() => {
    button.textContent = target.copyLabel;
  }, 1500);
}

function hydrateInstallCard(prefix, target) {
  const note = document.getElementById(`${prefix}-note`);
  const manifest = document.getElementById(`${prefix}-manifest-url`);
  const installLink = document.getElementById(`${prefix}-install-link`);
  const copyButton = document.getElementById(`${prefix}-copy-link`);

  note.textContent = target.note;
  manifest.textContent = target.previewText;

  setButtonState(installLink, target);
  setCopyButtonState(copyButton, target);

  copyButton.addEventListener("click", () => copyManifestUrl(copyButton, target));
}

function hydrateBrowserDebugTarget(target) {
  const debugSection = document.getElementById("browser-debug");
  const debugNote = document.getElementById("browser-debug-note");
  const debugUrl = document.getElementById("browser-debug-url");

  if (!target) {
    return;
  }

  debugSection.hidden = false;
  debugNote.textContent = target.note;
  debugUrl.textContent = target.manifestUrl;
}

function hydrateAddonBranding(addon) {
  document.title = addon.name;

  const metaDescription = document.getElementById("meta-description");
  const addonName = document.getElementById("addon-name");
  const addonLede = document.getElementById("addon-lede");
  const catalogCopy = document.getElementById("catalog-copy");

  if (metaDescription) {
    metaDescription.setAttribute("content", addon.description);
  }

  if (addonName) {
    addonName.textContent = addon.name;
  }

  if (addonLede) {
    addonLede.textContent = `${addon.contentLabel} movie discovery for Stremio, built from TMDB catalogs and resolved through Cinemeta. Metadata only. No streams.`;
  }

  if (catalogCopy) {
    catalogCopy.textContent = `New releases, OTT releases, future releases, and ${addon.contentLabel} genre shelves.`;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const config = window.__MALLUFLIX_CONFIG__;

  hydrateAddonBranding(config.addon);
  hydrateInstallCard("local", config.local);
  hydrateInstallCard("hosted", config.hosted);
  hydrateBrowserDebugTarget(config.browserDebug);
});
