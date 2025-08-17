import React, { useEffect, useRef } from 'react'

// Declare p5 as a global variable for TypeScript
declare global {
  interface Window {
    p5: any;
  }
}

// P5.js Fantasy Flowers Background Component
const Scene3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const p5InstanceRef = useRef<any>(null)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current) {
      return;
    }
    
    const loadP5AndInit = async () => {
      // Clean up any existing p5 instances and canvases first
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
      
      // More aggressive canvas cleanup
      const allCanvases = document.querySelectorAll('canvas');
      allCanvases.forEach(canvas => {
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      });
      
      // Clear the container
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      // Check if p5.js script already exists in the DOM
      const existingScript = document.querySelector('script[src*="p5.min.js"]');
      
      // Load p5.js if not already loaded
      if (!window.p5 && !existingScript) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.2/p5.min.js';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      } else if (existingScript && !window.p5) {
        // Wait for existing script to load
        await new Promise((resolve) => {
          const checkP5 = () => {
            if (window.p5) {
              resolve(undefined);
            } else {
              setTimeout(checkP5, 50);
            }
          };
          checkP5();
        });
      }

      if (!containerRef.current) return

      const sketch = (p: any) => {
      const CONFIG = {
        initialFlowers: 15,
        sparkles: 80,
        windSpeed: 0.0005,
        bgPulseSpeed: 0.02,
        maxPetals: 8,
        minPetals: 5
      }

      let flowers: Flower[] = []
      let sparkles: Sparkle[] = []
      let t = 0 // global time
      let glowLayer: any = null

      class Flower {
        baseX: number
        baseY: number
        stemLen: number
        petals: number
        hue: number
        size: number
        swayMag: number
        seed: number
        spin: number
        open: number

        constructor(baseX: number, baseY: number, stemLen: number, petals: number, hue: number, size: number, swayMag: number) {
          this.baseX = baseX
          this.baseY = baseY
          this.stemLen = stemLen
          this.petals = petals
          this.hue = hue
          this.size = size
          this.swayMag = swayMag
          this.seed = p.random(1000)
          this.spin = p.random(-0.25, 0.25)
          this.open = p.random(0.7, 1.2)
        }

        headPos(wind: number) {
          const n = p.noise(this.seed, t * 0.5) - 0.5 // -0.5..0.5
          const sway = (n + wind * 0.6) * this.swayMag
          const hx = this.baseX + sway
          const hy = this.baseY - this.stemLen
          return p.createVector(hx, hy)
        }

        drawStem(wind: number) {
          const segs = 18
          const thickness = p.map(this.stemLen, 70, 220, 3, 6)
          const hStem = (120 + (this.hue - 200) * 0.25 + 360) % 360
          p.fill(hStem, 55, 45, 100)
          p.stroke(hStem, 55, 45, 100)
          p.strokeWeight(thickness)
          p.noFill()
          p.beginShape()
          for (let i = 0; i <= segs; i++) {
            const prog = i / segs
            const y = p.lerp(this.baseY, this.baseY - this.stemLen, prog)
            const bend = (p.noise(this.seed + prog * 2, t * 0.3) - 0.5) * this.swayMag * (1 - prog) * 1.6 + wind * this.swayMag * (1 - prog)
            const x = this.baseX + bend
            if (i === 0) {
              p.vertex(x, y)
            } else {
              p.vertex(x, y)
            }
          }
          p.endShape()
          p.noStroke()

          // little leaves
          const leaves = 2
          for (let i = 1; i <= leaves; i++) {
            const prog = i / (leaves + 1)
            const y = p.lerp(this.baseY, this.baseY - this.stemLen * 0.7, prog)
            const bend = (p.noise(this.seed + prog * 2, t * 0.3) - 0.5) * this.swayMag * (1 - prog) * 1.6 + wind * this.swayMag * (1 - prog)
            const x = this.baseX + bend
            p.push()
            p.translate(x, y)
            p.rotate(p.sin(t * 8 + this.seed * 10 + i * 40) * 12)
            p.fill(hStem, 65, 60, 90)
            p.ellipse(10, 0, 26, 14)
            p.ellipse(-10, 0, 26, 14)
            p.pop()
          }
        }

        drawBloom(glow: any, wind: number) {
          const head = this.headPos(wind)
          const spin = (t * 8 * this.spin + this.seed * 720) % 360
          const coreHue = (this.hue + 40) % 360
          const petalHue = this.hue
          const petals = this.petals

          p.push()
          p.translate(head.x, head.y)
          p.rotate(spin)

          // inner glow halo (to glow layer) - only if glow layer exists
          if (glow) {
            const haloR = this.size * 2.2
            for (let r = haloR * 0.4; r < haloR; r += 6) {
              const a = p.map(r, haloR * 0.4, haloR, 20, 0)
              glow.fill(petalHue, 70, 90, a)
              glow.ellipse(head.x - 0, head.y - 0, r * 2, r * 2)
            }
          }

          // draw petals
          for (let i = 0; i < petals; i++) {
            const ang = (360 / petals) * i
            p.push()
            p.rotate(ang)
            const wob = p.sin(t * 15 + i * 30 + this.seed * 100) * this.size * 0.12
            const len = this.size * p.map(p.noise(this.seed + i * 0.12, t * 1), 0, 1, 1.2, 1.8) * this.open
            const w = this.size * 0.7 + wob

            // base soft petal
            p.fill(petalHue, 70, 90, 80)
            p.beginShape()
            p.vertex(0, 0)
            p.bezierVertex(w * 0.25, -len * 0.25, w * 0.45, -len * 0.55, 0, -len)
            p.bezierVertex(-w * 0.45, -len * 0.55, -w * 0.25, -len * 0.25, 0, 0)
            p.endShape(p.CLOSE)

            // highlight rim
            p.fill((petalHue + 20) % 360, 30, 100, 30)
            p.ellipse(0, -len * 0.6, w * 0.7, w * 0.35)
            p.pop()
          }

          // flower core
          p.fill(coreHue, 80, 40, 100)
          p.circle(0, 0, this.size * 0.7)
          p.fill((coreHue + 20) % 360, 70, 90, 80)
          p.circle(0, 0, this.size * 0.45)

          // floating pollen
          for (let k = 0; k < 3; k++) {
            const a = p.random(360)
            const r = p.random(this.size * 0.8, this.size * 1.6)
            const px = p.cos(a) * r
            const py = p.sin(a) * r - p.random(0, 2)
            p.fill((coreHue + p.random(-10, 10) + 360) % 360, 70, 100, 14)
            p.circle(px, py, p.random(1.5, 3.5))
          }

          p.pop()
        }
      }

      class Sparkle {
        x!: number
        y!: number
        r!: number
        speed!: number
        twinkle!: number
        h!: number

        constructor() {
          this.reset(true)
        }

        reset(init = false) {
          this.x = init ? p.random(p.width) : p.random([p.random(p.width * 0.15), p.random(p.width * 0.85, p.width)])
          this.y = init ? p.random(p.height) : p.height + p.random(40)
          this.r = p.random(0.6, 2.4)
          this.speed = p.random(0.15, 0.55)
          this.twinkle = p.random(1000)
          this.h = p.random([210, 260, 300, 330])
        }

        update() {
          this.y -= this.speed
          const sinValue = p.sin((t + this.twinkle) * 2)
          this.x += sinValue * 0.2
          if (this.y < -20) this.reset()
        }

        draw() {
          const a = (p.sin((t + this.twinkle) * 6) * 0.5 + 0.5) * 70 + 10
          p.fill(this.h, 30, 100, a)
          p.circle(this.x, this.y, this.r * 2)
        }
      }

      function makeFlower(x: number, y: number) {
        const petals = p.floor(p.random(CONFIG.minPetals, CONFIG.maxPetals + 1))
        const hue = (p.random(180, 330) + p.random([-20, 0, 20])) % 360
        const size = p.random(16, 34) * p.random(1, 2.2)
        const stemLen = p.random(70, 140) * p.random(0.9, 1.6)
        const swayMag = p.random(10, 28)
        return new Flower(x, y, stemLen, petals, hue, size, swayMag)
      }

      function drawBackground() {
        const base = (p.sin((t * 8) * CONFIG.bgPulseSpeed) * 0.5 + 0.5)
        const h1 = (200 + base * 80 + 360) % 360
        const h2 = (300 + (1 - base) * 80 + 360) % 360
        
        // Ensure we have valid canvas dimensions
        if (!p.width || !p.height || p.width <= 0 || p.height <= 0 || 
            isNaN(p.width) || isNaN(p.height)) {
          return
        }
        
        for (let y = 0; y < p.height; y += 2) {
          const prog = y / p.height
          const h = p.lerp(h1, h2, prog)
          
          // Validate all rect parameters
          if (isNaN(h) || isNaN(prog) || isNaN(y)) continue
          
          p.fill(h, 50, 10 + 50 * prog, 100)
          p.rect(0, y, p.width, 2)
        }

        const fogDensity = 0.75
        for (let y = 0; y < p.height; y += 6) {
          const n = p.noise(y * 0.01, t * 0.1)
          p.fill(240, 10, 100, 5 * fogDensity)
          p.rect(0, y + (n - 0.5) * 40, p.width, 6)
        }
      }

      function drawVignette() {
        p.push()
        const ctx = (p as any).drawingContext
        ctx.save()
        const g = ctx.createRadialGradient(
          p.width * 0.5, p.height * 0.65, p.min(p.width, p.height) * 0.2,
          p.width * 0.5, p.height * 0.65, p.max(p.width, p.height) * 0.7
        )
        g.addColorStop(0, 'rgba(0,0,0,0)')
        g.addColorStop(1, 'rgba(0,0,0,0.55)')
        ctx.globalCompositeOperation = 'multiply'
        ctx.fillStyle = g
        ctx.fillRect(0, 0, p.width, p.height)
        ctx.restore()
        p.pop()
      }

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight)
        p.colorMode(p.HSB, 360, 100, 100, 100)
        p.angleMode(p.DEGREES)
        p.noStroke()
        
        // Ensure valid canvas dimensions before creating graphics
        if (p.width > 0 && p.height > 0) {
          glowLayer = p.createGraphics(p.width, p.height)
          glowLayer.colorMode(p.HSB, 360, 100, 100, 100)
          glowLayer.noStroke()
        }
        
        for (let i = 0; i < CONFIG.initialFlowers; i++) {
          flowers.push(makeFlower(p.random(p.width), p.random(p.height * 0.55, p.height * 0.92)))
        }
        for (let i = 0; i < CONFIG.sparkles; i++) sparkles.push(new Sparkle())
      }

      p.windowResized = () => {
        if (p.windowWidth > 0 && p.windowHeight > 0) {
          p.resizeCanvas(p.windowWidth, p.windowHeight)
          if (glowLayer) {
            glowLayer.remove()
          }
          glowLayer = p.createGraphics(p.width, p.height)
          glowLayer.colorMode(p.HSB, 360, 100, 100, 100)
          glowLayer.noStroke()
        }
      }

      p.draw = () => {
        // Ensure canvas is properly initialized
        if (!p.width || !p.height || p.width <= 0 || p.height <= 0) {
          return
        }
        
        t += p.deltaTime * 0.001
        
        drawBackground()

        const wind = (p.noise(t * 0.3) - 0.5) * 2

        // Draw stems behind
        for (const f of flowers) f.drawStem(wind)

        // Draw blossoms and glow on top
        if (glowLayer) {
          glowLayer.clear()
          p.blendMode(p.BLEND)
          for (const f of flowers) f.drawBloom(glowLayer, wind)
        }
        // Additive glow pass
        if (glowLayer) {
          p.blendMode(p.ADD)
          p.image(glowLayer, 0, 0)
        }
        p.blendMode(p.BLEND)

        // Sparkles last
        for (const s of sparkles) {
          s.update()
          s.draw()
        }

        drawVignette()
      }

      p.mousePressed = () => {
        flowers.push(makeFlower(p.mouseX + p.random(-10, 10), p.mouseY + p.random(-10, 10)))
        // Sprinkle a burst of sparkles
        for (let i = 0; i < 20; i++) {
          const s = new Sparkle()
          s.x = p.mouseX + p.random(-30, 30)
          s.y = p.mouseY + p.random(-10, 10)
          s.speed = p.random(0.2, 1.2)
          sparkles.push(s)
        }
      }

      p.keyTyped = () => {
        if (p.key === 's' || p.key === 'S') {
          p.saveCanvas('fantasy-flowers', 'png')
        }
      }
    }

      // Create the p5 instance
      p5InstanceRef.current = new window.p5(sketch, containerRef.current)
      isInitializedRef.current = true
    }

    // Start the async loading
    loadP5AndInit().catch(console.error)

    // Cleanup function
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove()
        p5InstanceRef.current = null
      }
      isInitializedRef.current = false
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}
    />
  )
}

export default Scene3D
