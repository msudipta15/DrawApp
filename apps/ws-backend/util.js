const url = "www.cow.com?hello=923989";

const params = new URLSearchParams(url.split("?")[1]);

console.log(params.get("hello"));
