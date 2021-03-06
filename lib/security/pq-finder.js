'use strict'
const BigInteger = require('bigint-node')
const Int = require('big-integer')

const reInt = num => Int(num.toStr(10))
const reBig = num => new BigInteger.ParseFromString(num.toString(), 10)

const eq = (old, newOne) => old.toStr(10) !== newOne.toString()

const genRandom = () => ({
  q: (nextRandom(128) & 15) + 17,
  x: nextRandom(1000000000) + 1
})

const gcd = (a, b, c, d) => Int.gcd(
  Int.gcd(a, b),
  Int.gcd(c, d)
)

/**
 * Find the `PQ pair with P < Q` starting from a `BigInteger` value
 *
 * @class PQFinder
 */
class PQFinder {
  /**
   * The constructor may be called either giving a `Buffer` with the binary image or
   * a `String / Number` representation of the `BigInteger` number
   *
   * @param {Buffer|string|number} pqNumber
   *
   * @memberOf PQFinder
   */
  constructor(pqNumber) {
    this._pqNumber = switchTyping(pqNumber)
  }
  /**
   * Get the original PQ pair number.
   *
   * @returns
   *
   * @memberOf PQFinder
   */
  getPQPairNumber() {
    return this._pqNumber
  }

  /**
   * Calculates the pair P and Q with p < q and returns an array where `p = [0] and q = [1]`
   *
   * @returns {[number, number]}
   *
   * @memberOf PQFinder
   */
  findPQ() {
    if (!this._pq) {
      const num = this._pqNumber
      const numI = reInt(this._pqNumber)
      let prime, primeI
      for (let i = 0; i < 3; i++) {
        const rand = genRandom()
        const q = BigInt.number(rand.q)
        let x = BigInt.number(rand.x)
        let y = x.duplicate()
        const qI = Int(rand.q)
        let xI = Int(rand.x)
        let yI = Int(xI)
        const lim = 1 << (i + 18)
        for (let j = 1; j < lim; j++) {
          let a = x.duplicate()
          let b = x.duplicate()
          let c = q.duplicate()

          let aI = Int(xI)
          let bI = Int(xI)
          let cI = Int(qI)

          let loopCond = !b.eql(BigInteger.Zero())
          let loopCondI = !bI.isZero()
          console.assert(loopCond === loopCondI, 'loopCond')
          while (loopCond = !b.eql(BigInteger.Zero())) {
            console.assert(loopCond === !bI.isZero(), 'loopwhile')
            if (b.repr[0] & 1) {
              c.addEquals(a)
              if (c.gt(num))
                c = c.subtract(num)
            }
            a.addEquals(a)
            if (a.gt(num))
              a = a.subtract(num)
            b = b.shiftRight(1)
          }
          x = c.duplicate()
          const z = y.gt(x) ? y.subtract(x) : x.subtract(y)
          prime = z.gcd(num, a, b)
          if (!prime.eql(BigInteger.One()))
            break
          if ((j & (j - 1)) === 0)
            y = x.duplicate()
        }
        if (prime.gt(BigInteger.One()))
          break
      }
      const cofactor = num.divide(prime)[0]
      this._pq = cofactor.gt(prime)
        ? [prime, cofactor]
        : [cofactor, prime]
    }
    return this._pq
  }

  /**
   * Returns a new Buffer for each P and Q value as array
   *
   * @returns {[new Buffer]}
   *
   * @memberOf PQFinder
   */
  getPQAsBuffer() {
    return [new Buffer(this.findPQ()[0].toRawBytes()), new Buffer(this.findPQ()[1].toRawBytes())]
  }
  static getPQPair([p, q]) {
    return [ new Buffer(p.toRawBytes()), new Buffer(q.toRawBytes()) ]
  }
}

const BigInt = {
  number: num => new BigInteger.FromNumber(num),
  string: num => new BigInteger.ParseFromString(num, 10),
  buffer: num => new BigInteger.FromRawBytes(num)
}

const isType = {
  number: e => typeof e === 'number',
  string: e => typeof e === 'string'
}

const switchTyping = obj => {
  switch (true) {
    case isType.number(obj): return BigInt.number(obj)
    case isType.string(obj): return BigInt.string(obj)
    default: return BigInt.buffer(obj)
  }
}

const nextRandom = max => Math.floor(Math.random() * max)

module.exports = exports = PQFinder
