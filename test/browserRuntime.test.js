const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("index.html", "utf8");
const elementIds = [...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);

class FakeClassList {
  constructor() {
    this.items = new Set();
  }

  add(...names) {
    names.forEach((name) => this.items.add(name));
  }

  remove(...names) {
    names.forEach((name) => this.items.delete(name));
  }

  toggle(name, force) {
    if (force === undefined) {
      if (this.items.has(name)) this.items.delete(name);
      else this.items.add(name);
      return this.items.has(name);
    }
    if (force) this.items.add(name);
    else this.items.delete(name);
    return Boolean(force);
  }

  contains(name) {
    return this.items.has(name);
  }
}

class FakeElement {
  constructor(id = "") {
    this.id = id;
    this.value = "";
    this.textContent = "";
    this.innerHTML = "";
    this.dataset = {};
    this.style = {};
    this.listeners = {};
    this.classList = new FakeClassList();
  }

  addEventListener(type, listener) {
    (this.listeners[type] ||= []).push(listener);
  }

  querySelector() {
    return new FakeElement();
  }

  querySelectorAll() {
    return [];
  }

  closest() {
    return new FakeElement();
  }

  focus() {}
  setAttribute() {}
  setPointerCapture() {}

  getAttribute(name) {
    return this.dataset[name] || "";
  }

  getBoundingClientRect() {
    return { left: 0, top: 0, width: 430, height: 932 };
  }
}

function createDocument() {
  const elements = Object.fromEntries(elementIds.map((id) => [id, new FakeElement(id)]));
  return {
    getElementById(id) {
      return (elements[id] ||= new FakeElement(id));
    },
    querySelector(selector) {
      return new FakeElement(selector);
    },
    querySelectorAll(selector) {
      if (selector === ".route-time" || selector === ".route-meta") return [new FakeElement(), new FakeElement()];
      return [];
    },
  };
}

function createNaverStub() {
  class LatLng {
    constructor(lat, lng) {
      this._lat = lat;
      this._lng = lng;
    }
    lat() { return this._lat; }
    lng() { return this._lng; }
  }

  class Map {
    constructor() {
      this.zoom = 16;
    }
    setOptions() {}
    fitBounds() {}
    getZoom() { return this.zoom; }
    setZoom(zoom) { this.zoom = zoom; }
    morph(_coord, zoom) { this.zoom = zoom; }
    panTo() {}
    getProjection() {
      return { fromOffsetToCoord: () => new LatLng(37.5665, 126.978) };
    }
  }

  class Marker {
    constructor(options) {
      this.options = options;
    }
    setMap(map) { this.map = map; }
    setPosition(position) { this.position = position; }
    setCenter(position) { this.setPosition(position); }
    setRadius() {}
  }

  class Polyline {
    constructor(options) {
      this.options = options;
    }
    setMap(map) { this.map = map; }
    setPath(path) { this.path = path; }
  }

  class LatLngBounds {
    constructor() {
      this.points = [];
    }
    extend(point) { this.points.push(point); }
  }

  class Size { constructor(width, height) { this.width = width; this.height = height; } }
  class Point { constructor(x, y) { this.x = x; this.y = y; } }
  class InfoWindow { open() {} }

  return {
    maps: {
      LatLng,
      Map,
      Marker,
      Polyline,
      Circle: null,
      LatLngBounds,
      Size,
      Point,
      InfoWindow,
      Event: { addListener() {} },
    },
  };
}

function createBrowserContext() {
  const context = vm.createContext({
    window: null,
    document: createDocument(),
    console,
    setTimeout: () => 0,
    clearTimeout() {},
    addEventListener() {},
    navigator: {
      geolocation: {
        getCurrentPosition(success) {
          success({ coords: { latitude: 37.5665, longitude: 126.978, accuracy: 30 } });
        },
      },
    },
    naver: createNaverStub(),
    fetch: async () => ({ ok: true, json: async () => ({}) }),
  });
  context.window = context;
  return context;
}

function runBrowserScript(filename, context) {
  vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename });
}

const context = createBrowserContext();
runBrowserScript("tagDictionary.js", context);
runBrowserScript("tagDictionary.js", context);
runBrowserScript("tagMatcher.js", context);
runBrowserScript("tagMatcher.js", context);

const tagResult = context.window.RouteTagMatcher.matchRouteSegmentTags("밤에 무섭고 차선 복잡해");
assert.ok(tagResult.matchedTags.length > 0, "tag matcher should still work after duplicate script loads");

const inlineScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
vm.runInContext(inlineScript, context, { filename: "index.html:inline" });

console.log("browser runtime smoke test passed");
