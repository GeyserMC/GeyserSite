// noinspection JSUnresolvedVariable

const id = window.location.href.split('?').pop();

const url = "https://dump.geysermc.org/raw/" + id;
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

let result = null;

$.get(url, function(res) {
    res = JSON.parse(res);
    result = res;
    console.log(res);

    // Versions
    $("#geyserVersion").text(res.versionInfo.version);
    $("#javaVersion").text(res.versionInfo.javaVersion + " (" + res.versionInfo.architecture + ")");
    $("#osVersion").text(res.versionInfo.operatingSystem + " " + res.versionInfo.operatingSystemVersion);

    // Geyser Versions
    $("#buildNumber").text(res.gitInfo['git.build.number']);
    $("#commit").text(res.gitInfo['git.commit.id.abbrev']);
    $("#branch").text(res.gitInfo['git.branch']);

    // Config
    $("#config").text(JSON.stringify(res.config));

    // Platform Info
    $("#platformIdentifier").text(res.bootstrapInfo.platform);
    $("#platformName").text(res.bootstrapInfo.platformName);
    $("#platformVersion").text(res.bootstrapInfo.platformVersion);
    $("#platformAPIVersion").text(res.bootstrapInfo.platformAPIVersion);
    $("#onlineMode").text(res.bootstrapInfo.onlineMode);
});
