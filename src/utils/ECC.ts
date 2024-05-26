// Define a point on the elliptic curve
export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    toString(): string {
        return `(${this.x}, ${this.y})`;
    }
}

// Define the parameters for the elliptic curve
const p: number = 97;
const a: number = 1;
const b: number = 7;
const Gx: number = 2;
const Gy: number = 22;
const n: number = 79;

const G: Point = new Point(Gx, Gy);

// Modular inverse
function modInverse(a: number, b: number): number {
    let lm: number = 1, hm: number = 0, low: number = a % b, high: number = b;

    while (low > 1) {
        const ratio: number = Math.floor(high / low);
        const nm: number = hm - lm * ratio;
        const newLow: number = high - low * ratio;
        const newHigh: number = low;
        lm = nm;
        low = newLow;
        hm = lm;
        high = newHigh;
    }

    return lm % b;
}

// Elliptic curve point addition
function pointAdd(p1: Point, p2: Point): Point {
    if (p1.x === Number.POSITIVE_INFINITY) {
        return p2;
    }
    if (p2.x === Number.POSITIVE_INFINITY) {
        return p1;
    }
    if (p1.x === p2.x && p1.y !== p2.y) {
        return new Point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    }

    let lamb: number;
    if (p1.x === p2.x) {
        lamb = (3 * p1.x * p1.x + a) * modInverse(2 * p1.y, p) % p;
    } else {
        lamb = (p2.y - p1.y) * modInverse(p2.x - p1.x, p) % p;
    }

    const x3: number = (lamb * lamb - p1.x - p2.x) % p;
    const y3: number = (lamb * (p1.x - x3) - p1.y) % p;

    return new Point(x3, y3);
}

// Elliptic curve point doubling
function pointDouble(p1: Point): Point {
    if (p1.y === 0) {
        return new Point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    }

    const lamb: number = (3 * p1.x * p1.x + a) * modInverse(2 * p1.y, p) % p;
    const x3: number = (lamb * lamb - 2 * p1.x) % p;
    const y3: number = (lamb * (p1.x - x3) - p1.y) % p;

    return new Point(x3, y3);
}

// Elliptic curve point scalar multiplication
function pointMultiply(k: number, P: Point): Point {
    let Q: Point = new Point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    let N: Point = P;

    while (k > 0) {
        if (k & 1) {
            Q = pointAdd(Q, N);
        }
        N = pointDouble(N);
        k >>= 1;
    }

    return Q;
}

// Check if a point is on the elliptic curve
function isOnCurve(point: Point): boolean {
    if (point.x === Number.POSITIVE_INFINITY && point.y === Number.POSITIVE_INFINITY) {
        return true;
    }

    const left: number = (point.y * point.y) % p;
    const right: number = (point.x * point.x * point.x + a * point.x + b) % p;

    return left === right;
}

// Generate key pair (private key, public key)
export function generateKeyPair(): [number, Point] {
    const privateKey: number = Math.floor(Math.random() * (n - 1)) + 1;
    const publicKey: Point = pointMultiply(privateKey, G);
    return [privateKey, publicKey];
}

// Encrypt a string message using ElGamal encryption
function encrypt(publicKey: Point, message: Point): [Point, Point] {
    const k: number = Math.floor(Math.random() * (n - 1)) + 1;
    const C1: Point = pointMultiply(k, G);
    const C2: Point = pointAdd(message, pointMultiply(k, publicKey));
    return [C1, C2];
}

// Decrypt a point using ElGamal decryption
function decrypt(privateKey: number, C1: Point, C2: Point): Point {
    const S: Point = pointMultiply(privateKey, C1);
    const negS: Point = new Point(S.x, -S.y % p);
    const decryptedMessage: Point = pointAdd(C2, negS);
    return decryptedMessage;
}

function stringToPoint(message: string): Point[] {
    const points: Point[] = [];
    for (const char of message) {
        let x: number = char.charCodeAt(0);
        if (char === ' ') {
            x = 97;
        } else if (x < 97) {
            x += 97;
        }
        points.push(new Point(x, (x * x + a * x + b) % p));
    }
    return points;
}

function pointToString(points: Point[]): string {
    return points.map(point => {
        if (point.x < 97) {
            return String.fromCharCode(point.x + 97);
        } else if (point.x >= 25) {
            return String.fromCharCode(point.x);
        } else {
            return String.fromCharCode(point.x + 97);
        }
    }).join('');
}

export function encryptString(publicKey: Point, message: string): [Point, Point][] {
    const points: Point[] = stringToPoint(message);
    const encryptedPoints: [Point, Point][] = points.map(point => encrypt(publicKey, point));
    return encryptedPoints;
}

export function decryptString(privateKey: number, encryptedPoints: [Point, Point][]): string {
    const decryptedPoints: Point[] = encryptedPoints.map(([C1, C2]) => decrypt(privateKey, C1, C2));
    const message: string = pointToString(decryptedPoints);
    return message;
}
