export class ColorChanger {
    constructor() {
        console.log("ColorChanger constructor");
    }
    static rgbToHsv(r:number, g:number, b:number) {
        r /= 255, g /= 255, b /= 255;
    
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h:number = 0;
        let s:number = 0;
        let v:number = max;
    
        let d = max - min;
        s = max === 0 ? 0 : d / max;
    
        if (max === min) {
            h = 0; // achromatic
        } 
        else 
        {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
    
        return [h, s, v];
    }
    
    static hsvToRgb(h:number, s:number, v:number) {
        let r:number = 0;
        let g:number = 0; 
        let b:number = 0;
    
        let i = Math.floor(h * 6);
        let f = h * 6 - i;
        let p = v * (1 - s);
        let q = v * (1 - f * s);
        let t = v * (1 - (1 - f) * s);
    
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
    
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    
    static getRandomSimilarColor(baseColor:number, hueVariation = 0.1) {
        // Convert the base color to RGB
        let r = (baseColor >> 16) & 0xFF;
        let g = (baseColor >> 8) & 0xFF;
        let b = baseColor & 0xFF;
    
        // Convert RGB to HSV
        let [h, s, v] = ColorChanger.rgbToHsv(r, g, b);
    
        // Randomly adjust the hue within the specified variation
        h += (Math.random() - 0.5) * hueVariation;
        if (h < 0) h += 1;
        if (h > 1) h -= 1;
    
        // Convert back to RGB
        let [newR, newG, newB] = ColorChanger.hsvToRgb(h, s, v);
    
        // Return the new color as a hexadecimal value
        return (newR << 16) | (newG << 8) | newB;
    }
}