class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.map = new Map();

        this.head = new Node(null, null);
        this.tail = new Node(null, null);

        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    _remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    _add(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
    }

    get(key) {
        if (!this.map.has(key)) return -1;

        const node = this.map.get(key);
        this._remove(node);
        this._add(node);
        return node.value;
    }

    put(key, value) {
        let evicted = null;

        if (this.map.has(key)) {
            const node = this.map.get(key);
            node.value = value;
            this._remove(node);
            this._add(node);
        } else {
            if (this.map.size === this.capacity) {
                const lru = this.tail.prev;
                evicted = lru.key;
                this._remove(lru);
                this.map.delete(lru.key);
            }
            const node = new Node(key, value);
            this._add(node);
            this.map.set(key, node);
        }
        return evicted;
    }

    getItems() {
        const res = [];
        let cur = this.head.next;
        while (cur !== this.tail) {
            res.push(cur);
            cur = cur.next;
        }
        return res;
    }
}

let cache = new LRUCache(5);

/* ---------- UI ---------- */

function renderCache(highlightKey = null, type = "") {
    const display = document.getElementById("cache-display");
    display.innerHTML = "";

    cache.getItems().forEach((node, i) => {
        if (i > 0) {
            const arrow = document.createElement("div");
            arrow.className = "arrow";
            arrow.textContent = "→";
            display.appendChild(arrow);
        }

        const div = document.createElement("div");
        div.className = "cache-item";
        div.dataset.key = node.key;
        div.innerHTML = `<strong>${node.key}</strong><span>${node.value}</span>`;

        if (node.key === highlightKey) {
            div.classList.add(type);
        }

        display.appendChild(div);
    });

    document.getElementById("cache-size").textContent =
        `Current Size: ${cache.map.size} / ${cache.capacity}`;
}

/* ---------- PUT ---------- */
document.getElementById("put").onclick = () => {
    const key = document.getElementById("key").value.trim().toUpperCase();
    const value = document.getElementById("value").value.trim();
    const msg = document.getElementById("message");

    if (!key || !value) {
        msg.textContent = "Enter both key and value";
        msg.className = "message miss";
        return;
    }

    let evictedKey = null;
    if (!cache.map.has(key) && cache.map.size === cache.capacity) {
        evictedKey = cache.tail.prev.key;
    }

    cache.put(key, value);
    renderCache(key, "update");

    if (evictedKey) {
        msg.textContent = `PUT (${key}:${value}) → Evicted ${evictedKey}`;
        msg.className = "message eviction";

        setTimeout(() => {
            const evictedEl = document.querySelector(`[data-key="${evictedKey}"]`);
            if (evictedEl) evictedEl.classList.add("evicted");
        }, 100);

        setTimeout(() => renderCache(), 900);
    } else {
        msg.textContent = `PUT (${key}:${value})`;
        msg.className = "message update";
    }
};

/* ---------- GET ---------- */
document.getElementById("get").onclick = () => {
    const key = document.getElementById("key").value.trim().toUpperCase();
    const msg = document.getElementById("message");

    if (!key) {
        msg.textContent = "Enter a key";
        msg.className = "message miss";
        return;
    }

    const value = cache.get(key);
    if (value !== -1) {
        renderCache(key, "hit");
        msg.textContent = `HIT → ${key}: ${value}`;
        msg.className = "message hit";
    } else {
        renderCache();
        msg.textContent = `MISS → ${key}`;
        msg.className = "message miss";
    }
};

/* ---------- RESET / RESIZE ---------- */
document.getElementById("reset").onclick = () => {
    const cap = parseInt(document.getElementById("capacity").value) || 5;
    cache.capacity = cap;

    // Clear all cache entries and reset the doubly-linked list
    cache.map.clear();
    cache.head.next = cache.tail;
    cache.tail.prev = cache.head;

    renderCache();
    const msg = document.getElementById("message");
    msg.textContent = `Cache reset and capacity set to ${cap}`;
    msg.className = "message update";
};

renderCache();



