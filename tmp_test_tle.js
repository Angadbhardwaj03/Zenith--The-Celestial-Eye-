
async function test() {
    try {
        const res = await fetch("https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle");
        console.log("Status:", res.status);
        const headers = res.headers;
        console.log("CORS Header:", headers.get("access-control-allow-origin"));
        const text = await res.text();
        console.log("Head:", text.substring(0, 200));
    } catch (e) {
        console.error(e);
    }
}
test();
